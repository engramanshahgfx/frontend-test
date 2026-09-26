import React from "react";
import { FaMapMarkerAlt } from "react-icons/fa";

export default function SaudiCitiesMap({ cities, selectedCity, onCitySelect, lang }) {
  return (
    <div className="map-container">
      <div className="saudi-map-card">
        <div className="map-header">
          <h3>{lang === "ar" ? "خريطة المملكة" : "Kingdom Map"}</h3>
          <span className="map-subtitle">{lang === "ar" ? "انقر على المدن لاكتشافها" : "Click cities to explore"}</span>
        </div>
        
        <div className="map-visual">
          <img 
            src="/saudi-map.png" 
            alt="Saudi Arabia Map" 
            className="map-image"
            loading="lazy"
          />
          
          {/* Interactive City Markers */}
          {cities.map((city, index) => (
            <button
              key={city.id}
              className={`city-marker ${selectedCity === index ? 'active' : ''}`}
              style={city.mapPosition}
              onClick={() => onCitySelect(index)}
              aria-label={`Select ${city.name[lang]}`}
            >
              <div className="marker-core">
                <FaMapMarkerAlt className="marker-icon" />
              </div>
              <div className="marker-pulse"></div>
              <div className="marker-tooltip">
                <span className="tooltip-name">{city.name[lang]}</span>
                <span className="tooltip-temp">{city.temperature}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}