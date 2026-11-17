import { useEffect, useMemo, useState } from 'react'
import {
  Repeat,
  Globe,
  ChevronDown,
  Menu,
  CircleUserRound,
  UtensilsCrossed,
  Heart,
} from 'lucide-react'
import SearchBar from './components/SearchBar'
import Filters from './components/Filters'
import RestaurantCard from './components/RestaurantCard'
import Pagination from './components/Pagination'
import CurrencyModal from './components/CurrencyModal'
import LocationModal from './components/LocationModal'
import { MOCK_RESTAURANTS } from './data/restaurants'
import { fetchRates, FALLBACK_RATES } from './services/currency'
import { fetchRestaurants } from './services/places'
import { formatNumber, longDate, todayISO } from './utils/format'
import { fetchPhotos, photoFor, photosFor } from './services/photos'
import ConfirmarReserva from './pages/ConfirmarReserva'
import ReservationList from './components/ReservationList'
import RestaurantDetail from './pages/RestaurantDetail'
import { loadReservations, createReservation, cancelReservation } from './services/reservations'

const PAGE_SIZE = 6
const LIMITS = { min: 45000, max: 157500 }
const NAV_LINKS = ['Descubrir', 'Mis reservas', 'Guardados']
const STORAGE_KEY = 'mesa:guardados'


const DEFAULT_FILTERS = {
  minPrice: LIMITS.min,
  maxPrice: LIMITS.max,
  cuisine: 'all',
  minRating: 0,
}

const SORTERS = {
  recommended: () => 0,
  priceAsc: (a, b) => a.priceCOP - b.priceCOP,
  priceDesc: (a, b) => b.priceCOP - a.priceCOP,
  rating: (a, b) => b.rating - a.rating,
}

function loadSaved() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? []
  } catch {
    return []
  }
}

export default function App() {
  const [currency, setCurrency] = useState('COP')
  const [rates, setRates] = useState(FALLBACK_RATES)
  const [location, setLocation] = useState({
    city: 'Bogotá',
    label: 'toda Bogotá',
    country: 'Colombia',
    lat: 4.711,
    lon: -74.0721,
  })
  const [restaurants, setRestaurants] = useState(MOCK_RESTAURANTS)
  const [source, setSource] = useState('demo')
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')
  const [search, setSearch] = useState({ date: todayISO(), time: '19:30', guests: 2 })
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [sort, setSort] = useState('recommended')
  const [page, setPage] = useState(1)
  const [saved, setSaved] = useState(loadSaved) 
  const [activeLink, setActiveLink] = useState('Descubrir')
  const [showCurrency, setShowCurrency] = useState(false)
  const [showLocation, setShowLocation] = useState(false)
  const [booking, setBooking] = useState(null) // { restaurant, time }
  const [selected, setSelected] = useState(null) // restaurante abierto en el detalle
  const [reservations, setReservations] = useState(loadReservations)
  const [photos, setPhotos] = useState([])

  
useEffect(() => {
  fetchRates()
    .then(setRates)
    .catch(() => setRates(FALLBACK_RATES))
}, [])

useEffect(() => {
  fetchPhotos()
    .then(setPhotos)
    .catch((err) => console.error('Error fotos:', err))
}, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved))
    } catch {
      
    }
  }, [saved])

  async function handleLocation(place) {
    setShowLocation(false)
    setLoading(true)
    setApiError('')
    setLocation({
      city: place.name,
      label: place.name,
      country: '',
      lat: place.lat,
      lon: place.lon,
    })
    setFilters(DEFAULT_FILTERS)
    setPage(1)

    try {
      const list = await fetchRestaurants(place.lat, place.lon)
      if (list.length) {
        setRestaurants(list)
        setSource('osm')
      } else {
        setRestaurants(MOCK_RESTAURANTS)
        setSource('demo')
        setApiError('No encontramos restaurantes registrados en esa zona. Mostrando datos de ejemplo.')
      }
    } catch (err) {
      console.error('Error cargando restaurantes:', err)
      setRestaurants(MOCK_RESTAURANTS)
      setSource('demo')
      setApiError('No se pudo cargar la información. Mostrando datos de ejemplo.')
    } finally {
      setLoading(false)
    }
  }

  const cuisines = useMemo(
    () => [...new Set(restaurants.map((r) => r.cuisine))].sort(),
    [restaurants],
  )
  const filtered = useMemo(() => {
    const list = restaurants.filter(
      (r) =>
        r.priceCOP >= filters.minPrice &&
        r.priceCOP <= filters.maxPrice &&
        r.rating >= filters.minRating &&
        (filters.cuisine === 'all' || r.cuisine === filters.cuisine),
    )
    return [...list].sort(SORTERS[sort])
  }, [restaurants, filters, sort])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const savedIds = useMemo(() => new Set(saved.map((r) => r.id)), [saved])

  function toggleSaved(restaurant) {
    setSaved((prev) =>
      prev.some((r) => r.id === restaurant.id)
        ? prev.filter((r) => r.id !== restaurant.id)
        : [...prev, restaurant],
    )
  }

  function updateFilters(updater) {
    setFilters(updater)
    setPage(1)
  }

    function handleBook(restaurant, time, bookingSearch) {
  setBooking({ restaurant, time, search: bookingSearch })
  window.scrollTo({ top: 0 })
}

