"use client";
import { FaWhatsapp } from "react-icons/fa";
import { useEffect, useState, useRef } from "react";

const WhatsAppButton = ({ lang = "en" }) => {
  const phoneNumber = "966547305060"; 
  const message = lang === "ar" 
    ? "مرحبا، أريد الاستفسار عن خدماتكم" 
    : lang === "zh" 
      ? "你好，我想咨询你们的服务" 
      : "Hello, I would like to inquire about your services";

  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  
  const [bottom, setBottom] = useState(80);
  const [isVisible, setIsVisible] = useState(true);
  const buttonRef = useRef(null);
  const footerRef = useRef(null);

  useEffect(() => {
    // Get footer element
    const footer = document.querySelector('footer');
    if (footer) {
      footerRef.current = footer;
    }

    const handleScrollAndResize = () => {
      // Determine visibility based on window height
      if (window.innerHeight < 400) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
    };

    window.addEventListener("scroll", handleScrollAndResize);
    window.addEventListener("resize", handleScrollAndResize);

    // Initial check
    handleScrollAndResize();

    return () => {
      window.removeEventListener("scroll", handleScrollAndResize);
      window.removeEventListener("resize", handleScrollAndResize);
    };
  }, []);

  const handleClick = () => {
    window.open(whatsappUrl, "_blank");
  };

  if (!isVisible) return null;

  return (
    <div 
      ref={buttonRef}
      className="whatsapp-button"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          handleClick();
        }
      }}
      aria-label={lang === "ar" ? "زر واتساب" : lang === "zh" ? "WhatsApp 按钮" : "WhatsApp Button"}
      style={{
        position: "fixed",
        bottom: "25px",
        left: "20px",
        zIndex: 999,
        cursor: "pointer",
        backgroundColor: "#25D366",
        width: "60px",
        height: "60px",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        transition: "bottom 0.3s ease, transform 0.2s ease, box-shadow 0.2s ease",
        animation: "pulse 2s infinite",
        border: "none",
        padding: 0,
        outline: "none",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.1)";
        e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.4)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
      }}
    >
      <FaWhatsapp 
        style={{ 
          color: "white", 
          fontSize: "32px",
          pointerEvents: "none",
        }} 
      />
      
      <style jsx>{`
        .whatsapp-button:hover {
          cursor: pointer;
          z-index:10000 !important
        }

        .whatsapp-button:focus-visible {
          outline: 2px solid #1a7f3f;
          outline-offset: 2px;
        }

        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.7);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(37, 211, 102, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.7);
          }
        }

        /* Responsive adjustments */
        @media (max-width: 576px) {
          .whatsapp-button {
            width: 50px !important;
            height: 50px !important;
          }
        }

        /* RTL support */
        [dir="rtl"] .whatsapp-button {
          left: auto;
          right: 20px;
        }
      `}</style>
    </div>
  );
};

export default WhatsAppButton;