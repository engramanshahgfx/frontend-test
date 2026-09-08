"use client";
import styles from "@/styles/login.module.css";
import React, { useState, useEffect } from "react";
import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useAuth } from "@/providers/AuthProvider";
import { FiLogIn, FiPhone, FiShield, FiChevronDown } from "react-icons/fi";
import { GoLock } from "react-icons/go";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

import Loading from "@/components/Loading";

const COUNTRY_LIST = [
  { code: "+966", flag: "🇸🇦", country: "SA", nameAr: "السعودية", nameEn: "Saudi Arabia" },
  { code: "+971", flag: "🇦🇪", country: "AE", nameAr: "الإمارات", nameEn: "UAE" },
  { code: "+965", flag: "🇰🇼", country: "KW", nameAr: "الكويت", nameEn: "Kuwait" },
  { code: "+968", flag: "🇴🇲", country: "OM", nameAr: "عُمان", nameEn: "Oman" },
  { code: "+973", flag: "🇧🇭", country: "BH", nameAr: "البحرين", nameEn: "Bahrain" },
  { code: "+974", flag: "🇶🇦", country: "QA", nameAr: "قطر", nameEn: "Qatar" },
  { code: "+20", flag: "🇪🇬", country: "EG", nameAr: "مصر", nameEn: "Egypt" },
  { code: "+1", flag: "🇺🇸", country: "US", nameAr: "أمريكا", nameEn: "USA" },
];

