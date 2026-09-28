"use client";

import CountryField from '@/components/CountryField';
import React, { useState } from "react";
import styles from "./SchengenShowcasePage.module.css";

const createTraveler = () => ({
  id: Date.now() + Math.random(),
});

const content = {
  ar: {
    badge: "خدمة استخراج وتأهيل ملف شنغن",
    heroTitle: "تأشيرة شنغن للسعوديين والمقيمين في المملكة",
    heroSub:
      "ملف احترافي جاهز للتقديم من أول خطوة حتى موعد البصمة: الموعد، الابليكيشن، حجوزات السفر، الترجمة، وتأمين السفر.",
    cta: "ابدأ الطلب",
    wa: "تواصل واتساب",
    stat1: "+2400 طلب تم تجهيزه",
    stat2: "نسبة ترتيب ملفات دقيقة",
    stat3: "متابعة كاملة حتى التقديم",
    servicesTitle: "ماذا سنقدم لك",
    services: [
      "الموعد",
      "الابليكيشن",
      "حجز الطيران",
      "حجز فندق",
      "الترجمة",
      "تأمين السفر",
    ],
    reqTitle: "المتطلبات الأساسية لاستخراج تأشيرة شنغن",
    reqIntro: "للسعوديين والمقيمين في المملكة العربية السعودية",
    generalTitle: "1. المستندات العامة",
    general: [
      "جواز السفر: أصل الجواز وصورة منه، ويكون صالحا لمدة لا تقل عن 6 أشهر من تاريخ العودة، وبحد أدنى صفحتين فارغتين.",
      "عدد 2 صورة شخصية حديثة (خلال آخر 6 أشهر) بمقاس 3.5 × 4.5 وخلفية بيضاء.",
      "نموذج الطلب: تعبئة الاستمارة والتوقيع.",
      "التأمين الطبي: يغطي دول الشنغن بحد أدنى 30,000 يورو ويشمل كامل فترة الإقامة.",
      "إثبات السكن والطيران: حجز طيران مؤكد ذهاب وعودة + حجز فندق مؤكد أو خطاب دعوة موثق.",
      "كشف الحساب البنكي: باللغة الإنجليزية ومختوم من البنك لآخر 6 أشهر.",
    ],
    residentTitle: "2. متطلبات إضافية للمقيمين",
    resident: [
      "صورة الإقامة سارية لمدة لا تقل عن 6 أشهر بعد تاريخ العودة.",
      "تأشيرة خروج وعودة سارية بعد تاريخ الرجوع من أوروبا.",
      "خطاب تعريف بالراتب بالإنجليزية ومصدق حسب جهة العمل.",
    ],
    feesTitle: "3. الرسوم والإجراءات",
    fees: [
      "رسوم التأشيرات: حوالي 80 يورو للبالغين + رسوم خدمة مركز التأشيرات.",
      "البصمة: مطلوبة من عمر 12 سنة فما فوق إذا لم يتم التبصيم خلال آخر 59 شهرا.",
    ],
    formTitle: "طلب تجهيز ملف",
    formSub: "اكتب بياناتك وارفع المستندات المطلوبة وسنتواصل معك مباشرة.",
    fields: {
      contactTitle: "بيانات التواصل",
      name: "الاسم الكامل",
      phone: "رقم الجوال",
      email: "البريد الإلكتروني",
      nationality: "الجنسية",
      passportNo: "رقم الجواز",
      status: "نوع المتقدم",
      saudi: "سعودي",
      resident: "مقيم",
      date: "تاريخ السفر المتوقع",
      notes: "ملاحظات إضافية",
      submit: "إرسل الطلب",
    },
    familyOption: "هذا الطلب لعائلة / عدة مسافرين",
    travelersTitle: "بيانات المسافرين",
    travelerLabel: "المسافر",
    addTraveler: "+ إضافة مسافر",
    removeTraveler: "حذف",
    attachments: "المرفقات المطلوبة",
    docs: ["الجواز", "الهوية / الإقامة", "كرت العائلة", "خطاب تعريف الراتب"],
    success: "تم استلام طلبك بنجاح. سيتواصل معك الفريق قريبًا.",
    successCount: "تم إرسال طلب واحد بنجاح لعدد {count} مسافر.",
  },
  en: {
    badge: "Professional Schengen Application Service",
    heroTitle: "Schengen Visa for Saudis & Residents",
    heroSub:
      "A complete ready-to-submit file: appointment, application, travel bookings, translation, and insurance.",
    cta: "Start Application",
    wa: "WhatsApp Us",
    stat1: "2400+ prepared applications",
    stat2: "High-quality file preparation",
    stat3: "End-to-end support",
    servicesTitle: "What We Provide",
    services: [
      "Appointment",
      "Application",
      "Flight Booking",
      "Hotel Booking",
      "Translation",
      "Travel Insurance",
    ],
    reqTitle: "Core Schengen Visa Requirements",
    reqIntro: "For Saudi nationals and KSA residents",
    generalTitle: "1. General Documents",
    general: [
      "Passport valid for 6+ months after return with at least two blank pages.",
      "2 recent photos (3.5 x 4.5 cm), white background.",
      "Completed and signed visa application form.",
      "Travel medical insurance with minimum EUR 30,000 coverage.",
      "Confirmed round-trip flights and hotel booking (or invitation letter).",
      "Stamped bank statement in English for the last 6 months.",
    ],
    residentTitle: "2. Additional for Residents",
    resident: [
      "Iqama copy valid for at least 6 months after return.",
      "Valid exit/re-entry visa extending beyond return date.",
      "Salary certificate in English with proper attestation.",
    ],
    feesTitle: "3. Fees and Process",
    fees: [
      "Visa fee is around EUR 80 for adults plus visa center service fees.",
      "Biometrics required for applicants 12+ if not captured in last 59 months.",
    ],
    formTitle: "Application Request",
    formSub: "Fill your details and upload required documents.",
    fields: {
      contactTitle: "Contact Details",
      name: "Full Name",
      phone: "Phone",
      email: "Email",
      nationality: "Nationality",
      passportNo: "Passport Number",
      status: "Applicant Type",
      saudi: "Saudi",
      resident: "Resident",
      date: "Expected Travel Date",
      notes: "Additional Notes",
      submit: "Submit",
    },
    familyOption: "This is a family / multiple travelers request",
    travelersTitle: "Travelers Details",
    travelerLabel: "Traveler",
    addTraveler: "+ Add Traveler",
    removeTraveler: "Remove",
    attachments: "Required Attachments",
    docs: ["Passport", "ID / Iqama", "Family Card", "Salary Certificate"],
    success: "Request submitted successfully. Our team will contact you soon.",
    successCount: "One request submitted for {count} travelers.",
  },
  zh: {
    badge: "申根签证专业服务",
    heroTitle: "面向沙特公民和居民的申根签证",
    heroSub: "我们提供完整申请支持：预约、申请表、机票、酒店、翻译和旅行保险。",
    cta: "开始申请",
    wa: "WhatsApp 联系",
    stat1: "2400+ 申请案例",
    stat2: "高质量文件准备",
    stat3: "全流程支持",
    servicesTitle: "我们提供的服务",
    services: ["预约", "申请表", "机票预订", "酒店预订", "翻译", "旅行保险"],
    reqTitle: "申根签证基本要求",
    reqIntro: "适用于沙特公民和在沙特居民",
    generalTitle: "1. 通用材料",
    general: [
      "护照有效期在回程后不少于6个月，且至少有2页空白页。",
      "2张近期白底照片（3.5 x 4.5厘米）。",
      "完整并签字的签证申请表。",
      "最低30,000欧元保障的旅行医疗保险。",
      "往返机票和酒店确认单（或邀请函）。",
      "近6个月英文银行流水并加盖银行章。",
    ],
    residentTitle: "2. 居民额外要求",
    resident: [
      "居留证（Iqama）在回程后仍有效至少6个月。",
      "有效出入境签证，覆盖欧洲回程日期之后。",
      "英文在职与薪资证明，并完成认证。",
    ],
    feesTitle: "3. 费用与流程",
    fees: [
      "签证费约80欧元，另有签证中心服务费。",
      "12岁以上若59个月内未录指纹，需重新采集生物信息。",
    ],
    formTitle: "申请表",
    formSub: "填写资料并上传文件，我们会尽快联系您。",
    fields: {
      contactTitle: "联系方式",
      name: "姓名",
      phone: "手机号",
      email: "邮箱",
      nationality: "国籍",
      passportNo: "护照号",
      status: "申请人类型",
      saudi: "沙特公民",
      resident: "沙特居民",
      date: "预计出行日期",
      notes: "备注",
      submit: "提交申请",
    },
    familyOption: "这是家庭/多人出行申请",
    travelersTitle: "旅客信息",
    travelerLabel: "旅客",
    addTraveler: "+ 添加旅客",
    removeTraveler: "删除",
    attachments: "所需附件",
    docs: ["护照", "身份证/居留证", "家庭卡", "薪资证明"],
    success: "申请已提交成功，我们将尽快联系您。",
    successCount: "已成功提交1个申请，共{count}位旅客。",
  },
};

