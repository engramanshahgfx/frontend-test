"use client";
import React, { useState } from "react";
import { db } from "@/configuration/firebase-config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import "bootstrap/dist/css/bootstrap.min.css";

export default function ContactForm({ lang }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const content = {
    en: {
      form: {
        name: "Your Name",
        namePlaceholder: "Enter your full name",
        email: "Your Email",
        emailPlaceholder: "Enter your email address",
        subject: "Subject",
        subjectPlaceholder: "Enter the subject",
        message: "Your Message",
        messagePlaceholder: "Write your message here",
        send: "Send Message",
      },
      messages: {
        success: "Message sent successfully.",
        error: "Failed to send message. Please try again.",
      },
    },
    ar: {
      form: {
        name: "اسمك",
        namePlaceholder: "أدخل اسمك الكامل",
        email: "بريدك الإلكتروني",
        emailPlaceholder: "أدخل بريدك الإلكتروني",
        subject: "الموضوع",
        subjectPlaceholder: "أدخل الموضوع",
        message: "رسالتك",
        messagePlaceholder: "اكتب رسالتك هنا",
        send: "إرسال الرسالة",
      },
      messages: {
        success: "تم إرسال الرسالة بنجاح.",
        error: "فشل في إرسال الرسالة. يرجى المحاولة مرة أخرى.",
      },
    },
  };

  const { form, messages } = content[lang] || content.en;

  const dataChange = (e) => {
    const { name, value } = e.target;
    if (/^\s+$/.test(value)) return;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const collectionRef = collection(db, "contacts");
      await addDoc(collectionRef, {
        ...formData,
        timestamp: serverTimestamp(),
        read: false,
      });
      toast.success(messages.success);
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      console.log("Failed to send message", error);
      toast.error(messages.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-5">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="row justify-content-center"
          dir={lang === "ar" ? "rtl" : "ltr"}
        >
          <div className="col-lg-8 col-xl-6">
            <div className="card shadow-lg border-0 rounded-4 bg-white p-4 p-md-5">
              {/* Header Section */}
              <div className="text-center mb-5">
                <motion.h2
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="fw-bold text-dark mb-3"
                  style={{ fontSize: "2.2rem" }}
                >
                  {lang === "ar" ? "تواصل معنا" : "Get In Touch"}
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="text-muted fs-6"
                >
                  {lang === "ar" 
                    ? "سنكون سعداء لسماع منك والرد على استفساراتك" 
                    : "We'd love to hear from you and answer your questions"}
                </motion.p>
              </div>

              <form onSubmit={handleSubmit} className="w-100">
                <div className="row g-4">
                  {/* Name Field */}
                  <div className="col-md-6">
                    <div className="form-group">
                      <label className="form-label fw-semibold text-dark mb-2">
                        {form.name} *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={dataChange}
                        placeholder={form.namePlaceholder}
                        required
                        className="form-control form-control-lg border-2 rounded-3 px-4 py-3"
                        style={{
                          borderColor: "#e2e8f0",
                          transition: "all 0.3s ease",
                          fontSize: "1rem",
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = "#3b82f6";
                          e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = "#e2e8f0";
                          e.target.style.boxShadow = "none";
                        }}
                      />
                    </div>
                  </div>

                  {/* Email Field */}
                  <div className="col-md-6">
                    <div className="form-group">
                      <label className="form-label fw-semibold text-dark mb-2">
                        {form.email} *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={dataChange}
                        placeholder={form.emailPlaceholder}
                        required
                        className="form-control form-control-lg border-2 rounded-3 px-4 py-3"
                        style={{
                          borderColor: "#e2e8f0",
                          transition: "all 0.3s ease",
                          fontSize: "1rem",
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = "#3b82f6";
                          e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = "#e2e8f0";
                          e.target.style.boxShadow = "none";
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Subject Field */}
                <div className="mt-4">
                  <div className="form-group">
                    <label className="form-label fw-semibold text-dark mb-2">
                      {form.subject}
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={dataChange}
                      placeholder={form.subjectPlaceholder}
                      className="form-control form-control-lg border-2 rounded-3 px-4 py-3"
                      style={{
                        borderColor: "#e2e8f0",
                        transition: "all 0.3s ease",
                        fontSize: "1rem",
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "#3b82f6";
                        e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "#e2e8f0";
                        e.target.style.boxShadow = "none";
                      }}
                    />
                  </div>
                </div>

                {/* Message Field */}
                <div className="mt-4">
                  <div className="form-group">
                    <label className="form-label fw-semibold text-dark mb-2">
                      {form.message} *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={dataChange}
                      rows="6"
                      placeholder={form.messagePlaceholder}
                      required
                      className="form-control form-control-lg border-2 rounded-3 px-4 py-3"
                      style={{
                        borderColor: "#e2e8f0",
                        transition: "all 0.3s ease",
                        fontSize: "1rem",
                        resize: "vertical",
                        minHeight: "120px",
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "#3b82f6";
                        e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "#e2e8f0";
                        e.target.style.boxShadow = "none";
                      }}
                    ></textarea>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="d-grid mt-5">
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn btn-primary btn-lg fw-semibold py-3 rounded-3 border-0"
                    style={{
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      fontSize: "1.1rem",
                      transition: "all 0.3s ease",
                    }}
                  >
                    {loading ? (
                      <div className="d-flex align-items-center justify-content-center">
                        <div 
                          className="spinner-border spinner-border-sm me-2" 
                          style={{ width: "1.2rem", height: "1.2rem" }}
                        ></div>
                        {lang === "ar" ? "جاري الإرسال..." : "Sending..."}
                      </div>
                    ) : (
                      <div className="d-flex align-items-center justify-content-center">
                        <svg
                          className="me-2"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                        </svg>
                        {form.send}
                      </div>
                    )}
                  </motion.button>
                </div>
              </form>

              {/* Footer Note */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="text-center mt-4"
              >
                <p className="text-muted small">
                  {lang === "ar" 
                    ? "سنرد على رسالتك في غضون 24 ساعة" 
                    : "We'll respond to your message within 24 hours"}
                </p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        .form-control:focus {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
        }
        
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
        }
        
        .card {
          background: #ffffff !important;
          backdrop-filter: none !important;
        }
        
        .form-group {
          position: relative;
        }
        
        .form-label {
          font-size: 0.95rem;
          letter-spacing: 0.5px;
        }
      `}</style>
    </section>
  );
}