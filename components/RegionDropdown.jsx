// components/RegionDropdown.jsx (or wherever your dropdown is)
"use client";
import { useState } from "react";
import { ChevronDown, Globe } from "lucide-react";

const regionLabels = {
  en: {
    europe: 'Europe',
    asia: 'Asia',
    africa: 'Africa',
    australia: 'Australia & New Zealand',
    america: 'America'
  },
  ar: {
    europe: 'أوروبا',      // ← Arabic translation
    asia: 'آسيا',          // ← Arabic translation
    africa: 'أفريقيا',     // ← Arabic translation
    australia: 'أستراليا ونيوزيلندا', // ← Arabic translation
    america: 'أمريكا'      // ← Arabic translation
  }
};

export default function RegionDropdown({ lang, selectedRegion, onSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const isRTL = lang === 'ar';
  const labels = regionLabels[lang] || regionLabels.en;

  const regions = [
    { key: 'europe', label: labels.europe },
    { key: 'asia', label: labels.asia },
    { key: 'africa', label: labels.africa },
    { key: 'australia', label: labels.australia },
    { key: 'america', label: labels.america }
  ];

  return (
    <div className="region-dropdown" style={{ position: 'relative', display: 'inline-block' }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 16px',
          background: '#fff',
          border: '1px solid #ddd',
          borderRadius: '8px',
          cursor: 'pointer'
        }}
      >
        <Globe size={18} />
        <span>{selectedRegion ? labels[selectedRegion] : (isRTL ? 'اختر منطقة' : 'Select Region')}</span>
        <ChevronDown size={16} />
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          background: '#fff',
          borderRadius: '8px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
          padding: '8px 0',
          zIndex: 1000,
          minWidth: '200px'
        }}>
          <div style={{ padding: '8px 20px', fontWeight: 'bold', borderBottom: '1px solid #eee' }}>
            {isRTL ? 'الوجهات الدولية' : 'International Destinations'}
          </div>
          {regions.map(region => (
            <div
              key={region.key}
              onClick={() => {
                onSelect(region.key);
                setIsOpen(false);
              }}
              style={{
                padding: '10px 20px',
                cursor: 'pointer',
                background: selectedRegion === region.key ? '#f8f0e0' : 'transparent',
                color: selectedRegion === region.key ? '#dfa528' : '#333',
                fontWeight: selectedRegion === region.key ? '600' : '400'
              }}
              onMouseEnter={(e) => {
                if (selectedRegion !== region.key) {
                  e.target.style.background = '#f5f5f5';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedRegion !== region.key) {
                  e.target.style.background = 'transparent';
                }
              }}
            >
              {region.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}