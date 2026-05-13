import { NextRequest, NextResponse } from 'next/server'
import {
  CLIENT_CAPABILITIES,
  CLIENT_IMPACT_METRICS,
  CLIENT_OFFER_PILLARS,
  CLIENT_OPERATING_LANES,
  CLIENT_PACKAGES,
  CLIENT_SITE_NAVIGATION,
  CLIENT_SHOWCASE_FEATURES,
  packageById,
  recommendPackageFromText,
} from '@/lib/client-offers'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type ConsultMessage = {
  role: 'user' | 'assistant'
  content: string
}

type ConsultationMode = 'discovery' | 'ready-to-recommend' | 'recommendation'

type ConsultantPayload = {
  mode: ConsultationMode
  reply: string
  recommendedPackage: string
  plan: string[]
  nextQuestions: string[]
  suggestedSections: string[]
  recommendedActions: string[]
  confidence: 'early' | 'medium' | 'strong'
  model?: string
  modelLabel?: string
}

const RECOMMENDATION_PERMISSION_PHRASE = 'show you the best-fit package'
const DEFAULT_CONSULTANT_MODEL = 'gpt-5.4'
const DEFAULT_REASONING_EFFORT = 'medium'
const DEFAULT_CONSULTANT_TIMEOUT_MS = 30000
const FALLBACK_CONSULTANT_MODELS = ['gpt-4.1-mini']

const NAVIGATION_IDS = new Set(CLIENT_SITE_NAVIGATION.map((section) => section.id))

function cleanText(value: unknown, limit = 1200): string {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, limit)
}

function uniqueList(values: string[]): string[] {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)))
}

function getConsultantModels(): string[] {
  const configured = uniqueList((process.env.CLIENT_CONSULTANT_MODEL || DEFAULT_CONSULTANT_MODEL).split(','))
  return uniqueList([...configured, ...FALLBACK_CONSULTANT_MODELS])
}

function modelLabel(model: string): string {
  if (/^gpt-5\.4$/i.test(model)) return 'GPT-5.4 reasoning'
  return model.replace(/^gpt-/i, 'GPT-')
}

function supportsReasoning(model: string): boolean {
  return /^gpt-5/i.test(model)
}

function consultantTimeoutMs(): number {
  const configured = Number(process.env.CLIENT_CONSULTANT_TIMEOUT_MS)
  return Number.isFinite(configured) && configured > 0 ? configured : DEFAULT_CONSULTANT_TIMEOUT_MS
}

function normalizeMessages(value: unknown): ConsultMessage[] {
  if (!Array.isArray(value)) return []
  return value
    .map((message): ConsultMessage | null => {
      if (!message || typeof message !== 'object') return null
      const record = message as Record<string, unknown>
      const role = record.role === 'assistant' ? 'assistant' : record.role === 'user' ? 'user' : null
      const content = cleanText(record.content, 1600)
      return role && content ? { role, content } : null
    })
    .filter((message): message is ConsultMessage => Boolean(message))
    .slice(-10)
}

function fallbackConsultation(messages: ConsultMessage[]): ConsultantPayload {
  const combined = messages.filter((message) => message.role === 'user').map((message) => message.content).join(' ')
  const recommended = recommendPackageFromText(combined)
  const needs = detectNeeds(combined)
  const mode = determineConsultationMode(messages, needs)

  if (mode !== 'recommendation') {
    return conversationPayload(mode, recommended.id, needs, messages)
  }

  return {
    mode,
    reply: fallbackReplyForPackage(recommended.id, needs),
    recommendedPackage: recommended.id,
    plan: defaultPlanForPackage(recommended.id),
    suggestedSections: defaultSectionsForPackage(recommended.id),
    recommendedActions: defaultActionsForPackage(recommended.id),
    nextQuestions: [
      'What part of the business burns the most time each week?',
      'Are you trying to win more customers, create more content, run a team, or organize your own daily work?',
      'Do you want a fast pilot first or a full command center from the start?',
    ],
    confidence: combined.length > 220 ? 'medium' : 'early',
  }
}

