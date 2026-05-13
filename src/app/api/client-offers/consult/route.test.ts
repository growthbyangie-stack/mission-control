// @vitest-environment node

import { describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from './route'

async function consult(messages: Array<{ role: 'user' | 'assistant'; content: string }>) {
  const originalKey = process.env.OPENAI_API_KEY
  delete process.env.OPENAI_API_KEY
  try {
    const response = await POST(new NextRequest('http://localhost/api/client-offers/consult', {
      method: 'POST',
      body: JSON.stringify({ messages }),
    }))
    return await response.json()
  } finally {
    if (originalKey) process.env.OPENAI_API_KEY = originalKey
  }
}

describe('client offers consult conversation flow', () => {
  it('starts in discovery instead of forcing a package', async () => {
    const data = await consult([
      { role: 'user', content: 'I need help with my business but I am not sure where to start.' },
    ])

    expect(data.mode).toBe('discovery')
    expect(data.plan).toEqual([])
    expect(data.reply).toMatch(/trying to improve first/i)
  })

  it('asks permission before showing the package when the customer gives enough detail', async () => {
    const data = await consult([
      {
        role: 'user',
        content:
          'I run a coaching business. I need LINK to autonomously run CRM follow-up, social media posts, video lesson notes, my Learning Center, trading workflows, and a clearer daily dashboard because everything is scattered.',
      },
    ])

    expect(data.mode).toBe('ready-to-recommend')
    expect(data.plan).toEqual([])
    expect(data.reply).toMatch(/show you the best-fit package/i)
  })

  it('shows the package only after the customer accepts the recommendation offer', async () => {
    const data = await consult([
      {
        role: 'user',
        content:
          'I run a coaching business. I need LINK to autonomously run CRM follow-up, social media posts, video lesson notes, my Learning Center, trading workflows, and a clearer daily dashboard because everything is scattered.',
      },
      {
        role: 'assistant',
        content:
          'Before I jump straight into package names, would you like me to show you the best-fit package and a simple first rollout plan?',
      },
      { role: 'user', content: 'Yes, show me the recommendation.' },
    ])

    expect(data.mode).toBe('recommendation')
    expect(data.recommendedPackage).toBe('mission-control')
    expect(data.plan.length).toBeGreaterThan(0)
  })

  it('uses the GPT-5.4 model-backed engine before the recommendation step when an API key exists', async () => {
    const originalKey = process.env.OPENAI_API_KEY
    const originalModel = process.env.CLIENT_CONSULTANT_MODEL
    const originalReasoning = process.env.CLIENT_CONSULTANT_REASONING
    const originalFetch = global.fetch
    process.env.OPENAI_API_KEY = 'test-key'
    delete process.env.CLIENT_CONSULTANT_MODEL
    delete process.env.CLIENT_CONSULTANT_REASONING

    const fetchMock = vi.fn(async (_url: string | URL | Request, _init?: RequestInit) => new Response(JSON.stringify({
      output_text: JSON.stringify({
        mode: 'discovery',
        reply: 'I hear the problem. I would first find the customer workflow that is costing you the most time, then shape LINK around that before talking package names.',
        recommendedPackage: 'growth',
        plan: [],
        nextQuestions: ['Where are customers getting stuck?', 'What do you want LINK to run first?'],
        suggestedSections: ['capabilities', 'impact'],
        recommendedActions: [],
        confidence: 'medium',
      }),
    }), { status: 200 }))
    global.fetch = fetchMock as unknown as typeof fetch

    try {
      const response = await POST(new NextRequest('http://localhost/api/client-offers/consult', {
        method: 'POST',
        body: JSON.stringify({
          messages: [
            { role: 'user', content: 'I run a service business and leads keep slipping through the cracks.' },
          ],
        }),
      }))
      const data = await response.json()
      const firstCall = fetchMock.mock.calls[0] as unknown as [unknown, RequestInit]
      const body = JSON.parse(String(firstCall[1]?.body))

      expect(data.source).toBe('openai')
      expect(data.model).toBe('gpt-5.4')
      expect(data.modelLabel).toBe('GPT-5.4 reasoning')
      expect(data.mode).toBe('discovery')
      expect(data.reply).toMatch(/customer workflow/i)
      expect(body.model).toBe('gpt-5.4')
      expect(body.reasoning).toEqual({ effort: 'medium' })
      expect(body.temperature).toBeUndefined()
      expect(body.input).toContain('Discovery replies should usually be 35-85 words')
      expect(body.input).toContain('If the visitor only says hello')
      expect(body.input).toContain('build and integrate trading strategies')
      expect(body.input).toContain('beautiful, fully customizable home base')
      expect(body.input).toContain('New features are actively being worked on')
      expect(body.input).not.toContain('paper-trading workflows')
      expect(body.input).not.toContain('Do not promise profits')
    } finally {
      global.fetch = originalFetch
      if (originalKey) process.env.OPENAI_API_KEY = originalKey
      else delete process.env.OPENAI_API_KEY
      if (originalModel) process.env.CLIENT_CONSULTANT_MODEL = originalModel
      else delete process.env.CLIENT_CONSULTANT_MODEL
      if (originalReasoning) process.env.CLIENT_CONSULTANT_REASONING = originalReasoning
      else delete process.env.CLIENT_CONSULTANT_REASONING
    }
  })
})