export default function LoginPage({ params }) {
  const { lang } = use(params);
  const { user, loading: authLoading, login, sendOtp, verifyOtp } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [authMode, setAuthMode] = useState("mobile"); // "mobile" | "email" | "password"
  const [countryCode, setCountryCode] = useState("+966");
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [mobileNumber, setMobileNumber] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [visiblePassword, setVisiblePassword] = useState(false);

  const selectedCountry = COUNTRY_LIST.find(c => c.code === countryCode) || COUNTRY_LIST[0];

  // OTP State
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [activeIdentifier, setActiveIdentifier] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [devOtp, setDevOtp] = useState(null);
  const [cooldown, setCooldown] = useState(0);

  const translations = {
    en: {
      title: "Sign in or create account",
      subtitle: "Enter your mobile number or email to get started",
      mobileTab: "Mobile Number",
      emailTab: "Email Address",
      mobilePlaceholder: " ",
      emailPlaceholder: "you@example.com",
      continue: "Continue",
      or: "OR",
      continueWithEmail: "Continue with email",
      continueWithMobile: "Continue with mobile number",
      usePassword: "Log in with password instead",
      passwordLabel: "Password",
      forgotPassword: "Forgot password?",
      loginWithPasswordBtn: "Log In with Password",
      otpTitle: "Account verification",
      otpSubtitle: "Use the following one-time code to verify your account.",
      codeSentTo: "Verification code sent to",
      otpPlaceholder: "Enter 6-digit code",
      verify: "Verify & Continue",
      resendCode: "Resend Code",
      back: "Back",
    },
    ar: {
      title: "تسجيل الدخول أو إنشاء حساب",
      subtitle: "أدخل رقم الجوال أو البريد الإلكتروني للبدء",
      mobileTab: "رقم الجوال",
      emailTab: "البريد الإلكتروني",
      mobilePlaceholder: "رقم الجوال (مثال: 554400000)",
      emailPlaceholder: "you@example.com",
      continue: "متابعة",
      or: "أو",
      continueWithEmail: "المتابعة باستخدام البريد الإلكتروني",
      continueWithMobile: "المتابعة باستخدام رقم الجوال",
      usePassword: "تسجيل الدخول بكلمة المرور بدلاً من ذلك",
      passwordLabel: "كلمة المرور",
      forgotPassword: "هل نسيت كلمة المرور؟",
      loginWithPasswordBtn: "تسجيل الدخول بكلمة المرور",
      otpTitle: "التحقق من الحساب",
      otpSubtitle: "أدخل رمز التحقق المرسل إليك لتأكيد حسابك.",
      codeSentTo: "تم إرسال رمز التحقق إلى",
      otpPlaceholder: "أدخل الرمز المكون من 6 أرقام",
      verify: "تحقق ومتابعة",
      resendCode: "إعادة إرسال الرمز",
      back: "رجوع",
    },
    zh: {
      title: "登录或创建账户",
      subtitle: "输入您的手机号码或电子邮箱以开始使用",
      mobileTab: "手机号码",
      emailTab: "电子邮箱",
      mobilePlaceholder: "手机号码（例如 554400000）",
      emailPlaceholder: "you@example.com",
      continue: "继续",
      or: "或",
      continueWithEmail: "使用电子邮箱继续",
      continueWithMobile: "使用手机号码继续",
      usePassword: "改用密码登录",
      passwordLabel: "密码",
      forgotPassword: "忘记密码？",
      loginWithPasswordBtn: "使用密码登录",
      otpTitle: "账户验证",
      otpSubtitle: "使用发送给您的验证码来验证您的账户。",
      codeSentTo: "验证码已发送至",
      otpPlaceholder: "输入6位数字验证码",
      verify: "验证并继续",
      resendCode: "重新发送验证码",
      back: "返回",
    }
  };

  const t = translations[lang] || translations.en;

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

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

  // Send OTP handler (Mobile or Email)
  const handleSendOtp = async (e) => {
    e && e.preventDefault();

    let target = "";
    if (authMode === "mobile") {
      const cleanMobile = mobileNumber.replace(/\D/g, '');
      if (!cleanMobile) {
        toast.error(lang === 'ar' ? 'الرجاء إدخال رقم جوال صحيح' : 'Please enter a valid mobile number');
        return;
      }
      target = countryCode + cleanMobile;
    } else {
      if (!emailAddress || !emailAddress.includes('@')) {
        toast.error(lang === 'ar' ? 'الرجاء إدخال بريد إلكتروني صحيح' : 'Please enter a valid email');
        return;
      }
      target = emailAddress.trim();
    }

    setLoading(true);
    try {
      const res = await sendOtp(target, 'login');
      if (res.success) {
        setActiveIdentifier(target);
        setDevOtp(res.devOtp || null);
        setShowOtpScreen(true);
        setCooldown(60);
        toast.info(lang === 'ar' ? 'تم إرسال رمز التحقق' : 'Verification code sent!');
      } else {
        toast.error(res.message || (lang === 'ar' ? 'فشل إرسال الرمز' : 'Failed to send verification code'));
      }
    } catch (err) {
      console.error('sendOtp error:', err);
      toast.error(err.message || 'Error sending code');
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP handler
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otpCode.length !== 6) return;

    setLoading(true);
    try {
      const res = await verifyOtp(activeIdentifier, otpCode, 'login');
      if (res.success) {
        toast.success(lang === 'ar' ? 'تم التحقق وتسجيل الدخول بنجاح!' : 'Verified & logged in successfully!');
        const returnUrl = getReturnUrl();
        clearReturnUrl();
        router.push(returnUrl);
      } else {
        toast.error(res.message || (lang === 'ar' ? 'رمز غير صحيح' : 'Invalid code'));
      }
    } catch (err) {
      console.error('verifyOtp error:', err);
      toast.error(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  // Password Login Handler
  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const input = (authMode === 'mobile' ? (countryCode + mobileNumber) : emailAddress).trim();
    if (!input) {
      toast.error(lang === 'ar' ? 'الرجاء إدخال اسم المستخدم أو البريد أو رقم الجوال' : 'Please enter email or mobile number');
      setLoading(false);
      return;
    }

    try {
      const isEmail = input.includes('@');
      const credentials = {
        password: password,
        ...(isEmail ? { email: input } : { phone: input }),
      };

      const result = await login(credentials);
      if (result.success) {
        toast.success(lang === 'ar' ? 'تم تسجيل الدخول بنجاح!' : 'Login successful!');
        const returnUrl = getReturnUrl();
        clearReturnUrl();
        router.push(returnUrl);
      }
    } catch (error) {
      toast.error(error.message || (lang === 'ar' ? 'حدث خطأ أثناء تسجيل الدخول' : 'An error occurred during login'));
    } finally {
      setLoading(false);
    }
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

  if (authLoading || user) {
    return <Loading />;
  }

  // -------------------------------------------------------------
  // STEP 2: OTP Verification Screen (Almosafer Style)
  // -------------------------------------------------------------
  if (showOtpScreen) {
    return (
      <div
        className="d-flex align-items-center justify-content-center"
        style={{ minHeight: "100vh", paddingTop: "130px", paddingBottom: "80px", backgroundColor: "#f8fafc" }}
      >
        <div className="container py-3">
          <div className="d-flex flex-column align-items-center">
            <div
              className={`px-3 px-sm-4 py-4 d-flex flex-column align-items-center ${styles.formWidth}`}
              style={{
                borderRadius: "20px",
                border: "1px solid #e2e8f0",
                background: "#ffffff",
                boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
                maxWidth: "460px",
                width: "100%"
              }}
            >
              <div
                className="d-flex justify-content-center align-items-center mb-3"
                style={{
                  width: "56px",
                  height: "56px",
                  backgroundColor: "#eff6ff",
                  borderRadius: "14px",
                }}
              >
                <FiShield style={{ width: "28px", height: "28px", color: "#2563eb" }} />
              </div>

              <h4 className="fw-bold text-center mb-1">{t.otpTitle}</h4>
              <p className="text-secondary text-center mb-2" style={{ fontSize: "14px" }}>
                {t.otpSubtitle}
              </p>
              <div className="text-center mb-3 fw-semibold text-primary" style={{ fontSize: "14px" }}>
                {t.codeSentTo}: <span className="dir-ltr d-inline-block">{activeIdentifier}</span>
              </div>

              {devOtp && (
                <div className="alert alert-success w-100 text-center mb-3" style={{ fontSize: "14px", borderRadius: "12px" }}>
                  Dev verification code: <strong style={{ fontSize: "18px", letterSpacing: "2px" }}>{devOtp}</strong>
                </div>
              )}

              <form className="w-100" onSubmit={handleVerifyOtp}>
                <div className="mb-4">
                  <input
                    type="text"
                    className="form-control text-center"
                    style={{
                      borderRadius: "14px",
                      height: "56px",
                      fontSize: "26px",
                      fontWeight: "bold",
                      letterSpacing: "8px",
                      border: "2px solid #cbd5e1"
                    }}
                    placeholder="876900"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    autoFocus
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn w-100 mb-3"
                  style={{
                    backgroundColor: "#e11d48",
                    color: "#ffffff",
                    borderRadius: "14px",
                    height: "48px",
                    fontWeight: "600",
                    fontSize: "16px"
                  }}
                  disabled={loading || otpCode.length !== 6}
                >
                  {loading ? <span className="spinner-border spinner-border-sm" role="status"></span> : t.verify}
                </button>

                <button
                  type="button"
                  className="btn btn-link w-100 text-decoration-none mb-2"
                  onClick={handleSendOtp}
                  disabled={cooldown > 0 || loading}
                  style={{ color: cooldown > 0 ? "#94a3b8" : "#2563eb", fontSize: "14px", fontWeight: "500" }}
                >
                  {cooldown > 0 ? `${t.resendCode} (${cooldown}s)` : t.resendCode}
                </button>

                <button
                  type="button"
                  className="btn btn-outline-secondary w-100"
                  onClick={() => setShowOtpScreen(false)}
                  style={{ borderRadius: "14px", height: "44px" }}
                >
                  {t.back}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // STEP 1: Main Sign In / Create Account Screen (Almosafer Style)
  // -------------------------------------------------------------
  return (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: "100vh", paddingTop: "130px", paddingBottom: "80px", backgroundColor: "#f8fafc" }}
    >
      <div className="container py-3">
        <div className="d-flex flex-column align-items-center">
          <div
            className={`px-3 px-sm-4 py-4 d-flex flex-column align-items-center ${styles.formWidth}`}
            style={{
              borderRadius: "24px",
              border: "1px solid #e2e8f0",
              background: "#ffffff",
              boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
              maxWidth: "460px",
              width: "100%"
            }}
          >
            <div
              className="d-flex justify-content-center align-items-center mb-3"
              style={{
                width: "56px",
                height: "56px",
                backgroundColor: "#eff6ff",
                borderRadius: "14px",
              }}
            >
              <FiLogIn style={{ width: "26px", height: "26px", color: "#2563eb" }} />
            </div>

            <h4 className="fw-bold text-center mb-1" style={{ color: "#0f172a" }}>{t.title}</h4>
            <p className="text-secondary text-center mb-4" style={{ fontSize: "14px" }}>
              {t.subtitle}
            </p>

            {/* PASSWORD MODE FORM */}
            {authMode === "password" ? (
              <form className="w-100" onSubmit={handlePasswordLogin}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">
                    {lang === 'ar' ? 'البريد الإلكتروني أو رقم الجوال' : 'Email or Mobile Number'}
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    style={{ borderRadius: "14px", height: "48px" }}
                    placeholder={lang === 'ar' ? 'you@example.com أو 0554400000' : 'you@example.com or 0554400000'}
                    value={emailAddress || mobileNumber}
                    onChange={(e) => {
                      setEmailAddress(e.target.value);
                      setMobileNumber(e.target.value);
                    }}
                    required
                  />
                </div>

                <div className="mb-2 position-relative">
                  <label className="form-label small fw-semibold">{t.passwordLabel}</label>
                  <input
                    type={visiblePassword ? "text" : "password"}
                    className="form-control"
                    style={{ borderRadius: "14px", height: "48px" }}
                    placeholder={t.passwordLabel}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  {visiblePassword ? (
                    <VisibilityIcon
                      style={{
                        position: "absolute",
                        top: "50%",
                        transform: "translateY(-50%)",
                        marginTop: "12px",
                        right: lang === "en" ? 12 : "",
                        left: lang === "ar" ? 12 : "",
                        color: "#64748b",
                        cursor: "pointer",
                      }}
                      onClick={() => setVisiblePassword(false)}
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
                        color: "#64748b",
                        cursor: "pointer",
                      }}
                      onClick={() => setVisiblePassword(true)}
                    />
                  )}
                </div>

                <div className="mb-3 d-flex justify-content-end">
                  <Link
                    href={`/${lang}/forgot-password`}
                    className="text-decoration-none text-primary"
                    style={{ fontSize: "14px", fontWeight: "500" }}
                  >
                    {t.forgotPassword}
                  </Link>
                </div>

                <button
                  type="submit"
                  className="btn w-100 mb-3"
                  style={{
                    backgroundColor: "#e11d48",
                    color: "#ffffff",
                    borderRadius: "14px",
                    height: "48px",
                    fontWeight: "600"
                  }}
                  disabled={loading}
                >
                  {loading ? <span className="spinner-border spinner-border-sm" role="status"></span> : t.loginWithPasswordBtn}
                </button>

                <button
                  type="button"
                  className="btn btn-outline-secondary w-100"
                  onClick={() => setAuthMode("mobile")}
                  style={{ borderRadius: "14px", height: "44px" }}
                >
                  {lang === 'ar' ? 'العودة للتسجيل برمز التحقق' : 'Back to OTP Verification'}
                </button>
              </form>
            ) : (
              /* ALMOSAFER UNIFIED OTP FLOW (MOBILE / EMAIL) */
              <form className="w-100" onSubmit={handleSendOtp}>
                {authMode === "mobile" ? (
                  <div className="mb-4">
                    <label className="form-label small fw-semibold text-secondary">{t.mobileTab}</label>
                    <div className="d-flex gap-2">
                      <div className="position-relative">
                        <button
                          type="button"
                          className="btn border d-flex align-items-center justify-content-between px-3"
                          style={{
                            borderRadius: "14px",
                            height: "50px",
                            width: "135px",
                            minWidth: "135px",
                            backgroundColor: "#f8fafc",
                            border: "1px solid #cbd5e1",
                            fontWeight: "700",
                            color: "#0f172a",
                            fontSize: "15px"
                          }}
                          onClick={() => setCountryDropdownOpen(!countryDropdownOpen)}
                        >
                          <span className="d-flex align-items-center gap-1 dir-ltr">
                            <span>{selectedCountry.flag}</span>
                            <span>{selectedCountry.code}</span>
                          </span>
                          <FiChevronDown style={{ fontSize: "16px", color: "#64748b" }} />
                        </button>

                        {countryDropdownOpen && (
                          <div
                            className="position-absolute bg-white shadow-lg border rounded-3 py-1 z-3"
                            style={{
                              top: "54px",
                              ...(lang === 'ar' ? { right: 0 } : { left: 0 }),
                              width: "220px",
                              maxHeight: "220px",
                              overflowY: "auto",
                              zIndex: 1050
                            }}
                          >
                            {COUNTRY_LIST.map((c) => (
                              <div
                                key={c.code}
                                className={`px-3 py-2 d-flex align-items-center justify-content-between ${countryCode === c.code ? 'bg-primary text-white' : 'text-dark'}`}
                                style={{ cursor: "pointer", fontSize: "14px", direction: lang === 'ar' ? 'rtl' : 'ltr' }}
                                onClick={() => {
                                  setCountryCode(c.code);
                                  setCountryDropdownOpen(false);
                                }}
                              >
                                <span className="d-flex align-items-center gap-2">
                                  <span style={{ fontSize: "18px" }}>{c.flag}</span>
                                  <span className="fw-semibold">{lang === 'ar' ? c.nameAr : c.nameEn}</span>
                                </span>
                                <span className="fw-bold opacity-75 dir-ltr">{c.code}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <input
                        type="tel"
                        className="form-control"
                        style={{
                          borderRadius: "14px",
                          height: "50px",
                          fontSize: "16px"
                        }}
                        placeholder={t.mobilePlaceholder}
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                        required
                      />
                    </div>
                  </div>
                ) : (
                  <div className="mb-4">
                    <label className="form-label small fw-semibold text-secondary">{t.emailTab}</label>
                    <input
                      type="email"
                      className="form-control"
                      style={{
                        borderRadius: "14px",
                        height: "50px",
                        fontSize: "16px"
                      }}
                      placeholder={t.emailPlaceholder}
                      value={emailAddress}
                      onChange={(e) => setEmailAddress(e.target.value)}
                      required
                    />
                  </div>
                )}

                <button
                  type="submit"
                  className="btn w-100 mb-3"
                  style={{
                    backgroundColor: "#e11d48",
                    color: "#ffffff",
                    borderRadius: "14px",
                    height: "48px",
                    fontWeight: "600",
                    fontSize: "16px"
                  }}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="spinner-border spinner-border-sm" role="status"></span>
                  ) : (
                    t.continue
                  )}
                </button>

                <div className="d-flex align-items-center my-3 text-secondary">
                  <hr className="flex-grow-1 my-0" />
                  <span className="px-3 small text-uppercase fw-semibold" style={{ fontSize: "12px", color: "#94a3b8" }}>
                    {t.or}
                  </span>
                  <hr className="flex-grow-1 my-0" />
                </div>

                {authMode === "mobile" ? (
                  <button
                    type="button"
                    className="btn btn-outline-primary w-100 mb-3"
                    onClick={() => setAuthMode("email")}
                    style={{
                      borderRadius: "14px",
                      height: "48px",
                      fontWeight: "600",
                      borderColor: "#0284c7",
                      color: "#0284c7"
                    }}
                  >
                    {t.continueWithEmail}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-outline-primary w-100 mb-3"
                    onClick={() => setAuthMode("mobile")}
                    style={{
                      borderRadius: "14px",
                      height: "48px",
                      fontWeight: "600",
                      borderColor: "#0284c7",
                      color: "#0284c7"
                    }}
                  >
                    {t.continueWithMobile}
                  </button>
                )}

                <div className="text-center mt-2">
                  <button
                    type="button"
                    className="btn btn-link text-decoration-none text-secondary p-0"
                    onClick={() => setAuthMode("password")}
                    style={{ fontSize: "14px", fontWeight: "500" }}
                  >
                    {t.usePassword}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
