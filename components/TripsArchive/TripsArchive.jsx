"use client";

import React from "react";
import {
  FaStar,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaUsers,
  FaArrowLeft,
  FaArrowRight,
} from "react-icons/fa";
import { tripsAPI } from "../../lib/api";

export default function TripsArchive({ lang, hideHero = false }) {
  const content = {
    en: {
      heroTitle: "The Magic of Nature As You've Never Seen Before",
      heroSubtitle: "Discover Saudi Arabia from a New Perspective",
      heroDescription: "Let us plan... while you enjoy the journey",

      sectionTitle: "Our Previous Trips",
      sectionDescription:
        "Browse a collection of trips we've experienced with our clients for the most beautiful tourism experiences.",

      viewDetails: "Book Now",
      featured: "Featured",
      loadMoreText: "Load More",
      loadMoreQuestion: "Want to see more trips?",
      errorFetchingTrips: "Failed to fetch trips. Please try again.",
      retry: "Retry",
      dateTBD: "Date TBD",
    },
    ar: {
      heroTitle: "سحر الطبيعة كما لم تره من قبل",
      heroSubtitle: "اكتشف المملكة من منظور جديد",
      heroDescription: "دعنا نخطط.. وأنت استمتع بالرحلة",

      sectionTitle: "رحلاتنا السابقة",
      sectionDescription:
        "استعرض مجموعة من الرحلات التي خضناها مع عملائنا لأجمل التجارب السياحية.",

      viewDetails: " احجز الآن",
      featured: "مميز",
      loadMoreText: "عرض المزيد",
      loadMoreQuestion: "هل تريد رؤية المزيد من الرحلات؟",
      errorFetchingTrips: "فشل في جلب الرحلات. يرجى المحاولة مرة أخرى.",
      retry: "إعادة المحاولة",
      dateTBD: "قريباً",
    },
    zh: {
      heroTitle: "大自然的神奇，前所未见",
      heroSubtitle: "从新视角探索沙特阿拉伯",
      heroDescription: "让我们来规划... 您只管享受旅程",

      sectionTitle: "我们之前的旅行",
      sectionDescription:
        "浏览我们与客户体验过的旅行集合，享受最美丽的旅游体验。",

      viewDetails: "立即预订",
      featured: "精选",
      loadMoreText: "加载更多",
      loadMoreQuestion: "想看更多旅行吗？",
      errorFetchingTrips: "获取旅行失败。请重试。",
      retry: "重试",
      dateTBD: "日期待定",
    },
  };

  const safeLang = lang && content[lang] ? lang : "ar";
  const t = content[safeLang];
  const isRTL = safeLang === "ar";

  // Dynamic trips state
  const [trips, setTrips] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  // Debug / status info
  const [fetchStatus, setFetchStatus] = React.useState('idle'); // idle | fetching | success | error
  const [lastResponseSize, setLastResponseSize] = React.useState(null);

  // Video playback state - all videos play by default (no cover image)
  const videoRefs = React.useRef({});
  const [blockedAutoplay, setBlockedAutoplay] = React.useState({});

  // Developer helper
  const isDev = process.env.NODE_ENV === 'development';

  const fetchRef = React.useRef(() => { });

  // Static trips data with complete information and videos
  const staticTrips = [
    {
      id: 1,
      type: 'event',
      title: 'Winter Hills and Sands',
      title_trans: {
        en: 'Winter Hills and Sands',
        ar: 'شتوية التلال والرمال',
        zh: '冬季山丘与沙地'
      },
      description: 'Enjoy the pleasure with us at Winter Hills and Sands. Experience party sessions, warm gatherings, beverages, BBQ meals, and archery challenges in a unique desert atmosphere.',
      description_trans: {
        en: 'Enjoy the pleasure with us at Winter Hills and Sands. Experience party sessions, warm gatherings, beverages, BBQ meals, and archery challenges in a unique desert atmosphere.',
        ar: 'عيش المتعة معنا في شتوية التلال والرمال. جلسات طربية، جلسات دافئة، متعة المشروبات، الاستمتاع بوجبة الشواء، تحدي الرماية في أجواء صحراوية فريدة.',
        zh: '与我们一起享受冬季山丘与沙地的乐趣。体验派对环节、温馨聚会、饮品、烧烤餐以及在独特的沙漠氛围中的射箭挑战。'
      },
      video: '/videos/jeddah.mp4',
      image: '/foundation-day.jpg',
      start_date: '2025-01-24',
      city: { name: 'Jeddah-AlUla', id: 1 },
      city_name: 'Jeddah-AlUla',
      group_size: '20-50 Persons',
      duration: 1,
      highlights: [
        { en: 'Party Session', ar: 'جلسة طربية', zh: '派对环节' },
        { en: 'Warm Gatherings', ar: 'جلسات دافئة', zh: '温馨聚会' },
        { en: 'Beverages', ar: 'المشروبات', zh: '饮品' },
        { en: 'BBQ', ar: 'الشواء', zh: '烧烤' },
        { en: 'Archery', ar: 'الرماية', zh: '射箭' }
      ],
      lang: 'en'
    },
    {
      id: 2,
      type: 'event',
      title: 'Egyptian Night at Winter Hills and Sands',
      title_trans: {
        en: 'Egyptian Night at Winter Hills and Sands',
        ar: 'ليلة مصرية في شتوية التلال والرمال',
        zh: '冬季山丘与沙地的埃及之夜'
      },
      description: 'Experience different atmospheres and enjoy evening performances in nature. Oud music session with "Al-Omda", authentic Egyptian dinner, and classic melodies with "Amathal" band.',
      description_trans: {
        en: 'Experience different atmospheres and enjoy evening performances in nature. Oud music session with "Al-Omda", authentic Egyptian dinner, and classic melodies with "Amathal" band.',
        ar: 'عيش اجواء مختلفة والاستمتاع بفقرات الأمسية في اجواء الطبيعة. جلسة طربية على انغام العود بصوت العمده، وجبة عشاء مشاري واكلات مصرية، جلسة مع الانغام القديمة بصوت امثال.',
        zh: '体验不同的氛围，在大自然中享受晚间表演。与"Al-Omda"一同聆听乌德琴演奏，享用正宗埃及晚餐，并伴随"Amathal"乐队的经典旋律。'
      },
      video: '/videos/egyptian.mp4',
      image: '/alula-heritage.jpg',
      start_date: '2025-02-03',
      city: { name: 'Jeddah-AlUla', id: 1 },
      city_name: 'Jeddah-AlUla',
      group_size: '25-60 Persons',
      duration: 1,
      badge: '',
      highlights: [
        { en: 'Oud Music', ar: 'موسيقى العود', zh: '乌德琴音乐' },
        { en: 'Egyptian Food', ar: 'الطعام المصري', zh: '埃及美食' },
        { en: 'Live Performance', ar: 'عرض حي', zh: '现场表演' },
        { en: 'Natural Ambiance', ar: 'أجواء طبيعية', zh: '自然氛围' },
        { en: 'Classic Melodies', ar: 'الألحان الكلاسيكية', zh: '经典旋律' }
      ],
      lang: 'en'
    },
    {
      id: 3,
      type: 'event',
      title: 'Foundation Day at Winter Hills and Sands',
      title_trans: {
        en: 'Foundation Day at Winter Hills and Sands',
        ar: 'يوم التأسيس في شتوية التلال والرمال',
        zh: '冬季山丘与沙地的建国日庆典'
      },
      description: 'Celebrate our founding day with us! Experience Foundation Day procession, oud music by artist "Al-Omda", folk and folklore bands, women\'s folk performances, traditional hospitality, horse and camel rides.',
      description_trans: {
        en: 'Celebrate our founding day with us! Experience Foundation Day procession, oud music by artist "Al-Omda", folk and folklore bands, women\'s folk performances, traditional hospitality, horse and camel rides.',
        ar: 'يوم بدينا معنا، اعيش اجواء مختلفة. مسيرة يوم التأسيس، جلسة مع انغام العود بصوت الفنان العمده، فرقة شعبية وفلكلور، فرقة شعبية نسائية، الضيافة الشعبية، ركوب الخيول والجمال.',
        zh: '与我们一起庆祝建国日！体验建国日游行，艺术家"Al-Omda"的乌德琴演奏，民俗与民间乐团，女性民俗表演，传统待客之道，骑马和骑骆驼。'
      },
      video: '/videos/saudifounday.mp4',
      image: '/red-sea-beach.jpg',
      start_date: '2025-02-23',
      city: { name: 'Jeddah-AlUla', id: 1 },
      city_name: 'Jeddah-AlUla',
      group_size: '30-100 Persons',
      duration: 1,
      highlights: [
        { en: 'Foundation Day Procession', ar: 'مسيرة يوم التأسيس', zh: '建国日游行' },
        { en: 'Oud Music', ar: 'موسيقى العود', zh: '乌德琴音乐' },
        { en: 'Folk Bands', ar: 'فرق شعبية', zh: '民间乐队' },
        { en: 'Horse Riding', ar: 'ركوب الخيول', zh: '骑马' },
        { en: 'Camel Rides', ar: 'ركوب الجمال', zh: '骑骆驼' },
        { en: 'Traditional Hospitality', ar: 'الضيافة الشعبية', zh: '传统待客之道' }
      ],
      lang: 'en'
    }
  ];

  React.useEffect(() => {
    let cancelled = false;
    let timeoutId;

    const doFetch = async () => {
      setLoading(true);
      setError(null);

      try {
        setFetchStatus('fetching');

        // Fetch from API first
        console.debug('[TripsArchive] Fetching trips from API');
        const apiResponse = await tripsAPI.getAll({ lang: safeLang });
        
        let fetchedTrips = [];
        if (apiResponse) {
          if (Array.isArray(apiResponse.data)) {
            fetchedTrips = apiResponse.data;
          } else if (Array.isArray(apiResponse)) {
            fetchedTrips = apiResponse;
          }
        }

        if (!cancelled) {
          if (fetchedTrips && fetchedTrips.length > 0) {
            console.debug('[TripsArchive] API returned trips:', fetchedTrips.length);
            setTrips(fetchedTrips);
            setLastResponseSize(fetchedTrips.length);
          } else {
            console.debug('[TripsArchive] API returned no trips, falling back to static data');
            setTrips(staticTrips);
            setLastResponseSize(staticTrips.length);
          }
          setFetchStatus('success');
        }
      } catch (e) {
        if (!cancelled) {
          let errorMsg = e.message || 'Unknown error';
          console.error('[TripsArchive] API Error, falling back to static data:', errorMsg, e);
          
          // Fallback to static data on error so page still works
          setTrips(staticTrips);
          setLastResponseSize(staticTrips.length);
          setFetchStatus('success'); // mark as success since we loaded fallback
        }
      } finally {
        clearTimeout(timeoutId);
        if (!cancelled) setLoading(false);
      }
    };

    fetchRef.current = doFetch;
    doFetch();

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
    // IMPORTANT: only re-run when the requested language changes
  }, [safeLang]);

  // Try autoplaying video elements once trips are set; mark blocked ones for user tap overlay
  React.useEffect(() => {
    if (!trips || trips.length === 0) return;

    trips.forEach(trip => {
      const v = videoRefs.current[trip.id];
      if (v && v.play) {
        v.play().then(() => {
          setBlockedAutoplay(prev => ({ ...prev, [trip.id]: false }));
        }).catch((err) => {
          console.warn('[TripsArchive] autoplay blocked for', trip.id, err && err.name);
          setBlockedAutoplay(prev => ({ ...prev, [trip.id]: true }));
        });
      }
    });
  }, [trips]);

  function formatTripDate(dateStr) {
    if (!dateStr) return t.dateTBD || (safeLang === 'ar' ? 'قريباً' : 'Date TBD');
    try {
      const date = new Date(dateStr);
      return date.toLocaleString(safeLang === 'ar' ? 'ar-SA' : 'en-US', { month: 'long', year: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  }

  function durationLabel(d) {
    if (!d) return '';
    if (d === 1) return safeLang === 'ar' ? '١ ليلة' : '1 Night';
    return `${d} ${safeLang === 'ar' ? 'أيام' : 'Days'}`;
  }

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="trips-archive-page">
      {!hideHero && (
        <section className="trips-hero">
          <div className="video-background">
            <video
              autoPlay
              muted
              loop
              playsInline
              className="background-video"
            >
              <source src="/desert2.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <div className="video-overlay"></div>
          </div>

          <div className="container">
            <div className="row align-items-center min-vh-80">
              <div className="col-lg-8 mx-auto text-center text-white">
                <div className="hero-content">
                  <h1 className="display-4 fw-bold mb-4">{t.heroTitle}</h1>
                  <p className="lead mb-3">{t.heroSubtitle}</p>
                  <p className="hero-description">{t.heroDescription}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Trips Grid Section */}
      <section className="trips-section py-5">
        <div className="container">

          <div className="text-center mb-5">
            <h2 className="section-title mb-3">{t.sectionTitle}</h2>
            <p className="section-description">{t.sectionDescription}</p>
          </div>

          <div className="row g-4">
            {trips.length > 0 ? (
              trips.map((trip) => {
                let image = trip.image || (trip.images && trip.images.length ? trip.images[0] : '/foundation-day.jpg');
                if (image && !image.startsWith('http') && !image.startsWith('/')) image = '/' + image;
                const highlights = trip.highlights || [];

                return (
                  <div key={trip.id} className="col-lg-4 col-md-6 mb-4">
                    <div className={`trip-card ${isDev ? 'debug-outline' : ''}`}>
                      {/* Trip Badge */}
                      {/* {trip.badge && <div className="trip-badge">{trip.badge}</div>} */}

                      <div className="trip-image" style={{ position: 'relative', overflow: 'hidden' }}>
                        <video
                          src={(trip.video && (trip.video.startsWith('http') || trip.video.startsWith('/')) ? trip.video : (trip.video ? '/' + trip.video : '/desert2.mp4'))}
                          poster={image}
                          autoPlay
                          muted
                          loop
                          playsInline
                          preload="metadata"
                          className="background-video"
                          style={{ cursor: 'pointer' }}
                          onClick={(e) => {
                            const v = e.target;
                            if (v) {
                              if (v.paused) {
                                v.play().catch(err => console.warn('[TripsArchive] play failed', err));
                              } else {
                                v.pause();
                              }
                            }
                          }}
                          ref={(el) => (videoRefs.current[trip.id] = el)}
                          onLoadedData={(e) => {
                            const v = e.target;
                            if (v && v.play) {
                              v.play().then(() => {
                                setBlockedAutoplay(prev => ({ ...prev, [trip.id]: false }));
                              }).catch(err => {
                                console.warn('[TripsArchive] autoplay blocked for', trip.id, err && err.name);
                                setBlockedAutoplay(prev => ({ ...prev, [trip.id]: true }));
                              });
                            }
                          }}
                          onPlay={() => {
                            setBlockedAutoplay(prev => ({ ...prev, [trip.id]: false }));
                          }}
                          onError={(e) => {
                            console.error('[TripsArchive] video load error for', trip.id, e);
                            e.target.dataset.error = '1';
                          }}
                        />

                        {blockedAutoplay[trip.id] && (
                          <button
                            aria-label="Tap to play"
                            className="play-overlay visible"
                            onClick={() => {
                              const v = videoRefs.current[trip.id];
                              if (!v) return;
                              v.play().then(() => {
                                setBlockedAutoplay(prev => ({ ...prev, [trip.id]: false }));
                              }).catch(err => console.warn('[TripsArchive] play after user tap failed', trip.id, err));
                            }}
                          >
                            <span className="play-icon">►</span>
                          </button>
                        )}
                      </div>

                      <div className="trip-content">
                        {(trip.city_name || trip.city?.name) && (
                          <div className="trip-location">
                            <FaMapMarkerAlt size={12} className={isRTL ? "ms-1" : "me-1"} />
                            <span>{trip.city_name || trip.city?.name || ''}</span>
                          </div>
                        )}

                        <h3 className="trip-title">{(trip.title_trans && trip.title_trans[safeLang]) || trip.title || trip.title_trans?.en || ''}</h3>
                        <p className="trip-description">{(trip.description_trans && trip.description_trans[safeLang]) || trip.description || trip.description_trans?.en || ''}</p>

                        {/* Trip Highlights */}
                        <div className="trip-highlights">
                          {highlights.map((highlight, index) => {
                            const highlightText = typeof highlight === 'string'
                              ? highlight
                              : (highlight[safeLang] || highlight.en || '');
                            return (
                              <span key={index} className="highlight-tag">
                                {highlightText}
                              </span>
                            );
                          })}
                        </div>
                        {/* Trip Details */}
                        <div className="trip-details mt-auto">
                          <div className="detail-item">
                            <FaCalendarAlt className="detail-icon" />
                            <span className="detail-date">{formatTripDate(trip.start_date)}</span>
                          </div>
                          <div className="detail-item">
                            <FaUsers className="detail-icon" />
                            <span>{trip.group_size || ''}</span>
                          </div>
                          <div className="detail-item">
                            <FaStar className="detail-icon" />
                            <span>{durationLabel(trip.duration)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : fetchStatus === 'fetching' ? (
              <div className="col-12 text-center my-5">
                <div>Loading...</div>
                <small style={{ color: '#999', fontSize: '0.8rem', marginTop: '10px', display: 'block' }}>
                  API: {process.env.NEXT_PUBLIC_API_URL || 'https://admin.tilalr.com/api'}/trips?lang={safeLang}
                </small>
                <small style={{ color: '#666', fontSize: '0.8rem', marginTop: '6px', display: 'block' }}>
                  Status: {fetchStatus}{lastResponseSize !== null ? ` — ${lastResponseSize} items` : ''}
                </small>
                <div style={{ marginTop: 12 }}>
                  <button className="btn btn-load-more" onClick={() => { console.debug('[TripsArchive] Manual fetch triggered'); fetchRef.current(); }}>Fetch now</button>
                </div>
              </div>
            ) : error ? (
              <div className="col-12 text-center my-5 text-danger">
                <p>{error}</p>
                <button className="btn btn-load-more mt-2" onClick={() => { console.debug('[TripsArchive] Retry triggered'); fetchRef.current(); }}>{t.retry}</button>
              </div>
            ) : (
              <div className="col-12 text-center my-5">
                <p>No trips found.</p>
                <div style={{ marginTop: 12 }}>
                  <button className="btn btn-load-more" onClick={() => { console.debug('[TripsArchive] Manual fetch triggered (no trips)'); fetchRef.current(); }}>Fetch now</button>
                </div>
              </div>
            )}
          </div>

          {/* Load More Section */}
          <div className="text-center mt-5">

          </div>
        </div>
      </section>

      <style jsx>{`
        .trips-archive-page {
          background: #f8f9fa;
          font-family: 'Tajawal', sans-serif;
        }

        .trips-hero {
          position: relative;
          padding: 120px 0 80px;
          min-height: 60vh;
          display: flex;
          align-items: center;
          overflow: hidden;
        }

        .video-background {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
        }

        .background-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .video-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            135deg,
            rgba(28, 0, 82, 0.9) 0%,
            rgba(249, 229, 210, 0.8) 100%
          );
          z-index: 2;
        }

        .trips-hero .container {
          position: relative;
          z-index: 3;
        }

        .hero-content {
          max-width: 800px;
          margin: 0 auto;
        }

        .hero-content h1 {
          font-weight: 800;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
          line-height: 1.3;
          font-family: 'Tajawal', sans-serif;
        }

        .hero-content .lead {
          font-size: 1.5rem;
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
          font-weight: 600;
          font-family: 'Tajawal', sans-serif;
        }

        .hero-description {
          font-size: 1.2rem;
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
          color: rgba(255, 255, 255, 0.9);
          font-family: 'Tajawal', sans-serif;
        }

        .trips-section {
          background: #FAF6F0;
        }

        .section-title {
          color: #E85D1F;
          font-weight: 800;
          font-size: 2.5rem;
          position: relative;
          margin-bottom: 1rem;
          font-family: 'Tajawal', sans-serif;
        }

        .section-description {
          color: #555;
          font-size: 1.1rem;
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.6;
          font-family: 'Tajawal', sans-serif;
        }

        .trip-card {
          background: white;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
          position: relative;
          height: 100%;
          border: 1px solid rgba(28, 0, 82, 0.06);
          font-family: 'Tajawal', sans-serif;
          display: flex;
          flex-direction: column;
        }

        .trip-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 30px rgba(28, 0, 82, 0.1);
          border-color: rgba(232, 93, 31, 0.3);
        }

        .trip-card:hover .background-video {
          transform: scale(1.08);
        }

        .trip-badge {
          position: absolute;
          top: 15px;
          ${isRTL ? 'right: 15px;' : 'left: 15px;'}
          background: linear-gradient(135deg, #E85D1F 0%, #FFC60B 100%);
          color: white;
          padding: 8px 16px;
          border-radius: 10px;
          font-size: 0.8rem;
          font-weight: 700;
          z-index: 2;
          font-family: 'Tajawal', sans-serif;
        }

        .trip-image {
          height: 250px;
          overflow: hidden;
          position: relative;
        }

        .trip-image img, .trip-image video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .play-overlay {
          display: none;
        }

        .play-overlay.visible {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0,0,0,0.35);
          z-index: 4;
          cursor: pointer;
        }

        .play-overlay .play-icon {
          background: rgba(255,255,255,0.9);
          color: #333;
          padding: 12px 14px;
          border-radius: 50%;
          font-weight: 700;
          font-size: 1.1rem;
        }

        .trip-location {
          color: #E85D1F;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .trip-content {
          padding: 25px;
          font-family: 'Tajawal', sans-serif;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .trip-title {
          font-size: 1.4rem;
          font-weight: 700;
          color: #1C0052;
          margin-bottom: 10px;
          line-height: 1.3;
          font-family: 'Tajawal', sans-serif;
        }

        .trip-description {
          color: #666;
          margin-bottom: 15px;
          line-height: 1.5;
          font-size: 0.95rem;
          font-family: 'Tajawal', sans-serif;
        }

        .trip-highlights {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 20px;
        }

        .highlight-tag {
          background: rgba(232, 93, 31, 0.08);
          color: #E85D1F;
          border: 1px solid rgba(232, 93, 31, 0.15);
          padding: 4px 12px;
          border-radius: 10px;
          font-size: 0.75rem;
          font-weight: 500;
          font-family: 'Tajawal', sans-serif;
        }

        .trip-details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 20px;
          padding: 15px 0;
          border-top: 1px solid rgba(28, 0, 82, 0.06);
          border-bottom: 1px solid rgba(28, 0, 82, 0.06);
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #666;
          font-size: 0.85rem;
          font-weight: 500;
          font-family: 'Tajawal', sans-serif;
        }

        .detail-icon {
          color: #E85D1F;
          font-size: 0.9rem;
          flex-shrink: 0;
        }

        .detail-date, .detail-time {
          font-family: 'Inter', 'Roboto', 'Segoe UI', 'Noto Sans', 'Arial', sans-serif;
          font-weight: 700;
          color: #1C0052;
          font-size: 0.95rem;
          letter-spacing: 0.2px;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          font-variant-numeric: tabular-nums;
        }

        .detail-time {
          font-weight: 600;
          color: #6c757d;
        }

        .trip-footer {
          display: flex;
          justify-content: center;
        }

        .trip-btn {
          background: linear-gradient(135deg, #E85D1F 0%, #FFC60B 100%);
          border: none;
          color: white;
          padding: 10px 25px;
          border-radius: 10px;
          font-weight: 600;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          box-shadow: 0 4px 15px rgba(232, 93, 31, 0.2);
          font-family: 'Tajawal', sans-serif;
        }

        .trip-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(232, 93, 31, 0.3);
        }

        .btn-load-more {
          background: transparent;
          border: 2px solid #E85D1F;
          color: #E85D1F;
          padding: 12px 30px;
          border-radius: 10px;
          font-weight: 600;
          transition: all 0.3s ease;
          font-family: 'Tajawal', sans-serif;
        }

        .btn-load-more:hover {
          background: #E85D1F;
          color: white;
          transform: translateY(-2px);
        }

        .debug-panel {
          background: #fff8e6;
          border: 1px solid #dfa528;
          color: #333;
          padding: 8px 12px;
          border-radius: 8px;
          margin-bottom: 1rem;
          font-size: 0.95rem;
          text-align: center;
        }

        .load-more-section p {
          color: #5d6d7e;
          font-size: 1.1rem;
          font-family: 'Tajawal', sans-serif;
        }

        @media (max-width: 768px) {
          .trips-hero {
            padding: 100px 0 60px;
            min-height: 50vh;
          }

          .hero-content h1 {
            font-size: 2.2rem;
          }

          .hero-content .lead {
            font-size: 1.3rem;
          }

          .section-title {
            font-size: 2rem;
          }

          .trip-details {
            grid-template-columns: 1fr;
            gap: 8px;
          }
        }

        @media (max-width: 576px) {
          .hero-content h1 {
            font-size: 1.8rem;
          }

          .trip-content {
            padding: 20px;
          }

          .trip-title {
            font-size: 1.2rem;
          }
        }
      `}</style>
    </div>
  );
}