# 🛫 NDC Flight Booking System - Complete Flow Documentation

## 📋 Overview

This is a complete flight booking system following the **NDC (New Distribution Capability)** flow. It integrates with your Laravel backend API to manage flight searches, bookings, and payments.

---

## 🗺️ User Journey & Pages

### Step 1️⃣ **Flight Search** - `/[lang]/ndc-flights`
**File:** `app/[lang]/ndc-flights/page.jsx`

**What Happens:**
- User enters search criteria:
  - Departure City (e.g., "Riyadh")
  - Arrival City (e.g., "Dubai")
  - Departure Date
  - Number of Passengers
- Frontend calls API: `POST /api/ndc/flights/available-offers`
- Displays list of available flights with prices
- User selects a flight

**API Call:**
```javascript
POST /api/ndc/flights/available-offers
{
  "departureCity": "Riyadh",
  "arrivalCity": "Dubai",
  "departureDate": "2026-03-15",
  "passengers": 2
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "offers": [
      {
        "offerId": "OFFER_001",
        "airline": "Emirates",
        "flightNumber": "EK101",
        "price": 500,
        "departure": "10:00 AM",
        "arrival": "02:00 PM",
        "duration": "4h 30m"
      }
    ]
  }
}
```

---

### Step 2️⃣ **Fare Confirmation** - Automatic
**Happens when user clicks "Select & Next"**

**API Call:**
```javascript
POST /api/ndc/flights/confirm-fare
{
  "offerId": "OFFER_001"
}
```

**Data Stored:**
- ✅ Fare confirmation details saved to `localStorage`
- ✅ Selected flight saved to `localStorage`

---

### Step 3️⃣ **Bundle Selection** - `/[lang]/ndc-flights/bundle`
**File:** `app/[lang]/ndc-flights/bundle/page.jsx`

**What Happens:**
- User chooses travel bundle/class:
  - **Basic**: Standard seat, 1 bag, meal
  - **Premium**: Extra legroom, 2 bags, priority boarding
  - **Business**: Full business class experience
- Calculates total price with bundle extras
- User selects preferred bundle and continues

**API Call:**
```javascript
POST /api/ndc/flights/bundle-options
{
  "offerId": "OFFER_001"
}
```

**Data Stored:**
- ✅ Selected bundle saved to `localStorage`

---

### Step 4️⃣ **Passenger Details** - `/[lang]/ndc-flights/passengers`
**File:** `app/[lang]/ndc-flights/passengers/page.jsx`

**What Happens:**
- Form for each passenger with fields:
  - First Name *
  - Last Name *
  - Date of Birth *
  - Passport Number *
  - Email
  - Phone
- Validates required fields
- Saves passenger information

**API Call:**
```javascript
POST /api/ndc/passengers/add-details
{
  "offerId": "OFFER_001",
  "passengers": [
    {
      "firstName": "Ahmed",
      "lastName": "Ali",
      "dateOfBirth": "1990-05-15",
      "passport": "AB123456",
      "email": "ahmed@example.com",
      "phone": "+966501234567"
    }
  ]
}
```

**Data Stored:**
- ✅ Passenger information saved to `localStorage`

---

### Step 5️⃣ **Checkout & Payment** - `/[lang]/ndc-flights/checkout`
**File:** `app/[lang]/ndc-flights/checkout/page.jsx`

**What Happens:**
- **Summary of all selections:**
  - Flight details
  - Selected bundle
  - Passengers list
  - Price breakdown
- **Price Summary:**
  - Base flight price × passengers
  - Bundle extras × passengers
  - Total amount
- **Payment Processing:**
  - Currently mocked (ready for Moyasar integration)
  - Calls Book & Pay API

**API Call:**
```javascript
POST /api/ndc/booking/book-and-pay
{
  "offerId": "OFFER_001",
  "paymentMethod": "card",
  "cardToken": "tok_visa_4242",
  "email": "ahmed@example.com"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "bookingId": "BK_67890",
    "pnr": "PNR123456",
    "totalAmount": 2000,
    "status": "CONFIRMED",
    "ticketNumber": "0561001234567"
  }
}
```

**Data Cleanup:**
- ✅ All `localStorage` data cleared after successful booking

---

### Step 6️⃣ **Booking Confirmation** - `/[lang]/ndc-flights/confirmation`
**File:** `app/[lang]/ndc-flights/confirmation/page.jsx`

**What Happens:**
- Displays booking confirmation:
  - **PNR Code** (Passenger Name Record)
  - **Booking ID**
  - **Flight Details** with times
  - **Passenger Names**
  - **Total Amount Paid**
  - **Important travel info**
- Allows printing confirmation
- Option to search for another flight

**API Call:**
```javascript
POST /api/ndc/orders/retrieve
{
  "orderId": "BK_67890"
}
```

---

## 🗂️ File Structure

```
app/
  [lang]/
    ndc-flights/
      page.jsx                  # Step 1: Flight Search
      bundle/
        page.jsx               # Step 3: Bundle Selection
      passengers/
        page.jsx               # Step 4: Passenger Details
      checkout/
        page.jsx               # Step 5: Checkout & Payment
      confirmation/
        page.jsx               # Step 6: Confirmation
```

