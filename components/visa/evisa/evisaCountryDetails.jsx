"use client";

import React, { useState } from 'react';
import { API_URL } from '@/lib/api';
import Link from "next/link";
import styles from "./evisa.module.css";

const passportTypes = ["Normal", "Diplomatic", "Special"];
const visaTypes = ["B1 - B2", "Tourist", "Business", "Transit"];
const interviewCities = ["Riyadh", "Jeddah", "Dammam", "Khobar"];

const defaultVisaInfo = {
  visaType_en: "Tourist / Business",
  visaType_ar: "سياحية / أعمال",
  visaType_zh: "旅游/商务签证",
  processingTime_en: "5-7 business days",
  processingTime_ar: "٥-٧ أيام عمل",
  processingTime_zh: "5-7个工作日",
  costPerPerson: 949,
  documents: {
    en: ["Passport copy with at least 6 months validity.", "2 passport-size photos with white background.", "Travel itinerary or hotel booking.", "Bank statement for the last 3 months."],
    ar: ["نسخة من جواز السفر ساري لمدة ٦ أشهر", "صورتان شخصيتان مقاس جواز السفر", "خط سير الرحلة أو حجز فندق", "كشف حساب بنكي لآخر ٣ أشهر"],
    zh: ["有效期至少6个月的护照复印件", "2张护照尺寸照片", "旅行行程或酒店预订", "最近3个月的银行对账单"]
  },
  notes: {
    en: ["Fees are estimates and may change by embassy.", "Some countries require biometric appointments.", "Additional documents may be requested after application submission."],
    ar: ["الرسوم تقديرية وقد تتغير حسب السفارة", "تتطلب بعض البلدان مواعيد بصمة حيوية", "قد يتم طلب مستندات إضافية بعد تقديم الطلب"],
    zh: ["费用为估算值，可能因大使馆而异", "一些国家需要生物识别预约", "提交申请后可能要求提供额外文件"]
  },
  description_en: "Complete the e-visa application with your passport details, photo, and supporting documents. Our team will prepare your file for embassy submission.",
  description_ar: "أكمل طلب التأشيرات الإلكترونية بتفاصيل جواز سفرك وصورتك والمستندات الداعمة. سيقوم فريقنا بتجهيز ملفك لتقديمه إلى السفارة.",
  description_zh: "使用您的护照详细信息、照片和证明文件完成电子签证申请。我们的团队将准备您的文件提交给大使馆。",
};

