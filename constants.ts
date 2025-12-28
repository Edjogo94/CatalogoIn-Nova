export const WHATSAPP_PHONE = "573206064030";

export const RAW_PRODUCT_NAMES = [
  "HIDROLAVADORA",
  "SECADOR AGUACATE",
  "TOPE DE PUERTA",
  "CEPILLO SECADOR 5 EN 1",
  "SPRAY ACEITE MANIGUETA",
  "MESA PORTÁTIL",
  "BOLSO DEPORTIVO T60",
  "COMBO ASEO TOTAL: HIDROLAVADORA + ASPIRADORA",
  "RELOJ DE PARED 3D 80 CM X 100 CM",
  "COMBO TAPETE ULTRA ABSORBENTE",
  "DISPENSADOR DE JABÓN MULTIFUNCIONAL",
  "CÁMARA DE SEGURIDAD IK100",
  "ESTANTE ESQUINERO DE BAÑO",
  "TUBO MULTIFUNCIONAL 90 A 160 CM",
  "TUBO TENDEDERO PEQUEÑO 60 CM A 100 CM",
  "TUBO MULTIFUNCIONAL GRANDE 160 A 300 CM"
];

export const PRODUCT_DESCRIPTIONS: Record<string, string> = {
  "HIDROLAVADORA": "Potente limpieza a presión inalámbrica. Ideal para vehículos, fachadas y jardines. Incluye accesorios y maletín.",
  "SECADOR AGUACATE": "Secador profesional con microacondicionadores de aguacate y macadamia. Cabello más sano y brillante.",
  "TOPE DE PUERTA": "Evita golpes y daños en paredes. Diseño minimalista y alta resistencia para cualquier tipo de puerta.",
  "CEPILLO SECADOR 5 EN 1": "Seca, alisa, ondula y voluminiza en un solo paso. Tecnología iónica para reducir el frizz.",
  "SPRAY ACEITE MANIGUETA": "Dispensador de aceite tipo spray con manigueta ergonómica. Control total para una cocina saludable.",
  "MESA PORTÁTIL": "Mesa multifuncional para cama o sofá. Espacio para tablet, portavasos y gran estabilidad.",
  "BOLSO DEPORTIVO T60": "Bolso de alta resistencia, impermeable y con compartimento para zapatos. Ideal para gimnasio y viajes.",
  "COMBO ASEO TOTAL: HIDROLAVADORA + ASPIRADORA": "Kit completo de limpieza profunda para el hogar y el auto.",
  "RELOJ DE PARED 3D 80 CM X 100 CM": "Reloj gigante autoadhesivo para decoración moderna y elegante.",
  "COMBO TAPETE ULTRA ABSORBENTE": "Tapete de secado instantáneo para baño, antideslizante y elegante.",
  "DISPENSADOR DE JABÓN MULTIFUNCIONAL": "Optimiza el espacio en tu cocina. Dispensador de jabón con porta esponja integrado.",
  "CÁMARA DE SEGURIDAD IK100": "Vigilancia inteligente con visión nocturna y conexión WiFi. Protege lo que más quieres.",
  "ESTANTE ESQUINERO DE BAÑO": "Organización premium sin taladrar. Resistente al agua y de fácil instalación.",
  "TUBO MULTIFUNCIONAL 90 A 160 CM": "Barra ajustable de alta resistencia. Ideal para cortinas o clósets sin necesidad de tornillos.",
  "TUBO TENDEDERO PEQUEÑO 60 CM A 100 CM": "Solución compacta para secado de ropa en espacios reducidos. Ajuste a presión.",
  "TUBO MULTIFUNCIONAL GRANDE 160 A 300 CM": "Máxima extensión y soporte. Estructura reforzada para cortinas pesadas o divisiones de ambiente."
};

