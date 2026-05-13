import type { ClientPackage } from '@/lib/client-offers'

export type ClientHandoffMessage = {
  role: 'user' | 'assistant'
  content: string
}

export type ClientHandoffConsultation = {
  reply?: string
  plan?: string[]
  recommendedActions?: string[]
}

type BuildClientHandoffEmailBodyInput = {
  customerName: string
  messages: ClientHandoffMessage[]
  recommendedPackage: ClientPackage
  consultation?: ClientHandoffConsultation | null
}

type BuildClientHandoffMailtoInput = {
  email: string
  subject?: string
  body?: string
}

function compactText(value: string, maxLength = 420): string {
  const compacted = value.replace(/\s+/g, ' ').trim()
  if (compacted.length <= maxLength) return compacted
  return `${compacted.slice(0, maxLength - 1).trimEnd()}...`
}

function numberedList(items: string[] | undefined, fallback: string): string {
  const cleanItems = (items || []).map((item) => compactText(item, 320)).filter(Boolean)
  if (cleanItems.length === 0) return fallback
  return cleanItems.map((item, index) => `${index + 1}. ${item}`).join('\n')
}

function bulletList(items: string[] | undefined, fallback: string): string {
  const cleanItems = (items || []).map((item) => compactText(item, 320)).filter(Boolean)
  if (cleanItems.length === 0) return fallback
  return cleanItems.map((item) => `- ${item}`).join('\n')
}

export function buildClientHandoffEmailBody({
  customerName,
  messages,
  recommendedPackage,
  consultation,
}: BuildClientHandoffEmailBodyInput): string {
  const cleanName = compactText(customerName, 80) || 'there'
  const customerNotes = messages
    .filter((message) => message.role === 'user')
    .map((message) => compactText(message.content, 520))
    .filter(Boolean)
    .slice(-8)

  const notesText = customerNotes.length > 0
    ? customerNotes.map((note) => `- ${note}`).join('\n')
    : '- I am interested in learning how LINK could help my business.'

  const planText = numberedList(
    consultation?.plan,
    '1. Review my business needs.\n2. Decide the best first LINK workflow.\n3. Talk through next steps with Angelo.',
  )

  const actionsText = bulletList(
    consultation?.recommendedActions,
    '- Talk with Angelo about the best starting package and rollout.',
  )

  return [
    'Hello Angelo,',
    '',
    `My name is ${cleanName}. I just spoke with LINK on your client offers page, and I am interested in next steps.`,
    '',
    'Here is what I shared about my business and what I need help with:',
    notesText,
    '',
    `LINK recommended that I look at the ${recommendedPackage.name}.`,
    `Why it seems like a fit: ${compactText(recommendedPackage.promise, 520)}`,
    '',
    'The plan LINK helped shape for me:',
    planText,
    '',
    'The next moves that would help me most:',
    actionsText,
    '',
    'Please reach out when you can so we can talk through the best way to start.',
    '',
    `Thank you,\n${cleanName}`,
  ].join('\n')
}

export function buildClientHandoffMailtoHref({
  email,
  subject = 'LiNK Inquiry',
  body,
}: BuildClientHandoffMailtoInput): string {
  const params = new URLSearchParams()
  params.set('subject', subject)
  if (body?.trim()) params.set('body', body)
  return `mailto:${email}?${params.toString().replace(/\+/g, '%20')}`
}
