export function formatNumber(value, decimals = 0) {
  return new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping: 'always',
  }).format(value)
}

export function formatMoney(value, currency, decimals = 0) {
  return `${formatNumber(value, decimals)} ${currency}`
}

const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1)
export function todayISO() {
  const d = new Date()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${month}-${day}`
}
export function shortDate(iso) {
  const date = new Date(`${iso}T12:00:00`)
  return capitalize(
    date.toLocaleDateString('es-CO', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }),
  ).replace('.', '')
}

export function longDate(iso) {
  const date = new Date(`${iso}T12:00:00`)
  return capitalize(
    date.toLocaleDateString('es-CO', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }),
  )
}

