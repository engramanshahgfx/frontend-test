import PrivateJetRequestForm from "@/components/international/PrivateJetRequestForm";
import HeaderBanners from "@/components/HeaderBanners";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const validLang = ['ar', 'en', 'zh'].includes(lang) ? lang : 'en';
  
  const metadata = {
    en: {
      title: "Private Jet Charter | Tilal Rimal",
      description: "Charter a private jet for your business, vacation, or special needs. Experience luxury travel with our comprehensive private aviation services.",
      keywords: "private jet, jet charter, luxury travel, aviation services",
    },
    ar: {
      title: "استئجار طائرة خاصة | التلال والرمال",
      description: "استأجر طائرة خاصة لعملك أو إجازتك أو احتياجاتك الخاصة. استمتع بالسفر الفاخر من خلال خدمات الطيران الشاملة لدينا.",
      keywords: "طائرة خاصة, استئجار طائرة, سفر فاخر, خدمات الطيران",
    },
    zh: {
      title: "私人飞机包机 | Tilal Rimal",
      description: "为您的业务、假期或特殊需求包租私人飞机。通过我们综合的私人航空服务体验奢侈旅行。",
      keywords: "私人飞机, 飞机包机, 奢侈旅行, 航空服务",
    }
  };
  
  return {
    ...metadata[validLang],
    alternates: {
      canonical: `/${validLang}/international/private-jet`,
      languages: {
        'ar': '/ar/international/private-jet',
        'en': '/en/international/private-jet',
        'zh': '/zh/international/private-jet'
      }
    }
  };
}

export default async function PrivateJetPage({ params }) {
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
      <HeaderBanners lang={validLang} page="private-jet" index={3} />
      <PrivateJetRequestForm lang={validLang} />
    </main>
  );
}