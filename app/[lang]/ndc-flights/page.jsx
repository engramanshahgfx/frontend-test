import About from "@/components/ndcflights/ndcflights";

export async function ndcflights({ params }) {
  const { lang } = await params;

  const metadata = {
    ar: {
      title: "من نحن - التلال والرمال",
      description: "اكتشف قصة التلال والرمال، رؤيتنا ورسالتنا في تنظيم رحلات سياحية استثنائية في المملكة العربية السعودية.",
    },
    en: {
      title: "About Us - Tilal Rimal",
      description: "Discover the story of Tilal Rimal, our vision and mission in organizing exceptional tourist trips in Saudi Arabia.",
    },
    zh: {
      title: "关于我们 - Tilal Rimal",
      description: "了解Tilal Rimal的故事、我们的愿景以及我们在沙特阿拉伯组织卓越旅游行程的使命。",
    },
  };

  const validLang = ["ar", "en", "zh"].includes(lang) ? lang : "en";

  return {
    title: metadata[validLang].title,
    description: metadata[validLang].description,
  };
}

export default async function NDCFlightsPage({ params }) {
  const { lang } = await params;
  const validLang = ["ar", "en", "zh"].includes(lang) ? lang : "en";

  return <About lang={validLang} />;
}