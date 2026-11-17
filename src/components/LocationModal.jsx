import { useState } from 'react'
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import { X, Search } from 'lucide-react'
import { searchPlace, reverseGeocode } from '../services/places'

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

const QUICK = [
  { name: 'Bogotá', lat: 4.711, lon: -74.0721 },
  { name: 'Medellín', lat: 6.2442, lon: -75.5812 },
  { name: 'Cartagena', lat: 10.391, lon: -75.4794 },
  { name: 'Madrid', lat: 40.4168, lon: -3.7038 },
  { name: 'Roma', lat: 41.9028, lon: 12.4964 },
]

function ClickHandler({ onPick }) {
  useMapEvents({ click: (e) => onPick(e.latlng) })
  return null
}

function Recenter({ lat, lon }) {
  const map = useMap()
  map.flyTo([lat, lon], 13, { duration: 0.8 })
  return null
}

export default function LocationModal({ current, onConfirm, onClose }) {
  const [draft, setDraft] = useState({
    name: current.city,
    lat: current.lat,
    lon: current.lon,
  })
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function handleSearch(e) {
    e.preventDefault()
    if (!query.trim()) return
    setBusy(true)
    setError('')
    try {
      const found = await searchPlace(query)
      setResults(found)
      if (!found.length) setError('No encontramos ese lugar.')
    } catch {
      setError('No se pudo buscar. Intenta de nuevo.')
    } finally {
      setBusy(false)
    }
  }

  async function handleMapClick({ lat, lng }) {
    setDraft({ name: 'Buscando nombre...', lat, lon: lng })
    try {
      const name = await reverseGeocode(lat, lng)
      setDraft({ name, lat, lon: lng })
    } catch {
      setDraft({ name: 'Ubicación elegida', lat, lon: lng })
    }
  }

  function choose(place) {
    setDraft({ name: place.name, lat: place.lat, lon: place.lon })
    setResults([])
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="popover__head">
          <h2>Elige la ubicación</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>

        <form className="loc-search" onSubmit={handleSearch}>
          <input
            placeholder="Busca una ciudad o barrio"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" disabled={busy}>
            <Search size={18} />
          </button>
        </form>

        {error && <p className="loc-error">{error}</p>}

        {results.length > 0 && (
          <ul className="loc-results">
            {results.map((r) => (
              <li key={`${r.lat}-${r.lon}`}>
                <button onClick={() => choose(r)}>{r.fullName}</button>
              </li>
            ))}
          </ul>
        )}

        <div className="loc-quick">
          {QUICK.map((q) => (
            <button key={q.name} className="chip" onClick={() => choose(q)}>
              {q.name}
            </button>
          ))}
        </div>

        <div className="loc-map">
          <MapContainer center={[draft.lat, draft.lon]} zoom={12} scrollWheelZoom>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[draft.lat, draft.lon]} icon={DefaultIcon} />
            <ClickHandler onPick={handleMapClick} />
            <Recenter lat={draft.lat} lon={draft.lon} />
          </MapContainer>
        </div>

        <p className="popover__text">
          Haz clic en el mapa o busca un lugar. Seleccionado: <strong>{draft.name}</strong>
        </p>

        <button className="btn-primary" onClick={() => onConfirm(draft)}>
          Ver restaurantes en {draft.name}
        </button>
      </div>
    </div>
  )
}