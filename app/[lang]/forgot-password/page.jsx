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

  const [step, setStep] = useState(1); // 1: Email, 2: New Password & Token
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [devToken, setDevToken] = useState(null);
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [loading, setLoading] = useState(false);

  const translations = {
    en: {
      title: "Forgot Password",
      step1Title: "Recover Your Account",
      step1Subtitle: "Enter the email used during registration or guest booking",
      step2Title: "Set New Password",
      step2Subtitle: "Enter the reset token sent to your email and your new password",
      emailPlaceholder: "you@example.com",
      tokenPlaceholder: "Reset Token",
      passwordPlaceholder: "New Password (min 6 chars)",
      confirmPasswordPlaceholder: "Confirm New Password",
      sendEmail: "Send Reset Link",
      resetPassword: "Set New Password & Login",
      success: "Password reset successfully! Logging you in...",
      back: "Back",
    },
    ar: {
      title: "نسيت كلمة المرور",
      step1Title: "استعادة الحساب",
      step1Subtitle: "أدخل البريد الإلكتروني المستخدَم في التسجيل أو حجز الزائر",
      step2Title: "تعيين كلمة مرور جديدة",
      step2Subtitle: "أدخل رمز إعادة التعيين المرسل إلى بريدك وكلمة المرور الجديدة",
      emailPlaceholder: "you@example.com",
      tokenPlaceholder: "رمز إعادة التعيين",
      passwordPlaceholder: "كلمة المرور الجديدة (6 أحرف على الأقل)",
      confirmPasswordPlaceholder: "تأكيد كلمة المرور الجديدة",
      sendEmail: "إرسال رابط التعيين",
      resetPassword: "تعيين كلمة المرور وتسجيل الدخول",
      success: "تم إعادة تعيين كلمة المرور بنجاح! جاري تسجيل الدخول...",
      back: "رجوع",
    },
    zh: {
      title: "忘记密码",
      step1Title: "恢复您的账户",
      step1Subtitle: "请输入注册或游客预订时使用的电子邮箱",
      step2Title: "设置新密码",
      step2Subtitle: "请输入发送到您邮箱的重置令牌及新密码",
      emailPlaceholder: "you@example.com",
      tokenPlaceholder: "重置令牌",
      passwordPlaceholder: "新密码（至少6位）",
      confirmPasswordPlaceholder: "确认新密码",
      sendEmail: "发送重置链接",
      resetPassword: "设置新密码并登录",
      success: "密码重置成功！正在为您登录...",
      back: "返回",
    }
  };

  const t = translations[lang] || translations.en;

  const handleSendEmail = async (e) => {
    e && e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error(lang === 'ar' ? 'يرجى إدخال بريد إلكتروني صحيح' : 'Please enter a valid email');
      return;
    }
    setLoading(true);
    try {
      const data = await authAPI.forgotPassword(email.trim());
      if (data.dev_token) {
        setDevToken(data.dev_token);
        setResetToken(data.dev_token);
      }
      setStep(2);
      toast.success(data.message || (lang === 'ar' ? 'تم إرسال تعليمات إعادة التعيين إلى بريدك' : 'Reset instructions sent to your email'));
    } catch (err) {
      console.error('forgotPassword error', err);
      toast.error(err.message || (lang === 'ar' ? 'فشل إرسال تعليمات إعادة التعيين' : 'Failed to send reset instructions'));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (password !== passwordConfirmation) {
      toast.error(lang === 'ar' ? 'كلمات المرور غير متطابقة' : 'Passwords do not match');
      return;
    }
    if (password.length < 6) {
      toast.error(lang === 'ar' ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters');
      return;
    }
    if (!resetToken) {
      toast.error(lang === 'ar' ? 'يرجى إدخال رمز إعادة التعيين' : 'Please enter the reset token');
      return;
    }
    setLoading(true);
    try {
      const data = await authAPI.resetPasswordWithToken(email.trim(), resetToken.trim(), password, passwordConfirmation);
      if (!data.success) throw new Error(data.message || 'Reset failed');
      
      if (data.token) {
        localStorage.setItem('auth_token', data.token);
      }
      toast.success(t.success);
      setTimeout(() => {
        window.location.href = `/${lang}/dashboard`;
      }, 1500);
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
    <div className="d-flex align-items-center justify-content-center" style={{ minHeight: "100vh", paddingTop: "140px", paddingBottom: "80px", backgroundColor: "#f8fafc" }}>
      <div className="container py-3">
        <div className="d-flex flex-column align-items-center">
          <div className={`px-2 px-sm-4 py-4 d-flex flex-column align-items-center ${styles.formWidth}`} style={{ borderRadius: "25px", border: "1px solid rgba(202, 218, 231, 1)", background: "linear-gradient(180deg, #E2F2FF 0%, #ffffff 78.01%)", boxShadow: "0 10px 30px rgba(0,0,0,0.06)" }}>

            {/* Icon */}
            <div className="d-flex justify-content-center align-items-center mb-4" style={{ width: "61px", height: "61px", backgroundColor: "white", borderRadius: "12px", boxShadow: "0px 0px 16.15px 0px rgba(0, 0, 0, 0.07)" }}>
              {step === 1 ? <LuAtSign style={{ width: "30px", height: "30px" }} /> : <GoLock style={{ width: "30px", height: "30px" }} />}
            </div>

            {/* Title & Subtitle */}
            <div className="fs-4 text-center mb-2" style={{ fontWeight: 600 }}>
              {step === 1 ? t.step1Title : t.step2Title}
            </div>
            <div className="text-secondary text-center mb-4" style={{ fontSize: "14px" }}>
              {step === 1 ? t.step1Subtitle : t.step2Subtitle}
            </div>

            {/* Step 1: Enter Email */}
            {step === 1 && (
              <form className="w-100" onSubmit={handleSendEmail}>
                <div className="mb-3 position-relative">
                  <label className="form-label small fw-semibold">{lang === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}</label>
                  <input
                    type="email"
                    className="form-control"
                    style={{ borderRadius: "15px", height: "50px" }}
                    placeholder={t.emailPlaceholder}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="primaryButton w-100" style={{ borderWidth: 0, borderRadius: "15px", height: "44px" }} disabled={loading}>
                  {loading ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> : t.sendEmail}
                </button>
              </form>
            )}

            {/* Step 2: Set New Password */}
            {step === 2 && (
              <form className="w-100" onSubmit={handleResetPassword}>
                {devToken && (
                  <div className="alert alert-info w-100 text-center mb-3" style={{ fontSize: "13px" }}>
                    Dev Reset Token: <strong>{devToken}</strong>
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label small fw-semibold">{t.tokenPlaceholder}</label>
                  <input
                    type="text"
                    className="form-control"
                    style={{ borderRadius: "15px", height: "50px" }}
                    placeholder={t.tokenPlaceholder}
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3 position-relative">
                  <label className="form-label small fw-semibold">{t.passwordPlaceholder}</label>
                  <input
                    type="password"
                    className="form-control"
                    style={{ borderRadius: "15px", height: "50px" }}
                    placeholder={t.passwordPlaceholder}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>

                <div className="mb-4 position-relative">
                  <label className="form-label small fw-semibold">{t.confirmPasswordPlaceholder}</label>
                  <input
                    type="password"
                    className="form-control"
                    style={{ borderRadius: "15px", height: "50px" }}
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