function detectNeeds(text: string): string[] {
  const normalized = text.toLowerCase()
  const needs: string[] = []
  if (/\b(lead|customer|follow[- ]?up|dm|message|call|form|reply|pipeline|outreach)\b/.test(normalized)) needs.push('autonomous customer follow-up')
  if (/\b(crm|pipeline|contacts?|sales board|deal|prospect)\b/.test(normalized)) needs.push('autonomous CRM')
  if (/\b(website|web site|landing page|site build|web development|website development)\b/.test(normalized)) needs.push('website development')
  if (/\b(voice|voice control|talk to link|talking to link|microphone|speak|speech)\b/.test(normalized)) needs.push('voice control')
  if (/\b(social|instagram|facebook|tiktok|content calendar|post|caption|reel|publish|publishing)\b/.test(normalized)) needs.push('autonomous social media')
  if (/\b(video|edit|clip|caption|footage|cutdown)\b/.test(normalized)) needs.push('video editing')
  if (/\b(vlog|vlogging|daily content|story)\b/.test(normalized)) needs.push('auto vlogging')
  if (/\b(trading|trade|market|watchlist|paper[- ]?trading|portfolio|broker)\b/.test(normalized)) needs.push('autonomous trading workflows')
  if (/\b(lesson|course|learning center|quiz|teach|training)\b/.test(normalized)) needs.push('The Learning Center')
  if (/\b(log|logging|memory|notes|record)\b/.test(normalized)) needs.push('auto logging')
  if (/\b(homepage|home page|homebase|home base|dashboard|operations|workflow|team|command center|custom)\b/.test(normalized)) needs.push('a beautiful custom homepage')
  if (/\b(upgrade|new features?|feature releases?|continual|keep improving|build on|expand over time)\b/.test(normalized)) needs.push('continual upgrades')
  return Array.from(new Set(needs)).slice(0, 6)
}

function latestUserMessage(messages: ConsultMessage[]): string {
  return [...messages].reverse().find((message) => message.role === 'user')?.content || ''
}

function userWordCount(messages: ConsultMessage[]): number {
  return messages
    .filter((message) => message.role === 'user')
    .flatMap((message) => message.content.split(/\s+/).filter(Boolean))
    .length
}

function wantsRecommendation(text: string): boolean {
  return /\b(recommend|recommendation|package|price|pricing|plan|proposal|quote|which one|best fit|best[- ]?fit|show me|what should i choose)\b/i.test(text)
}