export default function SchengenShowcasePage({ lang = "ar" }) {
  const resolvedLang = ["ar", "en", "zh"].includes(lang) ? lang : "ar";
  const [submitted, setSubmitted] = useState(false);
  const [submittedCount, setSubmittedCount] = useState(1);
  const [isFamily, setIsFamily] = useState(false);
  const [travelers, setTravelers] = useState([createTraveler()]);
  const t = content[resolvedLang] || content.ar;
  const today = new Date().toISOString().split("T")[0];
  const isRTL = resolvedLang === "ar";

  const onSubmit = (e) => {
    e.preventDefault();
    setSubmittedCount(travelers.length);
    setSubmitted(true);
  };

  const addTraveler = () => {
    setTravelers((prev) => [...prev, createTraveler()]);
  };

  const removeTraveler = (id) => {
    setTravelers((prev) => {
      if (prev.length === 1) return prev;
      return prev.filter((traveler) => traveler.id !== id);
    });
  };

  const toggleFamily = (checked) => {
    setIsFamily(checked);
    if (!checked) {
      setTravelers((prev) => (prev.length ? [prev[0]] : [createTraveler()]));
    }
  };

  return (
    <main className={styles.page} dir={isRTL ? "rtl" : "ltr"}>
      <section className={styles.hero}>
        <span className={styles.badge}>{t.badge}</span>
        <h1>{t.heroTitle}</h1>
        <p>{t.heroSub}</p>
        <div className={styles.heroActions}>
          <a href="#request" className={styles.primaryBtn}>{t.cta}</a>
          <a href="https://wa.me/966547305060" target="_blank" rel="noreferrer" className={styles.ghostBtn}>
            {t.wa}
          </a>
        </div>
        <div className={styles.stats}>
          <div>{t.stat1}</div>
          <div>{t.stat2}</div>
          <div>{t.stat3}</div>
        </div>
      </section>

      <section className={styles.card} id="services">
        <h2>{t.servicesTitle}</h2>
        <div className={styles.serviceGrid}>
          {t.services.map((service) => (
            <div key={service} className={styles.serviceItem}>
              <span>✓</span>
              <span>{service}</span>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.card} id="requirements">
        <h2>{t.reqTitle}</h2>
        <p className={styles.lead}>{t.reqIntro}</p>

        <div className={styles.columns}>
          <div>
            <h3>{t.generalTitle}</h3>
            <ul className={styles.list}>
              {t.general.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3>{t.residentTitle}</h3>
            <ul className={styles.list}>
              {t.resident.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className={styles.feesBox} id="fees">
          <h3>{t.feesTitle}</h3>
          <ul className={styles.list}>
            {t.fees.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className={styles.card} id="request">
        <h2>{t.formTitle}</h2>
        <p className={styles.lead}>{t.formSub}</p>

        <form className={styles.form} onSubmit={onSubmit}>
          <h3>{t.fields.contactTitle}</h3>
          <div className={styles.formGrid}>
            <label>
              <span>{t.fields.name}</span>
              <input required type="text" name="fullName" />
            </label>
            <label>
              <span>{t.fields.phone}</span>
              <input required type="tel" name="phone" />
            </label>
            <label>
              <span>{t.fields.email}</span>
              <input required type="email" name="email" />
            </label>
            <label>
              <span>{t.fields.status}</span>
              <select required defaultValue="" name="applicantType">
                <option value="" disabled>{isRTL ? "اختر" : "Select"}</option>
                <option value="saudi">{t.fields.saudi}</option>
                <option value="resident">{t.fields.resident}</option>
              </select>
            </label>
            <label>
              <span>{t.fields.date}</span>
              <input type="date" name="travelDate" min={today} />
            </label>
            <label>
              <span>{t.fields.notes}</span>
              <textarea rows={3} name="notes" />
            </label>
          </div>

          <label className={styles.familyToggle}>
            <input
              type="checkbox"
              checked={isFamily}
              onChange={(e) => toggleFamily(e.target.checked)}
            />
            <span>{t.familyOption}</span>
          </label>

          <h3>{t.travelersTitle}</h3>
          <div className={styles.travelersStack}>
            {travelers.map((traveler, index) => (
              <div key={traveler.id} className={styles.travelerCard}>
                <div className={styles.travelerHeader}>
                  <strong>
                    {t.travelerLabel} {index + 1}
                  </strong>
                  {travelers.length > 1 && (
                    <button
                      type="button"
                      className={styles.removeTravelerBtn}
                      onClick={() => removeTraveler(traveler.id)}
                    >
                      {t.removeTraveler}
                    </button>
                  )}
                </div>

                <div className={styles.formGrid}>
                  <label>
                    <span>{t.fields.name}</span>
                    <input required type="text" name={`travelers[${index}][name]`} />
                  </label>
                  <label>
                    <span>{t.fields.nationality}</span>
                    <CountryField required type="text" name={`travelers[${index}][nationality]`} />
                  </label>
                  <label>
                    <span>{t.fields.passportNo}</span>
                    <input required type="text" name={`travelers[${index}][passportNo]`} />
                  </label>
                  <label>
                    <span>{t.fields.status}</span>
                    <select required defaultValue="" name={`travelers[${index}][status]`}>
                      <option value="" disabled>{isRTL ? "اختر" : "Select"}</option>
                      <option value="saudi">{t.fields.saudi}</option>
                      <option value="resident">{t.fields.resident}</option>
                    </select>
                  </label>
                </div>

                <h3>{t.attachments}</h3>
                <div className={styles.formGrid}>
                  {t.docs.map((doc, docIdx) => (
                    <label key={`${traveler.id}-${doc}`}>
                      <span>{doc}</span>
                      <input
                        type="file"
                        name={`travelers[${index}][attachment_${docIdx + 1}]`}
                        accept=".pdf,.jpg,.jpeg,.png"
                        required
                      />
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {isFamily && (
            <button type="button" className={styles.addTravelerBtn} onClick={addTraveler}>
              {t.addTraveler}
            </button>
          )}

          <button className={styles.submitBtn} type="submit">{t.fields.submit}</button>
        </form>

        {submitted && (
          <p className={styles.success}>
            {(t.successCount || t.success).replace("{count}", String(submittedCount))}
          </p>
        )}
      </section>
    </main>
  );
}
