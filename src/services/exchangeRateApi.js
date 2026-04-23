const API_BASE_URL = '/api/exchange-rate'

const API_ERRORS = {
  'inactive-account':
    'The ExchangeRate-API account is inactive. Confirm the account email and try again.',
  'invalid-key':
    'The ExchangeRate-API key is invalid. Update EXCHANGE_RATE_API_KEY and retry.',
  'malformed-request': 'The exchange rate request was malformed.',
  'quota-reached':
    'The ExchangeRate-API request quota has been reached for this key.',
  'unsupported-code':
    'The selected currency is not supported by ExchangeRate-API.',
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      Accept: 'application/json',
    },
    signal: options.signal,
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.message ?? `Exchange rate request failed with status ${response.status}.`,
    )
  }

  if (data.result === 'error') {
    throw new Error(
      API_ERRORS[data['error-type']] ??
        'ExchangeRate-API returned an unexpected error.',
    )
  }

  return data
}

export async function getSupportedCurrencyCodes(options = {}) {
  const data = await request('/codes', options)

  return data.supported_codes
    .map(([code, name]) => ({ code, name }))
    .sort((left, right) => left.code.localeCompare(right.code))
}

export async function getLatestRates(baseCode, options = {}) {
  const data = await request(`/latest/${baseCode}`, options)

  return {
    baseCode: data.base_code,
    conversionRates: data.conversion_rates,
    timeLastUpdate: data.time_last_update_utc,
    timeNextUpdate: data.time_next_update_utc,
  }
}
