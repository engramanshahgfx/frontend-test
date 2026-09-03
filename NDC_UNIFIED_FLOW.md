# akbar Flight Booking - Unified Flow Documentation

## Overview

This document explains the **ONE** unified flow for the akbar Flight Booking System.

```
Frontend (Next.js) → Backend (Laravel) → Database (MySQL) → akbar Provider
```

---

## The Complete Flow (With Holding System & Webhooks)

### Visual Flow Diagram

```
┌────────────────────────────────────────────────────────────────────────────┐
│                          USER JOURNEY WITH WEBHOOK                          │
└────────────────────────────────────────────────────────────────────────────┘

[1. SEARCH]          [2. SELECT]          [3. PASSENGERS]      [4. EXTRAS]
akbarflights.jsx       akbarflights.jsx       passengers/page.jsx  extras/page.jsx
    │                     │                     │                    │
    ▼                     ▼                     ▼                    ▼
┌─────────┐          ┌─────────┐          ┌─────────┐          ┌─────────┐
│ Search  │ ──────▶  │ Select  │ ──────▶  │  Enter  │ ──────▶  │ Select  │
│ Flights │          │ Flight  │          │Passenger│          │ Add-ons │
└─────────┘          └─────────┘          └─────────┘          └─────────┘
    │                     │                     │                    │
   API                localStorage            localStorage        localStorage
    │                     │                     │                    │
    ▼                     ▼                     ▼                    ▼
/search                store                  store                store
                    selectedFlight         passengers           selectedExtras


[5. CHECKOUT]                    [6. PAYMENT]                [7. CONFIRMATION]
unified-checkout/page.jsx        unified-pay/page.jsx        unified-confirmation/page.jsx
    │                                │                            │
    ▼                                ▼                            ▼
┌──────────────────────┐     ┌──────────────────────┐    ┌──────────────────────┐
│ Start Booking        │     │   Moyasar Payment    │    │  Poll for Status     │
│ + Add Passengers     │     │   Form (User enters  │    │  + Show Ticket       │
│ + HOLD FLIGHT ✅     │     │   card info)         │    │                      │
└──────────────────────┘     └──────────────────────┘    └──────────────────────┘
    │ (Reserves seat!)             │ (User clicks Pay)         │ (Frontend polls)
    │                              ▼                          │
   API                         Moyasar                         │
   (DB SAVE)                   (processes)                      │
    │                              │                          │
    ▼                              ▼                          │
/start              ───────────▶  /pay/record    ────────────┤
/add-passengers                   (optional)                  │  (status: PAYMENT_PENDING)
/hold (ON_HOLD) ✅                │                          │
                                  ▼                          │
                            Payment Success                  │
                                  │                          │
                                  ▼                          │
                         🔔 WEBHOOK CALLBACK 🔔              │
                    (Moyasar → Backend Webhook)              │
                                  │                          │
                                  ▼                          │ (polls every 2s)
                    ┌──────────────────────────┐             │
                    │ 1. Verify payment        │             │
                    │ 2. /confirm (akbar)        │             │
                    │ 3. /issue-ticket        │◄─────────────┘
                    │ Status → TICKETED ✅     │
                    └──────────────────────────┘
```

## Key Points with Webhooks & Hold

1. **Hold Flight (Checkout)** - Reserve seat before payment
2. **Payment Processing (Pay)** - Moyasar handles payment
3. **Webhook Confirmation** - Backend auto-confirms when Moyasar notifies
4. **Frontend Polling** - Frontend checks status while webhook processes
5. **Automatic Ticket Issuance** - Backend issues ticket via webhook

---

## Database Saves

The booking is saved to the database at these key points:

