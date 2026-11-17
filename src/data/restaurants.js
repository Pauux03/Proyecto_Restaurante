import { mulberry32, between, pick } from '../utils/random'

const TAGS = [
  'Favorito de la comunidad',
  'Terraza',
  'De temporada',
  'Cocina abierta',
  'Opciones vegetarianas',
  'Pasta hecha en casa',
  'Reserva popular',
  'Ambiente tranquilo',
]

const SLOTS = ['18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30']

function makeSlots(rand) {
  const start = Math.floor(rand() * (SLOTS.length - 2))
  return SLOTS.slice(start, start + 3)
}

export function enrich(raw) {
  const rand = mulberry32(Number(raw.id))
  return {
    ...raw,
    tag: raw.tag ?? pick(rand, TAGS),
    rating: Number(between(rand, 4.7, 4.98).toFixed(2)),
    reviews: Math.floor(between(rand, 40, 200)),
    priceCOP: Math.round(between(rand, 45000, 157500) / 1000) * 1000,
    slots: makeSlots(rand),
  }
}

const BASE = [
  { id: 1, name: 'Oliva & Fuego', zone: 'Chapinero', cuisine: 'Cocina de autor', priceCOP: 90000, rating: 4.92, reviews: 128, tag: 'Favorito de la comunidad', slots: ['19:00', '19:30', '20:00'] },
  { id: 2, name: 'Casa del Patio', zone: 'Usaquén', cuisine: 'Colombiana contemporánea', priceCOP: 72000, rating: 4.87, reviews: 96, tag: 'Terraza', slots: ['19:30', '20:00', '20:30'] },
  { id: 3, name: 'Savia', zone: 'Chapinero', cuisine: 'Vegetal y de temporada', priceCOP: 108000, rating: 4.95, reviews: 84, tag: 'De temporada', slots: ['19:00', '19:30', '21:00'] },
  { id: 4, name: 'Brasa de Origen', zone: 'Zona G', cuisine: 'Parrilla y vinos', priceCOP: 135000, rating: 4.89, reviews: 157, tag: 'Cocina abierta', slots: ['18:30', '19:30', '20:30'] },
  { id: 5, name: 'La Huerta', zone: 'Usaquén', cuisine: 'Local y sostenible', priceCOP: 63000, rating: 4.83, reviews: 72, tag: 'Opciones vegetarianas', slots: ['19:00', '20:00', '20:30'] },
  { id: 6, name: 'Taller de Pasta', zone: 'Chapinero', cuisine: 'Italiana artesanal', priceCOP: 81000, rating: 4.91, reviews: 113, tag: 'Pasta hecha en casa', slots: ['19:00', '19:30', '20:00'] },
]

const EXTRAS = [
  ['Fogón 82', 'Zona G', 'Cocina colombiana'],
  ['Mar y Sal', 'Parque 93', 'Mariscos'],
  ['Trattoria Nonna', 'Chapinero', 'Italiana artesanal'],
  ['Cumbre', 'La Candelaria', 'Cocina de autor'],
  ['Raíz', 'Usaquén', 'Local y sostenible'],
  ['El Aljibe', 'Teusaquillo', 'Colombiana contemporánea'],
  ['Brasero 11', 'Zona T', 'Parrilla y vinos'],
  ['Hoja Verde', 'Chapinero', 'Vegetal y de temporada'],
  ['Sakura Norte', 'Santa Bárbara', 'Japonesa'],
  ['Pan y Vino', 'Quinta Camacho', 'Italiana artesanal'],
  ['Maíz Antiguo', 'La Macarena', 'Cocina colombiana'],
  ['Lumbre', 'Zona G', 'Parrilla y vinos'],
  ['Casa Taller', 'Usaquén', 'Cocina de autor'],
  ['Chontaduro', 'Chapinero', 'Local y sostenible'],
  ['Niebla', 'La Candelaria', 'Colombiana contemporánea'],
  ['Ají & Co', 'Parque 93', 'Mexicana'],
  ['Olivo Negro', 'Teusaquillo', 'Mediterránea'],
  ['Almendro', 'Zona T', 'Vegetal y de temporada'],
]

export const MOCK_RESTAURANTS = [
  ...BASE,
  ...EXTRAS.map(([name, zone, cuisine], i) =>
    enrich({ id: 1001 + i, name, zone, cuisine }),
  ),
]