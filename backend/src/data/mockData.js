export const mockProducts = [
  {
    id: "prod-1",
    sku: "GDC-2024-001",
    name: "دهن العود الملكي",
    nameEn: "Royal Oud Essence",
    brand: "بيور فيل المعتق",
    brandEn: "PUREVEIL Vintage",
    category: "العطور الشرقية",
    categoryEn: "Oriental Perfumes",
    price: 1250,
    oldPrice: 1500,
    rating: 4.9,
    reviewsCount: 128,
    stock: 12,
    status: "active",
    image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=800",
    description: "تركيبة عطرية حصرية تمزج أنقى قطرات العود المعتق مع نفحات العنبر الأسود والتوابل الملكية. عطر يجسد الفخامة المطلقة والأناقة النادرة.",
    descriptionEn: "An exclusive olfactory composition blending the purest vintage oud with black amber and royal spices.",
    concentration: "Extrait de Parfum",
    volumeOptions: [
      { size: "50ml", price: 850 },
      { size: "100ml", price: 1250 },
      { size: "250ml", price: 2400 }
    ],
    notes: {
      top: ["الهيل الجبلي", "الزعفران المهروس", "البرغموت الإيطالي"],
      heart: ["الورد الجوري المعتق", "البخور الملكي", "الياسمين الأسود"],
      base: ["العود الهندي المعتّق", "العنبر الكهرماني", "المسك الخالص"]
    },
    specs: {
      sillage: "قوي جداً (Heavy)",
      longevity: "أكثر من 24 ساعة",
      season: "الخريف / الشتاء",
      gender: "للجنسين (Unisex)"
    },
    featured: true,
    isNew: false
  },
  {
    id: "prod-2",
    sku: "GDC-2024-002",
    name: "عود الذهب الملكي",
    nameEn: "Royal Gold Oud",
    brand: "عساف",
    brandEn: "Assaf",
    category: "البخور والعود",
    categoryEn: "Oud & Incense",
    price: 1450,
    oldPrice: 1650,
    rating: 4.95,
    reviewsCount: 174,
    stock: 10,
    status: "active",
    image: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=800",
    description: "إكسير ذو تركيز عالٍ من رقائق العود الكمبودي الفاخر الممتزجة مع قطرات من المسك الأبيض النادر والعنبر الذائب.",
    descriptionEn: "A highly concentrated elixir of rich Cambodian oud chips with rare white musk.",
    concentration: "Extrait de Parfum",
    volumeOptions: [
      { size: "50ml", price: 950 },
      { size: "100ml", price: 1450 }
    ],
    notes: {
      top: ["البرغموت", "الفلفل الأسود"],
      heart: ["خشب العود الكمبودي", "اللافندر"],
      base: ["المسك الأبيض", "العنبر الذائب"]
    },
    specs: {
      sillage: "أسطوري",
      longevity: "24+ ساعة",
      season: "الشتاء / المناسبات",
      gender: "للجنسين"
    },
    featured: true,
    isNew: true
  },
  {
    id: "prod-3",
    sku: "BLU-2024-003",
    name: "بلو دو شانيل بارفان",
    nameEn: "Bleu De Chanel Parfum",
    brand: "شانيل",
    brandEn: "Chanel",
    category: "الماركات العالمية",
    categoryEn: "Global Luxury Brands",
    price: 890,
    oldPrice: 980,
    rating: 4.8,
    reviewsCount: 94,
    stock: 24,
    status: "active",
    image: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&q=80&w=800",
    description: "عطر خشبي أروماي يجسد روح الاستقلالية والحرية الفائقة بتوقيع ملكي يدوم طوال اليوم.",
    descriptionEn: "A woody aromatic fragrance embodying independence and sheer sophistication.",
    concentration: "Parfum",
    volumeOptions: [
      { size: "50ml", price: 620 },
      { size: "100ml", price: 890 }
    ],
    notes: {
      top: ["قشور الليمون", "النعناع البارد", "الفلفل الوردي"],
      heart: ["الزنجبيل", "جوزة الطيب", "الياسمين"],
      base: ["خشب الصندل الكاليدوني", "الأرز", "العنبر"]
    },
    specs: {
      sillage: "متوسط إلى قوي",
      longevity: "12-16 ساعة",
      season: "جميع الفصول",
      gender: "رجالي"
    },
    featured: true,
    isNew: false
  },
  {
    id: "prod-4",
    sku: "SAV-2024-004",
    name: "ساواج إكسير",
    nameEn: "Sauvage Elixir",
    brand: "ديور",
    brandEn: "Dior",
    category: "الماركات العالمية",
    categoryEn: "Global Luxury Brands",
    price: 1100,
    oldPrice: 1200,
    rating: 4.95,
    reviewsCount: 210,
    stock: 8,
    status: "active",
    image: "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&q=80&w=800",
    description: "جرعة مكثفة للغاية من العطر الأيقوني، مشبعة بتوابل جامحة ومستخلص اللافندر المخصص وخلاصة الأخشاب الغنية.",
    descriptionEn: "An extraordinarily concentrated fragrance steeped in wild spices, lavender, and rich woods.",
    concentration: "Elixir",
    volumeOptions: [
      { size: "60ml", price: 1100 }
    ],
    notes: {
      top: ["القرفة", "جوزة الطيب", "الهيل"],
      heart: ["لافندر نايت فيرن"],
      base: ["العنبر الداكن", "خشب الصندل", "الباتشولي"]
    },
    specs: {
      sillage: "هائل",
      longevity: "أكثر من 18 ساعة",
      season: "الشتاء / السهرات",
      gender: "رجالي"
    },
    featured: true,
    isNew: true
  },
  {
    id: "prod-5",
    sku: "OUD-2024-005",
    name: "عود وود توم فورد",
    nameEn: "Oud Wood Private Blend",
    brand: "توم فورد",
    brandEn: "Tom Ford",
    category: "المجموعات الحصرية",
    categoryEn: "Private Blends",
    price: 1450,
    oldPrice: 1600,
    rating: 4.9,
    reviewsCount: 156,
    stock: 5,
    status: "active",
    image: "https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&q=80&w=800",
    description: "أحد أكثر المكونات ندرة وفخامة وثمناً في عالم العطور. خشب العود النادر يمتزج مع الهيل والورد البرازيلي وخشب الصندل.",
    descriptionEn: "One of the most rare, precious, and expensive ingredients in a perfumer's arsenal.",
    concentration: "Eau de Parfum",
    volumeOptions: [
      { size: "50ml", price: 1100 },
      { size: "100ml", price: 1450 }
    ],
    notes: {
      top: ["الهيل الغواتيمالي", "الفلفل الصيني", "الروزوود"],
      heart: ["خشب العود النادر", "خشب الصندل", "نجيل الهند"],
      base: ["التونكا", "الفيوليت", "العنبر Gold"]
    },
    specs: {
      sillage: "أنيق ومغناطيسي",
      longevity: "14-18 ساعة",
      season: "الخريف / الشتاء",
      gender: "للجنسين"
    },
    featured: true,
    isNew: false
  },
  {
    id: "prod-6",
    sku: "BAC-2024-006",
    name: "باكارات روج 540",
    nameEn: "Baccarat Rouge 540 Extrait",
    brand: "ميسون فرانسيس كوركديجان",
    brandEn: "Maison Francis Kurkdjian",
    category: "عطور النيش",
    categoryEn: "Niche Perfumes",
    price: 1850,
    oldPrice: 2000,
    rating: 5.0,
    reviewsCount: 340,
    stock: 3,
    status: "active",
    image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=800",
    description: "عطر ممتد الشذى يضع همسة زهرية خشبية على البشرة. كيمياء حقيقية من الشعور بالشاعرية والدفء.",
    descriptionEn: "A poetic alchemy where the aerial notes of jasmine and radiance of saffron carry mineral facets.",
    concentration: "Extrait de Parfum",
    volumeOptions: [
      { size: "70ml", price: 1850 },
      { size: "200ml", price: 3400 }
    ],
    notes: {
      top: ["الزعفران الأرجواني", "الياسمين المصري"],
      heart: ["العنبر الحجري", "خشب اللوز المر"],
      base: ["أخشاب الأرز الشامخ", "المسك الكريستالي"]
    },
    specs: {
      sillage: "أسطوري",
      longevity: "24+ ساعة",
      season: "جميع الفصول",
      gender: "للجنسين"
    },
    featured: true,
    isNew: true
  },
  {
    id: "prod-7",
    sku: "LAV-2024-007",
    name: "ياقوت الشرق لافيرن",
    nameEn: "Laverne Oriental Ruby",
    brand: "لافيرن",
    brandEn: "Laverne",
    category: "العطور العربية",
    categoryEn: "Arabic Perfumes",
    price: 1200,
    oldPrice: 1350,
    rating: 4.88,
    reviewsCount: 112,
    stock: 18,
    status: "active",
    image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=800",
    description: "عطر ملكي حالم مستوحى من فخامة الأحجار الكريمة، تتناغم فيه نفحات التوت العطري مع أريج الورد البلغاري وجوهر العنبر.",
    descriptionEn: "A majestic fragrance inspired by precious gemstones, harmonizing wild berry notes with Bulgarian rose.",
    concentration: "Eau de Parfum",
    volumeOptions: [
      { size: "100ml", price: 1200 }
    ],
    notes: {
      top: ["التوت العطري", "البرغموت"],
      heart: ["الورد البلغاري", "السوسن"],
      base: ["العنبر الكريستالي", "المسك"]
    },
    specs: {
      sillage: "فواح وساحر",
      longevity: "16+ ساعة",
      season: "جميع الفصول",
      gender: "نسائي / للجنسين"
    },
    featured: false,
    isNew: true
  },
  {
    id: "prod-8",
    sku: "DKH-2024-008",
    name: "بخور ملكي دخون الإمارات",
    nameEn: "Dokhoon Royal Incense",
    brand: "دخون الإمارات",
    brandEn: "Dokhoon Emirates",
    category: "البخور والعود",
    categoryEn: "Oud & Incense",
    price: 650,
    oldPrice: 750,
    rating: 4.92,
    reviewsCount: 89,
    stock: 22,
    status: "active",
    image: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=800",
    description: "أصالة البخور الإماراتي الفاخر المصنوع من أضخم دقات العود الكمبودي المشبع بزيوت الصندل والورد والمسك.",
    descriptionEn: "Authentic Emirati luxury bakhoor blended with sandalwood, rose, and musk oils.",
    concentration: "Pure Bakhoor & Oil",
    volumeOptions: [
      { size: "100g", price: 650 }
    ],
    notes: {
      top: ["الورد الطائفي"],
      heart: ["دقة العود الكمبودي"],
      base: ["المسك الأسود", "دهن الصندل"]
    },
    specs: {
      sillage: "ثابت وفواح جداً",
      longevity: "24+ ساعة في المكان",
      season: "جميع الفصول",
      gender: "للجنسين"
    },
    featured: false,
    isNew: false
  }
];

