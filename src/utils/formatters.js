export function formatCurrencyAmount(value, currencyCode) {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      maximumFractionDigits: 2,
    }).format(value)
  } catch {
    return `${currencyCode} ${Number(value).toFixed(2)}`
  }
}

export function formatPercent(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatRate(fromCurrency, toCurrency, rate) {
  return `1 ${fromCurrency} = ${Number(rate).toFixed(4)} ${toCurrency}`
}

export function formatTimestamp(value) {
  if (!value) {
    return 'Unavailable'
  }

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}
