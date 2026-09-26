"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUI } from "../providers/UIProvider";
import { contactAPI } from "../lib/api";
import {
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaWhatsapp,
  FaClock,
  FaCheckCircle,
  FaChevronDown,
} from "react-icons/fa";
import { FiSend } from "react-icons/fi";

export default function Contact({ lang, hideHero = false }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    tripType: "",
    message: "",
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const content = {
    ar: {
      contactTitle: "تواصل معنا",
      contactSubtitle: "نحن هنا لمساعدتك في تخطيط رحلتك المثالية",

      form: {
        name: "الاسم الكامل",
        email: "البريد الإلكتروني",
        phone: "رقم الهاتف",
        tripType: "نوع الرحلة",
        message: "أخبرنا عن رحلتك المثالية",
        submit: "ارسل الطلب",
        tripTypes: [
          "رحلات عائلية",
          "رحلات شركات",
          "رحلات مدارس",
          "رحلات أفراد",
          "رحلات مجموعات",
        ],
      },

      contactInfo: {
        address: "طريق الملك فهد، طريق ستين، جدة 21454",
        phone: "966547305060",
        email: "info@tilalr.com",
        hours: "مفتوح 24/7",
      },
    },
    en: {
      contactTitle: "Contact Us",
      contactSubtitle: "We're here to help you plan your perfect trip",

      form: {
        name: "Full Name",
        email: "Email Address",
        phone: "Phone Number",
        tripType: "Trip Type",
        message: "Tell us about your ideal trip",
        submit: "Send Request",
        tripTypes: [
          "Family Trips",
          "Corporate Trips",
          "School Trips",
          "Individual Trips",
          "Group Trips",
        ],
      },

      contactInfo: {
        address: "King Fahd Road, Sitteen Street, Jeddah 21454",
        phone: "966547305060",
        email: "info@tilalr.com",
        hours: "Open 24/7",
      },
    },

  };
  // Ensure Chinese fallback exists
  if (!content.zh) content.zh = content.en;

  const t = content[lang] || content.ar;
  const isRTL = lang === "ar";
  const [submitStatus, setSubmitStatus] = useState({ state: 'idle', message: '' });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus({ state: 'loading', message: '' });

    try {
      await contactAPI.submit({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: formData.tripType,
        message: formData.message,
      });

      setSubmitStatus({
        state: 'success',
        message: isRTL ? 'تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.' : 'Message sent successfully! We will contact you soon.'
      });

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        tripType: "",
        message: "",
      });
    } catch (error) {
      setSubmitStatus({
        state: 'error',
        message: isRTL ? 'فشل في إرسال الرسالة. يرجى المحاولة مرة أخرى.' : 'Failed to send message. Please try again.'
      });
    }
  };

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="contact-page">
      {/* Banner */}
      {!hideHero && (
        <header className="banner">
          <div className="banner-inner">
            <h1 className="banner-title">{t.contactTitle}</h1>
            <p className="banner-subtitle">{t.contactSubtitle}</p>
          </div>
        </header>
      )}

      {/* Contact Section */}
      <section className="contact-section">
        <div className="container">
          <div className="contact-wrapper">
            <div className="form-container">
              {!hideHero && (
                <div className="form-header">
                  <h2>{t.contactTitle}</h2>
                  <p>{t.contactSubtitle}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-group">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder={t.form.name}
                    required
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder={t.form.email}
                    required
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder={t.form.phone}
                    required
                    className="form-control"
                  />
                </div>

                <div className="form-group" ref={dropdownRef} style={{ position: "relative" }}>
                  <div
                    className={`custom-select-trigger ${formData.tripType ? "selected" : ""}`}
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    <span>{formData.tripType || t.form.tripType}</span>
                    <FaChevronDown
                      className={`select-arrow ${isDropdownOpen ? "open" : ""}`}
                    />
                  </div>

                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.ul
                        className="custom-options-menu"
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.15 }}
                      >
                        {t.form.tripTypes.map((type, index) => (
                          <li
                            key={index}
                            className={`custom-option ${formData.tripType === type ? "active" : ""}`}
                            onClick={() => {
                              setFormData({ ...formData, tripType: type });
                              setIsDropdownOpen(false);
                            }}
                          >
                            <span>{type}</span>
                            {formData.tripType === type && (
                              <span style={{ color: "#E85D1F", fontWeight: "bold", fontSize: "0.9rem" }}>✓</span>
                            )}
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </div>

                <div className="form-group">
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder={t.form.message}
                    rows="4"
                    required
                    className="form-control"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="btn-submit"
                  disabled={submitStatus.state === 'loading'}
                >
                  <FiSend className="me-2" />
                  {submitStatus.state === 'loading'
                    ? (isRTL ? 'جاري الإرسال...' : 'Sending...')
                    : t.form.submit}
                </button>

                {submitStatus.state === 'success' && (
                  <div className="alert alert-success">
                    <FaCheckCircle className="me-2" />
                    {submitStatus.message}
                  </div>
                )}

                {submitStatus.state === 'error' && (
                  <div className="alert alert-error">
                    {submitStatus.message}
                  </div>
                )}
              </form>
            </div>

            <div className="info-container">
              <div className="contact-info">
                <div className="contact-item">
                  <FaPhone className="contact-icon" />
                  <div>
                    <strong>{t.contactInfo.phone}</strong>
                    <span>{isRTL ? "اتصل بنا" : "Call Us"}</span>
                  </div>
                </div>

                <div className="contact-item">
                  <FaEnvelope className="contact-icon" />
                  <div>
                    <strong>{t.contactInfo.email}</strong>
                    <span>{isRTL ? "راسلنا" : "Email Us"}</span>
                  </div>
                </div>

                <div className="contact-item">
                  <FaMapMarkerAlt className="contact-icon" />
                  <div>
                    <strong>{t.contactInfo.address}</strong>
                    <span>{isRTL ? "عنواننا" : "Our Address"}</span>
                  </div>
                </div>

                <div className="contact-item">
                  <FaClock className="contact-icon" />
                  <div>
                    <strong>{t.contactInfo.hours}</strong>
                    <span>{isRTL ? "أوقات العمل" : "Working Hours"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .contact-page {
          font-family: "Tajawal", sans-serif;
          min-height: 100vh;
          padding: 0;
          background: #FAF6F0;
        }

        .banner {
          padding: 150px 0 60px;
          position: relative;
          overflow: visible;
          border-bottom-left-radius: 10px;
          border-bottom-right-radius: 10px;
          background: linear-gradient(135deg, #1C0052 0%, #0F0030 100%);
          color: #fff;
          box-shadow: 0 6px 24px rgba(0,0,0,0.06) inset;
        }

        .banner::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(0,0,0,0.18), rgba(0,0,0,0.28));
          z-index: 1;
        }

        .banner-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
          text-align: ${isRTL ? "right" : "left"};
          position: relative;
          z-index: 2;
        }

        .banner-title {
          font-size: 3rem;
          font-weight: 800;
          margin: 0 0 0.25rem 0;
          text-shadow: 0 8px 24px rgba(0,0,0,0.22);
        }

        .banner-subtitle {
          margin-top: 0.25rem;
          color: rgba(255,255,255,0.95);
          font-size: 1.1rem;
        }

        .contact-section {
          padding: ${hideHero ? "0 0 120px 0" : "30px 0 120px 0"};
        }

        .contact-wrapper {
          margin-top: ${hideHero ? "0" : "-80px"};
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3rem;
          align-items: start;
          max-width: 1200px;
          margin-left: auto;
          margin-right: auto;
        }

        .form-container {
          background: white;
          border-radius: 10px;
          padding: 2.5rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
          position: relative;
          z-index: 3;
          border: 1px solid rgba(28, 0, 82, 0.06);
        }

        .form-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .form-header h2 {
          color: #1C0052;
          font-weight: 800;
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }

        .form-header p {
          color: #555;
          font-size: 1rem;
        }

        .contact-form .form-group {
          margin-bottom: 1.5rem;
        }

        .form-control {
          width: 100%;
          border: 2px solid #e9ecef;
          border-radius: 10px;
          padding: 12px 15px;
          font-size: 1rem;
          transition: all 0.3s ease;
          font-family: inherit;
        }

        .form-control:focus {
          outline: none;
          border-color: #E85D1F;
          box-shadow: 0 0 0 0.2rem rgba(232, 93, 31, 0.15);
        }

        .form-control::placeholder {
          color: #999;
        }

        .custom-select-trigger {
          width: 100%;
          border: 2px solid #e9ecef;
          border-radius: 10px;
          padding: 13px 16px;
          font-size: 0.95rem;
          font-weight: 600;
          color: #999;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          user-select: none;
        }

        .custom-select-trigger.selected {
          color: #1C0052;
        }

        .custom-select-trigger:hover,
        .custom-select-trigger.open {
          border-color: #E85D1F;
          box-shadow: 0 4px 15px rgba(232, 93, 31, 0.15);
        }

        .select-arrow {
          color: #E85D1F;
          font-size: 0.85rem;
          transition: transform 0.3s ease;
        }

        .select-arrow.open {
          transform: rotate(180deg);
        }

        .custom-options-menu {
          position: absolute;
          top: calc(100% + 6px);
          left: 0;
          width: 100%;
          background: #ffffff !important;
          border: 1px solid rgba(232, 93, 31, 0.2) !important;
          border-radius: 12px !important;
          box-shadow: 0 15px 35px -5px rgba(28, 0, 82, 0.18), 0 5px 15px rgba(0, 0, 0, 0.04) !important;
          z-index: 1000 !important;
          list-style: none !important;
          list-style-type: none !important;
          padding: 6px !important;
          margin: 0 !important;
          max-height: 230px;
          overflow-y: auto;
        }

        .custom-option {
          list-style: none !important;
          list-style-type: none !important;
          padding: 10px 14px !important;
          font-size: 0.95rem !important;
          font-weight: 600 !important;
          color: #1C0052 !important;
          border-radius: 8px !important;
          cursor: pointer !important;
          transition: all 0.2s ease !important;
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
          text-align: ${isRTL ? "right" : "left"};
        }

        .custom-option:hover {
          background: rgba(232, 93, 31, 0.08) !important;
          color: #E85D1F !important;
        }

        .custom-option.active {
          background: #FAF6F0 !important;
          color: #E85D1F !important;
          font-weight: 700 !important;
        }

        .btn-submit {
          width: 100%;
          background: #E85D1F;
          color: white;
          border: none;
          padding: 14px 30px;
          border-radius: 10px;
          font-weight: 700;
          font-size: 1.05rem;
          cursor: pointer;
          transition: all 0.25s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          box-shadow: 0 4px 15px rgba(232, 93, 31, 0.2);
        }

        .btn-submit:hover {
          background: #1C0052;

          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(232, 93, 31, 0.35);
        }

        .btn-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .alert {
          margin-top: 1.5rem;
          padding: 1rem;
          border-radius: 10px;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .alert-success {
          background: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }

        .alert-error {
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }

        .info-container {
          background: white;
          border-radius: 10px;
          padding: 2.5rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
          position: relative;
          z-index: 3;
          border: 1px solid rgba(28, 0, 82, 0.06);
        }

        .contact-info {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .contact-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          border-radius: 10px;
          transition: all 0.3s ease;
          background: white;
        }

        .contact-item:hover {
          background: rgba(28, 0, 82, 0.03);
        }

        .contact-icon {
          color: #E85D1F;
          font-size: 1.5rem;
          flex-shrink: 0;
        }

        .contact-item strong {
          display: block;
          color: #1C0052;
          font-size: 1rem;
          margin-bottom: 0.25rem;
          font-weight: 700;
        }

        .contact-item span {
          display: block;
          color: #555;
          font-size: 0.85rem;
        }

        .whatsapp-float {
          position: fixed;
          bottom: 2rem;
          ${isRTL ? "left" : "right"}: 2rem;
          background: #25d366;
          color: white;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          box-shadow: 0 4px 20px rgba(37, 211, 102, 0.4);
          transition: all 0.3s ease;
          z-index: 1000;
        }

        .whatsapp-float:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 25px rgba(37, 211, 102, 0.6);
          color: white;
        }

        @media (max-width: 968px) {
          .contact-wrapper {
            margin-top: -40px;
            grid-template-columns: 1fr;
          }

          .form-container,
          .info-container {
            padding: 2rem;
          }

          .form-header h2 {
            font-size: 1.75rem;
          }
        }

        @media (max-width: 576px) {
          .contact-page {
            padding: 30px 0;
          }

          .contact-section {
            padding: 20px 0;
          }

          .contact-wrapper {
            gap: 1.5rem;
          }

          .form-container,
          .info-container {
            padding: 1.5rem;
          }

          .form-header h2 {
            font-size: 1.5rem;
          }

          .form-control {
            padding: 10px 12px;
            font-size: 0.95rem;
          }
        }
      `}</style>
    </div>
  );
}