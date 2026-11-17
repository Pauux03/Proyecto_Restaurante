
const API_URL = 'https://open.er-api.com/v6/latest/COP'

export const FALLBACK_RATES = {
  COP: 1,
  EUR: 1 / 4500,
  USD: 1 / 4000,
  live: false,
  updated: null,
}

export async function fetchRates() {
  const res = await fetch(API_URL)
  if (!res.ok) throw new Error('No se pudo obtener la tasa de cambio')
  const data = await res.json()
  if (data.result !== 'success') throw new Error('Respuesta inválida')

  return {
    COP: 1,
    EUR: data.rates.EUR,
    USD: data.rates.USD,
    live: true,
    updated: data.time_last_update_utc,
  }
}

export function convert(amountCOP, currency, rates) {
  return amountCOP * rates[currency]
}