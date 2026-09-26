import { FaCompass, FaCity, FaWater, FaMountain, FaUmbrellaBeach, FaTree } from "react-icons/fa";

const SaudiCitiesData = [
  {
    id: 1,
    name: { en: "AlUla", ar: "العلا" },
    temperature: "26°C",
    season: { en: "Perfect Season", ar: "الموسم المثالي" },
    description: {
      en: "ANCIENT WONDERS & DESERT ADVENTURE",
      ar: "عجائب قديمة ومغامرات صحراوية"
    },
    image: "/cities/alula.jpg",
    mapPosition: { top: "20%", left: "22%" },
    highlights: [
      { en: "Hegra UNESCO Site", ar: "موقع الحجر UNESCO" },
      { en: "Maraya Concert Hall", ar: "قاعة مرايا" },
      { en: "Desert Oasis", ar: "واحة صحراوية" },
      { en: "Ancient Tombs", ar: "مقابر قديمة" }
    ],
    icon: FaCompass,
    gradient: "from-amber-500 to-orange-600"
  },
  {
    id: 2,
    name: { en: "Riyadh", ar: "الرياض" },
    temperature: "33°C",
    season: { en: "Year-round Destination", ar: "وجهة على مدار العام" },
    description: {
      en: "MODERN METROPOLIS & CULTURAL HUB",
      ar: "عاصمة عصرية ومركز ثقافي"
    },
    image: "/cities/riyadh.png",
    mapPosition: { top: "38%", left: "50%" },
    highlights: [
      { en: "Kingdom Centre", ar: "برج المملكة" },
      { en: "Historic Diriyah", ar: "الدرعية التاريخية" },
      { en: "Business District", ar: "المنطقة التجارية" },
      { en: "Cultural Events", ar: "الفعاليات الثقافية" }
    ],
    icon: FaCity,
    gradient: "from-blue-500 to-purple-600"
  },
  {
    id: 3,
    name: { en: "Jeddah", ar: "جدة" },
    temperature: "31°C",
    season: { en: "Coastal Paradise", ar: "جنة ساحلية" },
    description: {
      en: "RED SEA GEM & HISTORIC PORT",
      ar: "جوهرة البحر الأحمر وميناء تاريخي"
    },
    image: "/cities/jeddah.webp",
    mapPosition: { top: "52%", left: "40%" },
    highlights: [
      { en: "Al-Balad District", ar: "حي البلد" },
      { en: "Red Sea Beaches", ar: "شواطئ البحر الأحمر" },
      { en: "Coral Reefs", ar: "الشعاب المرجانية" },
      { en: "Shopping Destinations", ar: "وجهات التسوق" }
    ],
    icon: FaWater,
    gradient: "from-cyan-500 to-blue-600"
  },
  {
    id: 4,
    name: { en: "AlBahah", ar: "الباحة" },
    temperature: "19°C",
    season: { en: "Mountain Escape", ar: "ملاذ جبلي" },
    description: {
      en: "GREEN MOUNTAINS & COOL CLIMATE",
      ar: "جبال خضراء وطقس معتدل"
    },
    image: "/cities/bahah.png",
    mapPosition: { top: "62%", left: "46%" },
    highlights: [
      { en: "Al-Soudah Park", ar: "منتزه السودة" },
      { en: "Mountain Peaks", ar: "قمم جبلية" },
      { en: "Traditional Villages", ar: "قرى تقليدية" },
      { en: "Cable Car Rides", ar: "رحلات التلفريك" }
    ],
    icon: FaMountain,
    gradient: "from-green-500 to-emerald-600"
  },
  {
    id: 5,
    name: { en: "Dammam", ar: "الدمام" },
    temperature: "30°C",
    season: { en: "Gulf Coast Beauty", ar: "جمال ساحل الخليج" },
    description: {
      en: "ARABIAN GULF & MODERN DEVELOPMENT",
      ar: "الخليج العربي والتطور العمراني"
    },
    image: "/cities/dammam.png",
    mapPosition: { top: "42%", left: "63%" },
    highlights: [
      { en: "Half Moon Bay", ar: "شاطئ نصف القمر" },
      { en: "King Fahd Park", ar: "حديقة الملك فهد" },
      { en: "Corniche Area", ar: "الكورنيش" },
      { en: "Economic Zone", ar: "المنطقة الاقتصادية" }
    ],
    icon: FaUmbrellaBeach,
    gradient: "from-teal-500 to-cyan-600"
  },
  {
    id: 6,
    name: { en: "Taif", ar: "الطائف" },
    temperature: "23°C",
    season: { en: "Rose Season", ar: "موسم الورد" },
    description: {
      en: "MOUNTAIN RESORT & ROSE GARDENS",
      ar: "منتجع جبلي وحدائق الورد"
    },
    image: "/cities/taif.jpg",
    mapPosition: { top: "28%", left: "75%" },
    highlights: [
      { en: "Rose Festival", ar: "مهرجان الورد" },
      { en: "Al Hada Mountain", ar: "جبل الهدا" },
      { en: "Fruit Farms", ar: "مزارع الفواكه" },
      { en: "Cool Summer Climate", ar: "طقس صيفي معتدل" }
    ],
    icon: FaTree,
    gradient: "from-pink-500 to-rose-600"
  }
];

export default SaudiCitiesData;