---

## 💾 LocalStorage Keys Used

| Key | Stores | Where |
|-----|--------|-------|
| `selectedFlight` | Flight details (airline, price, etc.) | After Step 1 |
| `fareConfirmation` | Fare confirmation response | After Step 1 |
| `selectedBundle` | Bundle/class selection | After Step 3 |
| `passengersData` | All passenger details | After Step 4 |

**Cleared after:** ✅ Successful booking (Step 5)

---

## 🎨 Design Features

### **Responsive Design**
- ✅ Mobile-first approach
- ✅ Tailwind CSS styling
- ✅ Works on all screen sizes

### **User Experience**
- ✅ Progress indication
- ✅ Back buttons on every page
- ✅ Error messages
- ✅ Loading states
- ✅ Price breakdowns
- ✅ Visual feedback on selections

### **Visual Elements**
- ✅ Gradient backgrounds
- ✅ Card-based layouts
- ✅ Icons and emojis
- ✅ Color-coded sections
- ✅ Animated interactions

---

## 🔌 API Endpoints Used

All endpoints are called from your **Laravel backend**:

| Step | Method | Endpoint | Purpose |
|------|--------|----------|---------|
| 1 | POST | `/api/ndc/flights/available-offers` | Search flights |
| 1 | POST | `/api/ndc/flights/confirm-fare` | Confirm price |
| 3 | POST | `/api/ndc/flights/bundle-options` | Get bundle options |
| 4 | POST | `/api/ndc/passengers/add-details` | Save passengers |
| 5 | POST | `/api/ndc/booking/book-and-pay` | Process booking |
| 6 | POST | `/api/ndc/orders/retrieve` | Get confirmation |

---

## 🧪 Testing with Mock Data

**Currently**, the system uses **mock data** when API calls fail or return empty results. 

### Mock Flights Generated:
- Emirates EK101 - 500 SAR
- FlyDubai FZ101 - 450 SAR
- Qatar Airways QR603 - 600 SAR
- Saudi Airlines SV101 - 480 SAR

### Mock Bundles:
- **Basic** - Free
- **Premium** - +150 SAR
- **Business** - +350 SAR

To test:
1. Start at `/ar/ndc-flights` (or `/en/ndc-flights`)
2. Keep default search values
3. Click "Search Flights"
4. Select any flight
5. Follow through the complete flow

---

## 🔐 Security Considerations

✅ **Implemented:**
- Client-side validation
- API response validation
- localStorage used for session data only
- CSS hiding of sensitive data in print

⚠️ **TO IMPLEMENT:**
- Server-side validation (add to Laravel)
- Payment gateway integration (Moyasar/Telr)
- Authentication token requirements
- CSRF token validation
- Rate limiting
- PCI compliance for card handling

---

## 🚀 Next Steps for Production

### 1. **Connect Real Payment Gateway**
```javascript
// Replace mock payment in checkout/page.jsx
const response = await initiateMoyasarPayment({
  amount: getTotalPrice() * 100,
  currency: 'SAR',
  description: `Flight booking - ${flight.flightNumber}`
});
```

### 2. **Add Authentication**
```javascript
// Add to all pages
const { user, isLoading } = useAuth();
if (!isLoading && !user) {
  redirect(`/${lang}/login`);
}
```

### 3. **Implement Real Booking Flow**
- Connect to actual airline GDS
- Handle inventory
- Real-time pricing
- Seat selection UI

### 4. **Email Integration**
- Confirmation emails
- Itinerary attachments
- Check-in reminders
- Cancellation emails

### 5. **Database Storage**
- Save bookings to database
- User booking history
- Support tickets
- Email notification logs

---

## 📧 Environment Variables

Add to `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_MOYASAR_PUBLISHABLE_KEY=your_key_here
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| API not responding | Check Laravel backend is running on port 8000 |
| localStorage errors | Clear browser cache (Ctrl+Shift+Delete) |
| Styling looks broken | Install Tailwind CSS: `npm install -D tailwindcss` |
| Pages not rendering | Check file paths and route naming conventions |
| API CORS errors | Add CORS headers in Laravel config/cors.php |

---

## 📞 Support

For issues or questions:
1. Check Laravel logs: `storage/logs/laravel.log`
2. Check browser console (F12 → Console tab)
3. Verify API endpoints are correct
4. Test endpoints with Postman

---

## ✅ Checklist for Going Live

- [ ] Connect to real flight API
- [ ] Implement payment gateway
- [ ] Add user authentication
- [ ] Set up email notifications
- [ ] Add booking database storage
- [ ] Test with real transactions
- [ ] Set up error monitoring
- [ ] Configure CDN for assets
- [ ] Add SSL/HTTPS
- [ ] Create privacy policy
- [ ] Add terms & conditions
- [ ] Test on all devices
- [ ] Set up customer support system

---

**Created:** February 19, 2026
**Version:** 1.0
**Status:** Ready for Development
