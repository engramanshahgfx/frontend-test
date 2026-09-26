// app/[lang]/layout.jsx
import "@/styles/globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import { ToastContainer } from "react-toastify";
import ContextProvider from "@/providers/ContextProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import UIProvider from "@/providers/UIProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackToTopButton from "@/components/BackToTopButton";
import WhatsAppButton from "@/components/WhatsAppButton";
import ChatAssistant from "@/components/ChatAssistant";
import AuthModal from "@/components/AuthModal";
import BookingModal from "@/components/BookingModal";
import ReservationModal from "@/components/ReservationModal";

export async function generateStaticParams() {
  return [{ lang: "en" }, { lang: "ar" }, { lang: "zh" }];
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const { lang } = resolvedParams;

  const metas = {
    ar: {
      title: "التلال والرمال - تنظيم الرحلات السياحية",
      description:
        "نقدم رحلات سياحية فريدة تجمع بين المتعة والمغامرة والقيمة المفيدة في ربوع المملكة العربية السعودية. رحلات العوائل، المدارس، الشركات والمجموعات الخاصة.",
    },
    en: {
      title: "Tilal Rimal - Tourism Trips Organization",
      description:
        "We offer unique tourism trips that combine fun, adventure, and meaningful value throughout Saudi Arabia. Family trips, school trips, corporate trips, and private groups.",
    },
  };

  const baseUrl = "";
  const canonicalUrl = `${baseUrl}/${lang}`;
  const meta = metas[lang] || metas.en;

  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: `${baseUrl}/en`,
        ar: `${baseUrl}/ar`,
        zh: `${baseUrl}/zh`,
      },
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      type: "website",
      url: canonicalUrl,
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
    },
  };
}

export default async function RootLayout({ children, params }) {
  const resolvedParams = await params;
  const { lang } = resolvedParams;

  return (
    <html
      lang={lang}
      dir={lang === "ar" ? "rtl" : "ltr"}
      data-scroll-behavior="smooth"
    >
      <head>
        {/* Google Fonts - Inter & IBM Plex Sans Arabic CDN */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=Tajawal:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        {/* Font Awesome 6 - Only ONE CDN link */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
          integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
        {/* Bootstrap CSS */}
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
          rel="stylesheet"
          integrity="sha384-9ndCyUaIbzAi2FUVXJi0CjmCapSmO7SnpJef0486qhLnuZ2cdeRhO02iuK6FUUVM"
          crossOrigin="anonymous"
        />
        <script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/js/bootstrap.bundle.min.js"
          defer
        ></script>
      </head>
      <body
        suppressHydrationWarning
        style={{ fontFamily: lang === "ar" ? "'IBM Plex Sans Arabic', sans-serif" : "'Inter', sans-serif" }}
      >
        <AuthProvider>
          <UIProvider>
            <ContextProvider>
              <Navbar lang={lang} />
              <ToastContainer position="top-center" autoClose={3000} />
              <main
                className="d-flex flex-column flex-grow-1 bg-white"
                style={{ minHeight: "100vh" }}
              >
                {children}
              </main>
              <BackToTopButton />
              <WhatsAppButton lang={lang} />
              {/* <ChatAssistant lang={lang} /> */}
              <Footer lang={lang} />
            </ContextProvider>
            <AuthModal />
            <BookingModal />
            <ReservationModal />
          </UIProvider>
        </AuthProvider>
        <div id="modal-root"></div>
      </body>
    </html>
  );
}