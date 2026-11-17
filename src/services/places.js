import { enrich } from '../data/restaurants'

const NOMINATIM = 'https://nominatim.openstreetmap.org'

const OVERPASS_URLS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
]

export async function searchPlace(query) {
  const url = `${NOMINATIM}/search?format=json&limit=5&accept-language=es&q=${encodeURIComponent(query)}`
  const res = await fetch(url)
  if (!res.ok) throw new Error('No se pudo buscar el lugar')
  const data = await res.json()

  return data.map((p) => ({
    name: p.display_name.split(',')[0],
    fullName: p.display_name,
    lat: Number(p.lat),
    lon: Number(p.lon),
  }))
}

export async function reverseGeocode(lat, lon) {
  const url = `${NOMINATIM}/reverse?format=json&zoom=10&accept-language=es&lat=${lat}&lon=${lon}`
  const res = await fetch(url)
  if (!res.ok) throw new Error('No se pudo obtener el lugar')
  const data = await res.json()
  const a = data.address ?? {}

  return a.city || a.town || a.village || a.county || a.state || 'Ubicación elegida'
}

const CUISINES = {
  italian: 'Italiana',
  pizza: 'Pizzería',
  colombian: 'Colombiana',
  regional: 'Regional',
  burger: 'Hamburguesas',
  steak_house: 'Parrilla',
  seafood: 'Mariscos',
  japanese: 'Japonesa',
  sushi: 'Sushi',
  mexican: 'Mexicana',
  chinese: 'China',
  vegetarian: 'Vegetariana',
  french: 'Francesa',
  peruvian: 'Peruana',
  american: 'Americana',
  international: 'Internacional',
  coffee_shop: 'Cafetería',
}

function translateCuisine(raw) {
  if (!raw) return 'Cocina variada'
  const first = raw.split(';')[0].trim()
  return CUISINES[first] ?? 'Cocina variada'
}

function uniqueByName(list) {
  const seen = new Set()
  return list.filter((item) => {
    const key = item.name.toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

async function fetchFromNominatim(lat, lon, delta = 0.04) {
  const viewbox = [lon - delta, lat + delta, lon + delta, lat - delta].join(',')
  const url =
    `${NOMINATIM}/search?format=jsonv2&q=restaurant&limit=40` +
    `&addressdetails=1&extratags=1&dedupe=1&accept-language=es` +
    `&viewbox=${viewbox}&bounded=1`

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 15000)

  try {
    const res = await fetch(url, { signal: controller.signal })
    if (!res.ok) throw new Error(`Nominatim respondió ${res.status}`)
    const data = await res.json()

    const onlyRestaurants = data.filter((p) => p.type === 'restaurant')
    const items = onlyRestaurants.length ? onlyRestaurants : data

    return uniqueByName(
      items
        .filter((p) => p.name)
        .map((p) => ({
          id: p.osm_id,
          name: p.name,
          zone:
            p.address?.suburb ||
            p.address?.neighbourhood ||
            p.address?.road ||
            'Cerca de ti',
          cuisine: translateCuisine(p.extratags?.cuisine),
          lat: Number(p.lat),
          lon: Number(p.lon),
        })),
    ).map(enrich)
  } finally {
    clearTimeout(timer)
  }
}

async function queryOverpass(query) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 10000)

  try {
    return await Promise.any(
      OVERPASS_URLS.map(async (url) => {
        const res = await fetch(url, {
          method: 'POST',
          body: new URLSearchParams({ data: query }),
          signal: controller.signal,
        })
        if (!res.ok) throw new Error(`${url} respondió ${res.status}`)
        return res.json()
      }),
    )
  } finally {
    clearTimeout(timer)
    controller.abort()
  }
}

async function fetchFromOverpass(lat, lon, radius = 2500) {
  const query = `[out:json][timeout:15];nwr["amenity"="restaurant"]["name"](around:${radius},${lat},${lon});out center 40;`
  const json = await queryOverpass(query)

  return uniqueByName(
    json.elements.map((el) => ({
      id: el.id,
      name: el.tags.name,
      zone: el.tags['addr:suburb'] || el.tags['addr:street'] || 'Cerca de ti',
      cuisine: translateCuisine(el.tags.cuisine),
      lat: el.lat ?? el.center?.lat,
      lon: el.lon ?? el.center?.lon,
    })),
  ).map(enrich)
}

export async function fetchRestaurants(lat, lon) {
  try {
    const list = await fetchFromNominatim(lat, lon)
    if (list.length) return list
  } catch (err) {
    console.warn('Nominatim falló, probando Overpass:', err)
  }

  return fetchFromOverpass(lat, lon)
}