function acceptsRecommendationOffer(messages: ConsultMessage[]): boolean {
  const latest = latestUserMessage(messages).toLowerCase()
  const priorAssistant = [...messages].reverse().slice(1).find((message) => message.role === 'assistant')?.content.toLowerCase() || ''
  const accepted = /\b(yes|yeah|yep|sure|ok|okay|show|send|let's do it|go ahead|recommend|package|plan)\b/.test(latest)
  return accepted && priorAssistant.includes(RECOMMENDATION_PERMISSION_PHRASE)
}

function hasEnoughContext(messages: ConsultMessage[], needs: string[]): boolean {
  const words = userWordCount(messages)
  const userTurns = messages.filter((message) => message.role === 'user').length
  return needs.length >= 3 || words >= 42 || (userTurns >= 2 && needs.length >= 2)
}

function determineConsultationMode(messages: ConsultMessage[], needs: string[]): ConsultationMode {
  if (acceptsRecommendationOffer(messages)) return 'recommendation'

  const latest = latestUserMessage(messages)
  if (wantsRecommendation(latest) && hasEnoughContext(messages, needs) && messages.some((message) => message.role === 'assistant' && message.content.toLowerCase().includes(RECOMMENDATION_PERMISSION_PHRASE))) {
    return 'recommendation'
  }

  if (hasEnoughContext(messages, needs)) return 'ready-to-recommend'

  return 'discovery'
}

function conversationPayload(mode: Exclude<ConsultationMode, 'recommendation'>, packageId: string, needs: string[], messages: ConsultMessage[]): ConsultantPayload {
  const needText = needs.length > 0 ? needs.join(', ') : 'your business goals'
  const hasAnyNeed = needs.length > 0
  const recommended = packageById(packageId)
  const reply = mode === 'ready-to-recommend'
    ? [
        `That helps. I’d shape this around ${needText}.`,
        `Want me to ${RECOMMENDATION_PERMISSION_PHRASE} and a simple first rollout plan?`,
      ].join('\n\n')
    : [
        hasAnyNeed
          ? `That makes sense. I’m hearing ${needText}.`
          : 'Hey, I’m with you.',
        'What are you trying to improve first: customers, content, trading workflows, or the whole business system?',
      ].join('\n\n')

  return {
    mode,
    reply,
    recommendedPackage: recommended.id,
    plan: [],
    suggestedSections: mode === 'ready-to-recommend' ? ['capabilities', 'packages', 'consult'] : ['capabilities', 'packages', 'safety'],
    recommendedActions: [],
    nextQuestions: mode === 'ready-to-recommend'
      ? [
          'Yes, show me the best-fit package and rollout plan.',
          'Ask me one more question first.',
          'Show me examples before the package.',
        ]
      : [
          'What business do you run and who are your customers?',
          'Where are you losing the most time each week?',
          'What would you want LINK to handle first?',
        ],
    confidence: mode === 'ready-to-recommend' || userWordCount(messages) > 28 ? 'medium' : 'early',
  }
}

function fallbackReplyForPackage(packageId: string, needs: string[]): string {
  const recommended = packageById(packageId)
  const needText = needs.length > 0 ? needs.join(', ') : 'the problem you described'
  const alternative = packageId === 'mission-control'
    ? 'If you want to start smaller, we can turn one problem into a pilot first.'
    : 'If this grows into several connected parts of the business, the Full Mission Control Build is the natural next step.'

  return [
    `I’d start with ${recommended.name}. Based on ${needText}, the first build should focus on the work LINK can run right away, then measure whether it saves time and captures more opportunity.`,
    `${recommended.promise} ${alternative}`,
    'From there, compare examples and pick one pilot workflow to prove first.',
  ].join('\n\n')
}

function defaultPlanForPackage(packageId: string): string[] {
  const recommended = packageById(packageId)
  return [
    'Map the work LINK should run and what the custom homepage needs to show first.',
    `Start with ${recommended.name} so the first autonomous workflow proves value before expanding.`,
    'Teach LINK the real answers, rules, risk limits, examples, customer context, posting style, and handoff points for this business.',
    'Keep improving the system as new features are released and the workflow grows.',
  ]
}

function defaultSectionsForPackage(packageId: string): string[] {
  if (packageId === 'creator') return ['capabilities', 'packages', 'consult']
  if (packageId === 'starter') return ['capabilities', 'packages', 'consult']
  if (packageId === 'growth') return ['capabilities', 'packages', 'consult']
  if (packageId === 'partnership') return ['packages', 'safety', 'consult']
  return ['capabilities', 'packages', 'safety', 'consult']
}

function defaultActionsForPackage(packageId: string): string[] {
  const recommended = packageById(packageId)
  return [
    `Compare ${recommended.name} against one smaller starting option.`,
    'Pick the first business problem that would save the most time in the first 14 days.',
    'Turn that problem into a pilot with clear before-and-after measurements.',
  ]
}

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { ...init, signal: controller.signal })
  } finally {
    clearTimeout(timeout)
  }
}

function parseConsultation(raw: string, fallback: ConsultantPayload): ConsultantPayload {
  try {
    const parsed = JSON.parse(extractJsonPayload(raw)) as Partial<ConsultantPayload>
    const mode = fallback.mode === 'recommendation' ? 'recommendation' : fallback.mode
    const parsedRecommended = packageById(parsed.recommendedPackage).id
    const shouldUseFallbackRecommendation = fallback.recommendedPackage === 'mission-control' && parsedRecommended !== 'mission-control' && parsedRecommended !== 'partnership'
    const recommended = shouldUseFallbackRecommendation ? fallback.recommendedPackage : parsedRecommended
    const fallbackPlan = fallback.recommendedPackage === recommended
      ? fallback.plan
      : defaultPlanForPackage(recommended)
    const parsedPlan = Array.isArray(parsed.plan)
      ? parsed.plan.map((item) => cleanText(item, 220)).filter(Boolean).slice(0, 5)
      : []
    const suggestedSections = Array.isArray(parsed.suggestedSections)
      ? parsed.suggestedSections.map((item) => cleanText(item, 32)).filter((item) => NAVIGATION_IDS.has(item)).slice(0, 4)
      : []
    const recommendedActions = Array.isArray(parsed.recommendedActions)
      ? parsed.recommendedActions.map((item) => cleanText(item, 220)).filter(Boolean).slice(0, 4)
      : []
    const reply = shouldUseFallbackRecommendation
      ? fallback.reply
      : humanizePackageIds(cleanText(parsed.reply, 2200) || fallback.reply)
    return {
      mode,
      reply,
      recommendedPackage: recommended,
      plan: mode === 'recommendation' ? shouldUseFallbackRecommendation ? fallbackPlan : parsedPlan.length > 0 ? parsedPlan : fallbackPlan : [],
      nextQuestions: Array.isArray(parsed.nextQuestions) ? parsed.nextQuestions.map((item) => cleanText(item, 180)).filter(Boolean).slice(0, 4) : fallback.nextQuestions,
      suggestedSections: suggestedSections.length > 0 ? suggestedSections : defaultSectionsForPackage(recommended),
      recommendedActions: mode === 'recommendation' ? recommendedActions.length > 0 ? recommendedActions : defaultActionsForPackage(recommended) : [],
      confidence: parsed.confidence === 'strong' || parsed.confidence === 'medium' || parsed.confidence === 'early' ? parsed.confidence : fallback.confidence,
    }
  } catch {
    return fallback
  }
}

