const KEY = import.meta.env.VITE_PIXABAY_KEY
const CACHE_KEY = 'mesa:fotos'
const ENDPOINT =
  'https://pixabay.com/api/?image_type=photo&orientation=horizontal' +
  '&q=restaurant+interior&min_width=800&safesearch=true&per_page=80'

let pending = null

function readCache() {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY)) ?? []
  } catch {
    return []
  }
}

export function fetchPhotos() {
  if (!KEY) return Promise.resolve([])
  const cached = readCache()
  if (cached.length) return Promise.resolve(cached)

  if (!pending) {
    pending = fetch(`${ENDPOINT}&key=${KEY}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Pixabay respondió ${res.status}`)
        return res.json()
      })
      .then((data) => {
        const photos = data.hits.map((p) => ({
          id: p.id,
          src: p.webformatURL,
          alt: 'Restaurante',
          photographer: p.user,
          url: p.pageURL,
        }))
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(photos))
        } catch {
        }
        return photos
      })
      .finally(() => {
        pending = null
      })
  }
  return pending
}

export function photoFor(photos, id) {
  if (!photos.length) return null
  const s = String(id)
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return photos[h % photos.length]
}

export function photosFor(photos, id, count = 8) {
  if (!photos.length) return []
  const s = String(id)
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  const start = h % photos.length
  const n = Math.min(count, photos.length)
  return Array.from({ length: n }, (_, i) => photos[(start + i) % photos.length])
}