export const mockCategories = [
  { id: "cat-1", name: "العطور العربية", nameEn: "Arabic Perfumes", count: 24, image: "https://images.unsplash.com/photo-1594035910387-fea47794261f" },
  { id: "cat-2", name: "الماركات العالمية", nameEn: "Global Luxury Brands", count: 32, image: "https://images.unsplash.com/photo-1523293182086-7651a899d37f" },
  { id: "cat-3", name: "البخور والعود", nameEn: "Oud & Incense", count: 16, image: "https://images.unsplash.com/photo-1547887537-6158d64c35b3" },
  { id: "cat-4", name: "المجموعات الحصرية", nameEn: "Private Blends", count: 18, image: "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75" }
];

export const mockBrands = [
  { id: "b-1", name: "بيور فيل المعتق", nameEn: "PUREVEIL Vintage", origin: "باريس - الرياض", logo: "/logo.png" },
  { id: "b-2", name: "عساف", nameEn: "Assaf", origin: "المملكة العربية السعودية" },
  { id: "b-3", name: "لافيرن", nameEn: "Laverne", origin: "المملكة العربية السعودية" },
  { id: "b-4", name: "دخون الإمارات", nameEn: "Dokhoon Emirates", origin: "الإمارات العربية المتحدة" },
  { id: "b-5", name: "الماجد للعود", nameEn: "Almajed4Oud", origin: "المملكة العربية السعودية" },
  { id: "b-6", name: "شانيل", nameEn: "Chanel", origin: "باريس، فرنسا" },
  { id: "b-7", name: "ديور", nameEn: "Dior", origin: "باريس، فرنسا" },
  { id: "b-8", name: "توم فورد", nameEn: "Tom Ford", origin: "نيويورك، أمريكا" },
  { id: "b-9", name: "ميسون فرانسيس كوركديجان", nameEn: "Maison Francis Kurkdjian", origin: "باريس، فرنسا" },
  { id: "b-10", name: "بارفام دي مارلي", nameEn: "Parfums de Marly", origin: "فرنسا" }
];

export const mockCart = [
  {
    productId: "prod-1",
    product: mockProducts[0],
    size: "100ml",
    unitPrice: 1250,
    quantity: 1
  }
];

export const mockOrders = [
  {
    id: "ORD-98421",
    date: "2026-08-01",
    customer: { name: "أحمد منصور", email: "ahmed@example.com", phone: "+966500000000" },
    items: [
      { productId: "prod-1", name: "دهن العود الملكي", size: "100ml", price: 1250, qty: 1 }
    ],
    subtotal: 1250,
    shippingFee: 0,
    total: 1250,
    status: "processing",
    paymentMethod: "Apple Pay"
  }
];
