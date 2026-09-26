'use client';

export default function SignInBanner({ show = true }) {
  if (!show) return null;
  
  return (
    <div style={{
      background:'#eff6ff',
      borderBottom:'1px solid #dbeafe',
      padding:'9px 24px',
      textAlign:'center',
      fontSize:'0.82rem',
      color:'#1e40af'
    }}>
      <strong>Already a Tilal Rimal member?</strong>{' '}
      <span style={{cursor:'pointer',textDecoration:'underline',color:'#4361ee'}}>
        Sign in now and speed up your booking!
      </span>
    </div>
  );
}
