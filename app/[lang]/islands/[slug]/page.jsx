"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { MapPin, Clock, Users, Star, Waves, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { API_URL } from "../../../../lib/api";
import { useUI } from "../../../../providers/UIProvider";

export default function IslandDetailPage() {
  const params = useParams();
  const router = useRouter();
  const lang = params.lang || "en";
  const slug = params.slug;
  const { openBookingOrAuth } = useUI();

  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Static labels
const labels = {
    en: {
      backButton: "Back",
      bookNow: "Book Now",
      duration: "Duration",
      groupSize: "Group Size",
      location: "Location",
      price: "Price",
      per_person: "per person",
      features: "Features",
      description: "Description",
      highlights: "Highlights",
      whatsIncluded: "What's Included",
      itinerary: "Itinerary",
    },
    ar: {
      backButton: "عودة",
      bookNow: "احجز الآن",
      duration: "المدة",
      groupSize: "حجم المجموعة",
      location: "الموقع",
      price: "السعر",
      per_person: "للشخص",
      features: "المميزات",
      description: "الوصف",
      highlights: "أبرز النقاط",
      whatsIncluded: "ما يشمله البرنامج",
      itinerary: "البرنامج الزمني",
    },
    zh: {
      backButton: "返回",
      bookNow: "立即预订",
      duration: "行程时长",
      groupSize: "团队人数",
      location: "地点",
      price: "价格",
      per_person: "每人",
      features: "特色",
      description: "描述",
      highlights: "亮点",
      whatsIncluded: "费用包含",
      itinerary: "行程安排",
    },
  };
  const t = labels[lang] || labels.en;

  // Get localized field
  const getText = (obj, field) => {
    // prefer explicit language field, then fall back to English, then raw field
    const fieldKey = lang === "ar" ? `${field}_ar` : (lang === "zh" ? `${field}_zh` : `${field}_en`);
    return obj[fieldKey] || obj[`${field}_en`] || obj[field] || "";
  };

  // Build image URL
  const getImageUrl = (img) => {
    const placeholder = "/placeholder.png";
    if (!img) return placeholder;
    if (/^https?:\/\//i.test(img)) return img;
    const backendBase = API_URL.replace(/\/api\/?$/, "");

    // If path starts with leading slash, treat it as backend-rooted path
    if (img.startsWith("/")) return `${backendBase}${img}`;

    // Support storage/ and islands/ conventions
    if (img.startsWith("storage/") || img.startsWith("islands/")) return `${backendBase}/${img}`;

    // Fallback to storage/islands
    return `${backendBase}/storage/islands/${img}`;
  }; 

  // Parse list
  const parseList = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        return value.split(",").map((s) => s.trim()).filter(Boolean);
      }
    }
    return [];
  };

  // Fetch destination details
  useEffect(() => {
    const fetchDestination = async () => {
      try {
        setLoading(true);
        const fetchUrl = `${API_URL}/island-destinations/${slug}`;
        console.debug("[IslandDetail] Fetching:", fetchUrl);

        const res = await fetch(fetchUrl);
        const data = await res.json();

        if (res.ok && data.success && data.data) {
          setDestination(data.data);
          setError(null);
        } else {
          throw new Error(data.message || "Failed to load destination");
        }
      } catch (err) {
        console.error("[IslandDetail] Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchDestination();
    }
  }, [slug]);

  if (loading) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "60px 20px",
          color: "#fff",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #8A7779 0%, #6e6768ff 50%, #5a4f50 100%)",
        }}
      >
        <p>Loading destination details...</p>
      </div>
    );
  }

  if (error || !destination) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "60px 20px",
          color: "#fff",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #8A7779 0%, #6e6768ff 50%, #5a4f50 100%)",
        }}
      >
        <div>
          <p style={{ color: "#ff6b6b", fontSize: "1.1rem" }}>
            {error || "Destination not found"}
          </p>
          <button
            onClick={() => router.back()}
            style={{
              marginTop: "20px",
              padding: "10px 20px",
              background: "#dfa528",
              color: "#333",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            {t.backButton}
          </button>
        </div>
      </div>
    );
  }

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={18}
        fill={i < Math.floor(rating) ? "#dfa528" : "none"}
        color="#dfa528"
      />
    ));
  };

  return (
    <section
      style={{
        background: "linear-gradient(135deg, #8A7779 0%, #6e6768ff 50%, #5a4f50 100%)",
        color: "white",
        direction: lang === "ar" ? "rtl" : "ltr",
        minHeight: "100vh",
        padding: "80px 40px",
      }}
    >
      <div className="container-lg" style={{ maxWidth: "1200px" }}>
        {/* Back Button */}
        <motion.button
          onClick={() => router.back()}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="btn d-flex align-items-center gap-2 mb-5"
          style={{
            background: "rgba(255,255,255,0.15)",
            color: "#fff",
            border: "2px solid rgba(255,255,255,0.3)",
            borderRadius: "25px",
            padding: "10px 25px",
          }}
        >
          <ArrowLeft size={20} />
          {t.backButton}
        </motion.button>

        <div className="row g-5">
          {/* Hero Image - Larger */}
          <div className="col-lg-7 mb-4">
            <motion.img
              src={getImageUrl(destination.image)}
              alt={getText(destination, "title")}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              style={{
                width: "100%",
                height: "580px",
                objectFit: "cover",
                borderRadius: "20px",
                boxShadow: "0 25px 70px rgba(0,0,0,0.5)",
              }}
              onError={(e) => {
                e.target.src = "/placeholder.png";
              }}
            />
          </div>

          {/* Details Sidebar - Larger */}
          <div className="col-lg-5">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{
                background: "rgba(255,255,255,0.1)",
                backdropFilter: "blur(20px)",
                padding: "40px",
                borderRadius: "20px",
                border: "2px solid rgba(255,255,255,0.2)",
              }}
            >
              {/* Title */}
              <h1
                className="fw-bold mb-4"
                style={{
                  fontSize: "2.2rem",
                  background: "linear-gradient(135deg, #ffffff, #EFC8AE, #dfa528)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  lineHeight: "1.3",
                }}
              >
                {getText(destination, "title")}
              </h1>

              {/* Rating */}
              <div className="d-flex align-items-center gap-2 mb-5">
                {renderStars(destination.rating || 0)}
                <span className="text-warning fw-bold ms-2" style={{ fontSize: "1.1rem" }}>
                  {destination.rating || 0}
                </span>
              </div>

              {/* Price */}
              <div className="mb-5 pb-5 border-bottom border-light border-opacity-25">
                <div className="text-warning fw-bold" style={{ fontSize: "2.5rem", marginBottom: "5px" }}>
                  ${destination.price ? parseFloat(destination.price).toFixed(2) : "0.00"}
                </div>
                <small className="text-light-50" style={{ fontSize: "0.95rem" }}>
                  {t.per_person}
                </small>
              </div>

              {/* Info Grid - Larger */}
              <div className="mb-5">
                <div className="d-flex align-items-start gap-4 mb-4">
                  <Clock size={24} className="text-warning flex-shrink-0 mt-1" />
                  <div>
                    <small className="d-block text-light-50 mb-1" style={{ fontSize: "0.85rem" }}>
                      {t.duration}
                    </small>
                    <strong style={{ fontSize: "1.15rem" }}>
                      {getText(destination, "duration")}
                    </strong>
                  </div>
                </div>

                <div className="d-flex align-items-start gap-4 mb-4">
                  <Users size={24} className="text-warning flex-shrink-0 mt-1" />
                  <div>
                    <small className="d-block text-light-50 mb-1" style={{ fontSize: "0.85rem" }}>
                      {t.groupSize}
                    </small>
                    <strong style={{ fontSize: "1.15rem" }}>
                      {getText(destination, "groupSize")}
                    </strong>
                  </div>
                </div>

                <div className="d-flex align-items-start gap-4">
                  <MapPin size={24} className="text-warning flex-shrink-0 mt-1" />
                  <div>
                    <small className="d-block text-light-50 mb-1" style={{ fontSize: "0.85rem" }}>
                      {t.location}
                    </small>
                    <strong style={{ fontSize: "1.15rem" }}>
                      {getText(destination, "location")}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Book Button - Larger */}
              <motion.button
                onClick={() =>
                  openBookingOrAuth({
                    slug: slug,
                    title: getText(destination, "title"),
                    amount: destination.price || 0,
                  })
                }
                className="btn w-100 fw-bold py-4"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  background: "#EFC8AE",
                  color: "#000",
                  border: "none",
                  borderRadius: "25px",
                  fontSize: "1.1rem",
                }}
              >
                {t.bookNow}
              </motion.button>
            </motion.div>
          </div>
        </div>

        {/* Description Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="row mt-8"
        >
          <div className="col-lg-8">
            <h2 className="fw-bold mb-4" style={{ fontSize: "2rem" }}>
              {t.description}
            </h2>
            <p
              style={{
                fontSize: "1.15rem",
                lineHeight: "1.9",
                opacity: 0.95,
                marginBottom: "0",
              }}
            >
              {getText(destination, "description")}
            </p>
          </div>
        </motion.div>

        {/* Features Section */}
        {parseList(getText(destination, "features")).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="row mt-8"
          >
            <div className="col-lg-8">
              <h2 className="fw-bold mb-5" style={{ fontSize: "2rem" }}>
                {t.features}
              </h2>
              <div className="row g-4">
                {parseList(getText(destination, "features")).map((feature, idx) => (
                  <div key={idx} className="col-md-6">
                    <div className="d-flex align-items-start gap-3">
                      <Waves size={24} className="text-warning flex-shrink-0 mt-1" />
                      <span style={{ fontSize: "1.1rem" }}>{feature}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Highlights Section */}
        {parseList(getText(destination, "highlights")).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="row mt-8"
          >
            <div className="col-lg-8">
              <h2 className="fw-bold mb-5" style={{ fontSize: "2rem" }}>
                {t.highlights}
              </h2>
              <div className="row g-4">
                {parseList(getText(destination, "highlights")).map((highlight, idx) => (
                  <div key={idx} className="col-md-6">
                    <div className="d-flex align-items-start gap-3">
                      <Star size={24} className="text-warning flex-shrink-0 mt-1" fill="#dfa528" />
                      <span style={{ fontSize: "1.1rem" }}>{highlight}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* What's Included Section */}
        {parseList(getText(destination, "includes")).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="row mt-8"
          >
            <div className="col-lg-8">
              <h2 className="fw-bold mb-5" style={{ fontSize: "2rem" }}>
                {t.whatsIncluded}
              </h2>
              <ul style={{ fontSize: "1.1rem", lineHeight: "2.2", listStyle: "none", paddingLeft: "0" }}>
                {parseList(getText(destination, "includes")).map((item, idx) => (
                  <li key={idx} style={{ marginBottom: "15px", paddingLeft: "35px", position: "relative" }}>
                    <span
                      className="text-warning"
                      style={{
                        position: "absolute",
                        left: "0",
                        fontSize: "1.3rem",
                        fontWeight: "bold",
                      }}
                    >
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}

        {/* Itinerary Section */}
        {getText(destination, "itinerary") && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="row mt-8 mb-8"
          >
            <div className="col-lg-8">
              <h2 className="fw-bold mb-5" style={{ fontSize: "2rem" }}>
                {t.itinerary}
              </h2>
              <div
                style={{
                  fontSize: "1.05rem",
                  lineHeight: "1.95",
                  whiteSpace: "pre-wrap",
                  wordWrap: "break-word",
                  backgroundColor: "rgba(255,255,255,0.08)",
                  padding: "35px",
                  borderRadius: "15px",
                  border: "2px solid rgba(255,255,255,0.15)",
                }}
              >
                {getText(destination, "itinerary")}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
