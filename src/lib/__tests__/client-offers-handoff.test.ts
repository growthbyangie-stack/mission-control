import { describe, expect, it } from 'vitest'
import { packageById } from '@/lib/client-offers'
import { buildClientHandoffEmailBody, buildClientHandoffMailtoHref } from '@/lib/client-offers-handoff'

describe('client offers handoff email', () => {
  it('builds a customer-written summary for Angelo', () => {
    const body = buildClientHandoffEmailBody({
      customerName: 'Taylor Smith',
      recommendedPackage: packageById('mission-control'),
      messages: [
        {
          role: 'user',
          content: 'I run a coaching business and need help with CRM follow-up, video lessons, social media, and a better daily dashboard.',
        },
        {
          role: 'assistant',
          content: 'LINK can shape that into a custom system.',
        },
        {
          role: 'user',
          content: 'I also want the system to keep improving because my workflow will grow over time.',
        },
      ],
      consultation: {
        plan: ['Map the homepage and CRM follow-up first.', 'Add video notes and social media workflow.', 'Keep upgrading the system over time.'],
        recommendedActions: ['Schedule a next-step call.', 'Review the first workflow to launch.'],
      },
    })

    expect(body).toContain('Hello Angelo,')
    expect(body).toContain('My name is Taylor Smith')
    expect(body).toContain('I run a coaching business')
    expect(body).toContain('Full Mission Control Build')
    expect(body).toContain('Map the homepage and CRM follow-up first.')
    expect(body).toContain('Schedule a next-step call.')
    expect(body.endsWith('Thank you,\nTaylor Smith')).toBe(true)
  })

  it('creates a mailto link with the inquiry subject and encoded body', () => {
    const href = buildClientHandoffMailtoHref({
      email: 'angelo@angiegrowth.com',
      body: 'Hello Angelo,\nMy name is Taylor.',
    })

    expect(href).toContain('mailto:angelo@angiegrowth.com')
    expect(href).toContain('subject=LiNK%20Inquiry')
    expect(href).toContain('body=Hello%20Angelo%2C%0AMy%20name%20is%20Taylor.')
  })
})
