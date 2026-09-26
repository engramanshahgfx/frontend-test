import React from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

export default function SaudiCitiesSlider({ 
  cities, 
  selectedCity, 
  onCitySelect, 
  scrollContainerRef, 
  onScrollLeft, 
  onScrollRight, 
  lang 
}) {
  return (
    <div className="cities-carousel-section">
      <div className="carousel-header">
        <h3 className="carousel-title">
          {lang === "ar" ? "استكشف جميع المدن" : "Explore All Cities"}
        </h3>
        <div className="carousel-controls">
          <span className="carousel-counter">
            {selectedCity + 1} / {cities.length}
          </span>
          <div className="control-buttons">
            <button className="control-btn prev-btn" onClick={onScrollLeft}>
              <FaChevronLeft />
            </button>
            <button className="control-btn next-btn" onClick={onScrollRight}>
              <FaChevronRight />
            </button>
          </div>
        </div>
      </div>
      
      <div className="cities-carousel" ref={scrollContainerRef}>
        {cities.map((city, index) => {
          const CityIcon = city.icon;
          return (
            <div
              key={city.id}
              className={`city-card ${selectedCity === index ? 'active' : ''}`}
              onClick={() => onCitySelect(index)}
            >
              <div className="card-image-container">
                <img src={city.image} alt={city.name[lang]} loading="lazy" />
                <div className={`card-gradient ${city.gradient}`}></div>
                <div className="card-badge">
                  <CityIcon className="card-icon" />
                </div>
                <div className="card-temperature">
                  {city.temperature}
                </div>
              </div>
              <div className="card-content">
                <h4 className="card-title">{city.name[lang]}</h4>
                <p className="card-description">{city.description[lang]}</p>
                <div className="card-highlights">
                  {city.highlights.slice(0, 2).map((highlight, idx) => (
                    <span key={idx} className="card-highlight">
                      {highlight[lang]}
                    </span>
                  ))}
                </div>
              </div>
              <div className="active-indicator"></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}