export const PRODUCT_PRICES: Record<string, number> = {
  "HIDROLAVADORA": 55000,
  "SECADOR AGUACATE": 25000,
  "TOPE DE PUERTA": 8500,
  "CEPILLO SECADOR 5 EN 1": 62500,
  "SPRAY ACEITE MANIGUETA": 13000,
  "MESA PORTÁTIL": 35000,
  "BOLSO DEPORTIVO T60": 40000,
  "COMBO ASEO TOTAL: HIDROLAVADORA + ASPIRADORA": 110000,
  "RELOJ DE PARED 3D 80 CM X 100 CM": 31500,
  "COMBO TAPETE ULTRA ABSORBENTE": 22000,
  "DISPENSADOR DE JABÓN MULTIFUNCIONAL": 12000,
  "CÁMARA DE SEGURIDAD IK100": 85000,
  "ESTANTE ESQUINERO DE BAÑO": 28000,
  "TUBO MULTIFUNCIONAL 90 A 160 CM": 24000,
  "TUBO TENDEDERO PEQUEÑO 60 CM A 100 CM": 18000,
  "TUBO MULTIFUNCIONAL GRANDE 160 A 300 CM": 42000
};

export const PRODUCT_RETAIL_PRICES: Record<string, number> = {
  "HIDROLAVADORA": 60000,
  "SECADOR AGUACATE": 29990,
  "TOPE DE PUERTA": 10000,
  "CEPILLO SECADOR 5 EN 1": 65000,
  "SPRAY ACEITE MANIGUETA": 18000,
  "MESA PORTÁTIL": 40000,
  "BOLSO DEPORTIVO T60": 45000,
  "COMBO ASEO TOTAL: HIDROLAVADORA + ASPIRADORA": 125000,
  "RELOJ DE PARED 3D 80 CM X 100 CM": 35000,
  "COMBO TAPETE ULTRA ABSORBENTE": 25000,
  "DISPENSADOR DE JABÓN MULTIFUNCIONAL": 15000,
  "CÁMARA DE SEGURIDAD IK100": 95000,
  "ESTANTE ESQUINERO DE BAÑO": 35000,
  "TUBO MULTIFUNCIONAL 90 A 160 CM": 30000,
  "TUBO TENDEDERO PEQUEÑO 60 CM A 100 CM": 22000,
  "TUBO MULTIFUNCIONAL GRANDE 160 A 300 CM": 50000
};

export const PRODUCT_STOCK: Record<string, number> = {
  "HIDROLAVADORA": 10,
  "SECADOR AGUACATE": 10,
  "TOPE DE PUERTA": 20,
  "CEPILLO SECADOR 5 EN 1": 15,
  "SPRAY ACEITE MANIGUETA": 12,
  "MESA PORTÁTIL": 10,
  "BOLSO DEPORTIVO T60": 10,
  "COMBO ASEO TOTAL: HIDROLAVADORA + ASPIRADORA": 5,
  "RELOJ DE PARED 3D 80 CM X 100 CM": 8,
  "COMBO TAPETE ULTRA ABSORBENTE": 15,
  "DISPENSADOR DE JABÓN MULTIFUNCIONAL": 20,
  "CÁMARA DE SEGURIDAD IK100": 6,
  "ESTANTE ESQUINERO DE BAÑO": 12,
  "TUBO MULTIFUNCIONAL 90 A 160 CM": 15,
  "TUBO TENDEDERO PEQUEÑO 60 CM A 100 CM": 15,
  "TUBO MULTIFUNCIONAL GRANDE 160 A 300 CM": 10
};

