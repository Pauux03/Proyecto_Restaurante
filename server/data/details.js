// Información extendida de cada restaurante: menú, opiniones, dirección, horarios...
// Los restaurantes de OpenStreetMap solo traen nombre, zona y tipo de cocina,
// así que el resto se arma aquí a partir del id (siempre da lo mismo para el mismo id).

function seeded(seed) {
  let a = seed
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const pick = (rand, list) => list[Math.floor(rand() * list.length)]
const between = (rand, min, max) => Math.floor(min + rand() * (max - min + 1))

function shuffle(rand, list) {
  const copy = [...list]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

const MENUS = {
  italiana: {
    headline: 'Pasta fresca y recetas de la nonna',
    description:
      'Pasta amasada a mano todos los días, salsas que se cocinan despacio y una carta de vinos pensada para compartir. Un rincón italiano sin afán.',
    Entradas: [['Burrata con tomates confitados', 28000], ['Carpaccio de res con rúgula', 32000], ['Focaccia de romero', 16000]],
    'Platos fuertes': [['Pappardelle al ragú de cordero', 52000], ['Ravioli de ricotta y espinaca', 46000], ['Risotto de hongos', 49000]],
    Postres: [['Tiramisú de la casa', 19000], ['Panna cotta de frutos rojos', 17000]],
  },
  parrilla: {
    headline: 'El fuego manda en esta cocina',
    description:
      'Cortes madurados a la brasa, vegetales asados y una bodega con etiquetas de Sudamérica. Ideal para una comida larga entre amigos.',
    Entradas: [['Provoleta a la parrilla', 26000], ['Chorizo artesanal con chimichurri', 22000], ['Empanadas de carne', 18000]],
    'Platos fuertes': [['Bife de chorizo 400 g', 78000], ['Punta de anca madurada', 69000], ['Pesca del día a la brasa', 54000]],
    Postres: [['Panqueque de dulce de leche', 18000], ['Flan casero', 15000]],
  },
  mariscos: {
    headline: 'Del mar a la mesa, sin escalas',
    description:
      'Pescados y mariscos frescos que llegan cada mañana, preparados de forma sencilla para que el producto sea el protagonista.',
    Entradas: [['Ceviche de corvina', 32000], ['Pulpo a la plancha', 38000], ['Patacones con hogao de camarón', 24000]],
    'Platos fuertes': [['Cazuela de mariscos', 62000], ['Pargo frito con arroz de coco', 58000], ['Langostinos al ajillo', 64000]],
    Postres: [['Cocada caliente', 16000], ['Mousse de maracuyá', 17000]],
  },
  japonesa: {
    headline: 'Precisión, temporada y buen arroz',
    description:
      'Barra de sushi frente al cocinero, pescado de calidad y platos calientes de la cocina casera japonesa.',
    Entradas: [['Edamame con sal de mar', 14000], ['Gyozas de cerdo', 24000], ['Tataki de atún', 36000]],
    'Platos fuertes': [['Omakase de 10 piezas', 89000], ['Ramen tonkotsu', 42000], ['Roll de salmón y aguacate', 38000]],
    Postres: [['Mochi de té verde', 16000], ['Cheesecake de yuzu', 19000]],
  },
  vegetal: {
    headline: 'La huerta en el centro del plato',
    description:
      'Cocina basada en vegetales de temporada, fermentos hechos en casa y productos de pequeños agricultores de la sabana.',
    Entradas: [['Remolachas asadas con kéfir', 22000], ['Hummus de ahuyama', 18000], ['Tostada de hongos silvestres', 24000]],
    'Platos fuertes': [['Coliflor rostizada con tahini', 42000], ['Ñoquis de papa criolla', 44000], ['Bowl de granos andinos', 38000]],
    Postres: [['Helado de coco y panela', 16000], ['Brownie de cacao 70 %', 17000]],
  },
  colombiana: {
    headline: 'Sabores de casa con una mirada nueva',
    description:
      'Recetas de las regiones de Colombia contadas con técnica actual. Ingredientes locales, porciones generosas y un ambiente familiar.',
    Entradas: [['Empanaditas de pipián', 18000], ['Arepa de choclo con queso', 16000], ['Chicharrón con guacamole', 24000]],
    'Platos fuertes': [['Ajiaco santafereño', 38000], ['Posta negra cartagenera', 52000], ['Lechona al horno', 46000]],
    Postres: [['Postre de natas', 15000], ['Brevas con arequipe', 14000]],
  },
  mexicana: {
    headline: 'Tortillas hechas al momento',
    description:
      'Maíz nixtamalizado en casa, salsas que pican de verdad y mezcales para acompañar. Cocina mexicana sin atajos.',
    Entradas: [['Guacamole con totopos', 22000], ['Esquites', 16000], ['Tostada de atún', 28000]],
    'Platos fuertes': [['Tacos al pastor (4)', 34000], ['Mole poblano', 48000], ['Cochinita pibil', 44000]],
    Postres: [['Churros con cajeta', 16000], ['Tres leches', 15000]],
  },
  autor: {
    headline: 'Ingredientes locales, encuentros memorables',
    description:
      'Cocina de autor con productos de pequeños productores y el fuego como protagonista. Un espacio cálido para una cena tranquila, con una carta que cambia al ritmo de la temporada.',
    Entradas: [['Burrata con tomates de temporada', 28000], ['Tartar de res con yema curada', 34000], ['Pan de masa madre y mantequilla ahumada', 14000]],
    'Platos fuertes': [['Pesca del día a la brasa', 54000], ['Costilla de cerdo glaseada', 58000], ['Arroz cremoso de hongos', 46000]],
    Postres: [['Tarta tibia de cacao colombiano', 18000], ['Helado de queso campesino', 16000]],
  },
}

function menuKey(cuisine = '') {
  const c = cuisine.toLowerCase()
  if (c.includes('ital') || c.includes('pizz') || c.includes('medit')) return 'italiana'
  if (c.includes('parrilla') || c.includes('hamburg') || c.includes('american')) return 'parrilla'
  if (c.includes('marisc') || c.includes('peru')) return 'mariscos'
  if (c.includes('japon') || c.includes('sushi') || c.includes('china')) return 'japonesa'
  if (c.includes('vegetal') || c.includes('vegetar') || c.includes('sostenible')) return 'vegetal'
  if (c.includes('colomb') || c.includes('regional')) return 'colombiana'
  if (c.includes('mexic')) return 'mexicana'
  return 'autor'
}

const FEATURES = [
  { icon: 'leaf', label: 'Opciones vegetarianas' },
  { icon: 'sun', label: 'Terraza al aire libre' },
  { icon: 'accessibility', label: 'Acceso sin escalones' },
  { icon: 'wifi', label: 'Wi-Fi gratis' },
  { icon: 'dog', label: 'Pet friendly' },
  { icon: 'wine', label: 'Carta de vinos' },
  { icon: 'car', label: 'Parqueadero' },
]

const PHOTOS = ['Salón principal', 'Cocina de temporada', 'Terraza', 'Barra', 'Plato insignia', 'Postres', 'Bodega', 'Fachada']

const AUTHORS = ['Laura M.', 'Andrés P.', 'Camila R.', 'Santiago G.', 'Valentina H.', 'Felipe C.', 'Daniela O.', 'Mateo L.']

const REVIEWS = [
  'Todo estuvo delicioso y la atención fue muy amable. Volvería sin pensarlo.',
  'El ambiente es muy agradable para ir en pareja. Los postres son lo mejor.',
  'Buena relación calidad-precio. La reserva funcionó perfecto y no tuvimos que esperar.',
  'Fuimos a celebrar un cumpleaños y nos trataron súper bien. Recomendado.',
  'Los platos llegan rápido y bien presentados. El fuerte estaba en su punto.',
  'Un poco ruidoso a la hora pico, pero la comida lo compensa.',
  'Me encantó que tuvieran opciones para todos. Repetiría el plato de la casa.',
]

// Coordenadas aproximadas de las zonas de Bogotá que salen en los datos de ejemplo
const ZONES = {
  Chapinero: [4.6486, -74.0626],
  'Usaquén': [4.6951, -74.0306],
  'Zona G': [4.6532, -74.0565],
  'Zona T': [4.6668, -74.0532],
  'Parque 93': [4.6767, -74.0484],
  'La Candelaria': [4.5964, -74.0733],
  Teusaquillo: [4.6346, -74.0789],
  'Santa Bárbara': [4.6982, -74.0423],
  'Quinta Camacho': [4.6559, -74.0584],
  'La Macarena': [4.6121, -74.0658],
}

export function getRestaurantDetails(id, { cuisine, zone, city = 'Bogotá', lat, lon } = {}) {
  const rand = seeded(id)
  const menu = MENUS[menuKey(cuisine)]

  const sections = ['Entradas', 'Platos fuertes', 'Postres'].map((name) => ({
    name,
    items: menu[name].map(([dish, priceCOP]) => ({ name: dish, priceCOP })),
  }))

  // Para el vistazo: el primer plato de cada sección
  const highlights = [
    { type: 'Entrada', ...sections[0].items[0] },
    { type: 'Plato fuerte', ...sections[1].items[0] },
    { type: 'Postre', ...sections[2].items[0] },
  ]

  const base = ZONES[zone]
  const coords =
    lat && lon
      ? { lat: Number(lat), lon: Number(lon) }
      : {
          lat: (base?.[0] ?? 4.711) + (rand() - 0.5) * 0.006,
          lon: (base?.[1] ?? -74.0721) + (rand() - 0.5) * 0.006,
        }

  const street = pick(rand, ['Calle', 'Carrera'])
  const address = `${street} ${between(rand, 10, 120)} # ${between(rand, 3, 30)}-${between(rand, 10, 99)}`

  const reviews = shuffle(rand, REVIEWS)
    .slice(0, 4)
    .map((text, i) => ({
      author: AUTHORS[(id + i) % AUTHORS.length],
      rating: pick(rand, [5, 5, 5, 4]),
      date: `2026-${String(between(rand, 6, 10)).padStart(2, '0')}-${String(between(rand, 1, 28)).padStart(2, '0')}`,
      text,
    }))

  return {
    id,
    headline: menu.headline,
    description: menu.description,
    features: shuffle(rand, FEATURES).slice(0, 3),
    photos: PHOTOS,
    menu: sections,
    highlights,
    address: `${address} · ${zone || 'Centro'}, ${city}`,
    hours: 'Lun–sáb: 12:00–22:00 · Dom: 12:00–17:00',
    coords,
    reviews,
    freeCancellationHours: 2,
  }
}
