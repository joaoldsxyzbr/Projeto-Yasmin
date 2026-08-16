const CACHE_NAME = 'yasmin-pwa-v1'
const ARQUIVOS_ESSENCIAIS = [
  '/',
  '/manifest.webmanifest',
  '/favicon.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-512.png',
  '/icons/apple-touch-icon.png',
]

async function armazenarSeDisponivel(cache, caminho) {
  try {
    const resposta = await fetch(caminho, { cache: 'no-store' })
    if (resposta.ok) {
      await cache.put(caminho, resposta)
    }
  } catch {
    // Um recurso opcional não deve impedir a instalação do service worker.
  }
}

async function prepararShell() {
  const cache = await caches.open(CACHE_NAME)

  let html = ''
  try {
    const resposta = await fetch('/', { cache: 'no-store' })
    if (resposta.ok) {
      const copia = resposta.clone()
      html = await copia.text()
      await cache.put('/', resposta)
    }
  } catch {
    // O restante da instalação ainda pode aproveitar recursos já disponíveis.
  }

  const recursosDoBuild = [...html.matchAll(/(?:src|href)="([^"]+)"/g)]
    .map((resultado) => resultado[1])
    .filter((caminho) => caminho.startsWith('/') && caminho !== '/sw.js')

  const recursos = [...new Set([...ARQUIVOS_ESSENCIAIS, ...recursosDoBuild])]
  await Promise.all(recursos.map((caminho) => armazenarSeDisponivel(cache, caminho)))
}

self.addEventListener('install', (evento) => {
  evento.waitUntil(
    prepararShell().then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    caches.keys()
      .then((nomes) => Promise.all(
        nomes
          .filter((nome) => nome.startsWith('yasmin-pwa-') && nome !== CACHE_NAME)
          .map((nome) => caches.delete(nome)),
      ))
      .then(() => self.clients.claim()),
  )
})

async function redePrimeiro(requisicao, fallback = null) {
  const cache = await caches.open(CACHE_NAME)

  try {
    const resposta = await fetch(requisicao)
    if (resposta.ok) {
      await cache.put(requisicao, resposta.clone())
    }
    return resposta
  } catch {
    const armazenada = await cache.match(requisicao)
    if (armazenada) return armazenada

    if (fallback) {
      const fallbackArmazenado = await cache.match(fallback)
      if (fallbackArmazenado) return fallbackArmazenado
    }

    return new Response('', {
      status: 503,
      statusText: 'Sem conexão',
    })
  }
}

self.addEventListener('fetch', (evento) => {
  const { request } = evento
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin || url.pathname === '/sw.js') return

  if (request.mode === 'navigate') {
    evento.respondWith(redePrimeiro(request, '/'))
    return
  }

  const destinosCacheaveis = new Set(['script', 'style', 'font', 'image', 'manifest'])
  if (destinosCacheaveis.has(request.destination)) {
    evento.respondWith(redePrimeiro(request))
  }
})