async function handleConfirm(data) {
  const reservation = await createReservation(data)
  setReservations((prev) => [reservation, ...prev])
  return reservation
}

async function handleCancel(id) {
  setReservations(await cancelReservation(id))
}

const view = booking ? 'Reserva' : selected ? 'Detalle' : activeLink

  function renderCard(r) {
    return (
      <RestaurantCard
        key={r.id}
        r={r}
        currency={currency}
        rates={rates}
        isSaved={savedIds.has(r.id)}
        onToggleSave={toggleSaved}
        onBook={handleBook}
        onOpen={(restaurant) => setSelected(restaurant)}
        photo={photoFor(photos, r.id)}
      />
    )
  }

  return (
    <>
      <header className="header">
        <div className="header__inner">
          <a className="logo" href="/">
            <span className="logo__icon">
              <UtensilsCrossed size={20} />
            </span>
            <span className="logo__text">mesa</span>
          </a>

          <nav className="nav">
            {NAV_LINKS.map((link) => (
              <a
                key={link}
                href="#"
                className={`nav__link ${link === (booking ? 'Mis reservas' : activeLink) ? 'is-active' : ''}`}
                onClick={(e) => {
                e.preventDefault()
                setBooking(null)
                setSelected(null)
                setActiveLink(link)
              }}
              >
                {link}
                {link === 'Guardados' && saved.length > 0 && (
                  <span className="nav__badge">{saved.length}</span>
                )}
              </a>
            ))}
          </nav>

          <div className="header__right">
            <button className="currency-btn" onClick={() => setShowCurrency(true)}>
              <Globe size={18} />
              <strong>{currency}</strong>
              <ChevronDown size={16} />
            </button>
            <button className="user-pill" aria-label="Menú de usuario">
              <Menu size={18} />
              <CircleUserRound size={26} />
            </button>
          </div>
        </div>
      </header>

      <main className="container">
        {view === 'Descubrir' && (
          <>
            <SearchBar
              search={search}
              setSearch={setSearch}
              locationText={`${location.city}${location.country ? ', ' + location.country : ''}`}
              onOpenLocation={() => setShowLocation(true)}
            />

            <h1 className="title">Tu próxima mesa está en {location.city}</h1>

            <div className="subrow">
              <p className="subtitle">
                {filtered.length} restaurantes · {longDate(search.date)} · {search.time} ·{' '}
                {search.guests} {search.guests === 1 ? 'persona' : 'personas'}
              </p>
              <label className="sort">
                Ordenar por:
                <select value={sort} onChange={(e) => setSort(e.target.value)}>
                  <option value="recommended">Recomendados</option>
                  <option value="priceAsc">Precio: menor a mayor</option>
                  <option value="priceDesc">Precio: mayor a menor</option>
                  <option value="rating">Mejor calificados</option>
                </select>
              </label>
            </div>

            <Filters
              filters={filters}
              setFilters={updateFilters}
              limits={LIMITS}
              cuisines={cuisines}
              currency={currency}
              rates={rates}
              locationLabel={location.label}
              onOpenLocation={() => setShowLocation(true)}
              onClear={() => updateFilters(DEFAULT_FILTERS)}
            />

            <div className="notice">
              Gasto estimado por persona. Reservar no genera ningún cobro automático.
            </div>

            {apiError && <p className="hint hint--error">{apiError}</p>}

            {currency !== 'COP' && (
              <button className="rate-strip" onClick={() => setShowCurrency(true)}>
                <Repeat size={14} />
                Precios en {currency} · {rates.live ? 'Tasa de referencia' : 'Ejemplo ilustrativo'}: 1{' '}
                {currency} = {formatNumber(Math.round(1 / rates[currency]))} COP · Cambiar moneda
              </button>
            )}

            {loading ? (
              <p className="empty">Buscando restaurantes cerca de {location.city}...</p>
            ) : pageItems.length === 0 ? (
              <p className="empty">No hay restaurantes con esos filtros. Prueba limpiándolos.</p>
            ) : (
              <section className="grid">{pageItems.map(renderCard)}</section>
            )}

            <Pagination
              page={currentPage}
              totalPages={totalPages}
              shown={pageItems.length}
              total={filtered.length}
              onChange={setPage}
            />
          </>
        )}

        {view === 'Guardados' && (
          <section className="saved">
            <h1 className="title">Tus restaurantes guardados</h1>

            <div className="subrow">
              <p className="subtitle">
                {saved.length} {saved.length === 1 ? 'restaurante' : 'restaurantes'}
              </p>
              {saved.length > 0 && (
                <button className="link-btn" onClick={() => setSaved([])}>
                  Quitar todos
                </button>
              )}
            </div>

            {saved.length === 0 ? (
              <div className="saved-empty">
                <Heart size={36} />
                <h2>Aún no has guardado restaurantes</h2>
                <p>Toca el corazón de cualquier tarjeta y aparecerá aquí.</p>
                <button
                  className="btn-primary saved-empty__btn"
                  onClick={() => setActiveLink('Descubrir')}
                >
                  Descubrir restaurantes
                </button>
              </div>
            ) : (
              <div className="grid">{saved.map(renderCard)}</div>
            )}
          </section>
        )}

        {view === 'Mis reservas' && (
  <ReservationList
    reservations={reservations}
    onCancel={handleCancel}
    photos={photos}
    onDiscover={() => setActiveLink('Descubrir')}
  />
)}

{view === 'Detalle' && (
  <RestaurantDetail
    key={selected.id}
    restaurant={selected}
    city={location.city}
    currency={currency}
    rates={rates}
    search={search}
    isSaved={savedIds.has(selected.id)}
    onToggleSave={toggleSaved}
    onBack={() => setSelected(null)}
    onReserve={handleBook}
    photo={photoFor(photos, selected.id)}
    gallery={photosFor(photos, selected.id, 8)}
  />
)}

{view === 'Reserva' && (
  <ConfirmarReserva
    restaurant={booking.restaurant}
    time={booking.time}
    search={booking.search ?? search}
    location={location}
    currency={currency}
    rates={rates}
    onBack={() => setBooking(null)}
    onConfirm={handleConfirm}
    photo={photoFor(photos, booking.restaurant.id)}
    onViewReservations={() => {
      setBooking(null)
      setSelected(null)
      setActiveLink('Mis reservas')
    }}
  />
)}

      </main>

      <footer className="footer">
        <div className="footer__inner">
          <div className="footer__links">
            <span>© 2026 mesa</span>
            <a href="#">Privacidad</a>
            <a href="#">Términos</a>
            <a href="#">Centro de ayuda</a>
          </div>
          <span>
            Español (CO) · Hecho para compartir la mesa ·{' '}
            <a href="https://www.exchangerate-api.com" target="_blank" rel="noreferrer">
              Tasas de ExchangeRate-API
            </a>{' '}
            ·{' '}
            <a href="https://pixabay.com" target="_blank" rel="noreferrer">
            Fotos de Pixabay
            </a>
          </span>
        </div>
      </footer>

      {showCurrency && (
        <CurrencyModal
          currency={currency}
          setCurrency={setCurrency}
          rates={rates}
          onClose={() => setShowCurrency(false)}
        />
      )}

      {showLocation && (
        <LocationModal
          current={location}
          onConfirm={handleLocation}
          onClose={() => setShowLocation(false)}
        />
      )}
    </>
  )
}