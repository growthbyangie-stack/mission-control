import { describe, expect, it, vi } from 'vitest'

function setNodeEnv(value: string) {
  ;(process.env as Record<string, string | undefined>).NODE_ENV = value
}

describe('proxy host matching', () => {
  it('allows the system hostname implicitly', async () => {
    vi.resetModules()
    vi.doMock('node:os', () => ({
      default: { hostname: () => 'hetzner-jarv' },
      hostname: () => 'hetzner-jarv',
    }))

    const { proxy } = await import('./proxy')
    const request = {
      headers: new Headers({ host: 'hetzner-jarv' }),
      nextUrl: { host: 'hetzner-jarv', hostname: 'hetzner-jarv', pathname: '/login', clone: () => ({ pathname: '/login' }) },
      method: 'GET',
      cookies: { get: () => undefined },
    } as any

    setNodeEnv('production')
    process.env.MC_ALLOWED_HOSTS = 'localhost,127.0.0.1'
    delete process.env.MC_ALLOW_ANY_HOST

    const response = proxy(request)
    expect(response.status).not.toBe(403)
  })

  it('keeps blocking unrelated hosts in production', async () => {
    vi.resetModules()
    vi.doMock('node:os', () => ({
      default: { hostname: () => 'hetzner-jarv' },
      hostname: () => 'hetzner-jarv',
    }))

    const { proxy } = await import('./proxy')
    const request = {
      headers: new Headers({ host: 'evil.example.com' }),
      nextUrl: { host: 'evil.example.com', hostname: 'evil.example.com', pathname: '/login', clone: () => ({ pathname: '/login' }) },
      method: 'GET',
      cookies: { get: () => undefined },
    } as any

    setNodeEnv('production')
    process.env.MC_ALLOWED_HOSTS = 'localhost,127.0.0.1'
    delete process.env.MC_ALLOW_ANY_HOST

    const response = proxy(request)
    expect(response.status).toBe(403)
  })

  it('allows unauthenticated health probe for /api/status?action=health', async () => {
    vi.resetModules()
    vi.doMock('node:os', () => ({
      default: { hostname: () => 'hetzner-jarv' },
      hostname: () => 'hetzner-jarv',
    }))

    const { proxy } = await import('./proxy')
    const request = {
      headers: new Headers({ host: 'localhost:3000' }),
      nextUrl: {
        host: 'localhost:3000',
        hostname: 'localhost',
        pathname: '/api/status',
        searchParams: new URLSearchParams('action=health'),
        clone: () => ({ pathname: '/api/status' }),
      },
      method: 'GET',
      cookies: { get: () => undefined },
    } as any

    setNodeEnv('production')
    process.env.MC_ALLOWED_HOSTS = 'localhost,127.0.0.1'
    delete process.env.MC_ALLOW_ANY_HOST

    const response = proxy(request)
    expect(response.status).not.toBe(401)
  })

  it('still blocks unauthenticated non-health status API calls', async () => {
    vi.resetModules()
    vi.doMock('node:os', () => ({
      default: { hostname: () => 'hetzner-jarv' },
      hostname: () => 'hetzner-jarv',
    }))

    const { proxy } = await import('./proxy')
    const request = {
      headers: new Headers({ host: 'localhost:3000' }),
      nextUrl: {
        host: 'localhost:3000',
        hostname: 'localhost',
        pathname: '/api/status',
        searchParams: new URLSearchParams('action=overview'),
        clone: () => ({ pathname: '/api/status' }),
      },
      method: 'GET',
      cookies: { get: () => undefined },
    } as any

    setNodeEnv('production')
    process.env.MC_ALLOWED_HOSTS = 'localhost,127.0.0.1'
    delete process.env.MC_ALLOW_ANY_HOST

    const response = proxy(request)
    expect(response.status).toBe(401)
  })

  it('allows unauthenticated social legal pages for provider app review', async () => {
    vi.resetModules()
    vi.doMock('node:os', () => ({
      default: { hostname: () => 'hetzner-jarv' },
      hostname: () => 'hetzner-jarv',
    }))

    const { proxy } = await import('./proxy')
    const request = {
      headers: new Headers({ host: 'localhost:3000' }),
      nextUrl: {
        host: 'localhost:3000',
        hostname: 'localhost',
        pathname: '/privacy',
        searchParams: new URLSearchParams(),
        clone: () => ({ pathname: '/privacy' }),
      },
      method: 'GET',
      cookies: { get: () => undefined },
    } as any

    setNodeEnv('production')
    process.env.MC_ALLOWED_HOSTS = 'localhost,127.0.0.1'
    delete process.env.MC_ALLOW_ANY_HOST

    const response = proxy(request)
    expect(response.status).not.toBe(307)
    expect(response.status).not.toBe(401)
  })

  it('allows unauthenticated client offer visual assets', async () => {
    vi.resetModules()
    vi.doMock('node:os', () => ({
      default: { hostname: () => 'hetzner-jarv' },
      hostname: () => 'hetzner-jarv',
    }))

    const { proxy } = await import('./proxy')
    const request = {
      headers: new Headers({ host: 'localhost:3000' }),
      nextUrl: {
        host: 'localhost:3000',
        hostname: 'localhost',
        pathname: '/site-visuals/messages-workflow-photo.png',
        searchParams: new URLSearchParams(),
        clone: () => ({ pathname: '/site-visuals/messages-workflow-photo.png' }),
      },
      method: 'GET',
      cookies: { get: () => undefined },
    } as any

    setNodeEnv('production')
    process.env.MC_ALLOWED_HOSTS = 'localhost,127.0.0.1'
    delete process.env.MC_ALLOW_ANY_HOST

    const response = proxy(request)
    expect(response.status).not.toBe(307)
    expect(response.status).not.toBe(401)
  })

  it('allows the local dev client to hydrate on loopback preview hosts', async () => {
    vi.resetModules()
    vi.doMock('node:os', () => ({
      default: { hostname: () => 'hetzner-jarv' },
      hostname: () => 'hetzner-jarv',
    }))

    const { proxy } = await import('./proxy')
    const request = {
      headers: new Headers({ host: '127.0.0.1:3002' }),
      nextUrl: {
        host: '127.0.0.1:3002',
        hostname: '127.0.0.1',
        pathname: '/client-offers',
        searchParams: new URLSearchParams(),
        clone: () => ({ pathname: '/client-offers' }),
      },
      method: 'GET',
      cookies: { get: () => undefined },
    } as any

    setNodeEnv('production')
    process.env.MC_ALLOWED_HOSTS = 'localhost,127.0.0.1'
    delete process.env.MC_ALLOW_ANY_HOST
    delete process.env.MC_ALLOW_UNSAFE_EVAL

    const response = proxy(request)
    expect(response.headers.get('Content-Security-Policy')).toContain("'unsafe-eval'")
  })

  it('rewrites configured public website domains to the client offers page', async () => {
    vi.resetModules()
    vi.doMock('node:os', () => ({
      default: { hostname: () => 'hetzner-jarv' },
      hostname: () => 'hetzner-jarv',
    }))

    const { proxy } = await import('./proxy')
    const request = {
      headers: new Headers({ host: 'link.angiegrowth.com' }),
      nextUrl: {
        host: 'link.angiegrowth.com',
        hostname: 'link.angiegrowth.com',
        pathname: '/',
        searchParams: new URLSearchParams(),
        clone: () => new URL('https://link.angiegrowth.com/'),
      },
      method: 'GET',
      cookies: { get: () => undefined },
    } as any

    setNodeEnv('production')
    process.env.MC_ALLOWED_HOSTS = 'link.angiegrowth.com'
    process.env.LINK_PUBLIC_SITE_HOSTS = 'link.angiegrowth.com'
    delete process.env.MC_ALLOW_ANY_HOST

    const response = proxy(request)
    expect(response.status).not.toBe(307)
    expect(response.status).not.toBe(401)
    expect(response.headers.get('x-middleware-rewrite')).toContain('/client-offers')
  })

  it('keeps the social media command page behind session auth', async () => {
    vi.resetModules()
    vi.doMock('node:os', () => ({
      default: { hostname: () => 'hetzner-jarv' },
      hostname: () => 'hetzner-jarv',
    }))

    const { proxy } = await import('./proxy')
    const request = {
      headers: new Headers({ host: 'localhost:3000' }),
      nextUrl: {
        host: 'localhost:3000',
        hostname: 'localhost',
        pathname: '/social-media',
        searchParams: new URLSearchParams(),
        clone: () => new URL('http://localhost:3000/social-media'),
      },
      method: 'GET',
      cookies: { get: () => undefined },
    } as any

    setNodeEnv('production')
    process.env.MC_ALLOWED_HOSTS = 'localhost,127.0.0.1'
    delete process.env.MC_ALLOW_ANY_HOST

    const response = proxy(request)
    expect(response.status).toBe(307)
  })

  it('allows local notification hygiene scout cron calls with local automation token header', async () => {
    vi.resetModules()
    vi.doMock('node:os', () => ({
      default: { hostname: () => 'hetzner-jarv' },
      hostname: () => 'hetzner-jarv',
    }))

    const { proxy } = await import('./proxy')
    const request = {
      headers: new Headers({
        host: '127.0.0.1:3002',
        'x-mc-local-automation-token': 'local-token',
      }),
      nextUrl: {
        host: '127.0.0.1:3002',
        hostname: '127.0.0.1',
        pathname: '/api/local/notification-hygiene-scout',
        searchParams: new URLSearchParams(),
        clone: () => ({ pathname: '/api/local/notification-hygiene-scout' }),
      },
      method: 'POST',
      cookies: { get: () => undefined },
    } as any

    setNodeEnv('production')
    process.env.MC_ALLOWED_HOSTS = 'localhost,127.0.0.1'
    delete process.env.API_KEY
    delete process.env.MC_ALLOW_ANY_HOST

    const response = proxy(request)
    expect(response.status).not.toBe(401)
  })

  it('blocks notification hygiene scout API calls without local automation token header', async () => {
    vi.resetModules()
    vi.doMock('node:os', () => ({
      default: { hostname: () => 'hetzner-jarv' },
      hostname: () => 'hetzner-jarv',
    }))

    const { proxy } = await import('./proxy')
    const request = {
      headers: new Headers({ host: '127.0.0.1:3002' }),
      nextUrl: {
        host: '127.0.0.1:3002',
        hostname: '127.0.0.1',
        pathname: '/api/local/notification-hygiene-scout',
        searchParams: new URLSearchParams(),
        clone: () => ({ pathname: '/api/local/notification-hygiene-scout' }),
      },
      method: 'POST',
      cookies: { get: () => undefined },
    } as any

    setNodeEnv('production')
    process.env.MC_ALLOWED_HOSTS = 'localhost,127.0.0.1'
    delete process.env.API_KEY
    delete process.env.MC_ALLOW_ANY_HOST

    const response = proxy(request)
    expect(response.status).toBe(401)
  })

  it('allows local cron noise budget auditor calls without a browser session', async () => {
    vi.resetModules()
    vi.doMock('node:os', () => ({
      default: { hostname: () => 'hetzner-jarv' },
      hostname: () => 'hetzner-jarv',
    }))

    const { proxy } = await import('./proxy')
    const request = {
      headers: new Headers({ host: '127.0.0.1:3002', origin: 'http://127.0.0.1:3002' }),
      nextUrl: {
        host: '127.0.0.1:3002',
        hostname: '127.0.0.1',
        pathname: '/api/local/cron-noise-budget',
        searchParams: new URLSearchParams(),
        clone: () => ({ pathname: '/api/local/cron-noise-budget' }),
      },
      method: 'POST',
      cookies: { get: () => undefined },
    } as any

    setNodeEnv('production')
    process.env.MC_ALLOWED_HOSTS = 'localhost,127.0.0.1'
    delete process.env.API_KEY
    delete process.env.MC_ALLOW_ANY_HOST

    const response = proxy(request)
    expect(response.status).not.toBe(401)
  })

  it('allows the local 5173 Control UI to make local mutating API calls', async () => {
    vi.resetModules()
    vi.doMock('node:os', () => ({
      default: { hostname: () => 'hetzner-jarv' },
      hostname: () => 'hetzner-jarv',
    }))

    const { proxy } = await import('./proxy')
    const request = {
      headers: new Headers({
        host: '127.0.0.1:3002',
        origin: 'http://127.0.0.1:5173',
        'x-api-key': 'test-key',
      }),
      nextUrl: {
        host: '127.0.0.1:3002',
        hostname: '127.0.0.1',
        pathname: '/api/tasks',
        searchParams: new URLSearchParams(),
        clone: () => ({ pathname: '/api/tasks' }),
      },
      method: 'POST',
      cookies: { get: () => undefined },
    } as any

    setNodeEnv('production')
    process.env.MC_ALLOWED_HOSTS = 'localhost,127.0.0.1'
    process.env.API_KEY = 'test-key'
    delete process.env.MC_ALLOW_ANY_HOST
    delete process.env.MC_CSRF_ALLOWED_ORIGINS

    const response = proxy(request)
    expect(response.status).not.toBe(403)
  })

  it('does not let the local 5173 exception bypass CSRF for nonlocal hosts', async () => {
    vi.resetModules()
    vi.doMock('node:os', () => ({
      default: { hostname: () => 'hetzner-jarv' },
      hostname: () => 'hetzner-jarv',
    }))

    const { proxy } = await import('./proxy')
    const request = {
      headers: new Headers({
        host: 'mission.example.com',
        origin: 'http://127.0.0.1:5173',
        'x-api-key': 'test-key',
      }),
      nextUrl: {
        host: 'mission.example.com',
        hostname: 'mission.example.com',
        pathname: '/api/tasks',
        searchParams: new URLSearchParams(),
        clone: () => ({ pathname: '/api/tasks' }),
      },
      method: 'POST',
      cookies: { get: () => undefined },
    } as any

    setNodeEnv('production')
    process.env.MC_ALLOWED_HOSTS = 'mission.example.com'
    process.env.API_KEY = 'test-key'
    delete process.env.MC_ALLOW_ANY_HOST
    delete process.env.MC_CSRF_ALLOWED_ORIGINS

    const response = proxy(request)
    expect(response.status).toBe(403)
  })
})