| Step | API Endpoint | What's Saved | Database Table | Status |
|------|-------------|--------------|----------------|--------|
| 1 | `/api/v2/akbar/bookings/start` | Flight offer, idempotency key | `akbar_orders` | INITIATED |
| 2 | `/api/v2/akbar/bookings/passengers` | Passenger details (encrypted) | `akbar_passengers` | PASSENGERS_ADDED |
| 3 | `/api/v2/akbar/bookings/hold` | Hold reservation with expiry | `akbar_orders` | **ON_HOLD** ✅ |
| 4 | `POST /api/v2/webhook/moyasar` | Webhook confirms payment | `akbar_payments` | PAYMENT_PENDING → PAID |
| 5 | (Webhook) `/confirm` | akbar confirmation + PNR | `akbar_orders` | CONFIRMED |
| 6 | (Webhook) `/issue-ticket` | Ticket numbers | `akbar_orders` | **TICKETED** ✅ |

---

## Webhook Flow (The Secure Way)

### What is a Webhook?

A webhook is a **callback** - Moyasar (payment gateway) calls your backend to notify about payment status.

```
Frontend              Moyasar              Backend
  │                    │                    │
  ├─ Pay Button ──────▶│                    │
  │                    ├─ Process Payment  │
  │                    │                   │
  │                    ├─ Payment Success  │
  │                    │                   │
  │                    └────▶ WEBHOOK ────▶│ (Automatic callback)
  │                         POST /webhook   │
  │                                        │
  │                                        ├─ Confirm with akbar
  │                                        ├─ Issue Ticket
  │                                        ├─ Update DB
  │                                        │
  │◀─ Poll Status ◀───────────────────────┤
  │   (every 2s)      Changed to TICKETED  │
  │                                        │
  └─ Show Ticket ────────────────────────▶│
```

### Backend Webhook Handler

```php
// routes/api.php
Route::post('/v2/webhook/moyasar', [akbarWebhookController::class, 'handleMoyasarWebhook']);

// app/Http/Controllers/Api/akbar/WebhookController.php
public function handleMoyasarWebhook(Request $request)
{
    // 1. Verify webhook signature (security!)
    if (!$this->verifyMoyasarSignature($request)) {
        return response()->json(['error' => 'Invalid signature'], 401);
    }

    // 2. Get payment info
    $paymentId = $request->input('source.id');
    $status = $request->input('status');

    // 3. Find order by payment
    $order = akbarOrder::whereHas('payment', function ($q) use ($paymentId) {
        $q->where('moyasar_payment_id', $paymentId);
    })->first();

    // 4. Process based on status
    if ($status === 'paid') {
        // Confirm with akbar
        $bookingService->confirm($order->order_reference);
        
        // Issue ticket
        $bookingService->issueTicket($order->order_reference);
        
        // Status becomes TICKETED
        $order->booking_status = BookingStatus::TICKETED;
        $order->save();
    } else if ($status === 'failed') {
        $order->booking_status = BookingStatus::PAYMENT_FAILED;
        $order->save();
    }

    return response()->json(['success' => true]);
}
```

### Frontend Polling While Webhook Processes

```javascript
// unified-pay/page.jsx - Wait for webhook
const pollStatus = async () => {
  try {
    const result = await akbarBookingApi.getBookingDetails(orderRef);
    const status = result.data.booking_status;
    
    // If webhook processed, status will be TICKETED
    if (status === 'TICKETED') {
      console.log('✅ Webhook confirmed - ticket issued!');
      redirectToConfirmation();
      return;
    }
    
    // Still processing - poll again in 2 seconds
    setTimeout(pollStatus, 2000);
  } catch (err) {
    console.error('Polling error:', err);
  }
};

// Start polling
pollStatus();
```

---

## Hold System (Flight Reservation)

### Why Hold?

When user clicks "Proceed to Payment", the flight needs to be **reserved**. Otherwise, another user might book the same flight while this user is entering payment.

### Hold Flow

```
1. Start Booking → Status: INITIATED
2. Add Passengers → Status: PASSENGERS_ADDED
3. HOLD FLIGHT ← NEW! ┐
   ↓                  │ Reserves seat for 30 mins
   Status: ON_HOLD ◀─┘ (or however long akbar allows)
4. User enters payment
5. Webhook confirms payment
6. Confirm with akbar (uses the hold)
7. Issue ticket
8. Status: TICKETED
```

### Hold Expiry

