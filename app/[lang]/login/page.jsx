"use client";
import styles from "@/styles/login.module.css";
import React, { useState, useEffect } from "react";
import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useAuth } from "@/providers/AuthProvider";
import { FiLogIn, FiPhone, FiShield } from "react-icons/fi";
import { GoLock } from "react-icons/go";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

import Loading from "@/components/Loading";

export default function LoginPage({ params }) {
  const { lang } = use(params);
  const { user, loading: authLoading, login, verifyOtp, sendOtp } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [userData, setUserData] = useState({
    phone: "",
    password: "",
  });
  
  // OTP flow state
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [devOtp, setDevOtp] = useState(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  const translations = {
    en: {
      title: "Log in to your account",
      subtitle: "Welcome back! Please enter your details",
      phone: "Phone (e.g., +966501234567)",
      password: "Password",
      forgotPassword: "Forgot password?",
      login: "Login",
      newHere: "New here?",
      createAccount: "Create Account",
      otpTitle: "Verify Your Phone",
      otpSubtitle: "Enter the verification code sent to your phone",
      otpPlaceholder: "Enter 6-digit code",
      verify: "Verify",
      resendCode: "Resend Code",
      backToLogin: "Back to Login",
      codeSentTo: "Code sent to",
    },
    ar: {
      title: "تسجيل الدخول إلى حسابك",
      subtitle: "مرحبًا بعودتك! الرجاء إدخال بياناتك",
      phone: "رقم الجوال (مثال: +966501234567)",
      password: "كلمة المرور",
      forgotPassword: "هل نسيت كلمة المرور؟",
      login: "تسجيل الدخول",
      newHere: "جديد هنا؟",
      createAccount: "إنشاء حساب",
      otpTitle: "تحقق من رقم الجوال",
      otpSubtitle: "أدخل رمز التحقق المرسل إلى هاتفك",
      otpPlaceholder: "أدخل الرمز المكون من 6 أرقام",
      verify: "تحقق",
      resendCode: "إعادة إرسال الرمز",
      backToLogin: "العودة لتسجيل الدخول",
      codeSentTo: "تم إرسال الرمز إلى",
    },

     zh: {
    title: "登录您的账户",
    subtitle: "欢迎回来！请输入您的详细信息",
    phone: "电话号码（例如：+966501234567）",
    password: "密码",
    forgotPassword: "忘记密码？",
    login: "登录",
    newHere: "新用户？",
    createAccount: "创建账户",
    otpTitle: "验证您的手机",
    otpSubtitle: "请输入发送到您手机的验证码",
    otpPlaceholder: "输入6位数字验证码",
    verify: "验证",
    resendCode: "重新发送验证码",
    backToLogin: "返回登录",
    codeSentTo: "验证码已发送至",
  },
  };

  const t = translations[lang] || translations.en;

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleDataChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const getReturnUrl = () => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('auth_return_url') || `/${lang}/dashboard`;
    }
    return `/${lang}/dashboard`;
  };

  const clearReturnUrl = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('auth_return_url');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const result = await login({
        phone: userData.phone,
        password: userData.password,
      });

      if (result.success) {
        if (result.requiresOtp) {
          // Show OTP input
          setShowOtp(true);
          setDevOtp(result.devOtp);
          setResendCooldown(60);
        } else {
          // Direct login (admin)
          toast.success(lang === 'ar' ? 'تم تسجيل الدخول بنجاح!' : 'Login successful!');
          const returnUrl = getReturnUrl();
          clearReturnUrl();
          router.push(returnUrl);
        }
      }
    } catch (error) {
      toast.error(error.message || (lang === 'ar' ? 'حدث خطأ أثناء تسجيل الدخول' : 'An error occurred during login'));
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const result = await verifyOtp(userData.phone, otpCode, 'login');
      
      if (result.success) {
        toast.success(lang === 'ar' ? 'تم تسجيل الدخول بنجاح!' : 'Login successful!');
        const returnUrl = getReturnUrl();
        clearReturnUrl();
        router.push(returnUrl);
      } else {
        toast.error(result.message || (lang === 'ar' ? 'رمز غير صحيح' : 'Invalid code'));
      }
    } catch (error) {
      toast.error(error.message || (lang === 'ar' ? 'فشل التحقق' : 'Verification failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    
    setLoading(true);
    try {
      const result = await sendOtp(userData.phone, 'login');
      if (result.success) {
        setResendCooldown(60);
        setDevOtp(result.devOtp);
        toast.info(lang === 'ar' ? 'تم إرسال رمز جديد' : 'New code sent');
      }
    } catch (error) {
      toast.error(error.message || (lang === 'ar' ? 'فشل إعادة الإرسال' : 'Failed to resend'));
    } finally {
      setLoading(false);
    }
  };

  const handleBackFromOtp = () => {
    setShowOtp(false);
    setOtpCode("");
    setDevOtp(null);
  };

  useEffect(() => {
    // Only redirect if user is logged in AND we've finished loading
    if (user && !authLoading) {
      const timer = setTimeout(() => {
        const returnUrl = getReturnUrl();
        clearReturnUrl();
        router.push(returnUrl);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [user, authLoading, lang, router]);

  // Show loading while checking auth
  if (authLoading) {
    return <Loading />;
  }

  // If user is logged in, show loading while redirecting
  if (user) {
    return <Loading />;
  }

  // OTP Verification Form
  if (showOtp) {
    return (
      <div
        className="d-flex align-items-center"
        style={{ minHeight: "calc(100vh - 88px)", backgroundColor: "#acaaaa" }}
      >
        <div className="container py-5">
          <div className="d-flex flex-column align-items-center">
            <div
              className={`px-2 px-sm-4 py-4 d-flex flex-column align-items-center ${styles.formWidth}`}
              style={{
                borderRadius: "25px",
                border: "1px solid rgba(202, 218, 231, 1)",
                background:
                  "linear-gradient(180deg, #E2F2FF 0%,",
              }}
            >
              <div
                className="d-flex justify-content-center align-items-center mb-4"
                style={{
                  width: "61px",
                  height: "61px",
                  backgroundColor: "white",
                  borderRadius: "12px",
                  boxShadow: "0px 0px 16.15px 0px rgba(0, 0, 0, 0.07)",
                }}
              >
                <FiShield style={{ width: "30px", height: "30px", color: "#0d6efd" }} />
              </div>
              <div className="fs-4 text-center mb-2" style={{ fontWeight: "600" }}>
                {t.otpTitle}
              </div>
              <div className="text-secondary text-center mb-2" style={{ fontSize: "14px" }}>
                {t.otpSubtitle}
              </div>
              <div className="text-center mb-4" style={{ fontSize: "14px", color: "#0d6efd" }}>
                {t.codeSentTo}: <strong>{userData.phone}</strong>
              </div>
              
              {devOtp && (
                <div className="alert alert-success w-100 text-center mb-3" style={{ fontSize: "14px" }}>
                  Dev OTP: <strong>{devOtp}</strong>
                </div>
              )}
              
              <form className="w-100" onSubmit={handleVerifyOtp}>
                <div className="mb-4">
                  <input
                    type="text"
                    className="form-control text-center"
                    style={{
                      borderRadius: "15px",
                      height: "60px",
                      fontSize: "24px",
                      fontWeight: "bold",
                      letterSpacing: "8px",
                    }}
                    placeholder={t.otpPlaceholder}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="primaryButton w-100 mb-3"
                  style={{ borderWidth: 0, borderRadius: "15px", height: "44px" }}
                  disabled={loading || otpCode.length !== 6}
                >
                  {loading ? (
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  ) : (
                    t.verify
                  )}
                </button>

                <button
                  type="button"
                  className="btn btn-link w-100"
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0 || loading}
                  style={{ color: resendCooldown > 0 ? "#999" : "#0d6efd" }}
                >
                  {resendCooldown > 0 ? `${t.resendCode} (${resendCooldown}s)` : t.resendCode}
                </button>

                <button
                  type="button"
                  className="btn btn-outline-secondary w-100 mt-2"
                  onClick={handleBackFromOtp}
                  style={{ borderRadius: "15px", height: "44px" }}
                >
                  {t.backToLogin}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Otherwise show login form
  return (
    <div
      className="d-flex align-items-center"
      style={{ minHeight: "calc(100vh - 88px)", backgroundColor: "#7b7b7b" }}
    >
      <div className="container py-5">
        <div className="d-flex flex-column align-items-center">
          <div
            className={`px-2 px-sm-4 py-4 d-flex flex-column align-items-center ${styles.formWidth}`}
            style={{
              borderRadius: "25px",
              border: "1px solid rgba(202, 218, 231, 1)",
              background:
                "linear-gradient(180deg, #E2F2FF 0%, rgba(255, 255, 255, 0) 78.01%)",
            }}
          >
            <div
              className="d-flex justify-content-center align-items-center mb-4"
              style={{
                width: "61px",
                height: "61px",
                backgroundColor: "white",
                borderRadius: "12px",
                boxShadow: " 0px 0px 16.15px 0px rgba(0, 0, 0, 0.07)",
              }}
            >
              <FiLogIn style={{ width: "30px", height: "30px" }} />
            </div>
            <div
              className="fs-4 text-center mb-2"
              style={{ fontWeight: "600" }}
            >
              {t.title}
            </div>
            <div
              className="text-secondary text-center mb-4"
              style={{ fontSize: "14px" }}
            >
              {t.subtitle}
            </div>
            <form className="w-100" onSubmit={handleLogin}>
              <div className="mb-3 position-relative">
                <input
                  type="tel"
                  className="form-control"
                  style={{
                    borderRadius: "15px",
                    height: "50px",
                  }}
                  placeholder={t.phone}
                  id="userPhone"
                  name="phone"
                  value={userData.phone}
                  onChange={handleDataChange}
                  required
                />
              </div>

              <div className="mb-2 position-relative">
                <input
                  type={visible ? "text" : "password"}
                  className="form-control"
                  placeholder={t.password}
                  style={{
                    borderRadius: "15px",
                    height: "50px",
                  }}
                  id="userPassword"
                  name="password"
                  value={userData.password}
                  onChange={handleDataChange}
                  required
                />
                {visible ? (
                  <VisibilityIcon
                    style={{
                      position: "absolute",
                      top: "50%",
                      transform: "translateY(-50%)",
                      right: lang === "en" ? 10 : "",
                      left: lang === "ar" ? 10 : "",
                      color: "rgba(134, 141, 151, 1)",
                      cursor: "pointer",
                    }}
                    onClick={() => setVisible(false)}
                  />
                ) : (
                  <VisibilityOffIcon
                    style={{
                      position: "absolute",
                      top: "50%",
                      transform: "translateY(-50%)",
                      right: lang === "en" ? 10 : "",
                      left: lang === "ar" ? 10 : "",
                      color: "rgba(134, 141, 151, 1)",
                      cursor: "pointer",
                    }}
                    onClick={() => setVisible(true)}
                  />
                )}
              </div>

              <div className="mb-3 d-flex justify-content-end">
                <Link
                  href={`/${lang}/forgot-password`}
                  className="text-decoration-none text-dark"
                  style={{ fontSize: "14px", fontWeight: "600" }}
                >
                  {t.forgotPassword}
                </Link>
              </div>

              <button
                type="submit"
                className="primaryButton w-100"
                style={{ borderWidth: 0, borderRadius: "15px", height: "44px" }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm"
                      role="status"
                      aria-hidden="true"
                    ></span>
                  </>
                ) : (
                  <>{t.login}</>
                )}
              </button>

              <div className="text-center mt-3" style={{ fontSize: "14px" }}>
                {t.newHere}{" "}
                <Link href={`/${lang}/register`} style={{ color: "#0d6efd", fontWeight: "500" }}>
                  {t.createAccount}
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
