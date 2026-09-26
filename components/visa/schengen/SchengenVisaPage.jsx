"use client";

import React from "react";
import HeaderBanners from "@/components/HeaderBanners";
import SchengenRequirementsSection from "./SchengenRequirementsSection";
import SchengenApplicationForm from "./SchengenApplicationForm";
import SchengenServiceSummary from "./SchengenServiceSummary";
import styles from "./SchengenVisaPage.module.css";

// Multilingual content
const content = {
  ar: {
    badge: "خدمة استخراج تأشيرة شنغن",
    title: "تجهيز متكامل لملف تأشيرة شنغن",
    subtitle: "كل المتطلبات في صفحة واحدة: المستندات، رفع المرفقات، والخدمات التي سنقدمها لك.",
    dir: "rtl",
  },
  en: {
    badge: "Schengen Visa Service",
    title: "Complete Schengen Visa File Preparation",
    subtitle: "All requirements in one page: documents, file uploads, and the services we provide.",
    dir: "ltr",
  },
  zh: {
    badge: "申根签证服务",
    title: "申根签证文件完整准备",
    subtitle: "一站式满足所有要求：文件、上传材料以及我们提供的服务。",
    dir: "ltr",
  },
};

export default function SchengenVisaPage({ lang = "ar" }) {
  // Validate language
  const locale = ["ar", "en", "zh"].includes(lang) ? lang : "ar";
  const t = content[locale];

  return (
    <main className={styles.page} dir={t.dir}>
      {/* Fixed Top Bar - Black */}
      <div className={styles.topBar}></div>
      
      <div className="container" style={{ maxWidth: "1200px", margin: "0 auto", paddingTop: "20px" }}>
        <HeaderBanners lang={locale} page="visa" index={1} />
      </div>

      <div className={styles.hero}>
        <p className={styles.badge}>{t.badge}</p>
        <h1 className={styles.title}>{t.title}</h1>
        <p className={styles.subtitle}>{t.subtitle}</p>
      </div>

      <div className={styles.contentStack}>
        <SchengenRequirementsSection lang={locale} />
        <SchengenApplicationForm lang={locale} />
        <SchengenServiceSummary lang={locale} />
      </div>
    </main>
  );
}