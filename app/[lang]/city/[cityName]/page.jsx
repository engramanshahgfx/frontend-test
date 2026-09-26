"use client";
import { use, useState, useEffect } from "react";
import Link from "next/link";
import { citiesData } from "@/config/citiesData";
import styles from "./city.module.css";
import { ArrowLeft, ArrowRight, Calendar, Compass, MapPin, Star, Clock, Users, Volume2, VolumeX } from "lucide-react";
import { API_URL } from "@/lib/api";
import BookingModal from "@/components/BookingModal";

export default function CityDetail({ params }) {
  const { lang, cityName } = use(params);
  const [city, setCity] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [isMuted, setIsMuted] = useState(true);

  const getImageUrl = (img) => {
    if (!img) return "/placeholder.png";
    if (/^https?:\/\//.test(img)) return img;
    if (img.startsWith("/")) return img; // Local static asset
    const backendBase = API_URL.replace(/\/api\/?$/, "");
    return `${backendBase}/storage/${img}`;
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating || 0);
    const hasHalfStar = (rating || 0) - fullStars >= 0.5;
    return Array.from({ length: 5 }, (_, i) => {
      if (i < fullStars) {
        return <Star key={i} size={15} fill="#FFC60B" color="#FFC60B" style={{ display: "inline" }} />;
      } else if (i === fullStars && hasHalfStar) {
        return <Star key={i} size={15} fill="#FFC60B" color="#FFC60B" style={{ display: "inline", opacity: 0.5 }} />;
      } else {
        return <Star key={i} size={15} fill="none" color="#ddd" style={{ display: "inline" }} />;
      }
    });
  };

  const getPersonRange = (destination) => {
    if (!destination) return null;
    let prices = destination.person_prices;
    if (typeof prices === "string") {
      try {
        prices = JSON.parse(prices);
      } catch (e) {
        prices = null;
      }
    }
    if (Array.isArray(prices) && prices.length > 0) {
      const min = prices[0].min_persons || 1;
      const max = prices[prices.length - 1].max_persons || prices[0].max_persons || 20;
      return `${min} - ${max}`;
    }
    return null;
  };

  const getText = (item, field) => {
    if (!item) return "";
    const key = `${field}_${lang}`;
    return item[key] || item[field] || "";
  };

  const handleBookNow = (offer) => {
    setSelectedOffer(offer);
    setShowBookingModal(true);
  };

  useEffect(() => {
    async function loadCity() {
      try {
        const res = await fetch(`${API_URL}/cities/${cityName.toLowerCase()}?lang=${lang}`);
        if (!res.ok) throw new Error("City not found in API");
        const data = await res.json();
        setCity(data);
      } catch (err) {
        console.warn("Failed to fetch city from API, falling back to static data:", err);
        const fallback = citiesData[cityName.toLowerCase()];
        setCity(fallback || null);
      } finally {
        setLoading(false);
      }
    }
    loadCity();
  }, [cityName, lang]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loader}></div>
        <p>{lang === "ar" ? "جارٍ التحميل..." : "Loading..."}</p>
      </div>
    );
  }

  if (!city) {
    return (
      <div className={styles.notFoundContainer}>
        <h1 className={styles.notFoundTitle}>
          {lang === "ar" ? "المدينة غير موجودة" : "City Not Found"}
        </h1>
        <Link href={`/${lang}`}>
          <button className={styles.notFoundButton}>
            {lang === "ar" ? "العودة للرئيسية" : "Back to Home"}
          </button>
        </Link>
      </div>
    );
  }

  const isRTL = lang === "ar";

  // Map URL city name → actual video/image file slug in /public/cities/
  const citySlugMap = {
    "albahah": "albahah",
    "jeddah": "jeddah",
    "riyadh": "riyadh",
    "madina": "madina",
    "taif": "taif",
    "alula": "alula",
  };
  const citySlug = citySlugMap[cityName.toLowerCase()] || cityName.toLowerCase();
  const citiesWithVideos = ["albahah", "jeddah", "riyadh", "madina", "taif", "alula"];
  const hasVideo = citiesWithVideos.includes(cityName.toLowerCase());

  // Resolve properties dynamically between API schema and fallback static config
  const displayName = city.name || (isRTL ? city.nameAr : city.nameEn);
  const description = city.description || (isRTL ? city.descriptionAr : city.descriptionEn);
  const bestTime = city.best_time || (isRTL ? city.bestTimeAr : city.bestTimeEn);

  let activities = [];
  if (Array.isArray(city.activities)) {
    activities = city.activities;
  } else if (city.activitiesEn || city.activitiesAr) {
    activities = isRTL ? city.activitiesAr : city.activitiesEn;
  }

  let landmarks = [];
  if (Array.isArray(city.landmarks)) {
    landmarks = city.landmarks;
  } else if (city.landmarksEn || city.landmarksAr) {
    landmarks = isRTL ? city.landmarksAr : city.landmarksEn;
  }

  return (
    <div className={styles.container} dir={isRTL ? "rtl" : "ltr"}>
      {/* Hero Section */}
      <div className={styles.heroSection}>
        {hasVideo ? (
          <>
            <video
              src={`/cities/${citySlug}.mp4`}
              autoPlay
              loop
              muted={isMuted}
              playsInline
              className={styles.heroImage}
              style={{ objectFit: 'cover', objectPosition: 'center 25%', width: '100%', height: '100%' }}
            />
            <button
              className={styles.muteButton}
              onClick={() => setIsMuted(!isMuted)}
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
            </button>
          </>
        ) : (
          <img src={getImageUrl(city.image)} alt={displayName} className={styles.heroImage} />
        )}
        <div className={styles.heroOverlay}></div>

        {/* Floating Back Button */}
        <div className={styles.floatingHeader}>
          <Link href={`/${lang}`}>
            <button className={styles.backButton}>
              {isRTL ? <ArrowRight size={18} /> : <ArrowLeft size={18} />}
              <span>{isRTL ? "العودة" : "Back"}</span>
            </button>
          </Link>
        </div>

        {/* Hero Content (City Title) */}
        <div className={styles.heroContent}>
          <h1 className={styles.cityName}>{displayName}</h1>
          <div className={styles.titleUnderline}></div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className={styles.contentWrapper}>
        <div className={styles.mainGrid}>

          {/* Main Content Column */}
          <div className={styles.leftColumn}>
            {/* Description Section */}
            <section className={styles.descriptionSection}>
              <div className={styles.quoteBar}></div>
              <p className={styles.description}>{description}</p>
            </section>

            {/* Landmarks Section */}
            <section className={styles.landmarksSection}>
              <h2 className={styles.sectionTitle}>
                <MapPin className={styles.sectionIcon} size={24} />
                <span>{isRTL ? "المعالم الرئيسية" : "Major Landmarks"}</span>
              </h2>
              <div className={styles.landmarksGrid}>
                {landmarks.map((landmark, index) => (
                  <div key={index} className={styles.landmarkCard}>
                    <div className={styles.landmarkImageWrapper}>
                      <img
                        src={getImageUrl(landmark.image)}
                        alt={landmark.name}
                        className={styles.landmarkImage}
                      />
                      <div className={styles.landmarkOverlay}></div>
                    </div>
                    <div className={styles.landmarkContent}>
                      <h3 className={styles.landmarkName}>{landmark.name}</h3>
                      <p className={styles.landmarkDescription}>
                        {landmark.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar Column */}
          <div className={styles.rightColumn}>
            {/* Best Time Section */}
            <section className={styles.bestTimeSection}>
              <div className={styles.cardHeader}>
                <Calendar className={styles.cardIcon} size={22} />
                <h3>{isRTL ? "أفضل وقت للزيارة" : "Best Time to Visit"}</h3>
              </div>
              <p className={styles.bestTimeText}>{bestTime}</p>
            </section>

            {/* Activities Section */}
            <section className={styles.activitiesSection}>
              <div className={styles.cardHeader}>
                <Compass className={styles.cardIcon} size={22} />
                <h3>{isRTL ? "الأنشطة الموصى بها" : "Recommended Activities"}</h3>
              </div>
              <div className={styles.activitiesList}>
                {activities.map((activity, index) => (
                  <div key={index} className={styles.activityTag}>
                    {activity}
                  </div>
                ))}
              </div>
            </section>

            {/* Call To Action Card */}
            <section className={styles.ctaCard}>
              <h3>{isRTL ? "ابدأ رحلتك اليوم" : "Start Your Journey Today"}</h3>
              <p>
                {isRTL
                  ? "احجز باقة سفرك المخصصة واستمتع بتجربة سياحية لا تُنسى."
                  : "Book your customized travel package and live an unforgettable tourism experience."}
              </p>
              <Link href={`/${lang}/tousimoffers`}>
                <button className={styles.bookButton}>
                  {isRTL ? "استكشف الباقات" : "Explore Packages"}
                </button>
              </Link>
            </section>
          </div>

        </div>

        {/* Tourism Offers Section */}
        {city.tourism_offers && city.tourism_offers.length > 0 && (
          <section className={styles.offersSection}>
            <div className={styles.offersHeader}>
              <h2 className={styles.offersTitle}>
                {isRTL ? "استكشف عروض " : "Discover "}
                <span className={styles.offersTitleHighlight}>{displayName}</span>
              </h2>
              {/* <p className={styles.offersSubtitle}>
                {isRTL 
                  ? "اكتشف الصفقات المذهلة والتجارب التي لا تنسى في هذه المدينة."
                  : "Discover amazing deals and unforgettable experiences in this city."}
              </p> */}
            </div>

            <div className={styles.offersGrid}>
              {city.tourism_offers.map((offer, index) => (
                <div key={offer.id || index} className={styles.offerCard}>
                  <div className={styles.offerImageWrapper}>
                    <img
                      src={getImageUrl(offer.image)}
                      alt={getText(offer, "title")}
                      className={styles.offerImage}
                      onError={(e) => { e.target.src = "/placeholder.png"; }}
                    />
                    <div className={styles.badgesContainer}>
                      {offer.discount && (
                        <span className={styles.discountBadge}>{offer.discount}% OFF</span>
                      )}
                      {offer.popular && (
                        <span className={styles.popularBadge}>
                          {isRTL ? "شائع" : "Popular"}
                        </span>
                      )}
                      {offer.limited && (
                        <span className={styles.limitedBadge}>
                          {isRTL ? "عرض محدود" : "Limited Offer"}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className={styles.offerContent}>
                    <div className={styles.offerTitleRating}>
                      <h3>{getText(offer, "title")}</h3>
                      <div className={styles.ratingStars}>
                        {renderStars(offer.rating)}
                        <span className={styles.ratingValue}>{offer.rating || 0}</span>
                      </div>
                    </div>

                    <p className={styles.offerDesc}>
                      {getText(offer, "description")}
                    </p>

                    <div className={styles.offerMeta}>
                      {getText(offer, "location") && (
                        <span>
                          <MapPin size={14} /> {getText(offer, "location")}
                        </span>
                      )}
                      {getText(offer, "duration") && (
                        <span>
                          <Clock size={14} /> {getText(offer, "duration")}
                        </span>
                      )}
                      {getPersonRange(offer) && (
                        <span>
                          <Users size={14} /> {getPersonRange(offer)}
                        </span>
                      )}
                    </div>

                    <div className={styles.offerFooter}>
                      <div className={styles.offerPrice}>
                        {offer.original_price && (
                          <span className={styles.priceOriginal}>
                            {offer.original_price}
                            <img
                              src="/saudi_riyal.png"
                              alt="SAR"
                              className={styles.currencyIconSmall}
                              style={{ width: "12px", height: "12px" }}
                            />
                          </span>
                        )}
                        <div className={styles.priceAmountWrapper}>
                          <span className={styles.priceAmount}>{offer.price}</span>
                          <img
                            src="/saudi_riyal.png"
                            alt="SAR"
                            className={styles.currencyIcon}
                            style={{ width: "16px", height: "16px" }}
                          />
                        </div>
                      </div>
                      <button
                        className={styles.btnBook}
                        onClick={() => handleBookNow(offer)}
                      >
                        {isRTL ? "احجز الآن" : "Book Now"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.btnViewAllContainer}>
              <Link href={`/${lang}/tousimoffers`} className={styles.btnViewAll}>
                <span>{isRTL ? "عرض جميع العروض" : "View All Offers"}</span>
                {isRTL ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
              </Link>
            </div>
          </section>
        )}
      </div>

      <BookingModal
        isOpen={showBookingModal}
        onClose={() => {
          setShowBookingModal(false);
          setSelectedOffer(null);
        }}
        packageData={selectedOffer}
        lang={lang}
        bookingType="tourism_offer"
      />
    </div>
  );
}
