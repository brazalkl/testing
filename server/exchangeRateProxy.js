const DEFAULT_API_BASE_URL = 'https://v6.exchangerate-api.com/v6'
const JSON_CONTENT_TYPE = 'application/json; charset=utf-8'

function trimTrailingSlash(value) {
  return value.replace(/\/+$/, '')
}

function normalizeEndpointPath(endpointPath = '') {
  return endpointPath
    .split('/')
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join('/')
}

function getProxyConfig(env = process.env) {
  const apiKey = env.EXCHANGE_RATE_API_KEY ?? env.VITE_EXCHANGE_RATE_API_KEY
  const apiBaseUrl = trimTrailingSlash(
    env.EXCHANGE_RATE_API_BASE_URL ??
      env.VITE_EXCHANGE_RATE_API_BASE_URL ??
      DEFAULT_API_BASE_URL,
  )

  if (!apiKey) {
    throw new Error(
      'Missing exchange rate API key. Set EXCHANGE_RATE_API_KEY in your server environment.',
    )
  }

  return { apiBaseUrl, apiKey }
}

export async function proxyExchangeRateRequest({
  endpointPath = '',
  search = '',
  signal,
  env = process.env,
}) {
  const { apiBaseUrl, apiKey } = getProxyConfig(env)
  const normalizedPath = normalizeEndpointPath(endpointPath)
  const upstreamUrl = new URL(`${apiBaseUrl}/${apiKey}/${normalizedPath}`)

  if (search) {
    upstreamUrl.search = search.startsWith('?') ? search : `?${search}`
  }

  const upstreamResponse = await fetch(upstreamUrl, {
    headers: {
      Accept: 'application/json',
    },
    signal,
  })

  return {
    status: upstreamResponse.status,
    body: await upstreamResponse.text(),
    contentType: upstreamResponse.headers.get('content-type') ?? JSON_CONTENT_TYPE,
  }
}

export function sendProxyError(response, error) {
  response.statusCode = 500
  response.setHeader('Content-Type', JSON_CONTENT_TYPE)
  response.end(
    JSON.stringify({
      result: 'error',
      'error-type': 'server-error',
      message:
        error instanceof Error ? error.message : 'The exchange rate proxy failed unexpectedly.',
    }),
  )
}

export function createExchangeRateDevMiddleware(env) {
  return async function exchangeRateDevMiddleware(request, response) {
    if (request.method !== 'GET') {
      response.statusCode = 405
      response.setHeader('Allow', 'GET')
      response.end('Method Not Allowed')
      return
    }

    try {
      const requestUrl = new URL(request.url ?? '/', 'http://localhost')
      const proxiedResponse = await proxyExchangeRateRequest({
        endpointPath: requestUrl.pathname,
        search: requestUrl.search,
        env,
      })

      response.statusCode = proxiedResponse.status
      response.setHeader('Content-Type', proxiedResponse.contentType)
      response.end(proxiedResponse.body)
    } catch (error) {
      sendProxyError(response, error)
    }
  }
}
