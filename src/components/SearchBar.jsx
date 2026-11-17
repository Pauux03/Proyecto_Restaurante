import { Search } from 'lucide-react'
import { shortDate } from '../utils/format'

const TIMES = Array.from({ length: 24 }, (_, i) => {
  const hour = 12 + Math.floor(i / 2)
  return `${hour}:${i % 2 ? '30' : '00'}`
})

function SearchBar({ search, setSearch, locationText, onOpenLocation }) {
  const update = (patch) => setSearch((s) => ({ ...s, ...patch }))

  return (
    <div className="searchbar">
      <button className="field field--button" onClick={onOpenLocation}>
        <span className="field__label">Ubicación</span>
        <span className="field__value">{locationText}</span>
      </button>

      <label className="field">
        <span className="field__label">Fecha</span>
        <span className="field__value">{shortDate(search.date)}</span>
        <input
          type="date"
          className="field__native"
          value={search.date}
          onChange={(e) => e.target.value && update({ date: e.target.value })}
          onClick={(e) => e.currentTarget.showPicker?.()}
        />
      </label>

      <label className="field">
        <span className="field__label">Hora</span>
        <select
          className="field__select"
          value={search.time}
          onChange={(e) => update({ time: e.target.value })}
        >
          {TIMES.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </label>

      <label className="field field--last">
        <span className="field__label">Comensales</span>
        <select
          className="field__select"
          value={search.guests}
          onChange={(e) => update({ guests: Number(e.target.value) })}
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n} {n === 1 ? 'persona' : 'personas'}
            </option>
          ))}
        </select>
      </label>

      <button className="searchbar__submit" aria-label="Buscar" onClick={onOpenLocation}>
        <Search size={22} />
      </button>
    </div>
  )
}
export default SearchBar;