export const PRODUCT_ASSETS: Record<string, { image?: string; video?: string }> = {
  "HIDROLAVADORA": {
    image: "https://d2nagnwby8accc.cloudfront.net/companies/products/images/800/ce2d6631-097e-4fac-8707-0e40197b19e7.webp"
  },
  "SECADOR AGUACATE": {
    image: "https://d2nagnwby8accc.cloudfront.net/companies/products/images/800/b9f080c9-be7a-409e-9784-407b0b2d75d7.webp"
  },
  "TOPE DE PUERTA": {
    image: "https://d2nagnwby8accc.cloudfront.net/companies/products/images/800/999d73cc-8819-4897-94b4-95fcb2b263a6.webp"
  },
  "CEPILLO SECADOR 5 EN 1": {
    image: "https://d2nagnwby8accc.cloudfront.net/companies/products/images/800/12c79d58-2e43-4bfd-8399-565f85ac8411.webp"
  },
  "SPRAY ACEITE MANIGUETA": {
    image: "https://http2.mlstatic.com/D_NQ_NP_609804-MCO78602636750_082024-O.webp"
  },
  "MESA PORTÁTIL": {
    image: "https://http2.mlstatic.com/D_NQ_NP_890731-MCO71131975143_082023-O.webp"
  },
  "BOLSO DEPORTIVO T60": {
    image: "https://http2.mlstatic.com/D_NQ_NP_688468-MCO78248107931_082024-O.webp"
  },
  "COMBO ASEO TOTAL: HIDROLAVADORA + ASPIRADORA": {
    image: "https://smartjoys.co/wp-content/uploads/2025/11/COMBO-HidrolavadoraAspiradora-1.jpg"
  },
  "RELOJ DE PARED 3D 80 CM X 100 CM": {
    image: "https://d2nagnwby8accc.cloudfront.net/companies/products/images/800/2d500d91-f3cb-4edc-8973-1d26c616ee6d.webp"
  },
  "COMBO TAPETE ULTRA ABSORBENTE": {
    image: "https://d2nagnwby8accc.cloudfront.net/companies/products/images/800/103607b0-5960-4c69-8828-c79fc64e7caa.webp"
  },
  "DISPENSADOR DE JABÓN MULTIFUNCIONAL": {
    image: "https://http2.mlstatic.com/D_NQ_NP_727932-MCO75628464645_042024-O.webp"
  },
  "CÁMARA DE SEGURIDAD IK100": {
    image: "https://http2.mlstatic.com/D_NQ_NP_918525-MCO71221975013_082023-O.webp"
  },
  "ESTANTE ESQUINERO DE BAÑO": {
    image: "https://http2.mlstatic.com/D_NQ_NP_2X_632020-MLA94377174233_102025-F.webp"
  },
  "TUBO MULTIFUNCIONAL 90 A 160 CM": {
    image: "https://http2.mlstatic.com/D_NQ_NP_934145-MCO74853036495_032024-O.webp"
  },
  "TUBO TENDEDERO PEQUEÑO 60 CM A 100 CM": {
    image: "https://http2.mlstatic.com/D_NQ_NP_675312-MCO48123012941_112021-O.webp"
  },
  "TUBO MULTIFUNCIONAL GRANDE 160 A 300 CM": {
    image: "https://http2.mlstatic.com/D_NQ_NP_603415-MCO74783036415_022024-O.webp"
  }
};

export const PRODUCT_CUSTOM_CATEGORIES: Record<string, string> = {
  "HIDROLAVADORA": "Herramientas",
  "SECADOR AGUACATE": "Belleza y Cuidado",
  "CEPILLO SECADOR 5 EN 1": "Belleza y Cuidado",
  "TOPE DE PUERTA": "Hogar",
  "SPRAY ACEITE MANIGUETA": "Cocina",
  "MESA PORTÁTIL": "Hogar",
  "BOLSO DEPORTIVO T60": "Organización",
  "COMBO ASEO TOTAL: HIDROLAVADORA + ASPIRADORA": "Combos",
  "RELOJ DE PARED 3D 80 CM X 100 CM": "Hogar",
  "COMBO TAPETE ULTRA ABSORBENTE": "Combos",
  "DISPENSADOR DE JABÓN MULTIFUNCIONAL": "Cocina",
  "CÁMARA DE SEGURIDAD IK100": "Tecnología",
  "ESTANTE ESQUINERO DE BAÑO": "Organización",
  "TUBO MULTIFUNCIONAL 90 A 160 CM": "Organización",
  "TUBO TENDEDERO PEQUEÑO 60 CM A 100 CM": "Organización",
  "TUBO MULTIFUNCIONAL GRANDE 160 A 300 CM": "Organización"
};

export const CATEGORY_COLORS: Record<string, string> = {
  'Hogar': 'bg-blue-100 text-blue-700',
  'Belleza y Cuidado': 'bg-pink-100 text-pink-700',
  'Tecnología': 'bg-purple-100 text-purple-700',
  'Cocina': 'bg-orange-100 text-orange-700',
  'Organización': 'bg-emerald-100 text-emerald-700',
  'Herramientas': 'bg-slate-100 text-slate-700',
  'Combos': 'bg-amber-100 text-amber-700',
};