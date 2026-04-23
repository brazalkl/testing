import { createReadStream } from 'node:fs'
import { access, stat } from 'node:fs/promises'
import { createServer } from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { proxyExchangeRateRequest } from './exchangeRateProxy.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DIST_DIR = path.resolve(__dirname, '../dist')
const INDEX_FILE = path.join(DIST_DIR, 'index.html')
const API_PREFIX = '/api/exchange-rate'

const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
}

function sendJson(response, statusCode, payload) {
  response.statusCode = statusCode
  response.setHeader('Content-Type', 'application/json; charset=utf-8')
  response.end(JSON.stringify(payload))
}

function getContentType(filePath) {
  return MIME_TYPES[path.extname(filePath).toLowerCase()] ?? 'application/octet-stream'
}

async function fileExists(filePath) {
  try {
    await access(filePath)
    return true
  } catch {
    return false
  }
}

function getSafeFilePath(pathname) {
  const normalizedPath = path.normalize(decodeURIComponent(pathname)).replace(/^(\.\.[/\\])+/, '')
  const requestedPath = normalizedPath === '/' ? '/index.html' : normalizedPath
  const filePath = path.resolve(DIST_DIR, `.${requestedPath}`)

  if (!filePath.startsWith(DIST_DIR)) {
    return null
  }

  return filePath
}

async function serveFile(response, filePath) {
  response.statusCode = 200
  response.setHeader('Content-Type', getContentType(filePath))

  createReadStream(filePath).pipe(response)
}

async function handleApiRequest(request, response, url) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET')
    sendJson(response, 405, {
      result: 'error',
      'error-type': 'method-not-allowed',
      message: 'Only GET requests are supported.',
    })
    return
  }

  try {
    const endpointPath = url.pathname.slice(API_PREFIX.length)
    const proxiedResponse = await proxyExchangeRateRequest({
      endpointPath,
      search: url.search,
    })

    response.statusCode = proxiedResponse.status
    response.setHeader('Content-Type', proxiedResponse.contentType)
    response.end(proxiedResponse.body)
  } catch (error) {
    sendJson(response, 500, {
      result: 'error',
      'error-type': 'server-error',
      message:
        error instanceof Error ? error.message : 'The exchange rate proxy failed unexpectedly.',
    })
  }
}

async function handleStaticRequest(response, url) {
  const candidatePath = getSafeFilePath(url.pathname)

  if (!candidatePath) {
    response.statusCode = 403
    response.end('Forbidden')
    return
  }

  if (await fileExists(candidatePath)) {
    const fileStats = await stat(candidatePath)

    if (fileStats.isFile()) {
      await serveFile(response, candidatePath)
      return
    }
  }

  await serveFile(response, INDEX_FILE)
}

const port = Number(process.env.PORT) || 10000

const server = createServer(async (request, response) => {
  if (!request.url) {
    response.statusCode = 400
    response.end('Bad Request')
    return
  }

  const url = new URL(request.url, 'http://localhost')

  if (url.pathname.startsWith(API_PREFIX)) {
    await handleApiRequest(request, response, url)
    return
  }

  await handleStaticRequest(response, url)
})

server.listen(port, '0.0.0.0', () => {
  console.log(`Web service listening on port ${port}`)
})
