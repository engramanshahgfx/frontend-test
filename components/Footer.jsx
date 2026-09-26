"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaTiktok,
  FaSnapchat,
  FaInstagram,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaWhatsapp,
  FaFacebook,
} from "react-icons/fa";
import { SiX } from "react-icons/si";
import en from "@/public/locales/en/common.json";
import ar from "@/public/locales/ar/common.json";
import zh from "@/public/locales/zh/common.json";

export default function Footer({ lang }) {
  const pathname = usePathname();
  const [currentDate, setCurrentDate] = useState(null);

  useEffect(() => {
    setCurrentDate(new Date());
  }, []);

  const arabicText = {
    companyName: "التلال والرمال",
    description:
      "لتنظيم الرحلات السياحية - نقدم رحلات فريدة تجمع بين المتعة والمغامرة والقيمة المفيدة في ربوع المملكة.",
    companyTitle: "الشركة",
    contactTitle: "تواصل معنا",
    legalTitle: "القانونية",
    links: {
      home: "الرئيسية",
      about: "من نحن",

      offers: "الباقات الداخلية  ",
      archive: "أرشيف الرحلات",
      basics: "معلومات تهمك ",
    },
    legal: {
      terms: "الشروط والأحكام",
      privacy: "الخصوصية",
      contact: "تواصل معنا",
    },
    rightsReserved: "جميع الحقوق محفوظة.",
    address: "جده, المملكة العربية السعودية",
    phone: "00966547305060",
    email: "Info@tilalr.com",
    website: "tilalr.com",
    googleMapsUrl: "https://maps.app.goo.gl/WakCAhdZsZERp1M97",
  };

  const englishText = {
    companyName: "Tilal Rimal",
    description:
      "For Tourism Trips Organization - We offer unique trips that combine fun, adventure, and meaningful value throughout the Kingdom.",
    companyTitle: "Company",
    contactTitle: "Contact Us",
    legalTitle: "Legal",
    links: {
      home: "Home",
      about: "About Us",

      offers: "Domestic Packages",
      archive: "Our Trips",
      basics: "Travel Requirements",
    },
    legal: {
      terms: "Terms & Conditions",
    },
    rightsReserved: "All Rights Reserved.",
    address: "Jeddah, Saudi Arabia",
    phone: "966547305060",
    email: "Info@tilalr.com",
    website: "tilalr.com",
    googleMapsUrl: "https://maps.app.goo.gl/WakCAhdZsZERp1M97",
  };

  const chineseText = {
    companyName: "Tilal Rimal",
    description:
      "旅游行程组织 - 我们提供结合乐趣、冒险和有意义价值的独特旅行，遍及整个王国。",
    companyTitle: "公司",
    contactTitle: "联系我们",
    legalTitle: "法律条款",
    links: {
      home: "首页",
      about: "关于我们",

      offers: "国内优惠",
      archive: "行程存档",
      basics: "旅行要求",
    },
    legal: {
      terms: "条款与条件",
    },
    rightsReserved: "保留所有权利。",
    address: "吉达，沙特阿拉伯",
    phone: "966547305060",
    email: "Info@tilalr.com",
    website: "tilalr.com",
    googleMapsUrl: "https://maps.app.goo.gl/WakCAhdZsZERp1M97",
  };

  // Get the appropriate text based on language
  let localeText;
  switch (lang) {
    case "ar":
      localeText = arabicText;
      break;
    case "zh":
      localeText = chineseText;
      break;
    default:
      localeText = englishText;
  }

  const isRTL = lang === "ar";

  // Translation helper for localized strings (from JSON files)
  const translations = { en, ar, zh };
  const tr = (key) => {
    const keys = key.split(".");
    let v = translations[lang] || translations.en;
    for (const k of keys) {
      if (v && typeof v === "object" && k in v) v = v[k];
      else return key;
    }
    return typeof v === "string" ? v : key;
  };

  return (
    <footer
      className="footer lh-lg"
      style={{
        backgroundColor: "#E85D1F",
        background: "linear-gradient(135deg, #E85D1F 0%, #E85D1F 100%)",
        position: "relative",
        zIndex: 1,
        direction: isRTL ? "rtl" : "ltr",
        paddingTop: "20px"
      }}
    >
      {/* Sand Wave Divider */}
      <div className="footer-wave" />
      <div className="container" style={{ maxWidth: "1200px" }}>
        <div className="row pt-4">
          <div
            className={`col-lg-4 col-md-6 mb-3 text-center ${isRTL ? "text-md-end" : "text-md-start"}`}
          >
            <Link href={`/${lang}`}>
              <img
                src="/logo.png"
                alt={`${localeText.companyName} logo`}
                style={{
                  width: "120px",
                  height: "auto",
                  marginBottom: "0.8rem",
                  background: "#ffffffff",
                  padding: "8px",
                  borderRadius: "12px",
                }}
              />
            </Link>
            <p
              className="mt-2"
              style={{ fontSize: "14px", color: "#e0e0e0", lineHeight: "1.6" }}
            >
              <span className="fw-bold" style={{ color: "#1C0052" }}>
                {localeText.companyName}
              </span>{" "}
              — {localeText.description}
            </p>
            <div className="mt-2">
              <div
                className={`d-flex align-items-center mb-1 gap-2 ${isRTL ? "flex-row-reverse justify-content-start" : ""
                  }`}
              >
                {isRTL ? (
                  <>
                    <a
                      href={localeText.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-decoration-none ms-1"
                      style={{
                        fontSize: "12px",
                        color: "#e0e0e0",
                        textAlign: "right",
                        flex: 1,
                      }}
                    >
                      {localeText.address}
                    </a>
                    <FaMapMarkerAlt
                      size={12}
                      style={{ color: "#E85D1F", flexShrink: 0 }}
                    />
                  </>
                ) : (
                  <>
                    <FaMapMarkerAlt
                      className="me-1"
                      size={12}
                      style={{ color: "#1C0052", flexShrink: 0 }}
                    />
                    <a
                      href={localeText.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-decoration-none"
                      style={{ fontSize: "12px", color: "#e0e0e0" }}
                    >
                      {localeText.address}
                    </a>
                  </>
                )}
              </div>

              <div
                className={`d-flex align-items-center mb-1 gap-2 ${isRTL ? "flex-row-reverse justify-content-start" : ""
                  }`}
              ></div>
            </div>

            {/* Social Media Icons */}
            <div
              className={`d-flex gap-2 mt-2 ${isRTL ? "justify-content-md-end" : "justify-content-md-start"
                } justify-content-center`}
            >
              <a
                href="https://www.tiktok.com/@tilalrimal"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon"
                aria-label="TikTok"
              >
                <FaTiktok size={16} />
              </a>
              <a
                href="https://www.snapchat.com/@tilalr2030"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon"
                aria-label="Snapchat"
              >
                <FaSnapchat size={16} />
              </a>
              <a
                href="https://www.instagram.com/tilalrimal"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon"
                aria-label="Instagram"
              >
                <FaInstagram size={16} />
              </a>
              {/* facebook link */}
              <a
                href="https://www.facebook.com/profile.php?id=61582764150212&mibextid=wwXIfr&rdid=m0D4Mr2zTBtHWma7&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1BR4UkLx1J%2F%3Fmibextid%3DwwXIfr#"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon"
                aria-label="Facebook"
              >
                <FaFacebook size={16} />
              </a>
              <a
                href="https://x.com/tilalrimal"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon"
                aria-label="X"
              >
                <SiX size={16} />
              </a>
            </div>
          </div>

          {/* Company Links */}
          <div className="col-lg-3 col-md-6 mb-3">
            <h6
              className="mb-1"
              style={{
                fontWeight: "600",
                color: "#1C0052",
                fontSize: "0.95rem",
              }}
            >
              {localeText.companyTitle}
            </h6>
            <div className="d-flex flex-column">
              <div className="mb-1">
                <Link
                  href={`/${lang}`}
                  className="text-decoration-none footer-link"
                >
                  {localeText.links.home}
                </Link>
              </div>
              <div className="mb-1">
                <Link
                  href={`/${lang}/about-us`}
                  className="text-decoration-none footer-link"
                >
                  {localeText.links.about}
                </Link>
              </div>

              <div className="mb-1">
                <Link
                  href={`/${lang}/trips-archive`}
                  className="text-decoration-none footer-link"
                >
                  {localeText.links.archive}
                </Link>
              </div>
              <div>
                <Link
                  href={`/${lang}/transportation`}
                  className="text-decoration-none footer-link"
                >
                  {localeText.links.basics}
                </Link>
              </div>
            </div>
          </div>

          {/* Legal & Contact */}
          <div className="col-lg-5 col-md-6 mb-3">
            <div className="row">
              {/* Legal Links */}
              <div className="col-sm-6 mb-3">
                <h6
                  className="mb-1"
                  style={{
                    fontWeight: "600",
                    color: "#1C0052",
                    fontSize: "0.95rem",
                  }}
                >
                  {localeText.legalTitle}
                </h6>
                <div className="d-flex flex-column">
                  <div className="mb-1">
                    <Link
                      href={`/${lang}/terms`}
                      className="text-decoration-none footer-link"
                    >
                      {localeText.legal.terms}
                    </Link>
                  </div>
                  <div className="mb-1">
                    <Link
                      href={`/${lang}/privacy`}
                      className="text-decoration-none footer-link"
                    >
                      {localeText.legal.privacy}
                    </Link>
                  </div>
                  <div className="mb-1">
                    <Link
                      href={`/${lang}/refund-policy`}
                      className="text-decoration-none footer-link"
                    >
                      {isRTL ? "سياسة الاسترجاع" : "Refund Policy"}
                    </Link>
                  </div>
                  <div className="mb-1">
                    <Link
                      href={`/${lang}/cancellation-policy`}
                      className="text-decoration-none footer-link"
                    >
                      {isRTL
                        ? "سياسة الإلغاء/التعديل"
                        : "Cancellation & Modification"}
                    </Link>
                  </div>

                  <div>
                    <Link
                      href={`/${lang}/contact-us`}
                      className="text-decoration-none footer-link"
                    >
                      {localeText.contactTitle}
                    </Link>
                  </div>
                </div>
              </div>

              {/* Quick Contact */}
              <div className="col-sm-6">
                {/* Add this heading */}
                <h6
                  className="mb-1"
                  style={{
                    fontWeight: "600",
                    color: "#1C0052",
                    fontSize: "0.95rem",
                  }}
                >
                  {localeText.contactTitle}
                </h6>

                <div className="d-flex flex-column">
                  {/* Phone */}
                  <div className={`contact-item ${isRTL ? "rtl" : ""} mb-2`}>
                    <FaPhone className="icon" />
                    <a href={`tel:${localeText.phone}`} className="footer-link">
                      {localeText.phone}
                    </a>
                  </div>

                  {/* WhatsApp - with Arabic label */}
                  <div className={`contact-item ${isRTL ? "rtl" : ""} mb-2`}>
                    <FaWhatsapp className="icon whatsapp" />
                    <a
                      href={`https://wa.me/${localeText.phone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="footer-link"
                    >
                      {isRTL ? "احجز عبر واتساب" : tr("footer.bookViaWhatsApp")}
                    </a>
                  </div>

                  <div className={`contact-item ${isRTL ? "rtl" : ""} mb-2`}>
                    <FaEnvelope className="icon" />
                    <a
                      href="https://mail.google.com/mail/?view=cm&fs=1&to=info@tilalr.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="footer-link"
                    >
                      info@tilalr.com
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <hr
          style={{ borderColor: "#E85D1F", opacity: 0.3, margin: "0.5rem 0" }}
        />

        {/* Footer Bottom */}
        <div className="row text-center py-1">
          <div className="col" style={{ color: "#e0e0e0" }}>
            <div className="d-flex flex-column justify-content-center align-items-center gap-1">
              {/* License Line */}
              <div style={{ fontSize: "12px" }}>
                <span style={{ color: "#1C0052", fontWeight: "600" }}>
                  {isRTL
                    ? "رقم الترخيص: 73106935 | التلال والرمال لتنظيم الرحلات السياحية | منظم رحلات سياحية / وكالة سفر وسياحة  "
                    : "License No: 73106935 | Tilal Rimal Tourism Company | Tourism Agent / Travel Agency "}
                </span>
              </div>

              {/* Copyright and Rights Line */}
              <div className="d-flex flex-column flex-md-row justify-content-center align-items-center gap-1">
                <span style={{ fontSize: "12px" }}>
                  &copy; 2026{" "}
                  <span style={{ color: "#1C0052" }}>
                    {localeText.companyName}
                  </span>
                </span>
                <span
                  className="d-none d-md-inline"
                  style={{ color: "#e0e0e0", fontSize: "12px" }}
                >
                  {" "}
                  |{" "}
                </span>
                <span style={{ color: "#e0e0e0", fontSize: "12px" }}>
                  {localeText.rightsReserved}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .footer-link {
          color: #e0e0e0;
          transition:
            color 0.3s,
            transform 0.3s;
          font-size: 0.85rem;
          line-height: 1.2;
          display: block;
          padding: 0.1rem 0;
        }
        .contact-item {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 6px;
        }
        .contact-item.rtl {
          flex-direction: row-reverse;
          justify-content: flex-end;
          text-align: right;
          gap: 10px;
          margin-bottom: 6px;
        }
        .icon {
          font-size: 12px;
          color: #E85D1F;
          flex-shrink: 0;
        }
        .icon.whatsapp {
          color: #25d366;
        }
        .footer-wave {
          position: absolute;
          top: -100px; /* Reduced negative offset to push it further down and overlap the solid region */
          left: -5%;
          width: 110%;
          height: 180px; /* Tall wave element */
          background-color: #E85D1F; /* Matches the orange footer background exactly */
          -webkit-mask-image: url("/newIdentity/Png/R-for-footer.png");
          mask-image: url("/newIdentity/Png/R-for-footer.png");
          -webkit-mask-size: 100% 100%;
          mask-size: 100% 100%;
          -webkit-mask-repeat: no-repeat;
          mask-repeat: no-repeat;
          z-index: 10;
        }

        .footer-link:hover {
          color: #ffffff !important;
          background: none !important;
          border: none !important;
          transform: none !important;
          text-decoration: none !important;
        }
        .social-icon {
          transition: all 0.3s ease;
          background: rgba(232, 93, 31, 0.1);
          padding: 4px;
          border-radius: 50%;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #1C0052;
        }
        .social-icon:hover {
          color: #ffffff !important;
          background: rgba(232, 93, 31, 0.3);
          transform: translateY(-1px);
        }
        @media (max-width: 768px) {
          .social-icon {
            width: 26px;
            height: 26px;
            padding: 3px;
          }
        }
        @media (max-width: 576px) {
          .container {
            padding-left: 12px;
            padding-right: 12px;
          }
          .footer-link {
            font-size: 0.8rem;
          }
        }
      `}</style>
    </footer>
  );
}
