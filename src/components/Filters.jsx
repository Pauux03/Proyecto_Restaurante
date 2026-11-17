import { useState } from 'react'
import { SlidersHorizontal, MapPin, ChevronDown } from 'lucide-react'
import { formatNumber } from '../utils/format'
import { convert } from '../services/currency'

const RATINGS = [
  { value: 0, label: 'Cualquier calificación' },
  { value: 4.0, label: '4,0 o más' },
  { value: 4.8, label: '4,8 o más' },
]

export default function Filters({
  filters,
  setFilters,
  limits,
  cuisines,
  currency,
  rates,
  locationLabel,
  onOpenLocation,
  onClear,
}) {
  const [open, setOpen] = useState(null)
  const toggle = (name) => setOpen(open === name ? null : name)
  const update = (patch) => setFilters((f) => ({ ...f, ...patch }))
  const show = (cop) =>
    currency === 'COP' ? cop : Math.round(convert(cop, currency, rates))

  return (
    <div className="filters">
      <div className="filters__chips">

        <div className="menu-wrap">
          <button className="chip chip--active" onClick={() => toggle('price')}>
            <SlidersHorizontal size={16} />
            Precio: {formatNumber(show(filters.minPrice))}–
            {formatNumber(show(filters.maxPrice))} {currency} / persona
            <ChevronDown size={16} />
          </button>
          {open === 'price' && (
            <div className="menu menu--price">
              <label>
                Mínimo: {formatNumber(show(filters.minPrice))} {currency}
                <input
                  type="range"
                  min={limits.min}
                  max={limits.max}
                  step={500}
                  value={filters.minPrice}
                  onChange={(e) =>
                    update({ minPrice: Math.min(Number(e.target.value), filters.maxPrice) })
                  }
                />
              </label>
              <label>
                Máximo: {formatNumber(show(filters.maxPrice))} {currency}
                <input
                  type="range"
                  min={limits.min}
                  max={limits.max}
                  step={500}
                  value={filters.maxPrice}
                  onChange={(e) =>
                    update({ maxPrice: Math.max(Number(e.target.value), filters.minPrice) })
                  }
                />
              </label>
            </div>
          )}
        </div>

        <button className="chip" onClick={onOpenLocation}>
          <MapPin size={16} />
          Ubicación: {locationLabel}
          <ChevronDown size={16} />
        </button>

        <div className="menu-wrap">
          <button className="chip" onClick={() => toggle('cuisine')}>
            Tipo de cocina
            {filters.cuisine !== 'all' && `: ${filters.cuisine}`}
            <ChevronDown size={16} />
          </button>
          {open === 'cuisine' && (
            <div className="menu">
              {['all', ...cuisines].map((c) => (
                <button
                  key={c}
                  className={`menu__item ${filters.cuisine === c ? 'is-selected' : ''}`}
                  onClick={() => {
                    update({ cuisine: c })
                    setOpen(null)
                  }}
                >
                  {c === 'all' ? 'Todas' : c}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="menu-wrap">
          <button className="chip" onClick={() => toggle('more')}>
            Más filtros
            <ChevronDown size={16} />
          </button>
          {open === 'more' && (
            <div className="menu">
              {RATINGS.map((r) => (
                <button
                  key={r.value}
                  className={`menu__item ${filters.minRating === r.value ? 'is-selected' : ''}`}
                  onClick={() => {
                    update({ minRating: r.value })
                    setOpen(null)
                  }}
                >
                  {r.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <button className="link-btn" onClick={onClear}>
        Limpiar filtros
      </button>
    </div>
  )
}