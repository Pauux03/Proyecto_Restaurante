import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import L from 'leaflet'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import {
  ArrowLeft,
  Star,
  Share,
  Heart,
  ImageIcon,
  LayoutGrid,
  Leaf,
  Sun,
  Accessibility,
  Wifi,
  Dog,
  Wine,
  Car,
  MapPin,
  X,
} from 'lucide-react'
import ReservationBox from './ReservationBox'
import { fetchDetails } from '../services/details'
import { convert } from '../services/currency'
import { formatMoney } from '../utils/format'
import './RestaurantDetail.css'

const PinIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

const FEATURE_ICONS = {
  leaf: Leaf,
  sun: Sun,
  accessibility: Accessibility,
  wifi: Wifi,
  dog: Dog,
  wine: Wine,
  car: Car,
}

const TABS = ['Información', 'Menú', 'Opiniones', 'Ubicación']

function Photo({ label, className = '', src }) {
  if (src) {
    return (
      <div className={`photo ${className}`}>
        <img className="photo__img" src={src} alt={label} />
      </div>
    )
  }
  return (
    <div className={`photo ${className}`}>
      <svg className="card__lines" viewBox="0 0 100 100" preserveAspectRatio="none">
        <line x1="0" y1="0" x2="100" y2="100" />
        <line x1="100" y1="0" x2="0" y2="100" />
      </svg>
      <div className="photo__label">
        <ImageIcon size={26} strokeWidth={1.4} />
        <span>{label}</span>
      </div>
    </div>
  )
}

function reviewDate(iso) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })
}