function humanizePackageIds(reply: string): string {
  return reply.replace(/\bmission-control\b/gi, packageById('mission-control').name)
}

function extractJsonPayload(raw: string): string {
  const trimmed = raw.trim()
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) return trimmed
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)
  if (fenced?.[1]) return fenced[1].trim()
  const objectMatch = trimmed.match(/\{[\s\S]*\}/)
  return objectMatch ? objectMatch[0] : trimmed
}

function consultationPrompt(messages: ConsultMessage[]): string {
  const combinedUserText = messages.filter((message) => message.role === 'user').map((message) => message.content).join(' ')
  const needs = detectNeeds(combinedUserText)
  const conversationMode = determineConsultationMode(messages, needs)
  const packages = CLIENT_PACKAGES.map((pkg) => ({
    id: pkg.id,
    name: pkg.name,
    bestFor: pkg.bestFor,
    promise: pkg.promise,
    outcomes: pkg.outcomes,
    timeline: pkg.timeline,
  }))
  return JSON.stringify({
    role: 'LINK customer package guide',
    conversationMode,
    detectedNeeds: needs,
    instructions: [
      'You are LINK, a polished, practical sales consultant for Angelo\'s LINK business systems.',
      'Assume the visitor knows nothing about AI. Explain LINK in plain customer language: what problem it solves, what the customer sees, and why it saves time or captures opportunity.',
      'Do not use internal terms like model, token, pipeline, orchestration, or command layer. Say LINK runs the workflow, autonomous workspace, dashboard, notes, follow-up, rules, and owner control instead.',
      'Talk like a sharp human consultant: warm, direct, conversational, and helpful. Do not sound like a form, a generic chatbot, or a keyword matcher.',
      'Use first person naturally. Say "I would..." or "Here is how I would think about it..." when that feels human.',
      'Reason from the visitor\'s details. Reflect their situation in normal language instead of repeating a list of detected keywords.',
      'If the visitor only says hello, hey, hi, or gives almost no detail, reply like a person in one or two short sentences and ask what they are trying to improve first. Do not pitch the whole product.',
      'Only recommend a package when conversationMode is recommendation. If conversationMode is discovery, acknowledge what they said, give one useful insight, and ask one pointed question. If conversationMode is ready-to-recommend, briefly summarize what you heard and ask if they would like you to show the best-fit package and rollout plan.',
      'Lead with autonomous operation as the main value: LINK can run CRM follow-up, customer outreach, social media workflows, content/media workflows, trading workflows, auto vlogging, auto logging, The Learning Center, owner dashboards, rollout plans, and estimated time saved.',
      'Package rule: the Starter Response System can include basic website development. Growth, Creator, Full Mission Control, and Automation Partnership can include voice control. Do not present voice control as part of Starter unless Angelo changes the package.',
      'Explain that the homepage setup is a selling point: the customer gets a beautiful, fully customizable home base tailored to their exact priorities, offers, customers, content, trading workflows, and daily needs.',
      'Explain that LINK systems are not one-and-done. New features are actively being worked on and can be released into the customer workflow over time, so there is always room to build on the current setup.',
      'You know the site sections. When useful, guide visitors to the right section using suggestedSections ids from the siteNavigation list.',
      'When conversationMode is recommendation, recommend one package by id only: starter, growth, creator, mission-control, or partnership.',
      'Use the package name in the reply. Never say raw package ids like mission-control to the customer.',
      'Explain why that package fits, name one smaller/larger alternative when helpful, and keep the recommendation practical.',
      'Produce a useful plan from the customer needs. Mention trust and owner control as the rule system that makes autonomy usable, not as the main feature pitch.',
      'For trading requests, say LINK can help build and integrate trading strategies, monitor markets and watchlists, check rules, run approved trading workflows autonomously, support real-money execution through connected brokerage permissions, and keep trade journals. Keep it confident and operator-like while keeping account, authorization, and risk boundaries clear.',
      'For media requests, describe video analysis, clip notes, edit plans, vlog outlines, caption creation, post creation, publishing workflows, and content logs.',
      'When explaining why this works, use simple cause-and-effect: autonomous follow-up means fewer warm leads go cold; autonomous social workflows mean content keeps shipping; autonomous logs mean the owner sees what happened.',
      'Be concise by default. Discovery replies should usually be 35-85 words. Ready-to-recommend replies should usually be 35-75 words. Recommendation replies should usually be 85-150 words unless the visitor asks for more detail.',
      'Use one relaxed paragraph for normal replies. Avoid long bullet dumps in the reply field.',
      'nextQuestions should feel like helpful quick replies a human prospect could tap. Use short, natural phrases.',
      'Return strict JSON only with keys: mode, reply, recommendedPackage, plan, nextQuestions, suggestedSections, recommendedActions, confidence.',
    ],
    responseContract: {
      mode: conversationMode,
      reply: 'Natural customer-facing answer. No markdown tables. No internal AI wording.',
      recommendedPackage: 'starter | growth | creator | mission-control | partnership',
      plan: 'Only include rollout steps when conversationMode is recommendation. Otherwise use an empty array.',
      nextQuestions: 'Two to four natural quick replies.',
      suggestedSections: 'Zero to four section ids from siteNavigation.',
      recommendedActions: 'Only include when conversationMode is recommendation. Otherwise use an empty array.',
      confidence: 'early | medium | strong',
    },
    packages,
    offerPillars: CLIENT_OFFER_PILLARS,
    showcaseFeatures: CLIENT_SHOWCASE_FEATURES,
    capabilities: CLIENT_CAPABILITIES,
    impactMetrics: CLIENT_IMPACT_METRICS,
    operatingLanes: CLIENT_OPERATING_LANES,
    siteNavigation: CLIENT_SITE_NAVIGATION,
    conversation: messages,
  })
}

