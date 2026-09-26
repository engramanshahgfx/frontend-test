"use client";

import React from "react";
import styles from "./SchengenVisaPage.module.css";

const content = {
  ar: {
    title: "ماذا سنقدم لك؟",
    lead: "هذه الخدمات نجهزها لك من البداية حتى التقديم.",
    services: ["الموعد", "الابليكيشن", "حجز الطيران", "حجز فندق", "الترجمة", "تأمين السفر"],
  },
  en: {
    title: "What We Provide?",
    lead: "We prepare these services for you from start to submission.",
    services: ["Appointment", "Application", "Flight Booking", "Hotel Booking", "Translation", "Travel Insurance"],
  },
  zh: {
    title: "我们提供什么？",
    lead: "我们为您准备这些服务，从开始到提交。",
    services: ["预约", "申请表", "机票预订", "酒店预订", "翻译", "旅行保险"],
  },
};

export default function SchengenServiceSummary({ lang = "ar" }) {
  const locale = ["ar", "en", "zh"].includes(lang) ? lang : "ar";
  const t = content[locale];

  return (
    <section className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>{t.title}</h2>
      <p className={styles.sectionLead}>{t.lead}</p>

      <div className={styles.serviceGrid}>
        {t.services.map((service, index) => (
          <div key={index} className={styles.serviceItem}>
            <span className={styles.checkMark}>✓</span>
            <span>{service}</span>
          </div>
        ))}
      </div>
    </section>
  );
}