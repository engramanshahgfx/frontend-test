"use client";
import { motion } from "framer-motion";
import { FiVideo, FiSmartphone, FiServer } from "react-icons/fi";
import { MdOutlineMovie, MdOutlinePhoneIphone, MdOutlineBrush } from 'react-icons/md';

// Map services to icons
const iconMap = {
  "Digital Marketing": <FiVideo size={50} />,
  "التسويق الرقمي": <FiVideo size={50} />,
  "Application Development": <FiSmartphone size={50} />,
  "تطوير التطبيقات": <FiSmartphone size={50} />,
  "Information Technology": <FiServer size={70} />,
  "تكنولوجيا المعلومات": <FiServer size={70} />,
  "Graphic Design": <MdOutlineBrush size={50} />,
  "التصميم الجرافيكي": <MdOutlineBrush size={50} />,
  "Video & Animation": <MdOutlineMovie size={50} />,
  "الفيديو والأنيميشن": <MdOutlineMovie size={50} />,
  "Mobile App Development": <MdOutlinePhoneIphone size={50} />,
  "تطبيقات الهواتف": <MdOutlinePhoneIphone size={50} />,
};

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.2 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function Services({ lang, servicesData, sectionTitle, sectionDescription }) {
  return (
    <section className="position-relative py-5" style={{ backgroundColor: "#f9f9f9" }}>
      <div className="container position-relative" style={{ zIndex: 1 }}>
        {/* Section Header */}
        <div className="text-center mb-5">
          <h2 className="fs-2" style={{ fontWeight: 600, color: "black" }}>{sectionTitle}</h2>
          <p className="w-md-75 mx-auto" style={{ fontSize: "18px", color: "black" }}>
            {sectionDescription}
          </p>
        </div>

        {/* Cards Container */}
        <motion.div
          className="row g-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          {servicesData.map((service, idx) => (
            <motion.div key={idx} className="col-12 col-md-6 col-lg-4" variants={cardVariants}>
              <motion.div
                whileHover={{ y: -10 }}
                className="service-card p-4 h-100 d-flex flex-column align-items-center text-center"
                style={{
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
                  border: "1px solid rgba(0,0,0,0.1)",
                  borderRadius: "16px",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
                  cursor: "pointer",
                  overflow: "hidden",
                  color: "black",
                  backgroundColor: "rgba(255,255,255,0.8)",
                }}
              >
                {/* Icon */}
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  className="mb-3"
                >
                  {iconMap[service.title] || (
                    <img
                      src={service.image}
                      alt={service.title}
                      style={{ width: "80px", height: "80px", objectFit: "contain" }}
                    />
                  )}
                </motion.div>

                {/* Text */}
                <h5 className="mb-2" style={{ fontWeight: "600", color: "black" }}>{service.title}</h5>
                <p style={{ color: "black" }}>{service.description}</p>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <style jsx>{`
        .service-card {
          transition: transform 0.3s, box-shadow 0.3s;
        }
        .service-card:hover {
          box-shadow: 0 12px 25px rgba(0,0,0,0.15);
        }
      `}</style>
    </section>
  );
}
