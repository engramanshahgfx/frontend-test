'use server';

import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
const toEmail = process.env.RECEIVING_EMAIL;

const resend = new Resend(resendApiKey);

export async function sendBookingEmail(formData) {
  if (!resendApiKey) {
    throw new Error('Email provider (RESEND_API_KEY) is not configured');
  }
  if (!toEmail) {
    throw new Error('Admin receiving email (RECEIVING_EMAIL) is not configured');
  }

  try {
    // Format activities list
    const activitiesList = Object.entries(formData.activities)
      .filter(([_, value]) => value)
      .map(([key]) => {
        switch(key) {
          case 'seaCruise': return 'Sea Cruise';
          case 'fishing': return 'Fishing';
          case 'adventures': return 'Adventures';
          default: return key;
        }
      })
      .join(', ') || 'None';

    // Format food preferences
    const foodPreferences = Object.entries(formData.foodPreferences)
      .filter(([key, value]) => value && key !== 'other')
      .map(([key]) => {
        switch(key) {
          case 'hotDrinks': return 'Hot Drinks (Coffee, Tea)';
          case 'customDinner': return 'Custom Dinner';
          default: return key;
        }
      })
      .join(', ') || 'None';

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: 'Booking System <onboarding@resend.dev>',
      to: [toEmail],
      subject: `New Booking Request: ${formData.destination}`,
      replyTo: formData.phoneNumber ? `+${formData.phoneNumber.replace(/\D/g, '')}@sms.resend.dev` : undefined,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #dfa528, #b8860b); padding: 20px; border-radius: 10px 10px 0 0; color: white; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 10px 10px; border: 1px solid #ddd; }
            .section { margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #eee; }
            .label { font-weight: bold; color: #dfa528; width: 180px; display: inline-block; }
            .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
            .badge { background: #dfa528; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px; margin-left: 5px; }
            .timestamp { color: #888; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🌴 New Island Booking Request</h1>
              <p class="timestamp">Submitted: ${new Date().toLocaleString()}</p>
            </div>
            
            <div class="content">
              <div class="section">
                <h2>📍 Destination Details</h2>
                <p><span class="label">Destination:</span> ${formData.destination}</p>
                <p><span class="label">Language:</span> ${formData.lang === 'ar' ? 'Arabic' : 'English'}</p>
              </div>
              
              <div class="section">
                <h2>👥 Guest Information</h2>
                <p><span class="label">Number of Guests:</span> ${formData.numberOfGuests}</p>
                <p><span class="label">Check-in Date:</span> ${formData.checkInDate}</p>
                <p><span class="label">Check-out Date:</span> ${formData.checkOutDate}</p>
                <p><span class="label">Phone Number:</span> ${formData.phoneNumber}</p>
              </div>
              
              ${formData.entertainment || formData.folkloreShow || activitiesList !== 'None' ? `
              <div class="section">
                <h2>🎭 Entertainment & Activities</h2>
                ${formData.entertainment ? `<p><span class="label">Entertainment:</span> ${formData.entertainment}</p>` : ''}
                ${formData.folkloreShow ? `<p><span class="label">Folklore Show:</span> <span class="badge">Requested</span></p>` : ''}
                ${activitiesList !== 'None' ? `<p><span class="label">Activities:</span> ${activitiesList}</p>` : ''}
              </div>
              ` : ''}
              
              ${foodPreferences !== 'None' || formData.foodPreferences?.other || formData.specialRequests ? `
              <div class="section">
                <h2>🍽️ Preferences & Requests</h2>
                ${foodPreferences !== 'None' ? `<p><span class="label">Food Preferences:</span> ${foodPreferences}</p>` : ''}
                ${formData.foodPreferences?.other ? `<p><span class="label">Other Preferences:</span> ${formData.foodPreferences.other}</p>` : ''}
                ${formData.specialRequests ? `<p><span class="label">Special Requests:</span> ${formData.specialRequests}</p>` : ''}
              </div>
              ` : ''}
              
              <div class="footer">
                <p>📧 This email was sent from your Island Booking System</p>
                <p>⏰ Please respond within 24 hours to confirm the booking</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    });

    if (error) {
      console.error('Resend error:', error);
      throw new Error('Failed to send email');
    }

    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
}