function responsesRequestBody(model: string, messages: ConsultMessage[]): Record<string, unknown> {
  const body: Record<string, unknown> = {
    model,
    input: consultationPrompt(messages),
    max_output_tokens: 1300,
  }

  if (supportsReasoning(model)) {
    body.reasoning = {
      effort: process.env.CLIENT_CONSULTANT_REASONING || DEFAULT_REASONING_EFFORT,
    }
  } else {
    body.temperature = 0.52
  }

  return body
}

function extractResponseText(data: any): string {
  return cleanText(
    data.output_text ||
      data.output
        ?.flatMap((item: any) => item.content || [])
        .map((content: any) => content.text || '')
        .join('\n'),
    4000,
  )
}

async function modelBackedConsultation(messages: ConsultMessage[], fallback: ConsultantPayload, apiKey: string): Promise<ConsultantPayload & { source: string; upstreamStatus?: number }> {
  let upstreamStatus: number | undefined

  for (const model of getConsultantModels()) {
    const upstream = await fetchWithTimeout('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(responsesRequestBody(model, messages)),
    }, consultantTimeoutMs())

    upstreamStatus = upstream.status
    if (!upstream.ok) continue

    const data = await upstream.json().catch(() => ({}))
    const text = extractResponseText(data)
    return {
      ...parseConsultation(text, fallback),
      source: 'openai',
      model,
      modelLabel: modelLabel(model),
    }
  }

  return {
    ...fallback,
    source: 'fallback',
    model: 'guided-fallback',
    modelLabel: 'Guided fallback',
    upstreamStatus,
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  const messages = normalizeMessages(body?.messages)

  if (messages.length === 0) {
    return NextResponse.json({ error: 'At least one message is required.' }, { status: 400 })
  }

  const fallback = fallbackConsultation(messages)
  const apiKey = process.env.OPENAI_API_KEY?.trim()
  if (!apiKey) {
    return NextResponse.json({
      ...fallback,
      source: 'guided',
      model: 'guided-fallback',
      modelLabel: 'Guided fallback',
    })
  }

  try {
    return NextResponse.json(await modelBackedConsultation(messages, fallback, apiKey))
  } catch {
    return NextResponse.json({
      ...fallback,
      source: 'fallback',
      model: 'guided-fallback',
      modelLabel: 'Guided fallback',
    })
  }
}
