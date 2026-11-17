import { X, Info } from 'lucide-react'
import { convert } from '../services/currency'
import { formatMoney, formatNumber } from '../utils/format'

const OPTIONS = [
  { code: 'COP', name: 'Peso colombiano', note: 'Moneda base' },
  { code: 'EUR', name: 'Euro', note: '' },
  { code: 'USD', name: 'Dólar estadounidense', note: 'Conversión de referencia' },
]

const SAMPLE = 90000 

export default function CurrencyModal({ currency, setCurrency, rates, onClose }) {
  const eur = convert(SAMPLE, 'EUR', rates)
  const usd = convert(SAMPLE, 'USD', rates)

  return (
    <div className="overlay overlay--top" onClick={onClose}>
      <div className="popover" onClick={(e) => e.stopPropagation()}>
        <div className="popover__head">
          <h2>Moneda de los precios</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>

        <p className="popover__text">
          Elige cómo ver el gasto estimado por persona. Esta preferencia no realiza pagos.
        </p>

        <div className="currency-list">
          {OPTIONS.map((o) => {
            const selected = currency === o.code
            const note = selected && o.code !== 'COP'
              ? 'Seleccionada · precios actualizados'
              : o.note
            return (
              <button
                key={o.code}
                className={`currency-option ${selected ? 'is-selected' : ''}`}
                onClick={() => setCurrency(o.code)}
              >
                <span className="currency-option__code">{o.code}</span>
                <span className="currency-option__text">
                  <strong>{o.name}</strong>
                  {note && <small>{note}</small>}
                </span>
                <span className={`radio ${selected ? 'is-on' : ''}`} />
              </button>
            )
          })}
        </div>

        <div className="example">
          <h4>Un mismo gasto, tres monedas</h4>
          <div className="example__row">
            <span>Estimación de Oliva & Fuego</span>
            <strong>{formatMoney(SAMPLE, 'COP')}</strong>
          </div>
          <div className="example__result">
            <span className="example__eur">{formatMoney(eur, 'EUR', 2)}</span>
            <span className="example__eq">=</span>
            <span className="example__usd">{formatMoney(usd, 'USD', 2)}</span>
          </div>
          <small>Importes estimados por persona.</small>
        </div>

        <div className="rates-note">
          <Info size={16} />
          <div>
            <strong>{rates.live ? 'Tasas de referencia en vivo' : 'Tasas de ejemplo, no tasas actuales'}</strong>
            <p>
              1 EUR = {formatNumber(Math.round(1 / rates.EUR))} COP · 1 USD ={' '}
              {formatNumber(Math.round(1 / rates.USD))} COP. Conversión ilustrativa; no
              determina el importe final de tu consumo.
            </p>
          </div>
        </div>

        <button className="btn-primary" onClick={onClose}>
          Listo · Ver precios en {currency}
        </button>
      </div>
    </div>
  )
}