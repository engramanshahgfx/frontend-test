"use client";

import React, { useState } from "react";
import { API_URL } from "@/lib/api";
import styles from "./SchengenVisaPage.module.css";

const content = {
  ar: {
    title: "طلب تجهيز ملف تأشيرة شنغن",
    lead: "اكتب بياناتك وارفع المستندات المطلوبة، وسيتم تجهيز ملفك للتقديم.",
    fullName: "الاسم الكامل",
    phone: "رقم الجوال",
    email: "البريد الإلكتروني",
    nationality: "الجنسية",
    status: "الحالة داخل المملكة",
    saudi: "سعودي",
    resident: "مقيم",
    travelDate: "تاريخ السفر المتوقع",
    notes: "ملاحظات إضافية",
    attachments: "المرفقات المطلوبة",
    passport: "الجواز",
    idOrIqama: "الهوية / الإقامة",
    familyCard: "كرت العائلة",
    salaryLetter: "خطاب تعريف الراتب",
    submit: "إرسل الطلب",
    submitting: "جاري الإرسال...",
    success: "✅ تم استلام بياناتك بنجاح. فريقنا سيتواصل معك خلال 24 ساعة لتأكيد الموعد ومراجعة الملف.",
    error: "حدث خطأ. الرجاء المحاولة مرة أخرى",
    connectionError: "خطأ في الاتصال. تأكد من اتصال الإنترنت",
    selectStatus: "اختر الحالة",
  },
  en: {
    title: "Schengen Visa File Preparation Request",
    lead: "Enter your data and upload the required documents, and your file will be prepared for submission.",
    fullName: "Full Name",
    phone: "Phone Number",
    email: "Email",
    nationality: "Nationality",
    status: "Status in Saudi Arabia",
    saudi: "Saudi",
    resident: "Resident",
    travelDate: "Expected Travel Date",
    notes: "Additional Notes",
    attachments: "Required Attachments",
    passport: "Passport",
    idOrIqama: "ID / Iqama",
    familyCard: "Family Card",
    salaryLetter: "Salary Certificate",
    submit: "Submit Application",
    submitting: "Submitting...",
    success: "✅ Your data has been received successfully. Our team will contact you within 24 hours to confirm the appointment and review your file.",
    error: "An error occurred. Please try again.",
    connectionError: "Connection error. Please check your internet connection.",
    selectStatus: "Select status",
  },
  zh: {
    title: "申根签证文件准备申请",
    lead: "填写您的信息并上传所需文件，我们将为您准备提交材料。",
    fullName: "全名",
    phone: "电话号码",
    email: "电子邮件",
    nationality: "国籍",
    status: "在沙特阿拉伯的身份",
    saudi: "沙特公民",
    resident: "居民",
    travelDate: "预计出行日期",
    notes: "附加说明",
    attachments: "所需附件",
    passport: "护照",
    idOrIqama: "身份证/居留证",
    familyCard: "家庭卡",
    salaryLetter: "薪资证明",
    submit: "提交申请",
    submitting: "提交中...",
    success: "✅ 您的信息已成功接收。我们的团队将在24小时内与您联系，确认预约并审核您的文件。",
    error: "发生错误，请重试。",
    connectionError: "连接错误，请检查您的网络连接。",
    selectStatus: "选择身份",
  },
};

const initialState = {
  fullName: "",
  phone: "",
  email: "",
  nationality: "",
  residencyStatus: "",
  travelDate: "",
  notes: "",
};

export default function SchengenApplicationForm({ lang = "ar" }) {
  const locale = ["ar", "en", "zh"].includes(lang) ? lang : "ar";
  const t = content[locale];
  
  const [formData, setFormData] = useState(initialState);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const isRTL = locale === "ar";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const apiData = {
      full_name: formData.fullName,
      phone: formData.phone,
      email: formData.email,
      nationality: formData.nationality,
      applicant_type: formData.residencyStatus,
      travel_date: formData.travelDate,
      notes: formData.notes,
      passport_number: "",
      locale: locale,
    };

    try {
      const response = await fetch(`${API_URL}/schengen-applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitted(true);
        setFormData(initialState);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setError(data.errors || { message: t.error });
      }
    } catch (err) {
      setError({ message: t.connectionError });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>{t.title}</h2>
      <p className={styles.sectionLead}>{t.lead}</p>

      {error && (
        <div style={{ 
          background: '#fee', 
          color: '#c00', 
          padding: '12px', 
          borderRadius: '10px', 
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          {typeof error === 'object' ? Object.values(error).flat().join(", ") : error.message}
        </div>
      )}

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGrid}>
          <div className={styles.field}>
            <label>{t.fullName}</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              disabled={submitting}
              placeholder={t.fullName}
            />
          </div>

          <div className={styles.field}>
            <label>{t.phone}</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              disabled={submitting}
              placeholder={t.phone}
            />
          </div>

          <div className={styles.field}>
            <label>{t.email}</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={submitting}
              placeholder={t.email}
            />
          </div>

          <div className={styles.field}>
            <label>{t.nationality}</label>
            <input
              type="text"
              name="nationality"
              value={formData.nationality}
              onChange={handleChange}
              required
              disabled={submitting}
              placeholder={t.nationality}
            />
          </div>

          <div className={styles.field}>
            <label>{t.status}</label>
            <select
              name="residencyStatus"
              value={formData.residencyStatus}
              onChange={handleChange}
              required
              disabled={submitting}
            >
              <option value="">{t.selectStatus}</option>
              <option value="saudi">{t.saudi}</option>
              <option value="resident">{t.resident}</option>
            </select>
          </div>

          <div className={styles.field}>
            <label>{t.travelDate}</label>
            <input
              type="date"
              name="travelDate"
              value={formData.travelDate}
              onChange={handleChange}
              required
              disabled={submitting}
            />
          </div>
        </div>

        <div className={styles.field}>
          <label>{t.notes}</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={4}
            placeholder={t.notes}
            disabled={submitting}
          />
        </div>

        <div className={styles.attachmentsBox}>
          <h3 className={styles.attachmentsTitle}>{t.attachments}</h3>
          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label>{t.passport}</label>
              <input type="file" name="passport" accept=".pdf,.jpg,.jpeg,.png" disabled={submitting} />
            </div>

            <div className={styles.field}>
              <label>{t.idOrIqama}</label>
              <input type="file" name="idOrIqama" accept=".pdf,.jpg,.jpeg,.png" disabled={submitting} />
            </div>

            <div className={styles.field}>
              <label>{t.familyCard}</label>
              <input type="file" name="familyCard" accept=".pdf,.jpg,.jpeg,.png" disabled={submitting} />
            </div>

            <div className={styles.field}>
              <label>{t.salaryLetter}</label>
              <input type="file" name="salaryLetter" accept=".pdf,.jpg,.jpeg,.png" disabled={submitting} />
            </div>
          </div>
        </div>

        <button type="submit" className={styles.submitButton} disabled={submitting}>
          {submitting ? t.submitting : t.submit}
        </button>
      </form>

      {submitted && (
        <p className={styles.successMessage}>
          {t.success}
        </p>
      )}
    </div>
  );
}