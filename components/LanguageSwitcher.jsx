"use client";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import styles from "./LanguageSwitcher.module.css";

const LANGUAGES = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "ar", name: "العربية", nativeName: "العربية" },
];

export default function LanguageSwitcher({ lang, className = "", displayText = null, showFlagOnly = false }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const switchLanguage = (newLang) => {
    // Normalize pathname: remove any leading language segments (en/ar)
    const supported = ['en', 'ar'];
    let path = pathname || '';

    // Remove leading /lang segments repeatedly if present
    while (path.match(new RegExp(`^/(${supported.join('|')})(?=/|$)`))) {
      path = path.replace(new RegExp(`^/(${supported.join('|')})(?=/|$)`), '');
    }

    // Ensure path starts with slash if not empty
    if (path && !path.startsWith('/')) path = '/' + path;

    // Build the new path with the desired language
    const newPath = path === '' ? `/${newLang}` : `/${newLang}${path}`;

    router.push(newPath, { scroll: false });
    setIsOpen(false);
  };

  const currentLang = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];
  const otherLanguages = LANGUAGES.filter((l) => l.code !== lang);

  // If showFlagOnly is true, show simple EN/AR text buttons
  if (showFlagOnly) {
    return (
      <div className={`${styles.languageSwitcher} ${className}`}>
        <button
          onClick={() => switchLanguage('en')}
          className={`${styles.textButton} ${lang === 'en' ? styles.activeText : ''}`}
          aria-label="Switch to English"
        >
          EN
        </button>
        <span className={styles.textDivider}>|</span>
        <button
          onClick={() => switchLanguage('ar')}
          className={`${styles.textButton} ${lang === 'ar' ? styles.activeText : ''}`}
          aria-label="Switch to Arabic"
        >
          AR
        </button>
      </div>
    );
  }

  // Original dropdown version
  return (
    <div className={`${styles.languageSwitcher} ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={styles.switcherButton}
        aria-label={`Switch language. Current: ${currentLang.name}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className={styles.languageName}>{displayText || currentLang.nativeName}</span>
        <svg
          className={`${styles.chevron} ${isOpen ? styles.open : ""}`}
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className={styles.backdrop}
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div className={styles.dropdown} role="menu">
            {otherLanguages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => switchLanguage(lang.code)}
                className={styles.dropdownItem}
                role="menuitem"
                aria-label={`Switch to ${lang.name}`}
              >
                <span className={styles.langCode}>{lang.code.toUpperCase()}</span>
                <span className={styles.langName}>{lang.name}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}