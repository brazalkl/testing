import { proxyExchangeRateRequest } from '../../server/exchangeRateProxy.js'

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET')
    response.status(405).json({
      result: 'error',
      'error-type': 'method-not-allowed',
      message: 'Only GET requests are supported.',
    })
    return
  }

  try {
    const requestUrl = new URL(request.url ?? '/', 'http://localhost')
    const pathSegments = Array.isArray(request.query.path)
      ? request.query.path
      : [request.query.path].filter(Boolean)

    const proxiedResponse = await proxyExchangeRateRequest({
      endpointPath: pathSegments.join('/'),
      search: requestUrl.search,
    })

    response.setHeader('Content-Type', proxiedResponse.contentType)
    response.status(proxiedResponse.status).send(proxiedResponse.body)
  } catch (error) {
    response.status(500).json({
      result: 'error',
      'error-type': 'server-error',
      message:
        error instanceof Error ? error.message : 'The exchange rate proxy failed unexpectedly.',
    })
  }
}
