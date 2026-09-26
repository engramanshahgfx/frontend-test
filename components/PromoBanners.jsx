"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { API_URL } from "@/lib/api";

export default function PromoBanners({ lang, index = 0, page, height, minHeight }) {
  const router = useRouter();
  const [banner, setBanner] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBanners();
  }, [index, page]);

  const fetchBanners = async () => {
    try {
      const response = await fetch(`${API_URL}/banners`);
      const data = await response.json();
      console.log("PromoBanners index:", index, "page:", page, "fetched data:", data);

      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        let selectedBanner = null;

        if (page) {
          selectedBanner = data.data.find(
            (b) => b.page && b.page.toLowerCase() === page.toLowerCase()
          );
        }

        if (!selectedBanner && data.data.length > index) {
          selectedBanner = data.data[index];
        }

        if (!selectedBanner) {
          selectedBanner = data.data[0];
        }

        setBanner(selectedBanner);
      } else {
        console.warn("No banner found for index/page:", index, page);
      }
    } catch (error) {
      console.error("Error fetching banners:", error);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (img) => {
    if (!img) return "";
    if (/^https?:\/\//.test(img)) return img;
    const backendBase = API_URL.replace(/\/api\/?$/, "");
    if (img.startsWith("/")) return `${backendBase}${img}`;
    return `${backendBase}/storage/${img}`;
  };

  if (loading || !banner) return null;

  const sentence = lang === "ar" ? banner.sentence_ar : banner.sentence_en;
  const buttonText = lang === "ar" ? banner.button_text_ar : banner.button_text_en;
  const targetUrl = banner.url?.startsWith("/") ? `/${lang}${banner.url}` : (banner.url || "#");

  // Prioritize single background_image for all responsive breakpoints
  const mainImage = banner.background_image;
  const pcImage = getImageUrl(mainImage || banner.background_image_pc);
  const tabletImage = getImageUrl(
    mainImage || banner.background_image_tablet || banner.background_image_pc
  );
  const mobileImage = getImageUrl(
    mainImage ||
      banner.background_image_mobile ||
      banner.background_image_tablet ||
      banner.background_image_pc
  );

  const customStyle = {
    "--bg-pc": `url(${pcImage})`,
    "--bg-tablet": `url(${tabletImage})`,
    "--bg-mobile": `url(${mobileImage})`,
    ...(height ? { "--banner-custom-height": typeof height === "number" ? `${height}px` : height } : {}),
    ...(minHeight ? { "--banner-custom-min-height": typeof minHeight === "number" ? `${minHeight}px` : minHeight } : {}),
  };

  return (
    <section className="promo-banners-section">
      <div className="container" style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <motion.div
          className="banner-card"
          style={customStyle}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          onClick={() => router.push(targetUrl)}
        >
          <div className="banner-overlay"></div>
          <div className="banner-content">
            <h3 className="banner-sentence">{sentence}</h3>
            {buttonText && (
              <button
                className="banner-button"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(targetUrl);
                }}
              >
                {buttonText}
              </button>
            )}
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        .promo-banners-section {
          padding: 40px 20px;
          background: #FAF6F0;
        }

        :global(.banner-card) {
          position: relative;
          height: var(--banner-custom-height, 400px) !important;
          min-height: var(--banner-custom-min-height, var(--banner-custom-height, 400px)) !important;
          border-radius: 12px;
          background-image: var(--bg-pc) !important;
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          overflow: hidden;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 30px;
          box-shadow: 0 8px 25px rgba(28, 0, 82, 0.08);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          margin: 0 auto;
          width: 100% !important;
          transform: translateZ(0);
          -webkit-mask-image: -webkit-radial-gradient(white, black);
        }

        :global(.banner-card:hover) {
          transform: translateY(-4px);
          box-shadow: 0 15px 35px rgba(28, 0, 82, 0.15);
        }

        :global(.banner-overlay) {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          transition: opacity 0.3s ease;
          border-radius: 12px;
        }

        :global(.banner-card:hover .banner-overlay) {
          // background: linear-gradient(0deg, rgba(28, 0, 82, 0.75) 0%, rgba(28, 0, 82, 0.65) 100%);
        }

        :global(.banner-content) {
          position: relative;
          z-index: 3;
          width: 100%;
          height: 100%;
          color: white;
          text-align: center;
          max-width: 800px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
          padding: 40px;
        }

        :global(.banner-sentence) {
          font-size: 1.6rem;
          font-weight: 700;
          line-height: 1.5;
          margin-bottom: 25px;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          font-family: 'Tajawal', sans-serif;
        }

        :global(.banner-button) {
          background: #E85D1F;
          color: white;
          border: none;
          padding: 12px 30px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(232, 93, 31, 0.2);
          font-family: 'Tajawal', sans-serif;
        }

        :global(.banner-button:hover) {
          background: #FFC60B;
          color: #1C0052;
          transform: scale(1.05);
        }

        /* ===== RESPONSIVE HEIGHTS & BACKGROUND IMAGES ===== */

        /* Large Screen / Laptop */
        @media (max-width: 1200px) {
          :global(.banner-card) {
            background-image: var(--bg-pc) !important;
            height: var(--banner-custom-height, 340px) !important;
            min-height: var(--banner-custom-min-height, var(--banner-custom-height, 340px)) !important;
          }

          :global(.banner-sentence) {
            font-size: 1.45rem;
          }
        }

        /* Tablet */
        @media (max-width: 1024px) {
          :global(.banner-card) {
            background-image: var(--bg-tablet, var(--bg-pc)) !important;
            height: var(--banner-custom-height, 300px) !important;
            min-height: var(--banner-custom-min-height, var(--banner-custom-height, 300px)) !important;
          }

          :global(.banner-sentence) {
            font-size: 1.3rem;
            margin-bottom: 20px;
          }

          :global(.banner-content) {
            padding: 30px;
          }

          :global(.banner-button) {
            padding: 10px 26px;
            font-size: 0.9rem;
          }
        }

        /* Mobile View (max-width: 768px) */
        @media (max-width: 768px) {
          .promo-banners-section {
            padding: 20px 15px;
          }

          :global(.banner-card) {
            background-image: var(--bg-mobile, var(--bg-tablet, var(--bg-pc))) !important;
            height: var(--banner-custom-height, 240px) !important;
            min-height: var(--banner-custom-min-height, var(--banner-custom-height, 240px)) !important;
            padding: 20px;
            border-radius: 10px !important;
          }

          :global(.banner-overlay) {
            border-radius: 10px !important;
          }

          :global(.banner-content) {
            padding: 20px;
          }

          :global(.banner-sentence) {
            font-size: 1.2rem;
            margin-bottom: 18px;
            line-height: 1.4;
          }

          :global(.banner-button) {
            padding: 10px 24px;
            font-size: 0.85rem;
            border-radius: 6px;
          }
        }

        /* Mobile Small (Phones <= 480px) */
        @media (max-width: 480px) {
          .promo-banners-section {
            padding: 15px 10px;
          }

          :global(.banner-card) {
            background-image: var(--bg-mobile, var(--bg-tablet, var(--bg-pc))) !important;
            height: var(--banner-custom-height, 200px) !important;
            min-height: var(--banner-custom-min-height, var(--banner-custom-height, 200px)) !important;
            padding: 15px;
            border-radius: 8px !important;
          }

          :global(.banner-overlay) {
            border-radius: 8px !important;
          }

          :global(.banner-content) {
            padding: 15px;
          }

          :global(.banner-sentence) {
            font-size: 1.1rem;
            margin-bottom: 16px;
            line-height: 1.4;
          }

          :global(.banner-button) {
            padding: 10px 22px;
            font-size: 0.85rem;
            border-radius: 6px;
          }
        }

        /* Extra Small Phone tweaking */
        @media (max-width: 360px) {
          :global(.banner-sentence) {
            font-size: 0.95rem;
            margin-bottom: 12px;
          }

          :global(.banner-button) {
            padding: 8px 18px;
            font-size: 0.8rem;
          }
        }
      `}</style>
    </section>
  );
}