When holding a flight:
```php
// Backend response
{
    "order_reference": "ORD-12345",
    "status": "ON_HOLD",
    "hold_expiry": "2024-01-15 15:30:00",  // 30 mins from now
    "message": "Flight held. Complete payment within 30 minutes."
}
```

Frontend shows user:
```
 Flight is held until 15:30
💳 Complete payment within 30 minutes
```

If hold expires (user doesn't pay in time):
- Can retry and hold again
- New hold will have new expiry time

---

## Frontend Files

### New Unified Pages (Use These)

| Page | Path | Purpose |
|------|------|---------|
| Checkout | `/[lang]/akbar-flights/unified-checkout` | Start booking + add passengers |
| Payment | `/[lang]/akbar-flights/unified-pay` | Moyasar payment processing |
| Confirmation | `/[lang]/akbar-flights/unified-confirmation` | Show booking + ticket |

### API Client

```javascript
// lib/akbarBookingApi.js - Single source for all API calls

import akbarBookingApi from '@/lib/akbarBookingApi';

// Set auth token (from login)
akbarBookingApi.setAuthToken(token);

// Search flights
await akbarBookingApi.searchFlights({ origin, destination, date, passengers });

// Start booking (SAVES TO DATABASE)
await akbarBookingApi.startBooking(offerId, flightData);

// Add passengers (SAVES TO DATABASE)
await akbarBookingApi.addPassengers(orderRef, passengers);

// Process payment (SAVES TO DATABASE)
await akbarBookingApi.processPayment(orderRef, paymentData);

// Confirm with akbar (SAVES TO DATABASE)
await akbarBookingApi.confirmBooking(orderRef);

// Issue ticket (SAVES TO DATABASE)
await akbarBookingApi.issueTicket(orderRef);

// Get booking details
await akbarBookingApi.getBookingDetails(orderRef);
```

---

## Backend API Endpoints

All endpoints under `/api/v2/akbar/bookings/`:

| Endpoint | Method | Purpose | Status After |
|----------|--------|---------|--------------|
| `/start` | POST | Create booking | INITIATED |
| `/{ref}/passengers` | POST | Add passengers | PASSENGERS_ADDED |
| `/{ref}/hold` | POST | Hold flight (optional) | ON_HOLD |
| `/{ref}/payment` | POST | Record payment | PAYMENT_PENDING |
| `/{ref}/confirm` | POST | Confirm with akbar | CONFIRMED |
| `/{ref}/ticket` | POST | Issue e-ticket | TICKETED |
| `/{ref}` | GET | Get booking details | - |
| `/{ref}/cancel` | POST | Cancel booking | CANCELLED |

---

## Data Flow Example

### Step 1: Search Flights
```
User: Enters RUH → JED, 2024-01-15

Frontend:
  POST /api/v2/akbar/bookings/search
  { origin: 'RUH', destination: 'JED', date: '2024-01-15' }

Backend:
  → Calls akbar provider search
  → Returns list of offers

Frontend:
  → Displays flight cards
  → User selects one
  → localStorage.setItem('selectedFlight', JSON.stringify(flight))
```

### Step 2: Enter Passengers
```
User: Fills passenger form

Frontend:
  → Validates form
  → localStorage.setItem('passengers', JSON.stringify([...]))
```

### Step 3: Checkout (START + HOLD - DB SAVES)
```
User: Clicks "Proceed to Payment"

Frontend (unified-checkout/page.jsx):

  1️⃣ POST /api/v2/akbar/bookings/start
     { offer_id, flight_data }
     
Backend:
  → Creates akbar_orders record
  → Status: INITIATED
  → Returns: { order_reference: 'ORD-XXXX' }

Frontend (continued):
  2️⃣ POST /api/v2/akbar/bookings/passengers
     { order_reference: 'ORD-XXXX', passengers: [...] }
     
Backend:
  → Creates akbar_passengers records
  → Status: PASSENGERS_ADDED

Frontend (continued):
  3️⃣ POST /api/v2/akbar/bookings/hold
     { order_reference: 'ORD-XXXX' }  ← NEW!
     
Backend:
  → Calls akbar to hold flight
  → Saves hold info
  → Status: ON_HOLD ✅
  → Returns: { hold_expiry: '2024-01-15 15:30' }

Frontend:
  → Stores hold_expiry in localStorage
  → Shows timer: "Hold expires in 29:45"
  → Redirects to /unified-pay?order_ref=ORD-XXXX
```

### Step 4: Payment (WEBHOOK TRIGGERS CONFIRMATION)
```
User: On payment page

Frontend (unified-pay/page.jsx):
  Shows Moyasar form
  User enters card info
  User clicks "Pay Now"

Moyasar Gateway (External):
  ✓ Processes payment
  ✓ Payment status: SUCCESS
  ✓ Calls: POST /api/v2/webhook/moyasar (automatic)
     { status: 'paid', source: { id: 'xxx' }, amount: 1000 }

Backend (WebhookController) - AUTOMATIC 🔔
  1. Receives webhook from Moyasar
  2. Verifies signature (security check)
  3. Finds order by payment_id
  4. Payment status: PAID
  
  Then:
  5️⃣ Calls: POST /api/v2/akbar/bookings/confirm
     { order_reference: 'ORD-XXXX' }
     
     → Calls akbar OrderCreate
     → Gets PNR from akbar
     → Saves PNR to akbar_orders
     → Status: CONFIRMED
  
  6️⃣ Calls: POST /api/v2/akbar/bookings/issue-ticket
     { order_reference: 'ORD-XXXX' }
     
     → Calls akbar TicketIssue
     → Gets ticket numbers
     → Saves to akbar_orders
     → Status: TICKETED ✅

Frontend (Meanwhile):
  Polling every 2 seconds:
  GET /api/v2/akbar/bookings/ORD-XXXX
  
  Waits for status to change from PAYMENT_PENDING → TICKETED
  Once TICKETED:
    ✓ Stops polling
    ✓ Redirects to /unified-confirmation?order_ref=ORD-XXXX
```

### Step 5: Confirmation (FETCH & DISPLAY)
```
Frontend (unified-confirmation/page.jsx):

  GET /api/v2/akbar/bookings/ORD-XXXX
  
Backend:
  → Returns full booking with:
     - pnr: 'ABC123'
     - ticket_numbers: ['0011111234567']
     - passenger details
     - flight info
     - payment info
     - status: TICKETED
  
Frontend:
  → Displays PNR
  → Shows ticket numbers
  → Allows download
  → Shows success message
  
Frontend:
  → Displays PNR, ticket numbers, download option
```

---

## Test Mode vs Production

### Local Testing (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_akbar_TEST_MODE=true
NEXT_PUBLIC_MOYASAR_PUBLISHABLE_KEY=pk_test_xxx
```

### Production (.env.production)
```env
NEXT_PUBLIC_API_URL=https://your-api.com/api
NEXT_PUBLIC_akbar_TEST_MODE=false
NEXT_PUBLIC_MOYASAR_PUBLISHABLE_KEY=pk_live_xxx
```

---

## Status State Machine

```
INITIATED
    │
    ▼
PASSENGERS_ADDED
    │
    ├──────────────────┐
    ▼                  ▼
ON_HOLD           (skip hold)
    │                  │
    └──────┬───────────┘
           ▼
    PAYMENT_PENDING
           │
           ▼
         PAID
           │
           ▼
    PENDING_CONFIRMATION
           │
           ▼
       CONFIRMED
           │
           ▼
       TICKETED ← Success!
           
Errors:
- PAYMENT_FAILED
- BOOKING_FAILED
- CANCELLED
- REFUNDED
```

---

## Quick Start

### 1. Start Backend
```bash
cd backend-test
php artisan serve
```

### 2. Seed Test Data (Optional)
```bash
php artisan db:seed --class=LocalTestingSeeder
```

### 3. Start Frontend
```bash
cd frontend-test
npm run dev
```

### 4. Test the Flow
1. Go to `http://localhost:3000/en/akbar-flights`
2. Search for flights (RUH → JED)
3. Select a flight
4. Enter passenger details
5. Go to checkout → `/en/akbar-flights/unified-checkout`
6. Click "Proceed to Payment"
7. Complete payment on `/en/akbar-flights/unified-pay`
8. View confirmation on `/en/akbar-flights/unified-confirmation`

### 5. Check Database
```sql
SELECT * FROM akbar_orders ORDER BY created_at DESC;
SELECT * FROM akbar_passengers WHERE order_id = ?;
SELECT * FROM akbar_payments WHERE order_id = ?;
```

### 6. Check Filament Admin
Go to `http://localhost:8000/admin/akbar-flight-bookings` to see all bookings.

---

## Files Summary

### Frontend
| File | Description |
|------|-------------|
| `lib/akbarBookingApi.js` | API client for all booking calls |
| `lib/BookingContext.js` | React context for state (optional) |
| `unified-checkout/page.jsx` | Checkout page |
| `unified-pay/page.jsx` | Payment page |
| `unified-confirmation/page.jsx` | Confirmation page |

### Backend
| File | Description |
|------|-------------|
| `app/Services/UnifiedBookingService.php` | Core booking logic |
| `app/Http/Controllers/Api/akbar/BookingController.php` | API endpoints |
| `app/Http/Controllers/Api/MockakbarController.php` | Mock akbar for testing |
| `app/Enums/BookingStatus.php` | Status state machine |
| `database/seeders/LocalTestingSeeder.php` | Test data |

---

## No More Duplicates

### Before (Confusing)
- Multiple checkout pages
- Data in localStorage + API + context
- Demo fallback mode creating fake PNRs
- Unclear where data is saved

### After (Clear)
- ONE checkout flow: `unified-checkout` → `unified-pay` → `unified-confirmation`
- Data saved to database at each step
- Clear status progression
- Test mode uses mock API (not fake data)

---

## Troubleshooting

### Webhook Issues

**Problem: "Webhook not receiving payment confirmation"**
- ✅ Moyasar webhook URL must be publicly accessible
- ✅ Webhook endpoint: `POST /api/v2/webhook/moyasar`
- ✅ Check backend logs: `storage/logs/laravel.log`
- ✅ Test webhook with Moyasar's test tool

**Problem: "Status stuck in PAYMENT_PENDING"**
- Frontend polls for 30 seconds then times out
- Backend webhook may still be processing in background
- Show user: "Confirming booking, you'll receive email soon"
- Safe to redirect to confirmation page with `pending=true`

### Hold System Issues

**Problem: "Hold expired before payment"**
- Holds usually expire after 20-30 minutes
- Solution: Click "Search again" to get a new hold
- Add timer to warn user: "Hold expires in 15 minutes"

**Problem: "User completed payment but hold expired"**
- Backend should handle this gracefully
- Either refresh hold or use existing reservation
- Webhook will process payment regardless

### Database & Data

**Q: "Where is payment info saved?"**
- `akbar_payments` table - records Moyasar payment ID
- `akbar_orders.booking_status` - changes from PAYMENT_PENDING → PAID

**Q: "Are tickets saved immediately?"**
- Yes! Webhook auto-issues tickets
- Saves to `akbar_orders.ticket_numbers`
- Confirmation page displays them immediately

**Q: "What if webhook never arrives?"**
- Frontend redirects with `pending=true` after timeout
- User sees: "Payment confirmed, booking processing"
- Backend keeps trying webhook silently
- User receives email when complete

### "Missing booking data" error
1. Make sure you selected a flight and entered passengers
2. Check localStorage has `selectedFlight` and `passengers`

### API returns 401
1. Log in first: `POST /api/auth/login`
2. Set token: `akbarBookingApi.setAuthToken(token)`

### Payment fails
1. Check Moyasar key is correct
2. In test mode, use test cards
3. Check browser console for errors

### Database not saving
1. Check Laravel logs: `storage/logs/laravel.log`
2. Verify database connection in `.env`
3. Check migrations ran: `php artisan migrate:status`
