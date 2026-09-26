"use client";

import React, { useState, useRef, useEffect } from "react";
import SaudiCitiesData from "./SaudiCitiesData";
import SaudiCitiesSlider from "./SaudiCitiesSlider";
import SaudiCitiesMap from "./SaudiCitiesMap";
import SaudiCitiesDetails from "./SaudiCitiesDetails";
import "./SaudiCitiesShowcase.css";

export default function SaudiCitiesShowcase({ lang }) {
  const [selectedCity, setSelectedCity] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const scrollContainerRef = useRef(null);
  const autoPlayRef = useRef(null);

  // Fix hydration by only running effects on client side
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Auto-play functionality for cities
  useEffect(() => {
    if (!isMounted) return;
    
    if (isAutoPlaying) {
      autoPlayRef.current = setInterval(() => {
        setSelectedCity((prev) => (prev + 1) % SaudiCitiesData.length);
      }, 6000);
    } else {
      clearInterval(autoPlayRef.current);
    }

    return () => clearInterval(autoPlayRef.current);
  }, [isAutoPlaying, isMounted]);

  const handleCitySelect = (index) => {
    setSelectedCity(index);
    setIsAutoPlaying(false);
  };

  const scrollLeft = () => {
    scrollContainerRef.current?.scrollBy({ left: -300, behavior: 'smooth' });
  };

  const scrollRight = () => {
    scrollContainerRef.current?.scrollBy({ left: 300, behavior: 'smooth' });
  };

  const currentCity = SaudiCitiesData[selectedCity];

  // Show loading state during SSR and initial client render
  if (!isMounted) {
    return (
      <section className="saudi-cities-showcase" dir={lang === "ar" ? "rtl" : "ltr"}>
        <div className="content-container">
          <div className="loading-placeholder">
            <div className="loading-spinner"></div>
            <span>{lang === "ar" ? "جاري التحميل..." : "Loading..."}</span>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="saudi-cities-showcase" dir={lang === "ar" ? "rtl" : "ltr"}>
      {/* Static background with optional video - Client only */}
      <VideoBackground />
      
      <div className="content-container">
        {/* Header Section */}
        <div className="section-header">
          <div className="header-content">
            <h1 className="section-title">
              {lang === "ar" ? "روائع المملكة" : "Saudi Wonders"}
            </h1>
            <p className="section-subtitle">
              {lang === "ar" 
                ? "اكتشف التنوع الاستثنائي والتراث الثري للمملكة العربية السعودية"
                : "Discover the extraordinary diversity and rich heritage of Saudi Arabia"
              }
            </p>
            <div className="header-badges">
              <span className="badge">🏜️ {lang === "ar" ? "صحراء" : "Desert"}</span>
              <span className="badge">🏔️ {lang === "ar" ? "جبال" : "Mountains"}</span>
              <span className="badge">🏖️ {lang === "ar" ? "سواحل" : "Coasts"}</span>
              <span className="badge">🏙️ {lang === "ar" ? "مدن" : "Cities"}</span>
            </div>
          </div>
        </div>

        <div className="showcase-grid">
          {/* Left Side - City Details */}
          <SaudiCitiesDetails 
            city={currentCity} 
            lang={lang} 
          />

          {/* Right Side - Interactive Visualization */}
          <div className="visual-section">
            <SaudiCitiesMap 
              cities={SaudiCitiesData}
              selectedCity={selectedCity}
              onCitySelect={handleCitySelect}
              lang={lang}
            />

            {/* Featured City Visual */}
            <div className="featured-city">
              <div className="city-visual-card">
                <img 
                  src={currentCity.image} 
                  alt={currentCity.name[lang]}
                  className="city-visual-image"
                  loading="lazy"
                />
                <div className={`city-gradient ${currentCity.gradient}`}></div>
                <div className="city-visual-content">
                  <div className="visual-badge">
                    <span>{currentCity.season[lang]}</span>
                  </div>
                  <h3 className="visual-title">{currentCity.name[lang]}</h3>
                  <p className="visual-description">{currentCity.description[lang]}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cities Navigation Carousel */}
        <SaudiCitiesSlider 
          cities={SaudiCitiesData}
          selectedCity={selectedCity}
          onCitySelect={handleCitySelect}
          scrollContainerRef={scrollContainerRef}
          onScrollLeft={scrollLeft}
          onScrollRight={scrollRight}
          lang={lang}
        />
      </div>
    </section>
  );
}

// Separate client-only video component
function VideoBackground() {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const handleCanPlay = () => {
        setIsVideoLoaded(true);
        video.play().catch(error => {
          console.log("Video autoplay failed:", error);
        });
      };

      video.addEventListener('canplay', handleCanPlay);

      return () => {
        video.removeEventListener('canplay', handleCanPlay);
      };
    }
  }, []);

  return (
    <div className="video-background">
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="background-video"
      >
        <source src="/bg2.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="video-overlay"></div>
      {!isVideoLoaded && (
        <div className="video-loading">
          <div className="loading-spinner-large"></div>
          <span className="loading-text">Loading video...</span>
        </div>
      )}
    </div>
  );
}