// This route used to send admin emails. We now persist bookings to backend instead of emailing.
// For legacy compatibility, it will forward the payload to the backend guest booking endpoint.
const BACKEND_API = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || process.env.BACKEND_API_URL || null;

if (!BACKEND_API) {
  console.error('BACKEND_API is not configured. Set NEXT_PUBLIC_API_URL or API_URL to your backend address.');
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      destination,
      numberOfGuests,
      checkInDate,
      checkOutDate,
      phoneNumber,
      entertainment,
      folkloreShow,
      activities,
      foodPreferences,
      specialRequests,
      userEmail,
      lang
    } = body;

    // Validate required fields
    if (!phoneNumber || !checkInDate || !checkOutDate) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Format the booking details
    const activitiesList = Object.entries(activities)
      .filter(([_, value]) => value)
      .map(([key, _]) => key)
      .join(", ");

    const foodList = Object.entries(foodPreferences)
      .filter(([key, value]) => {
        if (key === "other") return value.trim().length > 0;
        return value;
      })
      .map(([key, value]) => (key === "other" ? value : key))
      .join(", ");

    const isArabic = lang === "ar";

    // Email content in both languages
    const emailContent = isArabic
      ? `
        <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right; background-color: #f5f5f5; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #dfa528; text-align: center; margin-bottom: 30px;">طلب حجز جديد 🌴</h2>
            
            <div style="border-right: 4px solid #dfa528; padding-right: 15px; margin-bottom: 20px;">
              <h3 style="color: #333; margin: 0 0 15px 0;">📍 معلومات الحجز الأساسية</h3>
              <p><strong>الوجهة:</strong> ${destination}</p>
              <p><strong>عدد الأشخاص:</strong> ${numberOfGuests}</p>
              <p><strong>تاريخ الوصول:</strong> ${checkInDate}</p>
              <p><strong>تاريخ المغادرة:</strong> ${checkOutDate}</p>
              <p><strong>رقم الجوال:</strong> ${phoneNumber}</p>
            </div>

            ${
              entertainment || folkloreShow
                ? `
            <div style="border-right: 4px solid #dfa528; padding-right: 15px; margin-bottom: 20px;">
              <h3 style="color: #333; margin: 0 0 15px 0;">🎶 الترفيه والأنشطة</h3>
              ${entertainment ? `<p><strong>الترفيه المفضل:</strong> ${entertainment}</p>` : ""}
              ${folkloreShow ? "<p>✅ عرض فولكلور شعبي تقليدي</p>" : ""}
              ${activitiesList ? `<p><strong>الأنشطة المختارة:</strong> ${activitiesList}</p>` : ""}
            </div>
            `
                : ""
            }

            ${
              foodList || specialRequests
                ? `
            <div style="border-right: 4px solid #dfa528; padding-right: 15px; margin-bottom: 20px;">
              <h3 style="color: #333; margin: 0 0 15px 0;">🍽️ تفضيلات الطعام والطلبات الخاصة</h3>
              ${foodList ? `<p><strong>تفضيلات الطعام:</strong> ${foodList}</p>` : ""}
              ${specialRequests ? `<p><strong>الطلبات الخاصة:</strong> ${specialRequests}</p>` : ""}
            </div>
            `
                : ""
            }

            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; text-align: center;">
              <p style="margin: 0; color: #666; font-size: 14px;">
                يرجى التواصل مع العميل للتأكيد على التفاصيل والإجابة على أي استفسارات.
              </p>
            </div>
          </div>
        </div>
      `
      : `
        <div style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #dfa528; text-align: center; margin-bottom: 30px;">New Booking Request 🌴</h2>
            
            <div style="border-left: 4px solid #dfa528; padding-left: 15px; margin-bottom: 20px;">
              <h3 style="color: #333; margin: 0 0 15px 0;">📍 Basic Booking Information</h3>
              <p><strong>Destination:</strong> ${destination}</p>
              <p><strong>Number of Guests:</strong> ${numberOfGuests}</p>
              <p><strong>Check-in Date:</strong> ${checkInDate}</p>
              <p><strong>Check-out Date:</strong> ${checkOutDate}</p>
              <p><strong>Phone Number:</strong> ${phoneNumber}</p>
            </div>

            ${
              entertainment || folkloreShow
                ? `
            <div style="border-left: 4px solid #dfa528; padding-left: 15px; margin-bottom: 20px;">
              <h3 style="color: #333; margin: 0 0 15px 0;">🎶 Entertainment & Activities</h3>
              ${entertainment ? `<p><strong>Preferred Entertainment:</strong> ${entertainment}</p>` : ""}
              ${folkloreShow ? "<p>✅ Traditional Folklore Show</p>" : ""}
              ${activitiesList ? `<p><strong>Selected Activities:</strong> ${activitiesList}</p>` : ""}
            </div>
            `
                : ""
            }

            ${
              foodList || specialRequests
                ? `
            <div style="border-left: 4px solid #dfa528; padding-left: 15px; margin-bottom: 20px;">
              <h3 style="color: #333; margin: 0 0 15px 0;">🍽️ Food Preferences & Special Requests</h3>
              ${foodList ? `<p><strong>Food Preferences:</strong> ${foodList}</p>` : ""}
              ${specialRequests ? `<p><strong>Special Requests:</strong> ${specialRequests}</p>` : ""}
            </div>
            `
                : ""
            }

            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; text-align: center;">
              <p style="margin: 0; color: #666; font-size: 14px;">
                Please contact the customer to confirm details and answer any questions.
              </p>
            </div>
          </div>
        </div>
      `;

    // Instead of sending emails, forward the booking to the backend guest bookings endpoint
    if (!BACKEND_API) {
      console.error('No BACKEND_API configured to persist bookings');
      return Response.json({ error: 'Booking persistence not configured' }, { status: 500 });
    }

    // Map incoming payload to backend expected fields
    const bookingPayload = {
      name: userEmail ? userEmail.split('@')[0] : (destination || 'Guest'),
      email: userEmail || null,
      phone: phoneNumber || null,
      date: checkInDate || date || null,
      guests: numberOfGuests || passengers || 1,
      details: {
        source: bookingLocation || 'frontend',
        raw: {
          destination,
          bookingType,
          roomType,
          flightFrom,
          flightTo,
          activities,
          foodPreferences,
        }
      }
    };

    try {
      const res = await fetch(`${BACKEND_API.replace(/\/$/, '')}/api/bookings/guest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingPayload),
      });

      const json = await res.json();

      if (!res.ok) {
        console.error('Backend booking failed', json);
        return Response.json({ error: json?.message || 'Failed to persist booking' }, { status: res.status || 500 });
      }

      return Response.json({ success: true, booking: json.booking, message: json.message }, { status: 200 });
    } catch (err) {
      console.error('Forwarding booking to backend failed', err?.message || err);
      return Response.json({ error: 'Failed to persist booking' }, { status: 500 });
    }
  } catch (error) {
    console.error("Booking API error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
