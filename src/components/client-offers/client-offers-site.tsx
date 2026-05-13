'use client'

import { CSSProperties, FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { LinkLogoMark } from '@/components/ui/link-logo-mark'
import { buildClientHandoffEmailBody, buildClientHandoffMailtoHref } from '@/lib/client-offers-handoff'
import {
  CLIENT_CAPABILITIES,
  CLIENT_HERO_SIGNALS,
  CLIENT_IMPACT_METRICS,
  CLIENT_OFFER_PILLARS,
  CLIENT_OPERATING_LANES,
  CLIENT_PACKAGES,
  CLIENT_PRESENTATION_VISUALS,
  CLIENT_SAFETY_POINTS,
  CLIENT_SITE_NAVIGATION,
  CLIENT_SHOWCASE_FEATURES,
  packageById,
} from '@/lib/client-offers'

type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

type Consultation = {
  mode?: 'discovery' | 'ready-to-recommend' | 'recommendation'
  reply: string
  recommendedPackage: string
  plan: string[]
  nextQuestions: string[]
  suggestedSections?: string[]
  recommendedActions?: string[]
  confidence: 'early' | 'medium' | 'strong'
  source?: string
  model?: string
  modelLabel?: string
}

const STARTER_MESSAGES: ChatMessage[] = [
  {
    role: 'assistant',
    content:
      'Hey, I’m LINK. What are you trying to improve first: customers, content, trading workflows, or the whole business system?',
  },
]

const HERO_METRICS = [
  { label: 'Homepage', value: 'Beautiful custom setup' },
  { label: 'Workflows', value: 'Built around your needs' },
  { label: 'Upgrades', value: 'New features keep adding on' },
]

const CONTACT_EMAIL = 'angelo@angiegrowth.com'
const CONTACT_MAILTO_HREF = buildClientHandoffMailtoHref({ email: CONTACT_EMAIL })
const DEMO_VIDEO_ID = '1wHR94m-xhxkFBFoXwd578QRCvbKfmahK'
const DEMO_VIDEO_VIEW_URL = `https://drive.google.com/file/d/${DEMO_VIDEO_ID}/view?usp=sharing`
const DEMO_VIDEO_PREVIEW_URL = `https://drive.google.com/file/d/${DEMO_VIDEO_ID}/preview`

const CONSULT_PROMPTS = [
  {
    label: 'Help me choose',
    text: 'I am new to this. Ask me simple questions and help me choose the best LINK package for my business.',
  },
  {
    label: 'Autonomous trading',
    text: 'I need LINK to build, integrate, and run autonomous trading strategies with market monitoring, watchlists, risk rules, real-money execution support, and trade journals.',
  },
  {
    label: 'Video studio',
    text: 'I need help turning raw videos into notes, clip ideas, captions, and edit instructions.',
  },
  {
    label: 'Auto vlogging',
    text: 'I want LINK to run auto vlogging and turn daily activity, notes, and raw media into vlog outlines, posts, and captions.',
  },
  {
    label: 'Lead recovery',
    text: 'I miss calls, texts, and DMs. I need LINK to reply, follow up, and keep leads from falling through.',
  },
  {
    label: 'CRM setup',
    text: 'I need LINK to run my CRM, organize customers, follow up, update records, and show me who needs attention next.',
  },
  {
    label: 'Social media',
    text: 'I need LINK to run my social media by creating posts, captions, schedules, and content logs from my ideas and videos.',
  },
  {
    label: 'Learning Center',
    text: 'I need a creator package with The Learning Center, video lessons, quizzes, study notes, and content planning.',
  },
]

function IconMark({ label, tone = 'gold' }: { label: string; tone?: 'gold' | 'cyan' | 'green' | 'white' }) {
  const toneClass = {
    gold: 'border-amber-200/30 bg-amber-200/15 text-amber-100',
    cyan: 'border-cyan-200/30 bg-cyan-200/15 text-cyan-100',
    green: 'border-emerald-200/30 bg-emerald-200/15 text-emerald-100',
    white: 'border-white/15 bg-white/10 text-white',
  }[tone]
  return (
    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border text-[11px] font-black shadow-[inset_0_1px_0_rgba(255,255,255,0.22)] ${toneClass}`}>
      {label}
    </span>
  )
}

function packageTone(id: string): string {
  if (id === 'growth') return 'border-amber-300/50 bg-[#17140e]'
  if (id === 'creator') return 'border-rose-200/45 bg-[#171014]'
  if (id === 'mission-control') return 'border-cyan-300/45 bg-[#0d151a]'
  if (id === 'partnership') return 'border-emerald-300/45 bg-[#0e1712]'
  return 'border-white/[0.15] bg-[#111318]'
}

function accentTone(accent: string): { text: string; border: string; glow: string; icon: 'gold' | 'cyan' | 'green' } {
  if (accent === 'cyan') {
    return {
      text: 'text-cyan-100',
      border: 'border-cyan-200/30',
      glow: 'shadow-[0_24px_90px_rgba(34,211,238,0.18)]',
      icon: 'cyan',
    }
  }
  if (accent === 'emerald') {
    return {
      text: 'text-emerald-100',
      border: 'border-emerald-200/30',
      glow: 'shadow-[0_24px_90px_rgba(52,211,153,0.16)]',
      icon: 'green',
    }
  }
  return {
    text: 'text-amber-100',
    border: 'border-amber-200/30',
    glow: 'shadow-[0_24px_90px_rgba(245,190,70,0.18)]',
    icon: 'gold',
  }
}

function SectionIntro({
  eyebrow,
  title,
  body,
  center = false,
}: {
  eyebrow: string
  title: string
  body: string
  center?: boolean
}) {
  return (
    <div className={`min-w-0 ${center ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'}`}>
      <div className="text-xs font-black uppercase tracking-[0.24em] text-amber-700/70">{eyebrow}</div>
      <h2 className="mt-3 text-3xl font-black leading-[1.04] text-[#111318] sm:text-5xl">{title}</h2>
      <p className="mt-4 text-base leading-7 text-[#5e626d] sm:text-lg sm:leading-8">{body}</p>
    </div>
  )
}

function TypingDots() {
  return (
    <div className="flex w-fit items-center gap-1.5 rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3" role="status" aria-label="LINK is typing">
      <span className="sr-only">LINK is typing</span>
      <span className="h-2 w-2 animate-bounce rounded-full bg-white/45 [animation-delay:-0.22s]" />
      <span className="h-2 w-2 animate-bounce rounded-full bg-white/45 [animation-delay:-0.11s]" />
      <span className="h-2 w-2 animate-bounce rounded-full bg-white/45" />
    </div>
  )
}

function ProductTheater() {
  return (
    <div className="client-offers-product-stage mx-auto mt-8 hidden w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/[0.18] bg-[#080a0f]/[0.82] p-3 shadow-[0_34px_120px_rgba(0,0,0,0.46)] backdrop-blur-2xl md:block lg:mt-10 lg:rounded-[2.4rem] lg:p-4">
      <div className="overflow-hidden rounded-[1.45rem] border border-white/10 bg-[#0d111a]">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 text-xs text-white/50">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-red-300/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-300/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-300/80" />
          </div>
          <span className="hidden font-semibold sm:inline">LINK custom homepage preview</span>
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-emerald-200/80">Ready view</span>
        </div>

        <div className="grid gap-px bg-white/10 lg:grid-cols-[0.75fr_1.25fr_0.78fr]">
          <div className="bg-[#111723] p-4">
            <div className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40">Today</div>
            <div className="mt-4 space-y-3">
              {['Homepage tailored', 'CRM follow-up running', 'Trading strategy live', 'Content workflow active'].map((item, index) => (
                <div key={item} className="client-offers-row-glow rounded-2xl border border-white/10 bg-white/[0.055] p-3" style={{ '--delay': `${index * 140}ms` } as CSSProperties}>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-bold text-white">{item}</span>
                    <span className="rounded-full bg-emerald-300/[0.12] px-2 py-1 text-[10px] font-black text-emerald-100">LIVE</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div className="client-offers-progress h-full rounded-full bg-gradient-to-r from-amber-200 via-cyan-200 to-emerald-200" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative min-h-[24rem] overflow-hidden bg-[#05070d] sm:min-h-[28rem]">
            <Image
              src="/site-visuals/link-home-screen-showcase.jpeg"
              alt="LINK custom homepage interface"
              fill
              sizes="(min-width: 1024px) 46vw, 100vw"
              className="client-offers-visual-drift object-cover object-[center_12%] opacity-95"
              priority
              unoptimized
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,5,9,0.02),rgba(3,5,9,0.76)),radial-gradient(circle_at_50%_16%,rgba(255,214,122,0.18),transparent_34%)]" />
            <div className="absolute inset-x-4 bottom-4 grid gap-3 sm:grid-cols-3">
              {HERO_METRICS.map((metric) => (
                <div key={metric.label} className="rounded-2xl border border-white/[0.12] bg-black/[0.42] p-3 backdrop-blur-xl">
                  <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/[0.42]">{metric.label}</div>
                  <div className="mt-1 text-sm font-black leading-5 text-white">{metric.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#f5f3ed] p-4 text-[#15171c]">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-black">
                <Image src="/brand/link-robot-icon-128.png" alt="LINK" width={44} height={44} className="h-full w-full object-cover" />
              </span>
              <div>
                <div className="text-sm font-black">LINK</div>
                <div className="text-xs font-semibold text-[#77736a]">Custom system ready</div>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {['Design custom homepage', 'Choose best package', 'Launch tailored workflow', 'Keep upgrading'].map((item, index) => (
                <div key={item} className="rounded-2xl bg-white p-3 shadow-[0_12px_30px_rgba(18,18,20,0.08)]">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#111318] text-[11px] font-black text-amber-100">{index + 1}</span>
                    <span className="text-sm font-black">{item}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function AutonomousOperatorSection() {
  const lanes = [
    {
      label: 'Customer growth',
      title: 'LINK runs the follow-up.',
      detail: 'It answers common questions, checks back with warm leads, updates the CRM, and shows who needs attention next.',
      result: 'Faster replies, fewer dropped leads, cleaner customer records.',
      steps: ['Reply', 'Follow up', 'Log result'],
    },
    {
      label: 'Content engine',
      title: 'LINK runs the social workflow.',
      detail: 'It turns videos, notes, links, and customer questions into posts, captions, schedules, publishing queues, and content logs.',
      result: 'More content shipped without rebuilding the plan every day.',
      steps: ['Create', 'Schedule', 'Publish/log'],
    },
    {
      label: 'Trading workflow',
      title: 'LINK runs trading strategies like an operator.',
      detail: 'It can monitor watchlists, help build and integrate strategies, execute approved trading workflows, track risk limits, and log every move.',
      result: 'A trading operator that can run strategies autonomously inside owner-defined rules.',
      steps: ['Monitor', 'Execute', 'Journal'],
    },
  ]

  return (
    <section className="hidden">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-[0.76fr_1.24fr] lg:items-end">
          <div className="min-w-0">
            <div className="text-xs font-black uppercase tracking-[0.24em] text-amber-100/70">The big idea</div>
            <h2 className="mt-3 text-3xl font-black leading-[1.04] sm:text-5xl">LINK does the repeatable work, not just the planning.</h2>
            <p className="mt-4 max-w-2xl text-base leading-8 text-white/[0.62]">
              Every build is custom to the customer. LINK is shaped around their offers, customers, trading rules, content style, dashboards, and daily workflow.
            </p>
          </div>
          <div className="rounded-[1.65rem] border border-white/10 bg-white/[0.06] p-5">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">What customers understand</div>
            <div className="mt-3 text-2xl font-black leading-8">“I can buy a beautiful custom system that keeps getting better.”</div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {lanes.map((lane, index) => (
            <article key={lane.title} className="client-offers-reveal rounded-[1.65rem] border border-white/10 bg-white/[0.055] p-5" style={{ '--delay': `${index * 90}ms` } as CSSProperties}>
              <div className="flex items-center justify-between gap-4">
                <span className="rounded-full border border-amber-100/20 bg-amber-100/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-amber-100/80">
                  {lane.label}
                </span>
                <span className="text-xs font-black text-white/38">0{index + 1}</span>
              </div>
              <h3 className="mt-5 text-2xl font-black leading-7">{lane.title}</h3>
              <p className="mt-3 text-sm leading-6 text-white/62">{lane.detail}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {lane.steps.map((step) => (
                  <span key={step} className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-xs font-black text-white/66">
                    {step}
                  </span>
                ))}
              </div>
              <div className="mt-5 border-t border-white/10 pt-4 text-sm font-black leading-6 text-white/84">{lane.result}</div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function DemoVideoSection() {
  return (
    <section id="demo" className="order-[45] overflow-hidden bg-[#07080c] px-4 py-12 text-white sm:order-[18] sm:px-8 sm:py-16">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.86fr_1.14fr] lg:items-center">
        <div className="min-w-0">
          <div className="text-xs font-black uppercase tracking-[0.24em] text-amber-100/70">Live walkthrough</div>
          <h2 className="mt-3 max-w-2xl text-3xl font-black leading-[1.02] sm:text-5xl">
            Watch the 11-minute LINK demonstration.
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-8 text-white/[0.64]">
            See the newest LINK workspace in motion: the custom homepage, autonomous messaging, video workflow, social media tools, Learning Center, CRM follow-up, trading workflows, and the upgrade path for new features.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {['Homepage', 'Messages', 'Video studio', 'CRM', 'Trading'].map((item) => (
              <span key={item} className="rounded-full border border-white/10 bg-white/[0.065] px-3 py-1.5 text-xs font-black text-white/[0.66]">
                {item}
              </span>
            ))}
          </div>
          <a
            href={DEMO_VIDEO_VIEW_URL}
            target="_blank"
            rel="noreferrer"
            className="link-tap mt-7 inline-flex h-12 w-full items-center justify-center rounded-full bg-white px-6 text-sm font-black text-black shadow-[0_22px_70px_rgba(255,255,255,0.14)] transition hover:bg-amber-100 sm:w-auto"
          >
            Open full demo
          </a>
        </div>

        <div className="min-w-0 rounded-[2rem] border border-white/[0.13] bg-white/[0.065] p-3 shadow-[0_30px_110px_rgba(0,0,0,0.44)] backdrop-blur-2xl sm:p-4">
          <div className="overflow-hidden rounded-[1.55rem] border border-white/10 bg-black">
            <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-white/[0.055] px-4 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-amber-100/20 bg-black">
                  <Image src="/brand/link-robot-icon-128.png" alt="LINK" width={36} height={36} className="h-full w-full object-cover" />
                </span>
                <div className="min-w-0">
                  <LinkLogoMark compact className="client-offers-chat-logo" />
                  <div className="truncate text-[11px] font-bold uppercase tracking-[0.16em] text-white/42">Full system walkthrough</div>
                </div>
              </div>
              <span className="shrink-0 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-2.5 py-1 text-[11px] font-black text-emerald-100">
                10:59
              </span>
            </div>
            <div className="relative mx-auto aspect-[9/16] max-h-[78svh] w-full overflow-hidden bg-[#03050a]">
              <iframe
                title="LINK V2 overview demonstration"
                src={DEMO_VIDEO_PREVIEW_URL}
                className="absolute inset-0 h-full w-full"
                allow="encrypted-media; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function CapabilityOverview() {
  return (
    <section id="capabilities" className="order-[30] bg-[#f5f3ed] px-4 py-12 sm:px-8 sm:py-16">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
          <SectionIntro
            eyebrow="What LINK can run"
            title="One custom system, built around the customer."
            body="A customer can pick one lane or combine them: CRM follow-up, social media, trading workflows, video workflows, The Learning Center, and a beautiful homepage catered to how their business actually runs."
          />
          <div className="rounded-[1.75rem] border border-[#ddd5c4] bg-white p-4 shadow-[0_18px_70px_rgba(17,19,24,0.08)] sm:p-5">
            <div className="grid gap-3 sm:grid-cols-3">
              {['Bring everything in', 'Turn it into work', 'Show the next move'].map((step, index) => (
                <div key={step} className="rounded-[1.25rem] bg-[#111318] p-4 text-white">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-100/70">Step {index + 1}</div>
                  <div className="mt-2 text-base font-black">{step}</div>
                  <p className="mt-2 text-xs leading-5 text-white/58">
                    {index === 0 && 'Customer messages, videos, notes, trading signals, and ideas stop living in separate places.'}
                    {index === 1 && 'LINK answers, follows up, creates content, updates records, runs workflows, and logs results.'}
                    {index === 2 && 'The owner sees what matters now, what can wait, and what should happen next.'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {CLIENT_OFFER_PILLARS.map((pillar, index) => (
            <a
              key={pillar.id}
              href={pillar.id === 'operations' ? '#packages' : '#consult'}
              className="client-offers-reveal group overflow-hidden rounded-[1.8rem] border border-[#ddd5c4] bg-white shadow-[0_18px_55px_rgba(17,19,24,0.08)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_26px_80px_rgba(17,19,24,0.14)]"
              style={{ '--delay': `${index * 70}ms` } as CSSProperties}
            >
              <div className="relative min-h-[12rem] overflow-hidden bg-[#111318]">
                <Image
                  src={pillar.image}
                  alt={pillar.title}
                  fill
                  sizes="(min-width: 1280px) 30vw, (min-width: 768px) 50vw, 100vw"
                  className={`${pillar.id === 'operations' ? 'object-cover object-[center_12%] opacity-[0.95]' : 'object-cover opacity-[0.88]'} transition duration-700 group-hover:scale-[1.04]`}
                  unoptimized
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.04),rgba(0,0,0,0.68))]" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3">
                  <span className="max-w-[68%] rounded-full border border-white/70 bg-white/90 px-3 py-1.5 text-[11px] font-black leading-4 text-[#111318] shadow-[0_10px_30px_rgba(0,0,0,0.18)] backdrop-blur-xl">
                    {pillar.label}
                  </span>
                  <span className="rounded-full bg-white px-3 py-1.5 text-[10px] font-black text-[#111318]">
                    {pillar.packageHint}
                  </span>
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-2xl font-black leading-7 text-[#111318]">{pillar.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#626672]">{pillar.promise}</p>
                <div className="mt-4 rounded-2xl border border-[#e1dacb] bg-[#f8f5ed] p-3 text-sm font-black leading-5 text-[#1f232b]">
                  {pillar.buyerResult}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {pillar.bullets.map((bullet) => (
                    <span key={bullet} className="rounded-full border border-[#e0d8c6] bg-white px-3 py-1.5 text-xs font-bold text-[#6a6254]">
                      {bullet}
                    </span>
                  ))}
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

function PresentationGallery() {
  return (
    <section id="presentation" className="bg-[#f7f3ea] px-4 py-16 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-[0.62fr_1.38fr] lg:items-end">
          <SectionIntro
            eyebrow="Customer examples"
            title="Show customers what they are actually buying."
            body="The page uses polished visuals to make the offer easy to understand: customer conversations, business dashboards, creator tools, and the first pilot result they can expect to measure."
          />
          <div className="grid gap-3 sm:grid-cols-2">
            {CLIENT_PRESENTATION_VISUALS.slice(0, 2).map((visual, index) => (
              <a
                key={visual.title}
                href={`#${visual.sectionId}`}
                className="client-offers-reveal group relative min-h-[16rem] overflow-hidden rounded-[1.8rem] border border-[#d8d0bd] bg-black text-white shadow-[0_22px_70px_rgba(17,19,24,0.12)]"
                style={{ '--delay': `${index * 120}ms` } as CSSProperties}
              >
                <Image
                  src={visual.image}
                  alt={visual.title}
                  fill
                  sizes="(min-width: 1024px) 30vw, 100vw"
                  className="client-offers-visual-drift object-cover transition duration-700 group-hover:scale-[1.04]"
                  unoptimized
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.02),rgba(0,0,0,0.74))]" />
                <div className="absolute inset-x-4 bottom-4 rounded-3xl border border-white/[0.12] bg-black/[0.48] p-4 backdrop-blur-2xl">
                  <div className="text-[10px] font-black uppercase tracking-[0.22em] text-amber-100/70">{visual.label}</div>
                  <h3 className="mt-2 text-xl font-black leading-6">{visual.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/[0.68]">{visual.detail}</p>
                </div>
              </a>
            ))}
          </div>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1.18fr_0.82fr]">
          {CLIENT_PRESENTATION_VISUALS.slice(2).map((visual, index) => (
            <a
              key={visual.title}
              href={`#${visual.sectionId}`}
              className="client-offers-reveal group grid overflow-hidden rounded-[1.9rem] border border-[#d8d0bd] bg-white shadow-[0_22px_70px_rgba(17,19,24,0.1)] sm:grid-cols-[0.95fr_1.05fr]"
              style={{ '--delay': `${(index + 2) * 120}ms` } as CSSProperties}
            >
              <div className="relative min-h-[15rem] overflow-hidden bg-black">
                <Image
                  src={visual.image}
                  alt={visual.title}
                  fill
                  sizes="(min-width: 1024px) 28vw, 100vw"
                  className="client-offers-visual-drift object-cover transition duration-700 group-hover:scale-[1.04]"
                  unoptimized
                />
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.02),rgba(0,0,0,0.28))]" />
              </div>
              <div className="flex min-w-0 flex-col justify-center p-5 sm:p-6">
                <div className="text-[10px] font-black uppercase tracking-[0.22em] text-amber-700/70">{visual.label}</div>
                <h3 className="mt-3 text-2xl font-black leading-8 text-[#111318]">{visual.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#626672]">{visual.detail}</p>
                <div className="mt-5 text-sm font-black text-[#111318]">See how this helps</div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

function BusinessImpactCharts() {
  return (
    <section id="impact" className="hidden">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[0.74fr_1.26fr] lg:items-start">
          <div className="min-w-0">
            <SectionIntro
              eyebrow="Business impact"
              title="What gets better first."
              body="Each build is measured around the customer’s real drag: slow replies, manual follow-up, scattered notes, trading logs, or content that never ships."
            />
            <div className="mt-6 rounded-[1.5rem] border border-[#ded7c8] bg-[#f7f3ea] p-5">
              <div className="text-sm font-black uppercase tracking-[0.18em] text-amber-800/70">Plain English</div>
              <p className="mt-3 text-base leading-7 text-[#4d515b]">
                Think of LINK like a front desk, social media operator, CRM manager, trading workflow operator, and project board working together. It runs repeatable work, keeps important details visible, and helps the owner make better decisions faster.
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            {CLIENT_IMPACT_METRICS.map((metric, index) => (
              <article
                key={metric.label}
                className="client-offers-reveal rounded-[1.65rem] border border-[#ded7c8] bg-[#f9f7ef] p-5 shadow-[0_18px_55px_rgba(17,19,24,0.07)]"
                style={{ '--delay': `${index * 110}ms` } as CSSProperties}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="text-xs font-black uppercase tracking-[0.2em] text-amber-800/65">{metric.label}</div>
                    <h3 className="mt-2 text-xl font-black leading-7 text-[#111318]">{metric.question}</h3>
                  </div>
                  <span className="w-fit shrink-0 rounded-full border border-[#d7ceb8] bg-white px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.14em] text-[#777061]">
                    Pilot target
                  </span>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-[#e2dcca] bg-white p-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-black text-[#6b707b]">{metric.beforeLabel}</span>
                      <span className="text-sm font-black text-[#111318]">{metric.beforeValue}</span>
                    </div>
                    <div className="mt-3 h-3 overflow-hidden rounded-full bg-[#ede7d8]">
                      <div
                        className="h-full rounded-full bg-[#b7ad98]"
                        style={{ width: `${metric.beforePercent}%` }}
                        aria-label={`${metric.beforeLabel}: ${metric.beforeValue}`}
                      />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-amber-200/80 bg-white p-4 shadow-[0_12px_34px_rgba(245,190,70,0.12)]">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-black text-amber-800/75">{metric.afterLabel}</span>
                      <span className="text-sm font-black text-[#111318]">{metric.afterValue}</span>
                    </div>
                    <div className="mt-3 h-3 overflow-hidden rounded-full bg-amber-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-400 via-cyan-300 to-emerald-300"
                        style={{ width: `${metric.afterPercent}%` }}
                        aria-label={`${metric.afterLabel}: ${metric.afterValue}`}
                      />
                    </div>
                  </div>
                </div>

                <p className="mt-4 text-sm leading-6 text-[#626672]">{metric.detail}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="hidden">
          {[
            ['Choose what LINK runs', 'We identify where customers, content, trading logs, notes, or decisions are getting lost.'],
            ['Build the operator', 'We give LINK the right rules, examples, screens, and handoff points for that business.'],
            ['Measure the lift', 'We track speed, saved time, captured follow-ups, published content, logged workflows, and owner clarity before expanding.'],
          ].map(([title, detail], index) => (
            <div key={title} className="rounded-[1.5rem] border border-[#ded7c8] bg-[#111318] p-5 text-white">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-200 text-xs font-black text-[#111318]">{index + 1}</div>
              <h3 className="mt-4 text-xl font-black">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-white/62">{detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function ClientOffersSite() {
  const [messages, setMessages] = useState<ChatMessage[]>(STARTER_MESSAGES)
  const [input, setInput] = useState('')
  const [consultation, setConsultation] = useState<Consultation | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [handoffChoice, setHandoffChoice] = useState<'idle' | 'yes' | 'dismissed'>('idle')
  const [handoffName, setHandoffName] = useState('')
  const [handoffError, setHandoffError] = useState('')
  const chatScrollRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLTextAreaElement | null>(null)
  const hasSentMessageRef = useRef(false)

  const recommended = useMemo(
    () => packageById(consultation?.recommendedPackage || 'mission-control'),
    [consultation?.recommendedPackage],
  )
  const showRecommendation = consultation?.mode === 'recommendation'
  const readyToRecommend = consultation?.mode === 'ready-to-recommend'
  const showChatTryMe = input.trim().length === 0 && messages.length === STARTER_MESSAGES.length && !busy
  const handoffMailtoHref = useMemo(
    () => buildClientHandoffMailtoHref({
      email: CONTACT_EMAIL,
      body: buildClientHandoffEmailBody({
        customerName: handoffName.trim() || 'there',
        messages,
        recommendedPackage: recommended,
        consultation,
      }),
    }),
    [consultation, handoffName, messages, recommended],
  )

  useEffect(() => {
    if (typeof window === 'undefined' || window.location.hash) return
    window.history.scrollRestoration = 'manual'
    window.requestAnimationFrame(() => window.scrollTo({ left: 0, top: 0, behavior: 'auto' }))
  }, [])

  useEffect(() => {
    if (!hasSentMessageRef.current) return
    const chatScroller = chatScrollRef.current
    if (!chatScroller) return
    chatScroller.scrollTo({ top: chatScroller.scrollHeight, behavior: 'smooth' })
  }, [messages, busy, consultation])

  async function sendText(rawText: string) {
    const text = rawText.trim()
    if (!text || busy) return
    hasSentMessageRef.current = true
    const nextMessages = [...messages, { role: 'user' as const, content: text }]
    setMessages(nextMessages)
    setInput('')
    if (inputRef.current) inputRef.current.value = ''
    setBusy(true)
    setError('')
    setHandoffError('')

    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), 42000)

    try {
      const res = await fetch('/api/client-offers/consult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages }),
        signal: controller.signal,
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'LINK could not respond.')
      const assistant: ChatMessage = { role: 'assistant', content: data.reply }
      setMessages([...nextMessages, assistant])
      setConsultation(data)
    } catch (err) {
      const timedOut = err instanceof Error && err.name === 'AbortError'
      setMessages([
        ...nextMessages,
        {
          role: 'assistant',
          content: timedOut
            ? 'LINK is taking longer than expected. Give me one more try and I’ll keep the answer tighter: what workflow do you most want LINK to run first?'
            : 'LINK could not finish that reply. Try one more time with the main problem you want to improve first.',
        },
      ])
      setError(timedOut ? 'LINK timed out while building the full recommendation. Try Send again, or use one of the quick prompts.' : err instanceof Error ? err.message : 'LINK could not respond.')
    } finally {
      window.clearTimeout(timeout)
      setBusy(false)
    }
  }

  async function sendMessage(event?: FormEvent) {
    event?.preventDefault()
    await sendText(input || inputRef.current?.value || '')
  }

  function askPrompt(prompt: string) {
    void sendText(prompt)
  }

  function openHandoffEmail(event: FormEvent) {
    event.preventDefault()
    if (!handoffName.trim()) {
      setHandoffError('Please enter your name first.')
      return
    }
    setHandoffError('')
    window.location.href = handoffMailtoHref
  }

  return (
    <main className="flex min-h-screen w-full flex-col overflow-hidden bg-[#f5f3ed] text-[#111318]">
      <nav className="sticky top-0 z-50 order-[0] border-b border-white/10 bg-black/[0.55] text-white shadow-[0_18px_60px_rgba(0,0,0,0.18)] backdrop-blur-2xl">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-8">
          <a href="#top" className="flex min-w-0 items-center gap-3" aria-label="LINK offer site home">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-amber-100/20 bg-white/10">
              <Image src="/brand/link-robot-icon-128.png" alt="LINK" width={40} height={40} className="h-full w-full object-cover" />
            </span>
            <span className="min-w-0">
              <LinkLogoMark compact className="client-offers-nav-logo" />
              <span className="block truncate text-xs text-white/[0.55]">LINK business systems</span>
            </span>
          </a>
          <div className="hidden items-center gap-6 text-sm font-semibold text-white/[0.68] md:flex">
            <a href="#demo" className="transition hover:text-white">Demo</a>
            <a href="#capabilities" className="transition hover:text-white">What it runs</a>
            <a href="#packages" className="transition hover:text-white">Packages</a>
            <a href="#safety" className="transition hover:text-white">Trust</a>
            <a href="#consult" className="transition hover:text-white">LINK</a>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <a href={CONTACT_MAILTO_HREF} className="link-tap hidden h-10 items-center justify-center rounded-full border border-white/15 bg-white/10 px-4 text-xs font-black text-white transition hover:bg-white/[0.16] sm:inline-flex">
              Contact
            </a>
            <a href="#consult" className="link-tap inline-flex h-10 items-center justify-center rounded-full bg-white px-4 text-xs font-black text-black transition hover:bg-amber-100">
              Build my plan
            </a>
          </div>
        </div>
      </nav>

      <section id="top" className="relative order-[10] overflow-hidden bg-black text-white">
        <div className="absolute inset-0">
          <Image
            src="/site-visuals/home-night-office-photo.png"
            alt="Sleek LINK workspace at night"
            fill
            sizes="100vw"
            className="client-offers-hero-image object-cover opacity-[0.82]"
            priority
            unoptimized
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.35),rgba(0,0,0,0.88)_82%),linear-gradient(90deg,rgba(0,0,0,0.82),rgba(0,0,0,0.24),rgba(0,0,0,0.82))]" />
        </div>

        <div className="relative mx-auto flex min-h-[82svh] w-full max-w-7xl flex-col px-4 pb-8 pt-8 sm:px-8 sm:pt-12 lg:min-h-[86svh]">
          <div className="client-offers-reveal mx-auto max-w-5xl text-center">
            <div className="mx-auto mb-4 flex w-fit max-w-full items-center gap-3 rounded-[1.45rem] border border-white/[0.14] bg-white/[0.09] p-2 pr-4 shadow-[0_20px_70px_rgba(0,0,0,0.24)] backdrop-blur-2xl sm:mb-5 sm:rounded-[1.6rem]">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[1.1rem] border border-amber-100/20 bg-black sm:h-14 sm:w-14 sm:rounded-[1.25rem]">
                <Image src="/brand/link-robot-icon-128.png" alt="LINK robot logo" width={56} height={56} className="h-full w-full object-cover" priority />
              </span>
              <div className="min-w-0 text-left">
                <LinkLogoMark className="client-offers-hero-logo" />
                <div className="mt-1 truncate text-[11px] font-bold uppercase tracking-[0.18em] text-white/50">Smarter business systems</div>
              </div>
            </div>
            <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/[0.15] bg-white/10 px-3 py-1.5 text-xs font-bold text-white/[0.78] backdrop-blur-xl">
              <span className="h-2 w-2 rounded-full bg-emerald-300" />
              Fully customizable LINK systems for CRM, content, trading, learning, and daily work
            </div>
            <h1 className="mx-auto mt-5 max-w-5xl text-[2.7rem] font-black leading-[0.94] tracking-normal text-white sm:text-6xl lg:text-[5.8rem] xl:text-7xl">
              A custom LINK workspace for your business.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-white/[0.72] sm:text-lg sm:leading-8 lg:max-w-3xl">
              LINK is custom-built around your needs with a beautiful homepage setup that runs CRM follow-up, social media, video notes, Learning Center lessons, trading workflows, and daily operations from one clean place. New features keep getting added as your workflow grows.
            </p>
            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a href="#demo" className="link-tap inline-flex h-12 w-full items-center justify-center rounded-full bg-white px-6 text-sm font-black text-black shadow-[0_22px_70px_rgba(255,255,255,0.2)] transition hover:bg-amber-100 sm:w-auto">
                Watch demo
              </a>
              <a href="#capabilities" className="link-tap inline-flex h-12 w-full items-center justify-center rounded-full border border-white/[0.18] bg-white/10 px-6 text-sm font-black text-white backdrop-blur-xl transition hover:bg-white/[0.16] sm:w-auto">
                See what LINK runs
              </a>
              <a href="#consult" className="link-tap inline-flex h-12 w-full items-center justify-center rounded-full border border-white/[0.18] bg-white/10 px-6 text-sm font-black text-white backdrop-blur-xl transition hover:bg-white/[0.16] sm:w-auto">
                Talk to LINK
              </a>
            </div>
          </div>

          <ProductTheater />
        </div>

        <div className="relative overflow-hidden border-y border-white/10 bg-white/[0.06] py-3 backdrop-blur-xl">
          <div className="client-offers-marquee-track flex w-max items-center gap-3 text-xs font-black uppercase tracking-[0.18em] text-white/[0.58]">
            {[...CLIENT_HERO_SIGNALS, ...CLIENT_HERO_SIGNALS].map((signal, index) => (
              <span key={`${signal}-${index}`} className="rounded-full border border-white/10 bg-white/[0.06] px-4 py-2">
                {signal}
              </span>
            ))}
          </div>
        </div>
      </section>

      <AutonomousOperatorSection />
      <DemoVideoSection />
      <CapabilityOverview />
      <BusinessImpactCharts />

      <section id="features" className="hidden">
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            center
            eyebrow="Best features"
            title="Pick the capabilities that fit."
            body="LINK is not one fixed product. Each build combines the parts the customer needs and leaves out what they do not."
          />

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {CLIENT_SHOWCASE_FEATURES.map((feature, index) => {
              const tone = accentTone(feature.accent)
              return (
                <article
                  key={feature.id}
                  className={`client-offers-reveal overflow-hidden rounded-[1.8rem] border bg-[#111318] text-white ${tone.border} ${tone.glow}`}
                  style={{ '--delay': `${index * 110}ms` } as CSSProperties}
                >
                  <div className="relative min-h-[12rem] overflow-hidden">
                    <Image
                      src={feature.image}
                      alt={feature.title}
                      fill
                      sizes="(min-width: 768px) 50vw, 100vw"
                      className="object-cover transition duration-700 hover:scale-[1.03]"
                      loading="eager"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.05),rgba(0,0,0,0.72))]" />
                    <div className="absolute left-5 top-5 flex items-center gap-3">
                      <IconMark label={`0${index + 1}`} tone={tone.icon} />
                      <div className={`text-xs font-black uppercase tracking-[0.22em] ${tone.text}`}>{feature.eyebrow}</div>
                    </div>
                    <div className="absolute inset-x-4 bottom-4 rounded-3xl border border-white/[0.12] bg-black/[0.5] p-4 backdrop-blur-2xl">
                      <h3 className="text-xl font-black leading-6">{feature.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-white/68">{feature.customerValue}</p>
                    </div>
                  </div>
                  <div className="p-4 sm:p-5">
                    <p className="text-sm leading-6 text-white/[0.68]">{feature.summary}</p>
                    <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.07] p-3">
                      <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/40">Pilot target</div>
                      <p className="mt-2 text-sm font-bold leading-6 text-white/[0.78]">{feature.timeSaved.replace('Pilot target: ', '')}</p>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {feature.proofPoints.map((point) => (
                        <span key={point} className="rounded-full border border-white/10 bg-white/[0.07] px-3 py-1.5 text-xs font-black text-white/72">
                          {point}
                        </span>
                      ))}
                    </div>
                    <div className="mt-4 grid gap-2 sm:grid-cols-4">
                      {feature.workflow.map((step) => (
                        <div key={step} className="rounded-2xl bg-white/10 px-3 py-2 text-center text-xs font-black text-white/[0.78]">
                          {step}
                        </div>
                      ))}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>

          <div className="hidden">
            {CLIENT_SHOWCASE_FEATURES.flatMap((feature) => feature.detailCards.slice(0, 1).map((card) => ({
              ...card,
              feature: feature.eyebrow,
            }))).map((card) => (
              <div key={`${card.feature}-${card.title}`} className="rounded-[1.45rem] border border-[#ddd5c4] bg-white p-5 shadow-[0_16px_44px_rgba(17,19,24,0.06)]">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-700/70">{card.feature}</div>
                <h3 className="mt-3 text-lg font-black leading-6 text-[#111318]">{card.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#626672]">{card.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="workflows" className="hidden">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
            <div className="min-w-0">
              <div className="text-xs font-black uppercase tracking-[0.24em] text-cyan-100/70">How it works</div>
              <h2 className="mt-3 text-3xl font-black leading-[1.04] sm:text-5xl">A simple path from messy information to useful work.</h2>
              <p className="mt-4 text-base leading-8 text-white/[0.62]">
                Customers do not need setup details. They need to know that LINK collects what matters, runs the repeatable work, shows the outcome, and remembers what happened for next time.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {CLIENT_OPERATING_LANES.map((lane, index) => (
                <div key={lane.title} className="client-offers-reveal rounded-[1.6rem] border border-white/10 bg-white/[0.06] p-5" style={{ '--delay': `${index * 90}ms` } as CSSProperties}>
                  <div className="flex items-center justify-between gap-4">
                    <IconMark label={`0${index + 1}`} tone={index === 1 ? 'cyan' : index === 2 ? 'gold' : index === 3 ? 'green' : 'white'} />
                    <span className="h-px flex-1 bg-white/10" />
                  </div>
                  <h3 className="mt-5 text-xl font-black">{lane.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/60">{lane.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 grid gap-3 md:grid-cols-4">
            {CLIENT_CAPABILITIES.map((capability, index) => (
              <div key={capability.title} className="rounded-[1.4rem] border border-white/10 bg-white/[0.045] p-4">
                <div className="text-[11px] font-black uppercase tracking-[0.18em] text-amber-100/[0.64]">{capability.signal}</div>
                <h3 className="mt-3 text-base font-black leading-6">{capability.title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/56">{capability.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="packages" className="order-[40] bg-[#f5f3ed] px-4 py-12 sm:px-8 sm:py-16">
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            eyebrow="Packages"
            title="Start focused or build the full custom system."
            body="Every package is tailored around the customer’s real needs: replies, follow-up, content, trading workflows, notes, dashboards, learning, or the full workspace."
          />
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {CLIENT_PACKAGES.map((pkg) => (
              <article key={pkg.id} className={`flex min-w-0 flex-col rounded-[1.7rem] border bg-[#111318] p-5 text-white ${packageTone(pkg.id)}`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-[11px] font-black text-white/[0.66]">{pkg.eyebrow}</span>
                  <span className="text-xs font-black text-amber-100">{pkg.timeline}</span>
                </div>
                <h3 className="mt-6 text-2xl font-black leading-7">{pkg.name}</h3>
                <p className="mt-3 text-sm leading-6 text-white/[0.58]">{pkg.bestFor}</p>
                <div className="mt-5 text-sm font-black text-white">{pkg.priceLabel}</div>
                <ul className="mt-5 space-y-2">
                  {pkg.outcomes.map((outcome) => (
                    <li key={outcome} className="flex gap-2 text-sm leading-5 text-white/[0.72]">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-200" />
                      <span>{outcome}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-5 border-t border-white/10 pt-4">
                  {pkg.includes.slice(0, 3).map((item) => (
                    <div key={item} className="py-1 text-xs font-semibold leading-5 text-white/[0.48]">{item}</div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="safety" className="order-[50] bg-[#f9f7ef] px-4 py-12 text-[#111318] sm:px-8 sm:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[0.74fr_1.26fr] lg:items-start">
            <div className="min-w-0">
              <div className="text-xs font-black uppercase tracking-[0.24em] text-amber-700/70">Trust and control</div>
              <h2 className="mt-3 text-3xl font-black leading-[1.04] sm:text-5xl">Helpful where it saves time, careful where it matters.</h2>
              <p className="mt-4 text-base leading-8 text-[#5e626d]">
                LINK can run a lot of work autonomously, while the owner still controls sensitive choices like high-stakes sends, spending, publishing rules, account changes, and live-trading risk limits.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {CLIENT_SAFETY_POINTS.map((point, index) => (
                <div key={point.title} className="rounded-[1.5rem] border border-[#d9d3c3] bg-white p-5 shadow-[0_18px_50px_rgba(17,19,24,0.07)]">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#111318] text-xs font-black text-amber-100">{index + 1}</div>
                  <h3 className="mt-4 text-lg font-black leading-6">{point.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#646875]">{point.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="consult" className="order-[20] bg-[#07080c] px-4 py-12 text-white sm:px-8 sm:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
          <div className="min-w-0">
            <div className="text-xs font-black uppercase tracking-[0.24em] text-amber-100/70">Talk to LINK</div>
            <h2 className="mt-3 text-3xl font-black leading-[1.04] sm:text-5xl">Let LINK shape the custom fit.</h2>
            <p className="mt-4 text-base leading-8 text-white/[0.62]">
              A visitor can describe their business in normal words. LINK can ask what matters, explain the right capabilities, and shape a homepage, workflow, and package around their actual needs.
            </p>
            <div className="mt-6 hidden gap-3 sm:grid sm:grid-cols-2">
              {['Beautiful homepage', 'Fully customizable', 'Compares packages', 'Continual upgrades', 'New features coming'].map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.055] p-4 text-sm font-black text-white/[0.78]">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="min-w-0 overflow-hidden rounded-[1.8rem] border border-white/[0.12] bg-white/[0.07] p-2.5 shadow-[0_28px_100px_rgba(0,0,0,0.42)] backdrop-blur-2xl sm:p-3">
            <div className="min-w-0 overflow-hidden rounded-[1.4rem] border border-white/10 bg-[#0d121d]/[0.92]">
              <div className="flex items-center justify-between gap-3 border-b border-white/10 p-4">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-amber-100/20 bg-black">
                    <Image src="/brand/link-robot-icon-128.png" alt="LINK" width={44} height={44} className="h-full w-full object-cover" />
                  </span>
                  <div className="min-w-0">
                    <LinkLogoMark compact className="client-offers-chat-logo" />
                    <div className="truncate text-xs text-white/50">Consulting Agent</div>
                  </div>
                </div>
                <span className="shrink-0 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-2.5 py-1 text-[11px] font-bold text-emerald-100">
                  Live
                </span>
              </div>
              <div className="flex gap-2 overflow-x-auto border-b border-white/10 px-3 py-2">
                {CLIENT_SITE_NAVIGATION.slice(1, 6).map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="link-tap shrink-0 rounded-full border border-white/10 bg-white/[0.055] px-3 py-1.5 text-[11px] font-bold text-white/[0.62] transition hover:bg-white/10 hover:text-white"
                  >
                    {section.label}
                  </a>
                ))}
              </div>

              <div ref={chatScrollRef} className="max-h-[26rem] min-h-[20rem] space-y-3 overflow-y-auto p-3 sm:min-h-[24rem] sm:p-4">
                {messages.map((message, index) => (
                  <div key={`${message.role}-${index}`} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                      message.role === 'user'
                        ? 'bg-amber-300 text-slate-950'
                        : 'border border-white/10 bg-white/[0.07] text-white/[0.76]'
                    }`}>
                      {message.content}
                    </div>
                  </div>
                ))}
                {busy && <TypingDots />}
              </div>

              {readyToRecommend && (
                <div className="border-t border-white/10 p-4">
                  <div className="rounded-2xl border border-amber-200/20 bg-amber-200/[0.08] p-4">
                    <div className="text-[11px] font-black uppercase tracking-[0.18em] text-amber-100/70">Ready when you are</div>
                    <div className="mt-2 text-lg font-black text-white">LINK has enough to shape a recommendation.</div>
                    <p className="mt-2 text-sm leading-6 text-white/[0.66]">
                      The next step is to turn what you shared into a best-fit package, a simple rollout path, and the first thing to measure.
                    </p>
                    <button
                      type="button"
                      onClick={() => void sendText('Yes, show me the best-fit package and a simple rollout plan.')}
                      className="link-tap mt-4 inline-flex h-10 items-center justify-center rounded-full bg-white px-4 text-sm font-black text-slate-950 transition hover:bg-amber-100"
                    >
                      Show my recommendation
                    </button>
                  </div>
                </div>
              )}

              {consultation && !showRecommendation && consultation.nextQuestions.length > 0 && (
                <div className={`${readyToRecommend ? '' : 'border-t border-white/10'} px-4 pb-4`}>
                  <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/[0.38]">Helpful replies</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {consultation.nextQuestions
                      .filter((question) => !(readyToRecommend && question.toLowerCase().startsWith('yes, show')))
                      .map((question) => (
                      <button
                        key={question}
                        type="button"
                        onClick={() => void sendText(question)}
                        className="link-tap rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-left text-xs font-semibold leading-5 text-white/[0.64] transition hover:bg-white/10 hover:text-white"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {consultation && showRecommendation && (
                <div className="border-t border-white/10 px-4 py-3">
                  <p className="text-sm leading-6 text-white/[0.68]">
                    <span className="font-black text-white">Suggested package: {recommended.name}.</span> {recommended.promise}
                  </p>
                  {consultation.plan.length > 0 && (
                    <p className="mt-2 text-xs font-semibold leading-5 text-white/[0.5]">
                      First steps: {consultation.plan.slice(0, 3).join(' ')}
                    </p>
                  )}
                  {consultation.nextQuestions.length > 0 && (
                    <div className="mt-3">
                      <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/[0.38]">LINK can ask next</div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {consultation.nextQuestions.map((question) => (
                          <button
                            key={question}
                            type="button"
                            onClick={() => void sendText(question)}
                            className="link-tap rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-left text-xs font-semibold leading-5 text-white/[0.64] transition hover:bg-white/10 hover:text-white"
                          >
                            {question}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {consultation && showRecommendation && handoffChoice !== 'dismissed' && (
                <div className="border-t border-white/10 px-4 py-3">
                  <div className="rounded-2xl border border-emerald-200/20 bg-emerald-200/[0.075] p-3">
                    <div className="text-base font-black leading-6 text-white">Would you like to contact Angelo for more information?</div>

                    {handoffChoice === 'idle' && (
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setHandoffChoice('yes')
                            setHandoffError('')
                          }}
                          className="link-tap inline-flex min-h-10 items-center justify-center rounded-full bg-white px-4 text-sm font-black text-slate-950 transition hover:bg-amber-100"
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setHandoffChoice('dismissed')
                            setHandoffError('')
                          }}
                          className="link-tap inline-flex min-h-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] px-4 text-sm font-black text-white/[0.72] transition hover:bg-white/10 hover:text-white"
                        >
                          No
                        </button>
                      </div>
                    )}

                    {handoffChoice === 'yes' && (
                      <form onSubmit={openHandoffEmail} className="mt-3">
                        <label className="block text-[10px] font-black uppercase tracking-[0.18em] text-white/42" htmlFor="client-offers-handoff-name">
                          Your name
                        </label>
                        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                          <input
                            id="client-offers-handoff-name"
                            value={handoffName}
                            onChange={(event) => {
                              setHandoffName(event.target.value)
                              if (handoffError) setHandoffError('')
                            }}
                            className="min-h-11 flex-1 rounded-full border border-white/10 !bg-white px-4 text-sm font-semibold !text-slate-950 outline-none placeholder:!text-slate-500 focus:border-amber-200/70"
                            placeholder="Enter your name"
                            autoComplete="name"
                          />
                          <button
                            type="submit"
                            className="link-tap inline-flex min-h-11 shrink-0 items-center justify-center rounded-full bg-white px-5 text-sm font-black text-slate-950 transition hover:bg-amber-100"
                          >
                            Contact Angelo
                          </button>
                        </div>
                        {handoffError && <div className="mt-2 text-sm font-semibold text-amber-100">{handoffError}</div>}
                      </form>
                    )}
                  </div>
                </div>
              )}

              {error && <div className="mx-4 rounded-xl border border-red-300/20 bg-red-500/10 px-3 py-2 text-sm text-red-100">{error}</div>}
              <form onSubmit={sendMessage} className="min-w-0 border-t border-white/10 p-2.5 sm:p-3">
                <div className="relative rounded-2xl border border-white/[0.12] bg-white/[0.06] p-2">
                  <div className={`client-offers-try-me ${showChatTryMe ? 'client-offers-try-me-visible' : 'client-offers-try-me-hidden'}`} aria-hidden={!showChatTryMe}>
                    <span>Try me</span>
                    <span className="client-offers-try-me-dot" />
                  </div>
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    rows={3}
                    className="client-offers-input min-h-20 w-full resize-none rounded-xl border border-white/10 bg-[#090f19] px-3 py-2 text-sm leading-6 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] outline-none caret-amber-200 placeholder:text-white/35 focus:border-amber-200/40"
                    placeholder="Example: I need help replying to customers faster, turning videos into content, and keeping my business organized..."
                  />
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div className="flex min-w-0 flex-wrap gap-2">
                      {CONSULT_PROMPTS.map((prompt) => (
                        <button
                          key={prompt.label}
                          type="button"
                          onClick={() => askPrompt(prompt.text)}
                          className="link-tap min-w-0 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-semibold leading-5 text-white/[0.68] hover:bg-white/10"
                        >
                          {prompt.label}
                        </button>
                      ))}
                    </div>
                    <button
                      type="submit"
                      disabled={busy}
                      className="link-tap h-10 shrink-0 rounded-full bg-white px-5 text-sm font-black text-slate-950 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      <footer className="order-[60] bg-black px-4 py-12 text-white sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 border-t border-white/10 pt-10 text-center">
          <a
            href={CONTACT_MAILTO_HREF}
            className="link-tap mb-5 inline-flex min-h-12 w-full max-w-xs items-center justify-center rounded-full bg-white px-6 text-sm font-black text-black shadow-[0_22px_70px_rgba(255,255,255,0.14)] transition hover:bg-amber-100 sm:w-auto"
            aria-label="Email Angelo with subject LiNK Inquiry"
          >
            Contact
          </a>
          <span className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-amber-100/20 bg-white/10 shadow-[0_18px_60px_rgba(245,190,70,0.12)]">
            <Image src="/brand/link-robot-icon-128.png" alt="LINK" width={56} height={56} className="h-full w-full object-cover" />
          </span>
          <LinkLogoMark className="client-offers-footer-logo" />
          <p className="max-w-xl text-sm leading-6 text-white/52">
            Custom LINK systems for customer follow-up, content, trading workflows, learning, and daily operations.
          </p>
        </div>
      </footer>
    </main>
  )
}
