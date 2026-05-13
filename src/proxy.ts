import crypto from 'node:crypto'
import os from 'node:os'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { buildMissionControlCsp, buildNonceRequestHeaders } from '@/lib/csp'
import { MC_SESSION_COOKIE_NAME, LEGACY_MC_SESSION_COOKIE_NAME } from '@/lib/session-cookie'

/** Constant-time string comparison using Node.js crypto. */
function safeCompare(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  if (bufA.length !== bufB.length) return false
  return crypto.timingSafeEqual(bufA, bufB)
}

function envFlag(name: string): boolean {
  const raw = process.env[name]
  if (raw === undefined) return false
  const v = String(raw).trim().toLowerCase()
  return v === '1' || v === 'true' || v === 'yes' || v === 'on'
}

function normalizeHostname(raw: string): string {
  return raw.trim().replace(/^\[|\]$/g, '').split(':')[0].replace(/\.$/, '').toLowerCase()
}

function parseForwardedHost(forwarded: string | null): string[] {
  if (!forwarded) return []
  const hosts: string[] = []
  for (const part of forwarded.split(',')) {
    const match = /(?:^|;)\s*host="?([^";]+)"?/i.exec(part)
    if (match?.[1]) hosts.push(match[1])
  }
  return hosts
}

function getRequestHostCandidates(request: NextRequest): string[] {
  const rawCandidates = [
    ...(request.headers.get('x-forwarded-host') || '').split(','),
    ...(request.headers.get('x-original-host') || '').split(','),
    ...(request.headers.get('x-forwarded-server') || '').split(','),
    ...parseForwardedHost(request.headers.get('forwarded')),
    request.headers.get('host') || '',
    request.nextUrl.host || '',
    request.nextUrl.hostname || '',
  ]

  const candidates = rawCandidates
    .map(normalizeHostname)
    .filter(Boolean)

  return [...new Set(candidates)]
}

function getImplicitAllowedHosts(): string[] {
  const candidates = [
    'localhost',
    '127.0.0.1',
    '::1',
    normalizeHostname(os.hostname()),
  ].filter(Boolean)

  return [...new Set(candidates)]
}

const LOCAL_CONTROL_UI_CSRF_ORIGINS = [
  'http://127.0.0.1:3000',
  'http://localhost:3000',
  'http://127.0.0.1:3002',
  'http://localhost:3002',
  'http://127.0.0.1:5173',
  'http://localhost:5173',
]

function parseOrigin(raw: string): URL | null {
  try {
    return new URL(raw)
  } catch {
    return null
  }
}

function isLoopbackHost(raw: string): boolean {
  const host = normalizeHostname(raw)
  return host === 'localhost' || host === '127.0.0.1' || host === '::1'
}

function getConfiguredCsrfAllowedOrigins(): Set<string> {
  return new Set(
    String(process.env.MC_CSRF_ALLOWED_ORIGINS || '')
      .split(',')
      .map((entry) => parseOrigin(entry.trim())?.origin.toLowerCase())
      .filter((entry): entry is string => Boolean(entry)),
  )
}

function isAllowedCsrfOrigin(origin: string, requestHost: string): boolean {
  const parsedOrigin = parseOrigin(origin)
  if (!parsedOrigin) return false

  if (parsedOrigin.host.toLowerCase() === requestHost.toLowerCase()) return true

  const normalizedOrigin = parsedOrigin.origin.toLowerCase()
  if (getConfiguredCsrfAllowedOrigins().has(normalizedOrigin)) return true

  return LOCAL_CONTROL_UI_CSRF_ORIGINS.includes(normalizedOrigin)
    && isLoopbackHost(parsedOrigin.hostname)
    && isLoopbackHost(requestHost)
}

