"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import styles from "./evisa.module.css";

export default function Evisa({ lang, basePath = "/visas", countries = [] }) {
  const locale = lang || "ar";
  const [search, setSearch] = useState("");
  
  // Helper function to get translated field
  const getTranslatedField = (country, fieldName) => {
    const field = country[`${fieldName}_${locale}`];
    return field || country[`${fieldName}_en`] || country[fieldName] || "";
  };
  
  const filteredCountries = useMemo(
    () => countries.filter((country) => {
      const countryName = getTranslatedField(country, 'name');
      return countryName?.toLowerCase().includes(search.toLowerCase());
    }),
    [countries, search, locale],
  );

  const hasCountries = Array.isArray(countries) && countries.length > 0;

  return (
    <main className={styles.page}>
      <div className={styles.pageTopBar} />
      <div className={styles.pageContent}>
        <div className={styles.steps}>
          <div className={`${styles.step} ${styles.active}`}>
            <span className={styles.stepNumber}>1</span>
            <span>Select Country</span>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>2</span>
            <span>Visa Requirements</span>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>3</span>
            <span>Persons Data</span>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>4</span>
            <span>Payment</span>
          </div>
        </div>

        <section className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <h1 className={styles.sectionTitle}>Select Country</h1>
            <p className={styles.sectionSubtitle}>Search and choose your destination to view visa requirements on the next page.</p>
          </div>

          <div className={styles.searchRow}>
            <input
              className={styles.searchInput}
              placeholder="Search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className={styles.countryGrid}>
            {hasCountries ? (
              filteredCountries.map((country) => {
                const displayName = getTranslatedField(country, 'name');
                const visaType = getTranslatedField(country, 'visa_type');

                return (
                  <Link
                    key={country.slug}
                    href={`/${locale}${basePath}/${encodeURIComponent(country.slug)}`}
                    className={styles.countryCard}
                  >
                    <div className={styles.countryFlag}>
                      {country.flag_path ? (
                        <img 
                          src={country.flag_path} 
                          alt={`${displayName} flag`}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = country.flag_emoji || '🏳️';
                          }}
                        />
                      ) : (
                        <span style={{ fontSize: '40px' }}>{country.flag_emoji || '🏳️'}</span>
                      )}
                    </div>
                    <div className={styles.countryName}>{displayName}</div>
                    <div className={styles.countryLabel}>{visaType || "Visa Service"}</div>
                  </Link>
                );
              })
            ) : (
              <div className={styles.emptyState}>
                <h2>No visa countries available yet</h2>
                <p>Check back soon or contact us for help with your application.</p>
              </div>
            )}
          </div>
        </section>

        <p className={styles.footerNote}>Click a country to continue to the visa requirements page.</p>
      </div>
    </main>
  );
}