"use client";
import React, { useState } from "react";
import styles from "@/styles/login.module.css";
import { toast } from "react-toastify";
import { LuAtSign } from "react-icons/lu";
import { GoLock } from "react-icons/go";
import { FiShield } from "react-icons/fi";
import { useParams } from "next/navigation";
import { authAPI } from '@/lib/api';

export default function ForgotPassword() {
  const params = useParams();
  const lang = params?.lang || 'en';

  const [step, setStep] = useState(1); // 1: phone, 2: OTP, 3: password
  const [identifier, setIdentifier] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [devOtp, setDevOtp] = useState(null);

const translations = {
    en: {
      title: "Forgot Password",
      step1Title: "Enter Email or Saudi Mobile",
      step1Subtitle: "Enter your account email or mobile, or the contact used for your paid guest booking. We will send a verification code.",
      step2Title: "Verify OTP",
      step2Subtitle: "Enter the OTP sent to your phone",
      step3Title: "Set New Password",
      step3Subtitle: "Enter your new password",
      identifierPlaceholder: "Email or 05XXXXXXXX / +9665XXXXXXXX",
      otpPlaceholder: "Enter 6-digit OTP",
      passwordPlaceholder: "New password",
      confirmPasswordPlaceholder: "Confirm new password",
      sendOtp: "Send OTP",
      verifyOtp: "Verify OTP",
      resetPassword: "Reset Password",
      success: "Password reset successfully! Redirecting to login...",
      back: "Back",
    },
    ar: {
      title: "نسيت كلمة المرور",
      step1Title: "أدخل البريد الإلكتروني أو الجوال السعودي",
      step1Subtitle: "أدخل بريد حسابك أو رقم جوالك، أو بيانات التواصل المستخدمة في حجزك المدفوع كضيف. سنرسل رمز التحقق.",
      step2Title: "تحقق من الرمز",
      step2Subtitle: "أدخل الرمز المرسل إلى جوالك",
      step3Title: "تعيين كلمة مرور جديدة",
      step3Subtitle: "أدخل كلمة المرور الجديدة",
      identifierPlaceholder: "البريد الإلكتروني أو 05XXXXXXXX / +9665XXXXXXXX",
      otpPlaceholder: "أدخل رمز التحقق المكون من 6 أرقام",
      passwordPlaceholder: "كلمة المرور الجديدة",
      confirmPasswordPlaceholder: "تأكيد كلمة المرور الجديدة",
      sendOtp: "إرسال الرمز",
      verifyOtp: "التحقق من الرمز",
      resetPassword: "تعيين كلمة المرور",
      success: "تم إعادة تعيين كلمة المرور بنجاح! جاري التحويل إلى تسجيل الدخول...",
      back: "رجوع",
    },
    zh: {
      title: "忘记密码",
      step1Title: "输入电子邮箱或沙特手机号",
      step1Subtitle: "请输入账户邮箱或手机号，或已付款游客预订中使用的联系方式。我们将发送验证码。",
      step2Title: "验证验证码",
      step2Subtitle: "输入发送到您手机的验证码",
      step3Title: "设置新密码",
      step3Subtitle: "输入您的新密码",
      identifierPlaceholder: "电子邮箱或沙特手机号",
      otpPlaceholder: "输入6位验证码",
      passwordPlaceholder: "新密码",
      confirmPasswordPlaceholder: "确认新密码",
      sendOtp: "发送验证码",
      verifyOtp: "验证验证码",
      resetPassword: "重置密码",
      success: "密码重置成功！正在跳转到登录页面...",
      back: "返回",
    }
  };

  const t = translations[lang] || translations.en;

  const handleSendOtp = async (e) => {
    e && e.preventDefault();
    setLoading(true);
    try {
      const data = await authAPI.sendOtp(identifier, 'reset');
      setDevOtp(data.dev_otp || null);
      setStep(2); // Move to OTP verification step
      toast.success('OTP sent successfully');
    } catch (err) {
      console.error('sendOtp error', err);
      toast.error(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e && e.preventDefault();
    setLoading(true);
    try {
      const data = await authAPI.verifyOtp(identifier, otpCode, 'reset');
      if (!data.success) throw new Error(data.message || 'OTP verification failed');
      setStep(3); // Move to password reset step
      toast.success('OTP verified successfully');
    } catch (err) {
      console.error('verifyOtp error', err);
      toast.error('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (password !== passwordConfirmation) {
      toast.error('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const data = await authAPI.resetPassword(identifier, otpCode, password, passwordConfirmation);
      if (!data.success) throw new Error(data.message || 'Reset failed');
      toast.success(t.success);
      // Redirect to login page after 2 seconds
      setTimeout(() => {
        window.location.href = `/${lang}/login`;
      }, 2000);
    } catch (err) {
      console.error('Reset password error:', err);
      toast.error(err.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    if (step === 1) return;
    setStep(step - 1);
  };

  return (
    <div className="d-flex align-items-center" style={{ minHeight: "calc(100vh - 88px)", backgroundColor: "#000" }}>
      <div className="container py-5">
        <div className="d-flex flex-column align-items-center">
          <div className={`px-2 px-sm-4 py-4 d-flex flex-column align-items-center ${styles.formWidth}`} style={{ borderRadius: "25px", border: "1px solid rgba(202, 218, 231, 1)", background: "linear-gradient(180deg, #E2F2FF 0%, rgba(255, 255, 255, 0) 78.01%)" }}>
            
            {/* Icon */}
            <div className="d-flex justify-content-center align-items-center mb-4" style={{ width: "61px", height: "61px", backgroundColor: "white", borderRadius: "12px", boxShadow: "0px 0px 16.15px 0px rgba(0, 0, 0, 0.07)" }}>
              {step === 1 && <LuAtSign style={{ width: "30px", height: "30px" }} />}
              {step === 2 && <FiShield style={{ width: "30px", height: "30px" }} />}
              {step === 3 && <GoLock style={{ width: "30px", height: "30px" }} />}
            </div>

            {/* Title & Subtitle */}
            <div className="fs-4 text-center mb-2" style={{ fontWeight: 600 }}>
              {step === 1 && t.step1Title}
              {step === 2 && t.step2Title}
              {step === 3 && t.step3Title}
            </div>
            <div className="text-secondary text-center mb-4" style={{ fontSize: "14px" }}>
              {step === 1 && t.step1Subtitle}
              {step === 2 && t.step2Subtitle}
              {step === 3 && t.step3Subtitle}
            </div>

            {/* Step 1: Enter Phone */}
            {step === 1 && (
              <form className="w-100" onSubmit={handleSendOtp}>
                <div className="mb-3 position-relative">
                  <input 
                    type="text"
                    className="form-control" 
                    style={{ borderRadius: "15px", paddingLeft: lang === "ar" ? "" : "40px", paddingRight: lang === "ar" ? "40px" : "", height: "50px" }} 
                    placeholder={t.identifierPlaceholder}
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required 
                  />
                </div>
                <button type="submit" className="primaryButton w-100" style={{ borderWidth: 0, borderRadius: "15px", height: "44px" }} disabled={loading}>
                  {loading ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> : t.sendOtp}
                </button>
              </form>
            )}

            {/* Step 2: Verify OTP */}
            {step === 2 && (
              <form className="w-100" onSubmit={handleVerifyOtp}>
                <div className="mb-3 position-relative">
                  <input 
                    type="text" 
                    className="form-control text-center" 
                    style={{ borderRadius: "15px", height: "50px", fontSize: "24px", letterSpacing: "8px", fontWeight: "bold" }} 
                    placeholder={t.otpPlaceholder} 
                    value={otpCode} 
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))} 
                    maxLength={6}
                    required 
                  />
                </div>
                
                {devOtp && (
                  <div style={{ marginBottom: '10px', padding: '8px', background: '#e7f5e7', color: '#2d7d2d', borderRadius: '6px', textAlign: 'center' }}>
                    Dev OTP: <strong>{devOtp}</strong>
                  </div>
                )}

                <button type="submit" className="primaryButton w-100 mb-2" style={{ borderWidth: 0, borderRadius: "15px", height: "44px" }} disabled={loading || otpCode.length !== 6}>
                  {loading ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> : t.verifyOtp}
                </button>
                
                <button type="button" className="btn btn-outline-secondary w-100" onClick={goBack} style={{ borderRadius: "15px", height: "44px" }}>
                  {t.back}
                </button>
              </form>
            )}

            {/* Step 3: Set New Password */}
            {step === 3 && (
              <form className="w-100" onSubmit={handleResetPassword}>
                <div className="mb-3 position-relative">
                  <input 
                    type="password" 
                    className="form-control" 
                    style={{ borderRadius: "15px", paddingLeft: lang === "ar" ? "" : "40px", paddingRight: lang === "ar" ? "40px" : "", height: "50px" }} 
                    placeholder={t.passwordPlaceholder} 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                    minLength={6} 
                  />
                </div>
                
                <div className="mb-3 position-relative">
                  <input 
                    type="password" 
                    className="form-control" 
                    style={{ borderRadius: "15px", paddingLeft: lang === "en" ? "40px" : "", paddingRight: lang === "ar" ? "40px" : "", height: "50px" }} 
                    placeholder={t.confirmPasswordPlaceholder} 
                    value={passwordConfirmation} 
                    onChange={(e) => setPasswordConfirmation(e.target.value)} 
                    required 
                    minLength={6} 
                  />
                </div>

                <button type="submit" className="primaryButton w-100 mb-2" style={{ borderWidth: 0, borderRadius: "15px", height: "44px" }} disabled={loading || !password || !passwordConfirmation}>
                  {loading ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> : t.resetPassword}
                </button>
                
                <button type="button" className="btn btn-outline-secondary w-100" onClick={goBack} style={{ borderRadius: "15px", height: "44px" }}>
                  {t.back}
                </button>
              </form>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
