import React from "react";
import { FaTemperatureHigh } from "react-icons/fa";

export default function SaudiCitiesDetails({ city, lang }) {
  const IconComponent = city.icon;

  return (
    <div className="city-details">
      <div className="city-header">
        <div className="city-meta">
          <div className="season-badge">
            <span>{city.season[lang]}</span>
          </div>
          <div className="temperature-display">
            <FaTemperatureHigh className="temp-icon" />
            <span className="temp-value">{city.temperature}</span>
          </div>
        </div>
        
        <div className="city-title-section">
          <span className="city-description">{city.description[lang]}</span>
          <h2 className="city-name">{city.name[lang]}</h2>
        </div>
      </div>
      
      <div className="highlights-section">
        <div className="highlights-header">
          <IconComponent className="section-icon" />
          <h3>{lang === "ar" ? "أبرز المعالم" : "Key Highlights"}</h3>
        </div>
        <div className="highlights-grid">
          {city.highlights.map((highlight, index) => (
            <div key={index} className="highlight-item">
              <div className="highlight-dot"></div>
              <span className="highlight-text">{highlight[lang]}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="city-info-section">
        <p className="city-info">
          {lang === "ar" 
            ? "استعد لاكتشاف مدينة استثنائية تجمع بين الأصالة والحداثة. استمتع بتجارب فريدة تتنوع بين المغامرات الصحراوية والجولات الثقافية والاسترخاء في أحضان الطبيعة."
            : "Prepare to discover an extraordinary city that blends authenticity with modernity. Enjoy unique experiences ranging from desert adventures and cultural tours to relaxation amidst nature."
          }
        </p>
        
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-number">50+</span>
            <span className="stat-label">{lang === "ar" ? "جولة" : "Tours"}</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">24/7</span>
            <span className="stat-label">{lang === "ar" ? "دعم" : "Support"}</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">100%</span>
            <span className="stat-label">{lang === "ar" ? "تقييمات" : "Ratings"}</span>
          </div>
        </div>
      </div>

      <div className="action-section">
        <button className="btn btn-primary">
          <span>{lang === "ar" ? "اكتشف الرحلات" : "Discover Tours"}</span>
          <div className="btn-glow"></div>
        </button>
        <button className="btn btn-secondary">
          {lang === "ar" ? "خطط رحلتك" : "Plan Your Trip"}
        </button>
      </div>
    </div>
  );
}