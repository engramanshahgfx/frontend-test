"use client";

import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useUI } from "../providers/UIProvider";
import { useAuth } from "../providers/AuthProvider";
import { authAPI } from "../lib/api"; // for email existence pre-check

const initialRegister = {
  name: "",
  email: "",
  phone: "",
  password: "",
  password_confirmation: "",
};

export default function AuthModal({ onAuthenticated }) {
  const params = useParams();
  const lang = params?.lang || "en";
  const isRTL = lang === "ar";
  const { authModal, closeAuthModal, handleAuthSuccess } = useUI();
  const { login, register, verifyOtp, sendOtp, cancelOtp, pendingOtp } = useAuth();

  const [mode, setMode] = useState(authModal.mode || "login");
  const [form, setForm] = useState(initialRegister);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mounted, setMounted] = useState(false);

  // Email pre-check state
  const [emailExists, setEmailExists] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  
  // OTP verification state
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpPhone, setOtpPhone] = useState("");
  const [otpType, setOtpType] = useState("login");
  const [devOtp, setDevOtp] = useState(null); // For development mode hint
  const [resendCooldown, setResendCooldown] = useState(0);

  const t = useMemo(
    () => {
      // Determine which language text to use
      if (lang === "ar") {
        return {
          loginTitle: "تسجيل الدخول",
          registerTitle: "إنشاء حساب",
          otpTitle: "التحقق من الرمز",
          email: "البريد الإلكتروني",
          password: "كلمة المرور",
          confirmPassword: "تأكيد كلمة المرور",
          name: "الاسم",
          phone: "رقم الجوال",
          loginBtn: "تسجيل الدخول",
          haveAccount: "لديك حساب؟",
          newHere: "مستخدم جديد؟",
          goLogin: "تسجيل الدخول",
          goRegister: "إنشاء حساب",
          loadingLogin: "جاري تسجيل الدخول...",
          loadingRegister: "جاري إنشاء الحساب...",
          otpLabel: "رمز التحقق",
          otpPlaceholder: "أدخل الرمز المكون من 6 أرقام",
          verifyBtn: "تحقق",
          loadingVerify: "جاري التحقق...",
          resendOtp: "إعادة إرسال الرمز",
          otpSentTo: "تم إرسال الرمز إلى",
          backToLogin: "العودة لتسجيل الدخول",
          devOtpHint: "رمز التطوير",
          forgotPassword: "هل نسيت كلمة المرور؟",
        };
      } else if (lang === "zh") {
        return {
          loginTitle: "登录",
          registerTitle: "创建账户",
          otpTitle: "验证验证码",
          email: "电子邮件",
          password: "密码",
          confirmPassword: "确认密码",
          name: "姓名",
          phone: "手机号码",
          loginBtn: "登录",
          haveAccount: "已有账户？",
          newHere: "新用户？",
          goLogin: "登录",
          goRegister: "创建账户",
          loadingLogin: "正在登录...",
          loadingRegister: "正在创建账户...",
          otpLabel: "验证码",
          otpPlaceholder: "输入6位验证码",
          verifyBtn: "验证",
          loadingVerify: "正在验证...",
          resendOtp: "重新发送验证码",
          otpSentTo: "验证码已发送至",
          backToLogin: "返回登录",
          devOtpHint: "开发验证码",
          forgotPassword: "忘记密码？",
        };
      } else {
        // English (default)
        return {
          loginTitle: "Login",
          registerTitle: "Create Account",
          otpTitle: "Verify OTP",
          email: "Email",
          password: "Password",
          confirmPassword: "Confirm Password",
          name: "Name",
          phone: "Phone",
          loginBtn: "Login",
          haveAccount: "Have an account?",
          newHere: "New here?",
          goLogin: "Login",
          goRegister: "Create Account",
          loadingLogin: "Logging in...",
          loadingRegister: "Creating account...",
          otpLabel: "Verification Code",
          otpPlaceholder: "Enter 6-digit code",
          verifyBtn: "Verify",
          loadingVerify: "Verifying...",
          resendOtp: "Resend Code",
          otpSentTo: "Code sent to",
          backToLogin: "Back to Login",
          devOtpHint: "Dev OTP",
          forgotPassword: "Forgot password?",
        };
      }
    },
    [lang]
  );

  useEffect(() => {
    setMode(authModal.mode || "login");
    if (authModal.open) {
      setError(null);
      setForm(initialRegister);
      setShowOtpInput(false);
      setOtpCode("");
      setDevOtp(null);
    }
  }, [authModal.open, authModal.mode]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Debounced email existence check (trigger on change)
  useEffect(() => {
    let timer;
    setEmailExists(false);

    if (!form.email) return;

    timer = setTimeout(async () => {
      setCheckingEmail(true);
      try {
        const res = await authAPI.emailExists(form.email);
        setEmailExists(!!res.exists);
      } catch (err) {
        console.error('Email check failed:', err);
        setEmailExists(false);
      } finally {
        setCheckingEmail(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [form.email]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (authModal.open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [authModal.open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setError(null);
    setShowOtpInput(false);
    setOtpCode("");
    setDevOtp(null);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await login({ phone: form.phone, password: form.password });
      if (res.success) {
        if (res.requiresOtp) {
          // Show OTP input
          setShowOtpInput(true);
          setOtpPhone(res.phone);
          setOtpType("login");
          setDevOtp(res.devOtp);
          setResendCooldown(60);
        } else {
          // Direct login (admin)
          handleAuthSuccess();
          onAuthenticated?.();
        }
      } else {
        // Language-specific error messages
        if (lang === "ar") {
          setError(res.error?.message || "فشل تسجيل الدخول");
        } else if (lang === "zh") {
          setError(res.error?.message || "登录失败");
        } else {
          setError(res.error?.message || "Login failed");
        }
      }
    } catch (err) {
      // Language-specific error messages
      if (lang === "ar") {
        setError(err?.message || "فشل تسجيل الدخول");
      } else if (lang === "zh") {
        setError(err?.message || "登录失败");
      } else {
        setError(err?.message || "Login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Prevent registration if email already exists
      if (emailExists) {
        // Language-specific error message
        if (lang === "ar") {
          setError('هذا البريد الإلكتروني مسجل بالفعل. يرجى تسجيل الدخول لعرض حجوزاتك.');
        } else if (lang === "zh") {
          setError('此电子邮件已注册。请登录以查看您的预订。');
        } else {
          setError('This email is already registered. Please login to view your reservations.');
        }
        setLoading(false);
        return;
      }

      // Convert empty email to null for proper validation
      const registerData = {
        name: form.name,
        email: form.email && form.email.trim() ? form.email.trim() : null,
        phone: form.phone,
        password: form.password,
        password_confirmation: form.password_confirmation,
      };
      
      const res = await register(registerData);
      if (res.success) {
        if (res.requiresOtp) {
          // Show OTP input
          setShowOtpInput(true);
          setOtpPhone(res.phone);
          setOtpType("register");
          setDevOtp(res.devOtp);
          setResendCooldown(60);
        } else {
          handleAuthSuccess();
          onAuthenticated?.();
        }
      } else {
        // Language-specific error messages
        if (lang === "ar") {
          setError(res.error?.message || "فشل إنشاء الحساب");
        } else if (lang === "zh") {
          setError(res.error?.message || "创建账户失败");
        } else {
          setError(res.error?.message || "Registration failed");
        }
      }
    } catch (err) {
      // Language-specific error messages
      if (lang === "ar") {
        setError(err?.message || "فشل إنشاء الحساب");
      } else if (lang === "zh") {
        setError(err?.message || "创建账户失败");
      } else {
        setError(err?.message || "Registration failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await verifyOtp(otpPhone, otpCode, otpType);
      if (res.success) {
        handleAuthSuccess();
        onAuthenticated?.();
      } else {
        // Language-specific error messages
        if (lang === "ar") {
          setError(res.message || "رمز غير صحيح");
        } else if (lang === "zh") {
          setError(res.message || "验证码无效");
        } else {
          setError(res.message || "Invalid code");
        }
      }
    } catch (err) {
      // Language-specific error messages
      if (lang === "ar") {
        setError(err?.message || "فشل التحقق");
      } else if (lang === "zh") {
        setError(err?.message || "验证失败");
      } else {
        setError(err?.message || "Verification failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    
    setLoading(true);
    setError(null);
    try {
      const res = await sendOtp(otpPhone, otpType);
      if (res.success) {
        setResendCooldown(60);
        setDevOtp(res.devOtp);
      } else {
        // Language-specific error messages
        if (lang === "ar") {
          setError(res.message || "فشل إعادة الإرسال");
        } else if (lang === "zh") {
          setError(res.message || "重新发送失败");
        } else {
          setError(res.message || "Failed to resend");
        }
      }
    } catch (err) {
      // Language-specific error messages
      if (lang === "ar") {
        setError(err?.message || "فشل إعادة الإرسال");
      } else if (lang === "zh") {
        setError(err?.message || "重新发送失败");
      } else {
        setError(err?.message || "Failed to resend");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBackFromOtp = () => {
    setShowOtpInput(false);
    setOtpCode("");
    setDevOtp(null);
    cancelOtp();
  };

  // Don't render if not mounted or modal is closed
  if (!mounted || !authModal.open) return null;

  const overlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 99999,
    padding: "1rem",
  };

  const shellStyle = {
    background: "#fff",
    borderRadius: "12px",
    width: "100%",
    maxWidth: "480px",
    position: "relative",
    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
    maxHeight: "90vh",
    overflowY: "auto",
    direction: isRTL ? "rtl" : "ltr",
  };

  const closeStyle = {
    position: "absolute",
    top: "12px",
    right: isRTL ? "auto" : "12px",
    left: isRTL ? "12px" : "auto",
    background: "none",
    border: "none",
    fontSize: "28px",
    cursor: "pointer",
    color: "#777",
    zIndex: 10,
    width: "36px",
    height: "36px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
  };

  const bodyStyle = {
    padding: "2rem 1.75rem 1.5rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
    textAlign: isRTL ? "right" : "left",
  };

  const h3Style = {
    margin: "0 0 0.5rem",
    color: "#111",
    fontSize: "1.5rem",
  };

  const labelStyle = {
    fontWeight: 600,
    fontSize: "0.95rem",
    color: "#333",
  };

  const inputStyle = {
    width: "100%",
    padding: "0.75rem",
    borderRadius: "8px",
    border: "1px solid #ddd",

    fontSize: "1rem",
    fontFamily: '"Tajawal", sans-serif',
    boxSizing: "border-box",
    textAlign: isRTL ? "right" : "left",
    direction: isRTL ? "rtl" : "ltr",
  };

  const primaryStyle = {
    marginTop: "0.5rem",
    width: "100%",
    padding: "0.9rem",
    background: "#0070f3",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontWeight: 700,
    cursor: loading ? "not-allowed" : "pointer",
    fontFamily: '"Tajawal", sans-serif',
    fontSize: "1rem",
    opacity: loading ? 0.7 : 1,
  }; 

  const switcherStyle = {
    textAlign: "center",
    color: "#555",
    fontSize: "0.95rem",
    marginTop: "0.5rem",
  };

  const switcherBtnStyle = {
    background: "none",
    border: "none",
    color: "#0070f3",
    cursor: "pointer",
    fontSize: "0.95rem",
  };

  const errorStyle = {
    background: "#fdecea",
    color: "#b91c1c",
    padding: "0.75rem",
    borderRadius: "8px",
    border: "1px solid #f5c2c7",
    fontSize: "0.9rem",
  };

  const otpInputStyle = {
    ...inputStyle,
    fontSize: "1.5rem",
    textAlign: "center",
    letterSpacing: "0.5rem",
    fontWeight: "bold",
  };

  const resendStyle = {
    background: "none",
    border: "none",
    color: resendCooldown > 0 ? "#999" : "#0070f3",
    cursor: resendCooldown > 0 ? "not-allowed" : "pointer",
    fontSize: "0.9rem",
    padding: "0.5rem 0",
  };

  const backBtnStyle = {
    background: "none",
    border: "1px solid #ddd",
    color: "#555",
    padding: "0.75rem",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.95rem",
    marginTop: "0.5rem",
  };

  const devHintStyle = {
    background: "#e7f5e7",
    color: "#2d7d2d",
    padding: "0.5rem 0.75rem",
    borderRadius: "6px",
    fontSize: "0.85rem",
    textAlign: "center",
    marginTop: "0.5rem",
  };

  const modal = (
    <div style={overlayStyle} onClick={closeAuthModal}>
      <div style={shellStyle} onClick={(e) => e.stopPropagation()}>
        <button style={closeStyle} onClick={closeAuthModal} aria-label="Close">
          ×
        </button>

        {/* OTP Verification Step */}
        {showOtpInput && (
          <form onSubmit={handleVerifyOtp} style={bodyStyle}>
            <h3 style={h3Style}>{t.otpTitle}</h3>
            {error && <div style={errorStyle}>{error}</div>}
            
            <p style={{ color: "#666", fontSize: "0.95rem", margin: "0.5rem 0" }}>
              {t.otpSentTo} <strong>{otpPhone}</strong>
            </p>
            
            <label style={labelStyle}>{t.otpLabel}</label>
            <input 
              style={otpInputStyle} 
              name="otp" 
              type="text" 
              value={otpCode} 
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder={t.otpPlaceholder}
              maxLength={6}
              autoComplete="one-time-code"
              required 
            />
            
            <button type="submit" style={primaryStyle} disabled={loading || otpCode.length !== 6}>
              {loading ? t.loadingVerify : t.verifyBtn}
            </button>
            
            <button 
              type="button" 
              style={resendStyle} 
              onClick={handleResendOtp}
              disabled={resendCooldown > 0 || loading}
            >
              {resendCooldown > 0 
                ? `${t.resendOtp} (${resendCooldown}s)` 
                : t.resendOtp}
            </button>
            
            <button type="button" style={backBtnStyle} onClick={handleBackFromOtp}>
              {t.backToLogin}
            </button>
          </form>
        )}

        {/* Login Form */}
        {mode === "login" && !showOtpInput && (
          <form onSubmit={handleLogin} style={bodyStyle}>
            <h3 style={h3Style}>{t.loginTitle}</h3>
            {error && <div style={errorStyle}>{error}</div>}
            <label style={labelStyle}>{t.phone}</label>
            <input style={inputStyle} name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="+966xxxxxxxxx" required />
            <label style={labelStyle}>{t.password}</label>
            <input style={inputStyle} name="password" type="password" value={form.password} onChange={handleChange} required />

            <div style={{ textAlign: isRTL ? 'left' : 'right', marginTop: '8px' }}>
              <Link href={`/${lang}/forgot-password`} onClick={closeAuthModal} style={{ color: '#0070f3', textDecoration: 'none', fontSize: '0.95rem' }}>
                {t.forgotPassword}
              </Link>
            </div>

            <button type="submit" style={primaryStyle} disabled={loading}>
              {loading ? t.loadingLogin : t.loginBtn}
            </button>
            <p style={switcherStyle}>
              {t.newHere} <button type="button" style={switcherBtnStyle} onClick={() => switchMode("register")}>{t.goRegister}</button>
            </p>
          </form>
        )}

        {/* Register Form */}
        {mode === "register" && !showOtpInput && (
          <form onSubmit={handleRegister} style={bodyStyle}>
            <h3 style={h3Style}>{t.registerTitle}</h3>
            {error && <div style={errorStyle}>{error}</div>}
            <label style={labelStyle}>{t.name}</label>
            <input style={inputStyle} name="name" value={form.name} onChange={handleChange} required />
            <label style={labelStyle}>{t.email} ({isRTL ? "اختياري" : "optional"})</label>
            {/* Use text input to avoid browser email format validation; backend accepts free-text email */}
            <input style={inputStyle} name="email" type="text" value={form.email} onChange={handleChange} />
            {checkingEmail && <small style={{ display: 'block', color: '#6c757d' }}>Checking email...</small>}
            {!checkingEmail && emailExists && (
              <div style={{ marginTop: '6px', color: '#c82333', fontSize: '0.9rem' }}>
                ⚠️ This email is already registered. <button type="button" onClick={() => switchMode('login')} style={{ border: 'none', background: 'none', color: '#0d6efd', cursor: 'pointer' }}>Login</button> to view your reservations.
              </div>
            )}
            {!checkingEmail && !emailExists && form.email && (
              <div style={{ marginTop: '6px', color: '#28a745', fontSize: '0.9rem' }}>
                ✅ Email available
              </div>
            )}
            <label style={labelStyle}>{t.phone}</label>
            <input style={inputStyle} name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="+966xxxxxxxxx" required />
            <label style={labelStyle}>{t.password}</label>
            <input style={inputStyle} name="password" type="password" value={form.password} onChange={handleChange} required minLength={6} />
            <label style={labelStyle}>{t.confirmPassword}</label>
            <input style={inputStyle} name="password_confirmation" type="password" value={form.password_confirmation} onChange={handleChange} required minLength={6} />
            <button type="submit" style={primaryStyle} disabled={loading || emailExists}>
              {loading ? t.loadingRegister : t.goRegister}
            </button>
            <p style={switcherStyle}>
              {t.haveAccount} <button type="button" style={switcherBtnStyle} onClick={() => switchMode("login")}>{t.goLogin}</button>
            </p>
          </form>
        )}
      </div>
    </div>
  );

  // Render portal directly to document.body
  return createPortal(modal, document.body);
}
