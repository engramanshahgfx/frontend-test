'use client';

import { bookingStyles } from './styles';
import BookingNavbar from './BookingNavbar';
import StepBar from './StepBar';
import SignInBanner from './SignInBanner';

export default function BookingLayout({ children, currentStep = 1, showSignIn = true }) {
  return (
    <div style={{
      minHeight:'100vh',
      background:'#f4f5f7',
      fontFamily:"'Nunito Sans','Segoe UI',sans-serif",
      color:'#1a1a2e'
    }}>
      <style>{bookingStyles}</style>
      <BookingNavbar />
      <StepBar currentStep={currentStep} />
      <SignInBanner show={showSignIn && currentStep <= 2} />
      {children}
    </div>
  );
}
