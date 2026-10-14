/* ==========================================================
   BŪR FEST ¡El Parche! — Contenido editable
   Todo lo que la organización necesita cambiar vive aquí:
   fechas, ediciones, marcas/hamburguesas, boletas, horarios,
   aliados y preguntas frecuentes.
   (En la fase 2 esto se maneja desde un panel de administración.)
   ========================================================== */

window.BURFEST = {
  config: {
    // Apertura del próximo evento (hora Bogotá) → alimenta la cuenta regresiva
    nextEventDate: "2026-11-20T12:00:00-05:00",
    nextEventId: "bog-2026",
    instagram: "https://www.instagram.com/burfest.col/",
    instagramHandle: "@burfest.col",
    whatsapp: "", // ej: "573001234567"
    email: "hola@burfest.co",
    // Si se define, la preinscripción se envía por POST a esta URL
    // (Google Apps Script → Google Sheets, Formspree, Supabase, etc.)
    formEndpoint: "",
    demo: true, // muestra la cinta "propuesta · contenido de ejemplo"
  },

  events: [
    {
      id: "bog-2026",
      city: "Bogotá",
      name: "BŪR FEST Bogotá",
      dates: "20, 21 y 22 de noviembre",
      days: ["Viernes 20 Nov", "Sábado 21 Nov", "Domingo 22 Nov"],
      venue: "Lugar por confirmar",
      status: "proximo",
      tagline: "Llega el parche a la capital: 16 de las mejores hamburgueserías, música en vivo y tú decides quién gana.",
    },
    {
      id: "med-2026",
      city: "Medellín",
      name: "BŪR FEST Medellín",
      dates: "16, 17 y 18 de octubre",
      days: ["Viernes 16 Oct", "Sábado 17 Oct", "Domingo 18 Oct"],
      venue: "Universidad EAFIT",
      status: "realizado",
      tagline: "La edición en EAFIT. ¡Gracias por el parche, Medellín!",
    },
  ],

  schedule: [
    { day: "Viernes", hours: "12:00 m. — 10:00 p.m.", note: "Apertura + DJ set" },
    { day: "Sábado", hours: "11:00 a.m. — 10:00 p.m.", note: "Bandas en vivo" },
    { day: "Domingo", hours: "11:00 a.m. — 8:00 p.m.", note: "Premiación 6:00 p.m." },
  ],

  // palette: bun, patty, cheese, veg, sauce → colores de la ilustración
  burgers: [
    {
      id: "b1", event: "bog-2026",
      name: "La Smash Rola", restaurant: "Hamburguesería #1",
      zone: "Chapinero", price: 28000, tags: ["res", "smash"],
      description: "Doble carne smash, cheddar americano, cebolla caramelizada en cerveza artesanal y salsa de la casa en pan brioche.",
      palette: { bun: "#F4B54A", patty: "#6B3A22", cheese: "#FFDC4E", veg: "#7BC46A", sauce: "#EC8DB8" },
    },
    {
      id: "b2", event: "bog-2026",
      name: "Ajiaco Burger", restaurant: "Hamburguesería #2",
      zone: "Usaquén", price: 30000, tags: ["pollo", "colombiana"],
      description: "Pollo apanado, crema de guascas, papa criolla crocante, alcaparras y aguacate. Bogotá en una hamburguesa.",
      palette: { bun: "#F0A946", patty: "#E2A04B", cheese: "#FFF1B8", veg: "#5DAA4E", sauce: "#FFFFFF" },
    },
    {
      id: "b3", event: "bog-2026",
      name: "Fuego Paisa", restaurant: "Hamburguesería #3",
      zone: "Zona T", price: 32000, tags: ["res", "picante", "colombiana"],
      description: "Carne angus, chicharrón crocante, hogao picante, maduro caramelizado y queso costeño a la plancha.",
      palette: { bun: "#E99A3C", patty: "#5A2B18", cheese: "#FFF4D6", veg: "#F2B33D", sauce: "#E94E3C" },
    },
    {
      id: "b4", event: "bog-2026",
      name: "Verde Que Te Quiero", restaurant: "Hamburguesería #4",
      zone: "La Macarena", price: 27000, tags: ["veggie"],
      description: "Medallón de garbanzo y remolacha, queso de cabra, rúgula, pesto de cilantro y pan de masa madre.",
      palette: { bun: "#D9A55A", patty: "#A23B55", cheese: "#FFFFFF", veg: "#7BC46A", sauce: "#9BD36A" },
    },
    {
      id: "b5", event: "bog-2026",
      name: "La Triple B", restaurant: "Hamburguesería #5",
      zone: "Parque 93", price: 35000, tags: ["res", "bbq"],
      description: "Triple carne, triple tocineta, triple cheddar y BBQ de panela ahumada. No apta para indecisos.",
      palette: { bun: "#E39A3F", patty: "#4E2615", cheese: "#FFB23E", veg: "#D86C4A", sauce: "#7A3418" },
    },
    {
      id: "b6", event: "bog-2026",
      name: "Diabla Coreana", restaurant: "Hamburguesería #6",
      zone: "Teusaquillo", price: 29000, tags: ["pollo", "picante"],
      description: "Pollo frito estilo coreano glaseado en gochujang, kimchi, mayo de ajonjolí y pepinillos.",
      palette: { bun: "#F4B54A", patty: "#D2652E", cheese: "#FFDC4E", veg: "#E94E3C", sauce: "#B8231A" },
    },
    {
      id: "b7", event: "bog-2026",
      name: "Trufa Negra", restaurant: "Hamburguesería #7",
      zone: "Rosales", price: 38000, tags: ["res", "gourmet"],
      description: "Carne madurada, queso brie fundido, champiñones salteados, alioli de trufa y pan negro de carbón.",
      palette: { bun: "#3A3330", patty: "#6B3A22", cheese: "#FFF4D6", veg: "#9C7A52", sauce: "#F3E7CF" },
    },
    {
      id: "b8", event: "bog-2026",
      name: "Costeña Bacana", restaurant: "Hamburguesería #8",
      zone: "Modelia", price: 27000, tags: ["res", "colombiana"],
      description: "Carne a la parrilla, suero costeño, queso de capa, patacón crocante y ají dulce.",
      palette: { bun: "#F6C064", patty: "#6B3A22", cheese: "#FFFFFF", veg: "#F2C94C", sauce: "#FFF7E6" },
    },
  ],

  // price: 0 → registro gratuito (genera boleta con QR sin pago)
  tickets: [
    {
      id: "registro", name: "Ingreso General", price: 0, featured: true,
      perks: ["Ingreso gratuito con registro", "Boleta digital con QR", "Voto oficial por tu hamburguesa favorita", "Participas en sorteos del festival"],
      cta: "Registrarme gratis",
    },
    {
      id: "fastpass", name: "Fast Pass Parche", price: 25000,
      perks: ["Ingreso por fila rápida", "1 bebida incluida", "Mesa reservada 1 hora", "Sticker pack oficial"],
      cta: "Comprar",
    },
    {
      id: "combo", name: "Combo Degustación", price: 69000,
      perks: ["Fila rápida", "3 mini burgers de marcas participantes", "2 bebidas incluidas", "Kit oficial BŪR FEST"],
      cta: "Comprar",
    },
  ],

  giveaway: {
    title: "Esta boleta no se compra, se gana",
    steps: [
      "Sigue a @burfest.col en Instagram",
      "Comenta el post del sorteo etiquetando a tu parche",
      "Regístrate en la web con el mismo usuario de Instagram",
    ],
  },

  sponsors: ["Tu marca aquí", "Cervecería aliada", "Bebidas", "Banco aliado", "App de domicilios", "Medio aliado"],

  categories: [
    "Clásica de res", "Smash", "Pollo", "Vegetariana / vegana", "Colombiana de autor", "Gourmet", "Picante",
  ],

  faq: [
    ["¿El ingreso tiene costo?", "No. El ingreso es gratuito con registro previo: te registras aquí, recibes tu boleta con QR y la muestras en la entrada. Las hamburguesas se pagan en cada stand."],
    ["¿Qué incluyen el Fast Pass y el Combo?", "Son opcionales: te saltas la fila y, en el combo, ya tienes mini burgers y bebidas incluidas."],
    ["¿Cómo se elige la mejor hamburguesa?", "Combinamos el voto del público (desde la web, con tu boleta) y un jurado de chefs y creadores de contenido gastronómico."],
    ["¿Puedo ir con mascotas o niños?", "¡Claro! Es un plan para todo el parche. Menores de edad siempre acompañados de un adulto."],
    ["¿Cómo participo con mi hamburguesería?", "Llena la preinscripción en esta página. El equipo de BŪR FEST te contactará con las condiciones, el costo del stand y los requisitos."],
  ],
};
