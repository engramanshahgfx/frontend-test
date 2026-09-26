"use client";

import React from "react";
import styles from "./SchengenVisaPage.module.css";

const content = {
  ar: {
    title: "المتطلبات الأساسية لاستخراج تأشيرة شنغن",
    lead: "للسعوديين والمقيمين في المملكة العربية السعودية",
    generalTitle: "1. المستندات العامة (للسعوديين والمقيمين)",
    general: [
      "جواز السفر: أصل الجواز وصورة منه، ويجب أن يكون صالحا لمدة لا تقل عن 6 أشهر من تاريخ العودة المقررة، ويحتوي على صفحتين فارغتين على الأقل.",
      "الصور الشخصية: عدد (2) صورة حديثة (خلال آخر 6 أشهر) بمقاس 3.5 × 4.5 سم، خلفية بيضاء، وبدون غطاء رأس للرجال (إلا لأسباب دينية).",
      "نموذج الطلب: تعبئة استمارة طلب التأشيرات وتوقيعها.",
      "التأمين الطبي: وثيقة تأمين سفر تغطي جميع دول الشنغن بحد أدنى 30,000 يورو وتشمل فترة الإقامة كاملة.",
      "إثبات السكن والطيران: حجز طيران مؤكد (ذهاب وعودة)، وحجز فندق مؤكد أو خطاب دعوة موثق من المستضيف.",
      "كشف الحساب البنكي: باللغة الإنجليزية ومختوم من البنك؛ للسعوديين لآخر 6 أشهر، ولغير السعوديين لآخر 6 أشهر.",
    ],
    residentTitle: "2. متطلبات إضافية خاصة بالمقيمين في السعودية",
    resident: [
      "الإقامة السعودية: صورة من الإقامة سارية المفعول لمدة لا تقل عن 6 أشهر بعد تاريخ العودة.",
      "تأشيرة الخروج والعودة: يجب أن تكون صالحة إلى ما بعد التاريخ المحدد للعودة من أوروبا.",
      "خطاب تعريف بالراتب: محرر باللغة الإنجليزية، ومصدق من الغرفة التجارية (للقطاع الخاص)، أو بختم الجهة الرسمية (للقطاع الحكومي).",
    ],
    feesTitle: "3. رسوم التأشيرات والإجراءات",
    fees: [
      "الرسوم: تبلغ حوالي 80 يورو للبالغين، مع رسوم خدمة إضافية لمراكز التأشيرات (مثل VFS Global أو BLS).",
      "البصمة: مطلوبة لجميع المتقدمين من سن 12 سنة فما فوق الذين لم يبصموا خلال الـ 59 شهرا الماضية.",
    ],
  },
  en: {
    title: "Basic Requirements for Schengen Visa",
    lead: "For Saudi citizens and residents of the Kingdom of Saudi Arabia",
    generalTitle: "1. General Documents (For Saudis and Residents)",
    general: [
      "Passport: Original passport and copy, valid for at least 6 months from the intended return date, with at least two blank pages.",
      "Photos: (2) recent photos (within last 6 months) size 3.5 x 4.5 cm, white background, no head cover for men (except for religious reasons).",
      "Application Form: Complete and sign the visa application form.",
      "Medical Insurance: Travel insurance covering all Schengen countries with minimum 30,000 EUR covering the entire stay period.",
      "Accommodation and Flight Proof: Confirmed flight booking (round trip), confirmed hotel booking or notarized invitation letter from host.",
      "Bank Statement: In English and stamped by the bank; for Saudis for the last 6 months, for non-Saudis for the last 6 months.",
    ],
    residentTitle: "2. Additional Requirements for Saudi Residents",
    resident: [
      "Saudi Residency: Copy of valid residency (Iqama) valid for at least 6 months after return date.",
      "Exit/Re-entry Visa: Must be valid beyond the scheduled return date from Europe.",
      "Salary Certificate: Written in English, certified by the Chamber of Commerce (for private sector), or with official stamp (for government sector).",
    ],
    feesTitle: "3. Visa Fees and Procedures",
    fees: [
      "Fees: Approximately 80 EUR for adults, plus additional service fees for visa centers (e.g., VFS Global or BLS).",
      "Biometrics: Required for all applicants aged 12 and above who have not provided biometrics within the last 59 months.",
    ],
  },
  zh: {
    title: "申根签证基本要求",
    lead: "适用于沙特公民和沙特居民",
    generalTitle: "1. 通用文件（适用于沙特公民和居民）",
    general: [
      "护照：护照原件及复印件，有效期从计划返回日期起至少6个月，至少有两页空白页。",
      "照片：（2张）近期照片（6个月内），尺寸3.5 x 4.5厘米，白色背景，男性不得戴头饰（宗教原因除外）。",
      "申请表：填写并签署签证申请表。",
      "医疗保险：涵盖所有申根国家的旅行保险，最低保额30,000欧元，覆盖整个停留期。",
      "住宿和机票证明：确认的往返机票预订，确认的酒店预订或经过公证的邀请函。",
      "银行对账单：英文并加盖银行公章；沙特公民最近6个月，非沙特公民最近6个月。",
    ],
    residentTitle: "2. 沙特居民额外要求",
    resident: [
      "沙特居留证：有效居留证（Iqama）复印件，在返回日期后至少还有6个月有效期。",
      "出入境签证：必须有效期超过从欧洲返回的预定日期。",
      "薪资证明：英文书写，商会认证（私营部门）或官方盖章（政府部门）。",
    ],
    feesTitle: "3. 签证费用和程序",
    fees: [
      "费用：成人约80欧元，另加签证中心服务费（如VFS Global或BLS）。",
      "生物识别：所有12岁及以上申请人在过去59个月内未提供生物识别信息的都需要提供。",
    ],
  },
};

export default function SchengenRequirementsSection({ lang = "ar" }) {
  const locale = ["ar", "en", "zh"].includes(lang) ? lang : "ar";
  const t = content[locale];

  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>{t.title}</h2>
      <p className={styles.sectionLead}>{t.lead}</p>

      <div className={styles.group}>
        <h3 className={styles.groupTitle}>{t.generalTitle}</h3>
        <ul className={styles.list}>
          {t.general.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>

      <div className={styles.group}>
        <h3 className={styles.groupTitle}>{t.residentTitle}</h3>
        <ul className={styles.list}>
          {t.resident.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>

      <div className={styles.group}>
        <h3 className={styles.groupTitle}>{t.feesTitle}</h3>
        <ul className={styles.list}>
          {t.fees.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}