export default function RestaurantDetail({
  restaurant,
  city,
  currency,
  rates,
  search,
  initialSlot,
  isSaved,
  onToggleSave,
  onBack,
  onReserve,
  photo,
}) {
  const [details, setDetails] = useState(null)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [tab, setTab] = useState('Información')
  const [showGallery, setShowGallery] = useState(false)
  const [shareMsg, setShareMsg] = useState('')

  const loading = !details && !error

  // Pedimos los detalles a nuestra API cada vez que se abre un restaurante
  useEffect(() => {
    let cancelled = false
    fetchDetails(restaurant, city)
      .then((data) => !cancelled && setDetails(data))
      .catch((err) => !cancelled && setError(err.message))
    return () => {
      cancelled = true
    }
  }, [restaurant, city, attempt])

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [])

  function retry() {
    setError('')
    setAttempt((n) => n + 1)
  }

  const money = (cop) =>
    formatMoney(currency === 'COP' ? cop : Math.round(convert(cop, currency, rates)), currency)

  async function handleShare() {
    const text = `${restaurant.name} · ${restaurant.zone}, ${city}`
    try {
      if (navigator.share) {
        await navigator.share({ title: restaurant.name, text, url: window.location.href })
      } else {
        await navigator.clipboard.writeText(`${text} – ${window.location.href}`)
        setShareMsg('Enlace copiado')
        setTimeout(() => setShareMsg(''), 2000)
      }
    } catch {
      // el usuario cerró el menú de compartir
    }
  }

  return (
    <section className="detail">
      <nav className="detail__crumbs">
        <button className="detail__back" onClick={onBack}>
          <ArrowLeft size={18} />
          Volver a restaurantes
        </button>
        <span>
          / {city} / {restaurant.zone}
        </span>
      </nav>

      <h1 className="detail__name">{restaurant.name}</h1>

      <div className="detail__sub">
        <p>
          <Star size={15} />
          <strong>
            {restaurant.rating.toFixed(2).replace('.', ',')} · {restaurant.reviews} opiniones
          </strong>
          <span>
            {restaurant.zone}, {city} · {restaurant.cuisine}
          </span>
        </p>
        <div className="detail__actions">
          <button onClick={handleShare}>
            <Share size={17} />
            <u>{shareMsg || 'Compartir'}</u>
          </button>
          <button className={isSaved ? 'is-saved' : ''} onClick={() => onToggleSave(restaurant)}>
            <Heart size={17} />
            <u>{isSaved ? 'Guardado' : 'Guardar'}</u>
          </button>
        </div>
      </div>

      <div className="gallery">
        {(details?.photos ?? ['Salón principal', 'Cocina de temporada', 'Terraza'])
          .slice(0, 3)
          .map((label, i) => (
            <Photo
              key={label}
              label={label}
              className={i === 0 ? 'gallery__main' : ''}
              src={i === 0 ? photo?.src : undefined}
            />
          ))}
        {details && (
          <button className="gallery__all" onClick={() => setShowGallery(true)}>
            <LayoutGrid size={16} />
            Ver {details.photos.length} imágenes
          </button>
        )}
      </div>

      <div className="detail__layout">
        <div className="detail__content">
          <div className="tabs" role="tablist">
            {TABS.map((t) => (
              <button
                key={t}
                role="tab"
                aria-selected={tab === t}
                className={`tabs__btn ${tab === t ? 'is-active' : ''}`}
                onClick={() => setTab(t)}
              >
                {t}
              </button>
            ))}
          </div>

          {loading && <p className="empty">Cargando información del restaurante...</p>}

          {error && (
            <div className="detail__error">
              <p>{error}</p>
              <button className="link-btn" onClick={retry}>
                Intentar de nuevo
              </button>
            </div>
          )}

          {details && !loading && tab === 'Información' && (
            <>
              <h2 className="detail__headline">{details.headline}</h2>
              <p className="detail__text">{details.description}</p>

              <ul className="features">
                {details.features.map((f) => {
                  const Icon = FEATURE_ICONS[f.icon] ?? Leaf
                  return (
                    <li key={f.label}>
                      <Icon size={18} />
                      {f.label}
                    </li>
                  )
                })}
              </ul>

              <div className="detail__row">
                <h2 className="detail__headline">Un vistazo al menú</h2>
                <button className="detail__link" onClick={() => setTab('Menú')}>
                  Ver carta completa
                </button>
              </div>

              <ul className="dishes">
                {details.highlights.map((d) => (
                  <li key={d.name}>
                    <div>
                      <small>{d.type}</small>
                      <span>{d.name}</span>
                    </div>
                    <span>{money(d.priceCOP)}</span>
                  </li>
                ))}
              </ul>
              <p className="detail__note">Precios de referencia de la carta. El gasto final depende de tu consumo.</p>

              <div className="address">
                <MapPin size={22} />
                <div>
                  <strong>{details.address}</strong>
                  <span>{details.hours}</span>
                </div>
              </div>
            </>
          )}

          {details && !loading && tab === 'Menú' && (
            <>
              {details.menu.map((section) => (
                <div key={section.name} className="menu-section">
                  <h2 className="detail__headline">{section.name}</h2>
                  <ul className="dishes">
                    {section.items.map((d) => (
                      <li key={d.name}>
                        <span>{d.name}</span>
                        <span>{money(d.priceCOP)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <p className="detail__note">Precios de referencia de la carta. El gasto final depende de tu consumo.</p>
            </>
          )}

          {details && !loading && tab === 'Opiniones' && (
            <>
              <div className="score">
                <strong>{restaurant.rating.toFixed(2).replace('.', ',')}</strong>
                <div>
                  <span className="score__stars">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star key={n} size={16} />
                    ))}
                  </span>
                  <span>{restaurant.reviews} opiniones de comensales</span>
                </div>
              </div>
              <ul className="reviews">
                {details.reviews.map((r) => (
                  <li key={r.author}>
                    <div className="reviews__head">
                      <span className="reviews__avatar">{r.author[0]}</span>
                      <div>
                        <strong>{r.author}</strong>
                        <small>{reviewDate(r.date)}</small>
                      </div>
                      <span className="reviews__rating">
                        <Star size={14} /> {r.rating}
                      </span>
                    </div>
                    <p>{r.text}</p>
                  </li>
                ))}
              </ul>
            </>
          )}

          {details && !loading && tab === 'Ubicación' && (
            <>
              <div className="detail__map">
                <MapContainer
                  center={[details.coords.lat, details.coords.lon]}
                  zoom={16}
                  scrollWheelZoom={false}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={[details.coords.lat, details.coords.lon]} icon={PinIcon} />
                </MapContainer>
              </div>
              <div className="address">
                <MapPin size={22} />
                <div>
                  <strong>{details.address}</strong>
                  <span>{details.hours}</span>
                </div>
              </div>
            </>
          )}
        </div>

        <ReservationBox
          key={restaurant.id}
          restaurant={restaurant}
          currency={currency}
          rates={rates}
          search={search}
          initialSlot={initialSlot}
          cancelHours={details?.freeCancellationHours ?? 2}
          onReserve={onReserve}
        />
      </div>

      {showGallery && details && (
        <div className="overlay" onClick={() => setShowGallery(false)}>
          <div className="modal gallery-modal" onClick={(e) => e.stopPropagation()}>
            <div className="popover__head">
              <h2>Fotos de {restaurant.name}</h2>
              <button className="icon-btn" onClick={() => setShowGallery(false)} aria-label="Cerrar">
                <X size={20} />
              </button>
            </div>
            <div className="gallery-modal__grid">
              {details.photos.map((label) => (
                <Photo key={label} label={label} />
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
