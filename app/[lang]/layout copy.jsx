import { Tajawal } from "next/font/google";
import "@/styles/globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "font-awesome/css/font-awesome.css";
import { ToastContainer } from "react-toastify";
import ContextProvider from "@/providers/ContextProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackToTopButton from "@/components/BackToTopButton";
import WhatsAppButton from "@/components/WhatsAppButton"; // Add this import

const tajawal = Tajawal({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["arabic", "latin"],
  variable: '--font-tajawal',
});

export async function generateStaticParams() {
  return [{ lang: "en" }, { lang: "ar" }];
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const { lang } = resolvedParams;

const metas = {
  en: {
    title: "Tilal Rimal - Discover Saudi Arabia's Natural Wonders",
    description:
      "Tilal Rimal offers unique travel experiences across Saudi Arabia. Discover desert adventures, mountain hiking, cultural tours, and coastal escapes with expert local guides. Book your unforgettable journey today.",
    keywords: "Saudi Arabia travel, desert safari, mountain hiking, cultural tours, Red Sea trips, adventure tourism, family trips, school trips, corporate trips",
  },
  ar: {
    title: "التلال والرمال - اكتشف عجائب الطبيعة في المملكة العربية السعودية",
    description:
      "التلال والرمال تقدم تجارب سفر فريدة عبر المملكة العربية السعودية. اكتشف مغامرات الصحراء، تسلق الجبال، الجولات الثقافية، والرحلات الساحلية مع مرشدين محليين خبراء. احجز رحلتك لا تنسى اليوم.",
    keywords: "سفر السعودية, سفاري صحراوي, تسلق جبال, جولات ثقافية, رحلات البحر الأحمر, سياحة المغامرة, رحلات عائلية, رحلات مدرسية, رحلات شركات",
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
      },
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      type: "website",
      url: canonicalUrl,
      //  images: [
      //    {
      //      url: image,
      //      width: 1200,
      //      height: 630,
      //    },
      //  ],
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
      //  images: [image],
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
      className={tajawal.className}
    >
      <head>
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/js/bootstrap.bundle.min.js"></script>
      </head>
      <body>
        <ContextProvider>
          <Navbar lang={lang} />
          <ToastContainer position="top-center" autoClose={3000} />
          <main
            className="d-flex flex-column flex-grow-1 bg-white"
            style={{ minHeight: "100vh", paddingTop: "15.6px" }}
          >
            {children}
          </main>
          <BackToTopButton />

                             <WhatsAppButton lang={lang} /> {/* Add this line */}

          <Footer lang={lang} />
        </ContextProvider>
      </body>
    </html>
  );
}