function hostMatches(pattern: string, hostname: string): boolean {
  const p = normalizeHostname(pattern)
  const h = normalizeHostname(hostname)
  if (!p || !h) return false

  // "*.example.com" matches "a.example.com" (but not bare "example.com")
  if (p.startsWith('*.')) {
    const suffix = p.slice(2)
    return h.endsWith(`.${suffix}`)
  }

  // "100.*" matches "100.64.0.1"
  if (p.endsWith('.*')) {
    const prefix = p.slice(0, -1)
    return h.startsWith(prefix)
  }

  return h === p
}

function nextResponseWithNonce(request: NextRequest): { response: NextResponse; nonce: string } {
  const nonce = crypto.randomBytes(16).toString('base64')
  const googleEnabled = !!(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID)
  const requestHosts = getRequestHostCandidates(request)
  const allowUnsafeEval = envFlag('MC_ALLOW_UNSAFE_EVAL') || process.env.NODE_ENV !== 'production' || requestHosts.some(isLoopbackHost)
  const requestHeaders = buildNonceRequestHeaders({
    headers: request.headers,
    nonce,
    googleEnabled,
    allowUnsafeEval,
  })
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
  return { response, nonce }
}

function rewriteWithNonce(request: NextRequest, url: URL): { response: NextResponse; nonce: string } {
  const nonce = crypto.randomBytes(16).toString('base64')
  const googleEnabled = !!(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID)
  const requestHosts = getRequestHostCandidates(request)
  const allowUnsafeEval = envFlag('MC_ALLOW_UNSAFE_EVAL') || process.env.NODE_ENV !== 'production' || requestHosts.some(isLoopbackHost)
  const requestHeaders = buildNonceRequestHeaders({
    headers: request.headers,
    nonce,
    googleEnabled,
    allowUnsafeEval,
  })
  const response = NextResponse.rewrite(url, {
    request: {
      headers: requestHeaders,
    },
  })
  return { response, nonce }
}

function addSecurityHeaders(response: NextResponse, request: NextRequest, nonce?: string): NextResponse {
  const requestId = crypto.randomUUID()
  response.headers.set('X-Request-Id', requestId)
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  const googleEnabled = !!(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID)
  const requestHosts = getRequestHostCandidates(request)
  const allowUnsafeEval = envFlag('MC_ALLOW_UNSAFE_EVAL') || process.env.NODE_ENV !== 'production' || requestHosts.some(isLoopbackHost)
  const effectiveNonce = nonce || crypto.randomBytes(16).toString('base64')
  response.headers.set('Content-Security-Policy', buildMissionControlCsp({ nonce: effectiveNonce, googleEnabled, allowUnsafeEval }))

  return response
}

function extractApiKeyFromRequest(request: NextRequest): string {
  const direct = (request.headers.get('x-api-key') || '').trim()
  if (direct) return direct

  const authorization = (request.headers.get('authorization') || '').trim()
  if (!authorization) return ''

  const [scheme, ...rest] = authorization.split(/\s+/)
  if (!scheme || rest.length === 0) return ''
  const normalized = scheme.toLowerCase()
  if (normalized === 'bearer' || normalized === 'apikey' || normalized === 'token') {
    return rest.join(' ').trim()
  }
  return ''
}