export default function EvisaCountryDetails({ 
  countrySlug, 
  lang, 
  basePath = "/visas", 
  initialCountry = null 
}) {
  const locale = lang || "ar";
  const [passportType, setPassportType] = useState(passportTypes[0]);
  const [visaType, setVisaType] = useState(visaTypes[0]);
  const [interviewCity, setInterviewCity] = useState(interviewCities[0]);
  const [dob, setDob] = useState("");
  const [showPersonsData, setShowPersonsData] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  
  // Personal info fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [passportNumber, setPassportNumber] = useState("");
  const [passportExpiry, setPassportExpiry] = useState("");
  const [nationality, setNationality] = useState("");
  
  // Helper function to get translated field
  const getTranslatedField = (country, fieldName) => {
    if (!country) return "";
    const field = country[`${fieldName}_${locale}`];
    return field || country[`${fieldName}_en`] || country[fieldName] || "";
  };
  
  // Get translated documents and notes
  const getTranslatedArray = (obj, key) => {
    if (!obj) return [];
    if (Array.isArray(obj)) return obj;
    if (obj[locale]) return obj[locale];
    if (obj.en) return obj.en;
    return [];
  };
  
  const country = initialCountry;
  
  // Build visaInfo from country data or use default
  const visaInfo = country ? {
    visaType: getTranslatedField(country, 'visa_type'),
    processingTime: getTranslatedField(country, 'processing_time'),
    costPerPerson: country.cost_per_person || 949,
    description: getTranslatedField(country, 'description'),
    documents: getTranslatedArray(country.documents, 'documents'),
    notes: getTranslatedArray(country.notes, 'notes'),
  } : {
    visaType: defaultVisaInfo[`visaType_${locale}`] || defaultVisaInfo.visaType_en,
    processingTime: defaultVisaInfo[`processingTime_${locale}`] || defaultVisaInfo.processingTime_en,
    costPerPerson: defaultVisaInfo.costPerPerson,
    description: defaultVisaInfo[`description_${locale}`] || defaultVisaInfo.description_en,
    documents: getTranslatedArray(defaultVisaInfo.documents, 'documents'),
    notes: getTranslatedArray(defaultVisaInfo.notes, 'notes'),
  };

  const getTranslatedCountryName = () => {
    if (!country) return "";
    return getTranslatedField(country, 'name');
  };

  const handleSubmitApplication = async () => {
    setSubmitting(true);
    setError(null);
    
    const applicationData = {
      country_name: getTranslatedField(country, 'name'),
      country_slug: country.slug,
      passport_type: passportType,
      visa_type: visaType,
      interview_city: interviewCity,
      date_of_birth: dob,
      full_name: fullName,
      email: email,
      phone: phone,
      passport_number: passportNumber,
      passport_expiry: passportExpiry,
      nationality: nationality,
      amount: visaInfo.costPerPerson,
      locale: locale,
    };
    
    try {
      const response = await fetch(`${API_URL}/evisa-applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(applicationData),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSubmitted(true);
        setFullName("");
        setEmail("");
        setPhone("");
        setPassportNumber("");
        setPassportExpiry("");
        setNationality("");
      } else {
        setError(data.errors || { message: locale === 'ar' ? "حدث خطأ. الرجاء المحاولة مرة أخرى" : (locale === 'zh' ? "发生错误，请重试" : "An error occurred. Please try again") });
      }
    } catch (err) {
      setError({ message: locale === 'ar' ? "خطأ في الاتصال. تأكد من اتصال الإنترنت" : (locale === 'zh' ? "连接错误，请检查网络" : "Connection error. Check your internet") });
    } finally {
      setSubmitting(false);
    }
  };

  if (!country) {
    return (
      <main className={styles.page}>
        <div className={styles.pageTopBar} />
        <div className={styles.pageContent}>
          <section className={styles.sectionCard}>
            <h1 className={styles.sectionTitle}>Country not found</h1>
            <p className={styles.sectionSubtitle}>Please go back and select a valid country.</p>
            <Link href={`/${locale}${basePath}`} className={styles.primaryButton}>
              Back to country selection
            </Link>
          </section>
        </div>
      </main>
    );
  }

  if (submitted) {
    const successMessage = {
      en: { title: "Your application has been submitted successfully!", message: "Our team will contact you within 24 hours to confirm the appointment and review your file." },
      ar: { title: "تم إرسال طلبك بنجاح!", message: "سيتواصل معك فريقنا خلال 24 ساعة لتأكيد الموعد ومراجعة الملف." },
      zh: { title: "您的申请已成功提交！", message: "我们的团队将在24小时内与您联系，确认预约并审核您的文件。" }
    };
    
    return (
      <main className={styles.page}>
        <div className={styles.pageTopBar} />
        <div className={styles.pageContent}>
          <section className={styles.sectionCard}>
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ 
                width: '80px', 
                height: '80px', 
                background: '#4caf50', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                margin: '0 auto 20px',
                fontSize: '48px',
                color: 'white'
              }}>
                ✓
              </div>
              <h2>{successMessage[locale]?.title || successMessage.en.title}</h2>
              <p>{successMessage[locale]?.message || successMessage.en.message}</p>
              <Link href={`/${locale}${basePath}`} className={styles.primaryButton}>
                {locale === 'ar' ? "العودة إلى قائمة الدول" : (locale === 'zh' ? "返回国家列表" : "Back to country list")}
              </Link>
            </div>
          </section>
        </div>
      </main>
    );
  }

  const stepLabels = {
    en: ['Select Country', 'Visa Requirements', 'Persons Data', 'Payment'],
    ar: ['اختر البلد', 'متطلبات التأشيرات', 'بيانات الأشخاص', 'الدفع'],
    zh: ['选择国家', '签证要求', '个人信息', '付款']
  };

  return (
    <main className={styles.page}>
      <div className={styles.pageTopBar} />
      <div className={styles.pageContent}>
        <div className={styles.steps}>
          {stepLabels[locale]?.map((label, index) => {
            const active = showPersonsData ? index + 1 <= 2 : index === 1;
            return (
              <div key={label} className={`${styles.step} ${active ? styles.active : ""}`}>
                <span className={styles.stepNumber}>{index + 1}</span>
                <span>{label}</span>
              </div>
            );
          })}
        </div>

        <section className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <h1 className={styles.sectionTitle}>{getTranslatedCountryName()} Visa Requirements</h1>
            <p className={styles.sectionSubtitle}>Review the required documents, processing times, and visa details for {getTranslatedCountryName()}.</p>
          </div>

          <div className={styles.countryGrid} style={{ maxWidth: 480, marginBottom: 24 }}>
            <div className={`${styles.countryCard} ${styles.active}`}>
              <div className={styles.countryFlag}>
                {country.flag_path ? (
                  <img src={country.flag_path} alt={`${getTranslatedCountryName()} flag`} />
                ) : (
                  country.flag_emoji
                )}
              </div>
              <div className={styles.countryName}>{getTranslatedCountryName()}</div>
              <div className={styles.countryLabel}>{visaInfo.visaType}</div>
            </div>
          </div>

          <div className={styles.infoBox}>
            <strong>{visaInfo.processingTime}</strong>
            <span>{visaInfo.description}</span>
          </div>

          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label>{locale === 'ar' ? 'نوع جواز السفر' : (locale === 'zh' ? '护照类型' : 'Passport Type')} *</label>
              <select value={passportType} onChange={(event) => setPassportType(event.target.value)}>
                {passportTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className={styles.field}>
              <label>{locale === 'ar' ? 'نوع التأشيرات' : (locale === 'zh' ? '签证类型' : 'Visa Type')} *</label>
              <select value={visaType} onChange={(event) => setVisaType(event.target.value)}>
                {visaTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className={styles.field}>
              <label>{locale === 'ar' ? 'مدينة المقابلة' : (locale === 'zh' ? '面试城市' : 'Interview City')} *</label>
              <select value={interviewCity} onChange={(event) => setInterviewCity(event.target.value)}>
                {interviewCities.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
            <div className={styles.field}>
              <label>{locale === 'ar' ? 'تاريخ الميلاد' : (locale === 'zh' ? '出生日期' : 'Date of birth')} *</label>
              <input type="date" value={dob} onChange={(event) => setDob(event.target.value)} />
            </div>
          </div>

          <div className={styles.listBlock}>
            <h3>{locale === 'ar' ? 'المستندات المطلوبة' : (locale === 'zh' ? '所需文件' : 'Required Documents')}</h3>
            <ul>
              {visaInfo.documents.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>

          <div className={styles.summaryGrid}>
            <div className={styles.summaryCard}>
              <h3>{locale === 'ar' ? 'ملخص التأشيرات' : (locale === 'zh' ? '签证摘要' : 'Visa Summary')}</h3>
              <div className={styles.summaryItem}>
                <span>{locale === 'ar' ? 'نوع التأشيرات' : (locale === 'zh' ? '签证类型' : 'Visa Type')}</span>
                <span>{visaInfo.visaType}</span>
              </div>
              <div className={styles.summaryItem}>
                <span>{locale === 'ar' ? 'وقت المعالجة' : (locale === 'zh' ? '处理时间' : 'Processing Time')}</span>
                <span>{visaInfo.processingTime}</span>
              </div>
              <div className={styles.summaryItem}>
                <span>{locale === 'ar' ? 'التكلفة للفرد' : (locale === 'zh' ? '每人费用' : 'Cost per person')}</span>
                <span className={styles.highlight}>{visaInfo.costPerPerson} SAR</span>
              </div>
            </div>
            <div className={styles.summaryCard}>
              <h3>{locale === 'ar' ? 'ملاحظات' : (locale === 'zh' ? '注意事项' : 'Notes')}</h3>
              <ul>
                {visaInfo.notes.map((note, idx) => (
                  <li key={idx}>{note}</li>
                ))}
              </ul>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 24 }}>
            <Link href={`/${locale}${basePath}`} className={styles.secondaryButton}>
              {locale === 'ar' ? 'العودة إلى الدول' : (locale === 'zh' ? '返回国家列表' : 'Back to countries')}
            </Link>
            <button type="button" className={styles.primaryButton} onClick={() => setShowPersonsData(true)}>
              {locale === 'ar' ? 'متابعة إلى بيانات الأشخاص' : (locale === 'zh' ? '继续填写个人信息' : 'Continue to persons data')}
            </button>
          </div>
        </section>

        {showPersonsData && (
          <section className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>{locale === 'ar' ? 'بيانات الأشخاص' : (locale === 'zh' ? '个人信息' : 'Persons Data')}</h2>
              <p className={styles.sectionSubtitle}>{locale === 'ar' ? 'أدخل معلوماتك الشخصية لإكمال طلب التأشيرات الإلكترونية' : (locale === 'zh' ? '输入您的个人信息以完成电子签证申请' : 'Enter your personal information to complete the e-visa request.')}</p>
            </div>

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

            <div className={styles.formGrid}>
              <div className={styles.field}>
                <label>{locale === 'ar' ? 'الاسم الكامل' : (locale === 'zh' ? '全名' : 'Full Name')} *</label>
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={locale === 'ar' ? 'أدخل اسمك الكامل' : (locale === 'zh' ? '输入您的全名' : 'Enter your full name')}
                  required
                />
              </div>
              <div className={styles.field}>
                <label>{locale === 'ar' ? 'البريد الإلكتروني' : (locale === 'zh' ? '电子邮件' : 'Email')} *</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                />
              </div>
              <div className={styles.field}>
                <label>{locale === 'ar' ? 'رقم الهاتف' : (locale === 'zh' ? '电话号码' : 'Phone Number')} *</label>
                <input 
                  type="tel" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={locale === 'ar' ? '٠٥xxxxxxxx' : (locale === 'zh' ? '05xxxxxxxx' : '05xxxxxxxx')}
                  required
                />
              </div>
              <div className={styles.field}>
                <label>{locale === 'ar' ? 'الجنسية' : (locale === 'zh' ? '国籍' : 'Nationality')} *</label>
                <input 
                  type="text" 
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                  placeholder={locale === 'ar' ? 'جنسيتك' : (locale === 'zh' ? '您的国籍' : 'Your nationality')}
                  required
                />
              </div>
              <div className={styles.field}>
                <label>{locale === 'ar' ? 'رقم جواز السفر' : (locale === 'zh' ? '护照号码' : 'Passport Number')}</label>
                <input 
                  type="text" 
                  value={passportNumber}
                  onChange={(e) => setPassportNumber(e.target.value)}
                  placeholder={locale === 'ar' ? 'أدخل رقم جواز السفر' : (locale === 'zh' ? '输入护照号码' : 'Enter passport number')}
                />
              </div>
              <div className={styles.field}>
                <label>{locale === 'ar' ? 'تاريخ انتهاء جواز السفر' : (locale === 'zh' ? '护照到期日期' : 'Passport Expiry Date')}</label>
                <input 
                  type="date" 
                  value={passportExpiry}
                  onChange={(e) => setPassportExpiry(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.summaryGrid}>
              <div className={styles.summaryCard}>
                <h3>{locale === 'ar' ? 'ملخص الحجز' : (locale === 'zh' ? '预订摘要' : 'Booking Summary')}</h3>
                <div className={styles.summaryItem}>
                  <span>{locale === 'ar' ? 'الوجهة' : (locale === 'zh' ? '目的地' : 'Destination')}</span>
                  <span className={styles.highlight}>{getTranslatedCountryName()}</span>
                </div>
                <div className={styles.summaryItem}>
                  <span>{locale === 'ar' ? 'نوع جواز السفر' : (locale === 'zh' ? '护照类型' : 'Passport Type')}</span>
                  <span>{passportType}</span>
                </div>
                <div className={styles.summaryItem}>
                  <span>{locale === 'ar' ? 'نوع التأشيرات' : (locale === 'zh' ? '签证类型' : 'Visa Type')}</span>
                  <span>{visaType}</span>
                </div>
                <div className={styles.summaryItem}>
                  <span>{locale === 'ar' ? 'مدينة المقابلة' : (locale === 'zh' ? '面试城市' : 'Interview City')}</span>
                  <span>{interviewCity}</span>
                </div>
                <div className={styles.summaryItem}>
                  <span>{locale === 'ar' ? 'المبلغ الإجمالي' : (locale === 'zh' ? '总金额' : 'Total Amount')}</span>
                  <span className={styles.highlight}>{visaInfo.costPerPerson} SAR</span>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 24 }}>
              <button type="button" className={styles.secondaryButton} onClick={() => setShowPersonsData(false)}>
                {locale === 'ar' ? 'رجوع' : (locale === 'zh' ? '返回' : 'Back')}
              </button>
              <button 
                type="button" 
                className={styles.primaryButton} 
                onClick={handleSubmitApplication}
                disabled={submitting || !fullName || !email || !phone || !nationality}
              >
                {submitting ? (locale === 'ar' ? 'جاري الإرسال...' : (locale === 'zh' ? '提交中...' : 'Submitting...')) : (locale === 'ar' ? 'إرسل الطلب' : (locale === 'zh' ? '提交申请' : 'Submit Application'))}
              </button>
            </div>
          </section>
        )}

        <p className={styles.footerNote}>Powered by Tilalr e-visa experience.</p>
      </div>
    </main>
  );
}