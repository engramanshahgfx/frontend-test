// app/[lang]/international/internet-packages/page.jsx
import InternetPackagesForm from "@/components/international/InternetPackagesForm";
import HeaderBanners from "@/components/HeaderBanners";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const validLang = ['ar', 'en', 'zh'].includes(lang) ? lang : 'en';
  
  const metadata = {
    en: {
      title: "Internet Packages | Tilal Rimal",
      description: "Get the best international internet packages for your travels. Stay connected anywhere in the world with our reliable services.",
      keywords: "internet packages, international data, mobile data, roaming",
    },
    ar: {
      title: "حزم الإنترنت | التلال والرمال",
      description: "احصل على أفضل حزم الإنترنت الدولية لرحلاتك. ابقَ متصلاً في أي مكان في العالم من خلال خدماتنا الموثوقة.",
      keywords: "حزم الإنترنت, البيانات الدولية, بيانات الهاتف المحمول, التجول",
    },
    zh: {
      title: "互联网套餐 | Tilal Rimal",
      description: "获得最佳国际互联网套餐来完成您的旅行。通过我们可靠的服务在世界任何地方保持连接。",
      keywords: "互联网套餐, 国际数据, 移动数据, 漫游",
    }
  };
  
  return {
    ...metadata[validLang],
    alternates: {
      canonical: `/${validLang}/international/internet-packages`,
      languages: {
        'ar': '/ar/international/internet-packages',
        'en': '/en/international/internet-packages',
        'zh': '/zh/international/internet-packages'
      }
    }
  };
}

export default async function InternetPackagesPage({ params }) {
  const { lang } = await params;
  const validLang = ['ar', 'en', 'zh'].includes(lang) ? lang : 'en';
  
  return (
    <main 
      className="min-h-screen"
      style={{ 
        backgroundColor: "#FAF6F0",
        paddingTop: "150px",
        direction: validLang === 'ar' ? 'rtl' : 'ltr'
      }}
    >
      <HeaderBanners lang={validLang} page="internet-packages" index={0} />
      <InternetPackagesForm lang={validLang} />
    </main>
  );
}