export function proxy(request: NextRequest) {
  // Network access control.
  // In production: default-deny unless explicitly allowed.
  // In dev/test: allow all hosts unless overridden.
  const requestHosts = getRequestHostCandidates(request)
  const allowAnyHost = envFlag('MC_ALLOW_ANY_HOST') || process.env.NODE_ENV !== 'production'
  const allowedPatterns = String(process.env.MC_ALLOWED_HOSTS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  const implicitAllowedHosts = getImplicitAllowedHosts()

  const enforceAllowlist = !allowAnyHost && allowedPatterns.length > 0
  const isAllowedHost = !enforceAllowlist
    || requestHosts.some((hostName) =>
      implicitAllowedHosts.some((candidate) => hostMatches(candidate, hostName))
      || allowedPatterns.some((pattern) => hostMatches(pattern, hostName))
    )

  if (!isAllowedHost) {
    return addSecurityHeaders(new NextResponse('Forbidden', { status: 403 }), request)
  }

  const { pathname } = request.nextUrl
  const method = request.method.toUpperCase()
  const publicClientSitePatterns = String(process.env.LINK_PUBLIC_SITE_HOSTS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  const isPublicClientSiteHost = publicClientSitePatterns.length > 0
    && requestHosts.some((hostName) => publicClientSitePatterns.some((pattern) => hostMatches(pattern, hostName)))

  if (pathname === '/' && ['GET', 'HEAD', 'OPTIONS'].includes(method) && isPublicClientSiteHost) {
    const clientOffersUrl = request.nextUrl.clone()
    clientOffersUrl.pathname = '/client-offers'
    const { response, nonce } = rewriteWithNonce(request, clientOffersUrl)
    return addSecurityHeaders(response, request, nonce)
  }

  // CSRF Origin validation for mutating requests
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    const origin = request.headers.get('origin')
    if (origin) {
      let originHost: string
      try { originHost = new URL(origin).host } catch { originHost = '' }
      const requestHost = request.headers.get('host')?.split(',')[0]?.trim()
        || request.nextUrl.host
        || ''
      if (originHost && requestHost && !isAllowedCsrfOrigin(origin, requestHost)) {
        return addSecurityHeaders(NextResponse.json({ error: 'CSRF origin mismatch' }, { status: 403 }), request)
      }
    }
  }

  const isPublicAsset = pathname === '/mc-push-sw.js'
    || pathname === '/manifest.webmanifest'
    || pathname === '/icon.png'
    || pathname === '/apple-icon.png'
    || pathname.startsWith('/brand/')
    || pathname.startsWith('/site-visuals/')

  // Allow login, setup, auth API, docs, PWA assets, container health probe, and selected local-only read-only surfaces without session.
  const isPublicHealthProbe = pathname === '/api/status' && request.nextUrl.searchParams.get('action') === 'health'
  const isLocalDecisionBridge = pathname === '/api/local/decision-bridge'
    && ['GET', 'OPTIONS'].includes(method)
  const isLocalUiImprovementReconciler = pathname === '/api/local/ui-improvement-reconciler'
    && ['GET', 'OPTIONS'].includes(method)
  const isLocalNewsSignals = pathname === '/api/local/news-signals'
    && ['GET', 'OPTIONS'].includes(method)
  const isLocalRouteContracts = pathname === '/api/local/route-contracts'
    && ['GET', 'OPTIONS'].includes(method)
  const isLocalDashboardRouteContractScout = pathname === '/api/local/dashboard-route-contract-scout'
    && ['GET', 'POST', 'OPTIONS'].includes(method)
  const isLocalCronNoiseBudget = pathname === '/api/local/cron-noise-budget'
    && ['GET', 'POST', 'OPTIONS'].includes(method)
    && requestHosts.some(isLoopbackHost)
  const isLocalOperatorBrief = pathname === '/api/local/operator-brief'
    && (['GET', 'OPTIONS'].includes(method) || (method === 'POST' && requestHosts.some(isLoopbackHost)))
  const isLocalNewFeatureImprovementScout = pathname === '/api/local/new-feature-improvement-scout'
    && ['GET', 'POST', 'OPTIONS'].includes(method)
  const isLocalNewFeatureRadar = pathname === '/api/local/new-feature-radar'
    && ['GET', 'OPTIONS'].includes(method)
    && requestHosts.some(isLoopbackHost)
  const isLocalCustomerCapabilityGaps = pathname === '/api/local/customer-capability-gaps'
    && ['GET', 'OPTIONS'].includes(method)
    && requestHosts.some(isLoopbackHost)
  const isLocalHelperAllowlistCandidates = pathname === '/api/local/helper-allowlist-candidates'
    && ['GET', 'OPTIONS'].includes(method)
    && requestHosts.some(isLoopbackHost)
  const isLocalAgentFocusDirection = pathname === '/api/local/agent-focus-direction'
    && ['GET', 'POST', 'OPTIONS'].includes(method)
    && requestHosts.some(isLoopbackHost)
  const isLocalNotificationHygieneScout = pathname === '/api/local/notification-hygiene-scout'
    && ['GET', 'POST', 'OPTIONS'].includes(method)
    && Boolean(request.headers.get('x-mc-local-automation-token')?.trim())
  const isPresentationShareFrame = pathname === '/api/presentation-share/frame'
    && ['GET', 'OPTIONS'].includes(method)
  const isPresentationShareSnapshot = pathname === '/api/presentation-share/snapshot'
    && ['GET', 'HEAD', 'OPTIONS'].includes(method)
  const isPresentationShareViewer = pathname.startsWith('/present/')
    && ['GET', 'HEAD', 'OPTIONS'].includes(method)
  const isSocialLegalPage = ['/privacy', '/terms', '/data-deletion'].includes(pathname)
    && ['GET', 'HEAD', 'OPTIONS'].includes(method)
  const isClientOffersPage = pathname === '/client-offers'
    && ['GET', 'HEAD', 'OPTIONS'].includes(method)
  const isClientOffersConsult = pathname === '/api/client-offers/consult'
    && ['POST', 'OPTIONS'].includes(method)
  if (isPublicAsset || pathname === '/login' || pathname === '/setup' || pathname.startsWith('/api/auth/') || pathname === '/api/setup' || pathname === '/api/docs' || pathname === '/docs' || isSocialLegalPage || isPublicHealthProbe || isClientOffersPage || isClientOffersConsult || isLocalDecisionBridge || isLocalUiImprovementReconciler || isLocalNewsSignals || isLocalRouteContracts || isLocalDashboardRouteContractScout || isLocalCronNoiseBudget || isLocalOperatorBrief || isLocalNewFeatureImprovementScout || isLocalNewFeatureRadar || isLocalCustomerCapabilityGaps || isLocalHelperAllowlistCandidates || isLocalAgentFocusDirection || isLocalNotificationHygieneScout || isPresentationShareFrame || isPresentationShareSnapshot || isPresentationShareViewer) {
    const { response, nonce } = nextResponseWithNonce(request)
    return addSecurityHeaders(response, request, nonce)
  }

  // Check for session cookie
  const sessionToken = request.cookies.get(MC_SESSION_COOKIE_NAME)?.value || request.cookies.get(LEGACY_MC_SESSION_COOKIE_NAME)?.value

  // API routes: accept session cookie OR API key
  if (pathname.startsWith('/api/')) {
    const configuredApiKey = (process.env.API_KEY || '').trim()
    const apiKey = extractApiKeyFromRequest(request)
    const hasValidApiKey = Boolean(configuredApiKey && apiKey && safeCompare(apiKey, configuredApiKey))

    // Agent-scoped keys are validated in route auth (DB-backed) and should be
    // allowed to pass through proxy auth gate.
    const looksLikeAgentApiKey = /^mca_[a-f0-9]{48}$/i.test(apiKey)

    if (sessionToken || hasValidApiKey || looksLikeAgentApiKey) {
      const { response, nonce } = nextResponseWithNonce(request)
      return addSecurityHeaders(response, request, nonce)
    }

    return addSecurityHeaders(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }), request)
  }

  // Page routes: redirect to login if no session
  if (sessionToken) {
    const { response, nonce } = nextResponseWithNonce(request)
    return addSecurityHeaders(response, request, nonce)
  }

  // Redirect to login
  const loginUrl = request.nextUrl.clone()
  loginUrl.pathname = '/login'
  return addSecurityHeaders(NextResponse.redirect(loginUrl), request)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|brand/|mc-push-sw.js|manifest.webmanifest|icon.png|apple-icon.png).*)']
}
