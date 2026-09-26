"use client";
import styles from "@/styles/login.module.css";
import React, { useState, useEffect } from "react";
import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useAuth } from "@/providers/AuthProvider";
import { authAPI } from "@/lib/api";
import { FiUserPlus, FiPhone, FiMail, FiUser, FiShield } from "react-icons/fi";
import { GoLock } from "react-icons/go";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

import Loading from "@/components/Loading";

export default function RegisterPage({ params }) {
  const { lang } = use(params);
  const { user, loading: authLoading, register, verifyOtp, sendOtp } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [visibleConfirm, setVisibleConfirm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    password_confirmation: "",
  });

  // Email pre-check state
  const [emailExists, setEmailExists] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  
  // OTP flow state
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [devOtp, setDevOtp] = useState(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  const translations = {
    en: {
      title: "Create Account",
      subtitle: "Join us today! Fill in your details to get started",
      name: "Full Name",
      namePlaceholder: "Enter your full name",
      email: "Email (optional)",
      emailPlaceholder: "you@example.com (optional)",
      phone: "Phone",
      phonePlaceholder: "+966xxxxxxxxx",
      password: "Password",
      passwordPlaceholder: "Create a password (min 6 chars)",
      confirmPassword: "Confirm Password",
      confirmPasswordPlaceholder: "Repeat your password",
      register: "Create Account",
      haveAccount: "Have an account?",
      login: "Login",
      otpTitle: "Verify Your Phone",
      otpSubtitle: "Enter the verification code sent to your phone",
      otpPlaceholder: "Enter 6-digit code",
      verify: "Verify",
      resendCode: "Resend Code",
      backToRegister: "Back to Registration",
      codeSentTo: "Code sent to",
      emailAvailable: "Email available",
      emailTaken: "This email is already registered.",
      checkingEmail: "Checking email...",
    },
    ar: {
      title: "إنشاء حساب",
      subtitle: "انضم إلينا اليوم! أكمل بياناتك للبدء",
      name: "الاسم الكامل",
      namePlaceholder: "أدخل اسمك الكامل",
      email: "البريد الإلكتروني (اختياري)",
      emailPlaceholder: "you@example.com (اختياري)",
      phone: "رقم الجوال",
      phonePlaceholder: "+966xxxxxxxxx",
      password: "كلمة المرور",
      passwordPlaceholder: "أنشئ كلمة مرور (6 أحرف على الأقل)",
      confirmPassword: "تأكيد كلمة المرور",
      confirmPasswordPlaceholder: "أعد إدخال كلمة المرور",
      register: "إنشاء حساب",
      haveAccount: "لديك حساب؟",
      login: "تسجيل الدخول",
      otpTitle: "تحقق من رقم الجوال",
      otpSubtitle: "أدخل رمز التحقق المرسل إلى هاتفك",
      otpPlaceholder: "أدخل الرمز المكون من 6 أرقام",
      verify: "تحقق",
      resendCode: "إعادة إرسال الرمز",
      backToRegister: "العودة للتسجيل",
      codeSentTo: "تم إرسال الرمز إلى",
      emailAvailable: "البريد الإلكتروني متاح",
      emailTaken: "هذا البريد مسجل مسبقاً.",
      checkingEmail: "جاري التحقق من البريد...",
    },

     zh: {
    title: "创建账户",
    subtitle: "立即加入我们！填写您的信息开始使用",
    name: "全名",
    namePlaceholder: "请输入您的全名",
    email: "电子邮箱（选填）",
    emailPlaceholder: "you@example.com（可选）",
    phone: "电话号码",
    phonePlaceholder: "+966xxxxxxxxx",
    password: "密码",
    passwordPlaceholder: "设置密码（至少6位）",
    confirmPassword: "确认密码",
    confirmPasswordPlaceholder: "再次输入密码",
    register: "创建账户",
    haveAccount: "已有账户？",
    login: "登录",
    otpTitle: "验证您的手机",
    otpSubtitle: "请输入发送到您手机的验证码",
    otpPlaceholder: "输入6位数字验证码",
    verify: "验证",
    resendCode: "重新发送验证码",
    backToRegister: "返回注册",
    codeSentTo: "验证码已发送至",
    emailAvailable: "电子邮箱可用",
    emailTaken: "该电子邮箱已被注册。",
    checkingEmail: "正在检查电子邮箱...",
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

  // Debounced email existence check
  useEffect(() => {
    let timer;
    setEmailExists(false);

    if (!formData.email) return;

    timer = setTimeout(async () => {
      setCheckingEmail(true);
      try {
        const res = await authAPI.emailExists(formData.email);
        setEmailExists(!!res.exists);
      } catch (err) {
        console.error('Email check failed:', err);
        setEmailExists(false);
      } finally {
        setCheckingEmail(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.email]);

  const handleDataChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
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

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (emailExists) {
      toast.error(t.emailTaken);
      return;
    }

    if (formData.password !== formData.password_confirmation) {
      toast.error(lang === 'ar' ? 'كلمات المرور غير متطابقة' : 'Passwords do not match');
      return;
    }

    setLoading(true);
    
    try {
      const registerData = {
        name: formData.name,
        email: formData.email && formData.email.trim() ? formData.email.trim() : null,
        phone: formData.phone,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
      };

      const result = await register(registerData);

      if (result.success) {
        if (result.requiresOtp) {
          setShowOtp(true);
          setDevOtp(result.devOtp);
          setResendCooldown(60);
        } else {
          toast.success(lang === 'ar' ? 'تم إنشاء الحساب بنجاح!' : 'Account created successfully!');
          const returnUrl = getReturnUrl();
          clearReturnUrl();
          router.push(returnUrl);
        }
      }
    } catch (error) {
      toast.error(error.message || (lang === 'ar' ? 'حدث خطأ أثناء التسجيل' : 'An error occurred during registration'));
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const result = await verifyOtp(formData.phone, otpCode, 'register');
      
      if (result.success) {
        toast.success(lang === 'ar' ? 'تم إنشاء الحساب بنجاح!' : 'Account created successfully!');
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
      const result = await sendOtp(formData.phone, 'register');
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
    if (user && !authLoading) {
      const timer = setTimeout(() => {
        const returnUrl = getReturnUrl();
        clearReturnUrl();
        router.push(returnUrl);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [user, authLoading, lang, router]);

  if (authLoading) {
    return <Loading />;
  }

  if (user) {
    return <Loading />;
  }

  // OTP Verification Form
  if (showOtp) {
    return (
      <div
        className="d-flex align-items-center"
        style={{ minHeight: "calc(100vh - 88px)", backgroundColor: "#000" }}
      >
      <div className="container py-5" style={{ paddingTop: "15rem" }}>
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
                {t.codeSentTo}: <strong>{formData.phone}</strong>
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
                  {t.backToRegister}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Registration Form
  return (
    <div
      className="d-flex "
      style={{ minHeight: "calc(100vh - 88px)", backgroundColor: "#7b7b7b", justifyContent: "center", alignItems: "flex-start", paddingTop: "2rem" }}
    >
      <div className="container py-5" style={{}}>

        <div className="d-flex flex-column align-items-center" style={{ width: "100%" }}>
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
                boxShadow: "0px 0px 16.15px 0px rgba(0, 0, 0, 0.07)",
              }}
            >
              <FiUserPlus style={{ width: "30px", height: "30px" }} />
            </div>
            <div className="fs-4 text-center mb-2" style={{ fontWeight: "600" }}>
              {t.title}
            </div>
            <div className="text-secondary text-center mb-4" style={{ fontSize: "14px" }}>
              {t.subtitle}
            </div>
            
            <form className="w-100" onSubmit={handleRegister}>
              {/* Name */}
              <div className="mb-3 position-relative">
                <label className="form-label small fw-semibold">{t.name}</label>
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    transform: "translateY(-50%)",
                    marginTop: "12px",
                    left: lang === "ar" ? "" : "12px",
                    right: lang === "ar" ? "12px" : "",
                  }}
                >
                  <FiUser style={{ width: "18px", height: "18px", color: "rgba(135, 135, 135, 1)" }} />
                </div>
                <input
                  type="text"
                  className="form-control"
                  style={{
                    borderRadius: "15px",
                    paddingLeft: lang === "ar" ? "" : "40px",
                    paddingRight: lang === "ar" ? "40px" : "",
                    height: "50px",
                  }}
                  name="name"
                  placeholder={t.namePlaceholder}
                  value={formData.name}
                  onChange={handleDataChange}
                  required
                />
              </div>

              {/* Email (optional) */}
              <div className="mb-3 position-relative">
                <label className="form-label small fw-semibold">{t.email}</label>
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    transform: "translateY(-50%)",
                    marginTop: "12px",
                    left: lang === "ar" ? "" : "12px",
                    right: lang === "ar" ? "12px" : "",
                  }}
                >
                  <FiMail style={{ width: "18px", height: "18px", color: "rgba(135, 135, 135, 1)" }} />
                </div>
                <input
                  type="email"
                  className="form-control"
                  style={{
                    borderRadius: "15px",
                    paddingLeft: lang === "ar" ? "" : "40px",
                    paddingRight: lang === "ar" ? "40px" : "",
                    height: "50px",
                  }}
                  name="email"
                  placeholder={t.emailPlaceholder}
                  value={formData.email}
                  onChange={handleDataChange}
                />
                {checkingEmail && (
                  <small className="text-muted">{t.checkingEmail}</small>
                )}
                {!checkingEmail && emailExists && (
                  <small className="text-danger">⚠️ {t.emailTaken}</small>
                )}
                {!checkingEmail && !emailExists && formData.email && (
                  <small className="text-success">✅ {t.emailAvailable}</small>
                )}
              </div>

              {/* Phone */}
              <div className="mb-3 position-relative">
                <label className="form-label small fw-semibold">{t.phone}</label>
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    transform: "translateY(-50%)",
                    marginTop: "12px",
                    left: lang === "ar" ? "" : "12px",
                    right: lang === "ar" ? "12px" : "",
                  }}
                >
                  <FiPhone style={{ width: "18px", height: "18px", color: "rgba(135, 135, 135, 1)" }} />
                </div>
                <input
                  type="tel"
                  className="form-control"
                  style={{
                    borderRadius: "15px",
                    paddingLeft: lang === "ar" ? "" : "40px",
                    paddingRight: lang === "ar" ? "40px" : "",
                    height: "50px",
                  }}
                  placeholder={t.phonePlaceholder}
                  name="phone"
                  value={formData.phone}
                  onChange={handleDataChange}
                  required
                />
              </div>

              {/* Password */}
              <div className="mb-3 position-relative">
                <label className="form-label small fw-semibold">{t.password}</label>
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    transform: "translateY(-50%)",
                    marginTop: "12px",
                    left: lang === "ar" ? "" : "12px",
                    right: lang === "ar" ? "12px" : "",
                  }}
                >
                  <GoLock style={{ width: "18px", height: "18px", color: "rgba(135, 135, 135, 1)" }} />
                </div>
                <input
                  type={visible ? "text" : "password"}
                  className="form-control"
                  style={{
                    borderRadius: "15px",
                    paddingLeft: lang === "ar" ? "" : "40px",
                    paddingRight: lang === "ar" ? "40px" : "",
                    height: "50px",
                  }}
                  name="password"
                  placeholder={t.passwordPlaceholder}
                  value={formData.password}
                  onChange={handleDataChange}
                  minLength={6}
                  required
                />
                {visible ? (
                  <VisibilityIcon
                    style={{
                      position: "absolute",
                      top: "50%",
                      transform: "translateY(-50%)",
                      marginTop: "12px",
                      right: lang === "en" ? 12 : "",
                      left: lang === "ar" ? 12 : "",
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
                      marginTop: "12px",
                      right: lang === "en" ? 12 : "",
                      left: lang === "ar" ? 12 : "",
                      color: "rgba(134, 141, 151, 1)",
                      cursor: "pointer",
                    }}
                    onClick={() => setVisible(true)}
                  />
                )}
              </div>

              {/* Confirm Password */}
              <div className="mb-4 position-relative">
                <label className="form-label small fw-semibold">{t.confirmPassword}</label>
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    transform: "translateY(-50%)",
                    marginTop: "12px",
                    left: lang === "ar" ? "" : "12px",
                    right: lang === "ar" ? "12px" : "",
                  }}
                >
                  <GoLock style={{ width: "18px", height: "18px", color: "rgba(135, 135, 135, 1)" }} />
                </div>
                <input
                  type={visibleConfirm ? "text" : "password"}
                  className="form-control"
                  style={{
                    borderRadius: "15px",
                    paddingLeft: lang === "ar" ? "" : "40px",
                    paddingRight: lang === "ar" ? "40px" : "",
                    height: "50px",
                  }}
                  name="password_confirmation"
                  placeholder={t.confirmPasswordPlaceholder}
                  value={formData.password_confirmation}
                  onChange={handleDataChange}
                  minLength={6}
                  required
                />
                {visibleConfirm ? (
                  <VisibilityIcon
                    style={{
                      position: "absolute",
                      top: "50%",
                      transform: "translateY(-50%)",
                      marginTop: "12px",
                      right: lang === "en" ? 12 : "",
                      left: lang === "ar" ? 12 : "",
                      color: "rgba(134, 141, 151, 1)",
                      cursor: "pointer",
                    }}
                    onClick={() => setVisibleConfirm(false)}
                  />
                ) : (
                  <VisibilityOffIcon
                    style={{
                      position: "absolute",
                      top: "50%",
                      transform: "translateY(-50%)",
                      marginTop: "12px",
                      right: lang === "en" ? 12 : "",
                      left: lang === "ar" ? 12 : "",
                      color: "rgba(134, 141, 151, 1)",
                      cursor: "pointer",
                    }}
                    onClick={() => setVisibleConfirm(true)}
                  />
                )}
              </div>

              <button
                type="submit"
                className="primaryButton w-100"
                style={{ borderWidth: 0, borderRadius: "15px", height: "44px" }}
                disabled={loading || emailExists}
              >
                {loading ? (
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                ) : (
                  t.register
                )}
              </button>

              <div className="text-center mt-3" style={{ fontSize: "14px" }}>
                {t.haveAccount}{" "}
                <Link href={`/${lang}/login`} style={{ color: "#0d6efd", fontWeight: "500" }}>
                  {t.login}
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
