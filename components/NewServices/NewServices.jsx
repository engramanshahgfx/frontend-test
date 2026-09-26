"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useUI } from "@/providers/UIProvider";

export default function NewServices({ lang, servicesData, sectionTitle, sectionDescription }) {
  const { openReservationModal } = useUI();

  // Ensure servicesData is always an array
  const safeServicesData = Array.isArray(servicesData) && servicesData.length > 0
    ? servicesData
    : [];

  console.log(' NewServices component received:', {
    lang,
    servicesDataLength: servicesData?.length || 0,
    sectionTitle,
    sectionDescription,
    safeDataLength: safeServicesData.length,
  });

  const translations = {
    en: {
      viewDetails: "Book Service Now",
      bookNow: "Book Now",
    },
    ar: {
      viewDetails: "طلب حجز الخدمة",
      bookNow: "حجز الآن",
    },
    zh: {
      viewDetails: "立即预订",
      bookNow: "立即预订",
    },
  };

  const t = translations[lang] || translations.en;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  // Helper to get localized text fields (supports string or { en, ar } objects)
  const localize = (field) => {
    if (!field) return "";
    if (typeof field === "string") return field;
    return field[lang] || field.en || Object.values(field)[0] || "";
  };

  const getTripType = (title) => {
    const lowerTitle = (title || "").toLowerCase();
    if (
      lowerTitle.includes('school') ||
      lowerTitle.includes('student') ||
      lowerTitle.includes('مدارس') ||
      lowerTitle.includes('مدراس') ||
      lowerTitle.includes('مدرس') ||
      lowerTitle.includes('جامع') ||
      lowerTitle.includes('طلاب') ||
      lowerTitle.includes('تعليم')
    ) return 'school';

    if (
      lowerTitle.includes('corporate') ||
      lowerTitle.includes('company') ||
      lowerTitle.includes('شرك') ||
      lowerTitle.includes('أعمال') ||
      lowerTitle.includes('مؤسس')
    ) return 'company';

    if (
      lowerTitle.includes('family') ||
      lowerTitle.includes('private') ||
      lowerTitle.includes('group') ||
      lowerTitle.includes('عوائل') ||
      lowerTitle.includes('عائل') ||
      lowerTitle.includes('مجموعات') ||
      lowerTitle.includes('خاص')
    ) return 'family';

    return 'individual';
  };

  const getButtonText = (service) => {
    const titleText = localize(service.title);
    const type = getTripType(titleText);

    if (type === 'school') {
      return lang === 'ar' ? 'طلب حجز رحلة مدرسية' : 'Book School Trip';
    }
    if (type === 'company') {
      return lang === 'ar' ? 'طلب حجز رحلة شركات' : 'Book Corporate Trip';
    }
    if (type === 'family') {
      return lang === 'ar' ? 'طلب حجز رحلة عائلية' : 'Book Family Trip';
    }

    return lang === 'ar' ? `طلب حجز ${titleText}` : `Book ${titleText}`;
  };

  const handleReservation = (service) => {
    const titleText = localize(service.title);
    const tripType = getTripType(titleText || '');

    openReservationModal({
      title: titleText,
      slug: service.slug || '',
      type: tripType,
      category: tripType,
      bookingLocation: 'local',
      preferredBookingType: 'activity',
      isLocalService: true,
    });
  };

  return (
    <>
      <section
        id="discover-destinations"
        className="position-relative"
        style={{
          padding: "40px 0",
          backgroundImage: "url('/bg3.webp')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
          direction: lang === "ar" ? "rtl" : "ltr",
          minHeight: "100vh",
        }}
      >
        {/* Dark Overlay */}
        <div
          className="position-absolute top-0 start-0 w-100 h-100"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            zIndex: 0
          }}
        ></div>

        <div className="container position-relative"
          style={{
            zIndex: 1,
            maxWidth: "1200px"
          }}>
          {/* Section Header */}
          <motion.div
            className="text-center mb-5"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="fw-bold text-white mb-3" style={{ fontSize: "2rem", letterSpacing: "0.5px" }}>
              {sectionTitle}
            </h2>
            <div
              className="mx-auto mb-4"
              style={{
                width: "80px",
                height: "4px",
                background: "#E85D1F",
                borderRadius: '2px'
              }}
            ></div>
            <p
              className="lead text-light mx-auto"
              style={{
                maxWidth: "600px",
                // color: "#f5f5f5 !important", // Changed from #d71111
                lineHeight: "1.7",
                fontSize: "1.1rem"
              }}
            >
              {sectionDescription}
            </p>
          </motion.div>

          {/* Services Grid */}
          <motion.div
            className="row g-4"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {safeServicesData.length > 0 ? (
              safeServicesData.map((service, index) => (
                <motion.div
                  key={index}
                  className="col-lg-4 col-md-6"
                  variants={itemVariants}
                >
                  <motion.div
                    className="card h-100 border-0 overflow-hidden shadow-lg"
                    style={{
                      background: "#f9e5d2", // Solid, no transparency
                      border: "1px solid rgba(249, 229, 210, 0.15)",
                      borderRadius: "10px",
                      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                    whileHover={{
                      scale: 1.03,
                      borderColor: "rgba(232, 93, 31, 0.5)", /* Accent orange */
                      boxShadow: "0 20px 40px rgba(232, 93, 31, 0.25)"
                    }}
                  >
                    {/* Service Image */}
                    <div
                      className="position-relative overflow-hidden"
                      style={{ height: "240px" }}
                    >
                      <Image
                        src={service.image}
                        alt={localize(service.title)}
                        fill
                        style={{ objectFit: "cover" }}
                        className="transition-transform duration-300 hover:scale-110"
                      />
                      {/* Overlay */}
                      <div
                        className="position-absolute top-0 start-0 w-100 h-100"
                        style={{
                          background: "linear-gradient(to bottom, transparent 40%, rgba(27, 0, 82, 0.41) 100%)"
                        }}
                      ></div>
                    </div>

                    {/* Service Content */}
                    <div className="card-body p-4 d-flex flex-column">
                      <h5
                        className="card-title fw-bold mb-3"
                        style={{ color: "#E85D1F", fontSize: "1.25rem" }} /* Golden Dune Yellow */
                      >
                        {localize(service.title)}
                      </h5>
                      <p
                        className="card-text flex-grow-1 mb-4"
                        style={{
                          // color: "#d71111 !important",
                          lineHeight: "1.6",
                          fontSize: "0.95rem"
                        }}
                      >
                        {localize(service.description)}
                      </p>
                      <div className="mt-auto">
                        <button
                          onClick={() => handleReservation(service)}
                          className="btn"
                          style={{
                            background: "#E85D1F", /* Brand Orange to Yellow gradient */
                            color: "#FFFFFF",
                            border: "none",
                            borderRadius: "10px",
                            fontWeight: "700",
                            padding: "0.8rem 1.5rem",
                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                            width: "100%",
                            boxShadow: "0 4px 15px rgba(232, 93, 31, 0.25)"
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.background = "#1C0052";
                            e.target.style.transform = "translateY(-2px)";
                            e.target.style.boxShadow = "0 8px 25px rgba(28, 0, 82, 0.5)";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = "#E85D1F";
                            e.target.style.transform = "translateY(0)";
                            e.target.style.boxShadow = "0 4px 15px rgba(232, 93, 31, 0.25)";
                          }}
                        >
                          {getButtonText(service)}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              ))
            ) : (
              <div className="col-12 text-center">
                <p style={{ color: "#e0e0e0", fontSize: "1rem" }}>
                  {lang === 'ar' ? 'جاري تحميل الخدمات...' : 'Loading services...'}
                </p>
              </div>
            )}
          </motion.div>


        </div>

        <style jsx>{`
          @media (max-width: 768px) {
            section {
              background-attachment: scroll;
            }
            
            .display-4 {
              font-size: 2.5rem;
            }
          }
        `}</style>
      </section>
    </>
  );
}