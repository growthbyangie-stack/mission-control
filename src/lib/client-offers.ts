export type ClientPackageId = 'starter' | 'growth' | 'creator' | 'mission-control' | 'partnership'

export type ClientPackage = {
  id: ClientPackageId
  name: string
  eyebrow: string
  bestFor: string
  priceLabel: string
  promise: string
  outcomes: string[]
  includes: string[]
  timeline: string
}

export type ClientShowcaseFeature = {
  id: string
  eyebrow: string
  title: string
  summary: string
  image: string
  accent: string
  proofPoints: string[]
  workflow: string[]
  detailCards: Array<{ title: string; detail: string }>
  timeSaved: string
  customerValue: string
}

export type ClientCapability = {
  title: string
  detail: string
  signal: string
}

export type ClientSafetyPoint = {
  title: string
  detail: string
}

export type ClientPresentationVisual = {
  label: string
  title: string
  detail: string
  image: string
  sectionId: string
}

export type ClientSiteNavigationTarget = {
  id: string
  label: string
  detail: string
}

export type ClientImpactMetric = {
  label: string
  question: string
  beforeLabel: string
  afterLabel: string
  beforeValue: string
  afterValue: string
  beforePercent: number
  afterPercent: number
  detail: string
}

export type ClientOfferPillar = {
  id: string
  label: string
  title: string
  promise: string
  buyerResult: string
  image: string
  packageHint: string
  bullets: string[]
}

export const CLIENT_PACKAGES: ClientPackage[] = [
  {
    id: 'starter',
    name: 'Starter Response System',
    eyebrow: 'Fastest launch',
    bestFor: 'Solo operators and local teams missing calls, DMs, forms, or follow-ups.',
    priceLabel: 'Pilot-ready starter',
    promise: 'Let LINK answer common questions, follow up with warm leads, and keep customer conversations moving while interest is still high.',
    outcomes: ['Autonomous lead recovery', 'Customer replies', 'Basic website development', 'Customer notes'],
    includes: ['Basic website development', 'Lead sources connected', 'Approved answer library', 'Simple CRM board'],
    timeline: '7-10 day setup',
  },
  {
    id: 'growth',
    name: 'Growth Command Center',
    eyebrow: 'Most popular',
    bestFor: 'Businesses that want LINK running CRM follow-up, customer outreach, social content, and next actions from one place.',
    priceLabel: 'Growth package',
    promise: 'Put LINK to work as the daily operator for leads, CRM follow-up, customer replies, content, revenue next steps, and a clean homepage view tailored to the business.',
    outcomes: ['Custom homepage setup', 'Autonomous CRM follow-up', 'Voice control', 'Customer outreach', 'Revenue next steps'],
    includes: ['Beautiful owner homepage', 'Voice control setup', 'Customer question helper', 'Social posting workflow', 'Weekly opportunity review'],
    timeline: '2-3 week build',
  },
  {
    id: 'creator',
    name: 'Creator Studio + Learning Center',
    eyebrow: 'Creator package',
    bestFor: 'Creators, coaches, artists, trainers, and educators who want LINK running content, lessons, video breakdowns, and a guided learning hub.',
    priceLabel: 'Creator growth package',
    promise: 'Let LINK turn videos, lessons, ideas, and daily moments into social posts, lesson tracks, study material, and content people can buy from.',
    outcomes: ['Learning Center hub', 'Autonomous content workflow', 'Voice control', 'Video breakdown notes', 'Social publishing system'],
    includes: ['The Learning Center setup', 'Voice control setup', 'Creator media library', 'Lesson and quiz builder', 'Posting workflow'],
    timeline: '2-4 week build',
  },
  {
    id: 'mission-control',
    name: 'Full Mission Control Build',
    eyebrow: 'Custom system',
    bestFor: 'Teams ready for a custom LINK operator that can run CRM, social media, trading workflows, content, dashboards, and connected data.',
    priceLabel: 'Custom build',
    promise: 'Turn scattered messages, content, trading work, notes, and daily tasks into one beautiful, fully customizable homepage and autonomous workspace built around the business.',
    outcomes: ['Beautiful custom homepage', 'Autonomous business flows', 'Voice control', 'Trading and media modules', 'Owner reports'],
    includes: ['Custom homepage and app surface', 'Voice control setup', 'Customer and team process design', 'Trading, social, and media automation', 'Launch training and handoff'],
    timeline: '4-8 week build',
  },
  {
    id: 'partnership',
    name: 'Automation Partnership',
    eyebrow: 'Ongoing operator',
    bestFor: 'Owners who want LINK monitored, improved, and expanded as an ongoing autonomous operator.',
    priceLabel: 'Monthly support',
    promise: 'Keep the autonomous workflows sharp as your offers, customers, team, trading rules, content needs, and future feature releases keep evolving.',
    outcomes: ['Continual upgrades', 'Workflow monitoring', 'Voice control improvements', 'New feature releases', 'Performance review'],
    includes: ['Priority improvements', 'Voice control improvements', 'Monthly strategy session', 'System health checks', 'New feature experiments'],
    timeline: 'Monthly cadence',
  },
]

export const CLIENT_SHOWCASE_FEATURES: ClientShowcaseFeature[] = [
  {
    id: 'crm',
    eyebrow: 'Autonomous CRM',
    title: 'LINK runs customer follow-up so warm leads do not sit untouched.',
    summary:
      'LINK can watch incoming leads, answer common questions, update the CRM, follow up with people, and keep customer conversations moving from first touch to next step.',
    image: '/site-visuals/messages-workflow-photo.png',
    accent: 'emerald',
    proofPoints: ['Lead intake', 'Auto replies', 'CRM updates', 'Follow-up loop'],
    workflow: ['Capture lead', 'Reply', 'Follow up', 'Log result'],
    detailCards: [
      {
        title: 'Runs the follow-up loop',
        detail: 'Texts, DMs, forms, calls, and notes can become one customer record that LINK keeps moving with reminders, replies, and next actions.',
      },
      {
        title: 'Autonomous outreach',
        detail: 'LINK can send or queue approved replies, check back with warm leads, and keep the CRM current based on the rules you set.',
      },
      {
        title: 'Customer memory',
        detail: 'Customer questions, preferences, objections, and repeated answers become saved context LINK can use in later conversations.',
      },
    ],
    timeSaved: 'Pilot target: save 3-6 hours per week by letting LINK run first replies, follow-ups, CRM notes, and lead recovery.',
    customerValue: 'Best for service businesses, local teams, and owners who know missed follow-up is costing them money.',
  },
  {
    id: 'social',
    eyebrow: 'Autonomous social media',
    title: 'LINK runs the content engine instead of waiting for you to post.',
    summary:
      'LINK can turn raw thoughts, videos, links, customer questions, and daily work into posts, captions, content calendars, and platform-specific publishing workflows.',
    image: '/site-visuals/social-coffee-selfie-photo.jpg',
    accent: 'cyan',
    proofPoints: ['Post creation', 'Caption writing', 'Content calendar', 'Publishing workflow'],
    workflow: ['Collect ideas', 'Create post', 'Schedule', 'Publish/log'],
    detailCards: [
      {
        title: 'Posts from real business activity',
        detail: 'LINK can turn customer questions, notes, videos, and daily work into real post angles without starting from a blank page.',
      },
      {
        title: 'Autonomous calendar',
        detail: 'The system can organize topics, offers, platforms, posting times, and recurring themes so the content machine keeps moving.',
      },
      {
        title: 'Consistent voice',
        detail: 'Good captions, hooks, and themes can be saved so LINK keeps the brand voice consistent across posts.',
      },
    ],
    timeSaved: 'Pilot target: save 4-8 hours per week by letting LINK run post creation, scheduling, captioning, and content logging.',
    customerValue: 'Best for owners who need to show up online consistently without rebuilding the content plan every day.',
  },
  {
    id: 'trading',
    eyebrow: 'Autonomous trading workflow',
    title: 'LINK can build, integrate, and run trading strategies inside your rules.',
    summary:
      'For trading-focused customers, LINK can monitor setups, manage watchlists, help build and integrate strategies, run autonomous trading workflows, track risk rules, log decisions, and support real-money execution through approved account and owner-defined boundaries.',
    image: '/site-visuals/trading-briefing-photo.png',
    accent: 'amber',
    proofPoints: ['Market monitoring', 'Strategy integration', 'Autonomous execution', 'Trade journal'],
    workflow: ['Monitor', 'Check rules', 'Run workflow', 'Log result'],
    detailCards: [
      {
        title: 'Always-on monitoring',
        detail: 'LINK can watch the markets, track catalysts, maintain watchlists, and surface setups against the strategy rules you choose.',
      },
      {
        title: 'Autonomous strategy execution',
        detail: 'LINK can turn approved strategy rules into monitored entries, exits, risk checks, screenshots, and trade logs so execution works like a trading operator on the team.',
      },
      {
        title: 'Real-money trading connection',
        detail: 'When brokerage access is connected, LINK can support real-money trading workflows inside approved broker, account, risk, and owner-control rules.',
      },
    ],
    timeSaved: 'Pilot target: save 30-60 minutes per session by letting LINK monitor setups, run trading routines, and log outcomes automatically.',
    customerValue: 'Best for customers who want LINK to act like an autonomous trading operator with visible rules, strategy logs, risk limits, and owner control.',
  },
  {
    id: 'editing',
    eyebrow: 'Autonomous video studio',
    title: 'LINK analyzes raw videos and turns them into usable content.',
    summary:
      'Instead of rewatching footage over and over, customers can let LINK break videos into highlights, talking points, copyable notes, captions, clip priorities, and edit direction.',
    image: '/site-visuals/editing-studio-photo.png',
    accent: 'cyan',
    proofPoints: ['Video search and library', 'Breakdown notes', 'Clip priorities', 'Edit direction'],
    workflow: ['Add footage', 'Analyze', 'Create clips', 'Log ideas'],
    detailCards: [
      {
        title: 'Video notes people can use',
        detail: 'LINK can turn a video into copyable notes, highlights, talking points, and follow-up questions.',
      },
      {
        title: 'Less blank timeline stress',
        detail: 'Before editing starts, the customer can see suggested hooks, pacing notes, cutdown ideas, caption angles, and clip priorities.',
      },
      {
        title: 'Reusable content memory',
        detail: 'Good ideas from one video can be saved for future posts, lessons, customer answers, or follow-up content.',
      },
    ],
    timeSaved: 'Pilot target: save 45-90 minutes per raw video by starting from notes, highlight candidates, and edit direction.',
    customerValue: 'Useful for creators, agencies, coaches, and teams that need to move from footage to finished content faster.',
  },
  {
    id: 'vlogging',
    eyebrow: 'Auto vlogging',
    title: 'LINK runs the auto-vlogging workflow from daily moments to posts.',
    summary:
      'LINK helps customers stop losing good content inside their camera roll and notes app by shaping daily activity into storylines, posts, captions, schedules, and reusable content memory.',
    image: '/site-visuals/video-analysis-photo.png',
    accent: 'emerald',
    proofPoints: ['Moment capture', 'Vlog outlines', 'Captions and posts', 'Story memory'],
    workflow: ['Capture', 'Shape story', 'Schedule', 'Publish/log'],
    detailCards: [
      {
        title: 'Story capture',
        detail: 'Daily activity, notes, photos, and footage can be shaped into a storyline instead of staying scattered.',
      },
      {
        title: 'Publishing workflow',
        detail: 'LINK can create captions, posts, scripts, vlog outlines, platform-specific versions, and a publishing queue from the same captured moment.',
      },
      {
        title: 'Content memory',
        detail: 'Recurring themes, wins, lessons, and customer questions can become a searchable creator memory.',
      },
    ],
    timeSaved: 'Pilot target: save hours each week by turning daily notes and media into story outlines, posts, captions, schedules, and content logs.',
    customerValue: 'Built for operators who want their work, lessons, and wins turned into content without manually rebuilding the story every time.',
  },
  {
    id: 'learning-center',
    eyebrow: 'Creator package',
    title: 'The Learning Center turns expertise into lessons, quizzes, notes, and guided practice.',
    summary:
      'For creators, coaches, and trainers, The Learning Center turns knowledge into a clean customer experience with lesson tracks, study notes, practice prompts, quizzes, and topic support.',
    image: '/site-visuals/j-cole-tour-photo.png',
    accent: 'amber',
    proofPoints: ['Lesson tracks', 'Daily study plan', 'Quiz and weak-spot review', 'Dedicated topic chat'],
    workflow: ['Choose topic', 'Build lessons', 'Practice daily', 'Track progress'],
    detailCards: [
      {
        title: 'Lesson hub',
        detail: 'Customers can package what they teach into a guided hub with tracks, reference material, tasks, and review prompts.',
      },
      {
        title: 'Quizzes and drills',
        detail: 'LINK can generate practice questions, missed-answer review, scenario prompts, and follow-up study tasks.',
      },
      {
        title: 'Creator-ready delivery',
        detail: 'The Learning Center pairs with video notes, vlog outlines, and content planning so education becomes a product.',
      },
    ],
    timeSaved: 'Pilot target: save 5-10 hours building a course structure by letting LINK organize lessons, drills, quizzes, and review loops first.',
    customerValue: 'A strong fit for creators who teach, document a journey, train a team, or want their knowledge turned into an organized experience.',
  },
]

export const CLIENT_PRESENTATION_VISUALS: ClientPresentationVisual[] = [
  {
    label: 'Customer conversations',
    title: 'See who needs a reply and what to say next.',
    detail: 'Show customers how missed messages, follow-ups, and next steps become a simple daily view.',
    image: '/site-visuals/chat-workspace-photo.png',
    sectionId: 'capabilities',
  },
  {
    label: 'Revenue clarity',
    title: 'Show where opportunities are being lost.',
    detail: 'Connect LINK to captured leads, owner priorities, and the time saved during a practical pilot.',
    image: '/site-visuals/revenue-workflow-photo.png',
    sectionId: 'impact',
  },
  {
    label: 'Creator operations',
    title: 'Turn content work into an organized production line.',
    detail: 'Show video notes, auto vlogging, The Learning Center, and content planning as one customer-friendly offer.',
    image: '/site-visuals/editing-workspace-photo.png',
    sectionId: 'features',
  },
  {
    label: 'Pilot outcome',
    title: 'Start small, prove the value, then expand.',
    detail: 'Help customers understand the first version, the expected wins, and the next upgrade path.',
    image: '/site-visuals/pilot-roi-photo.png',
    sectionId: 'packages',
  },
]

export const CLIENT_OFFER_PILLARS: ClientOfferPillar[] = [
  {
    id: 'crm',
    label: 'Autonomous CRM',
    title: 'LINK reaches out, follows up, and keeps the CRM moving.',
    promise: 'LINK can watch calls, texts, DMs, forms, and notes, then answer, follow up, update records, and show who needs attention next.',
    buyerResult: 'Fewer missed leads, faster replies, cleaner customer follow-up.',
    image: '/site-visuals/messages-workflow-photo.png',
    packageHint: 'Starter or Growth',
    bullets: ['Auto replies', 'CRM updates', 'Follow-up loop'],
  },
  {
    id: 'social',
    label: 'Autonomous social media',
    title: 'LINK runs the content engine for you.',
    promise: 'LINK can turn raw notes, links, photos, videos, and customer questions into posts, captions, calendars, and publishing workflows.',
    buyerResult: 'More content shipped without rebuilding the plan every day.',
    image: '/site-visuals/social-coffee-selfie-photo.jpg',
    packageHint: 'Creator or Growth',
    bullets: ['Post creation', 'Scheduling', 'Content log'],
  },
  {
    id: 'trading',
    label: 'Autonomous trading',
    title: 'LINK builds and runs trading strategies inside your rules.',
    promise: 'LINK can monitor setups, manage watchlists, help build and integrate strategies, run approved trading workflows, track risk rules, and log outcomes automatically.',
    buyerResult: 'A visible autonomous trading operator with strategy logs and owner-defined risk limits.',
    image: '/site-visuals/trading-briefing-photo.png',
    packageHint: 'Mission Control',
    bullets: ['Market monitor', 'Strategy execution', 'Risk rules'],
  },
  {
    id: 'creator',
    label: 'Video + creator studio',
    title: 'Make raw footage easier to understand and edit.',
    promise: 'LINK can break videos into notes, highlights, clip ideas, hooks, captions, edit instructions, and reusable content memory.',
    buyerResult: 'Less rewatching, faster edits, more useful content from the same media.',
    image: '/site-visuals/editing-studio-photo.png',
    packageHint: 'Creator',
    bullets: ['Video notes', 'Clip ideas', 'Edit plans'],
  },
  {
    id: 'learning',
    label: 'The Learning Center',
    title: 'Turn knowledge into lessons people can follow.',
    promise: 'LINK can help package expertise into lesson tracks, quizzes, practice prompts, reference libraries, and topic-specific study support.',
    buyerResult: 'A cleaner way to teach, train, sell knowledge, or guide a community.',
    image: '/site-visuals/j-cole-tour-photo.png',
    packageHint: 'Creator',
    bullets: ['Lessons', 'Quizzes', 'Study notes'],
  },
  {
    id: 'operations',
    label: 'Custom homepage setup',
    title: 'A beautiful home base tailored to the customer.',
    promise: 'LINK can create a polished homepage that shows the exact priorities, customers, content, trading workflows, notes, approvals, and reports that matter to that business.',
    buyerResult: 'A fully customizable daily command center that feels built for the owner, not copied from a template.',
    image: '/site-visuals/link-home-screen-showcase.jpeg',
    packageHint: 'Mission Control',
    bullets: ['Custom layout', 'Daily view', 'Upgrade-ready'],
  },
]

export const CLIENT_IMPACT_METRICS: ClientImpactMetric[] = [
  {
    label: 'Lead response',
    question: 'Can LINK answer and follow up before warm leads go cold?',
    beforeLabel: 'Before LINK',
    afterLabel: 'With LINK',
    beforeValue: 'Scattered inboxes',
    afterValue: 'LINK follow-up loop',
    beforePercent: 34,
    afterPercent: 86,
    detail: 'LINK can collect customer questions, answer from approved rules, follow up automatically, and log the outcome so fewer warm leads go cold.',
  },
  {
    label: 'Autonomous work',
    question: 'How much routine work can LINK run without waiting on the owner?',
    beforeLabel: 'Before LINK',
    afterLabel: 'With LINK',
    beforeValue: 'Manual busywork',
    afterValue: 'Autonomous workflows',
    beforePercent: 28,
    afterPercent: 78,
    detail: 'The goal is to let LINK run repeatable work like CRM updates, follow-ups, content workflows, logs, and daily owner reports inside clear rules.',
  },
  {
    label: 'Content output',
    question: 'Can LINK keep content moving when the owner is busy?',
    beforeLabel: 'Before LINK',
    afterLabel: 'With LINK',
    beforeValue: 'Blank page',
    afterValue: 'Posts and plans running',
    beforePercent: 25,
    afterPercent: 74,
    detail: 'Videos, notes, links, and lessons can become posts, captions, outlines, clips, publishing workflows, and content logs faster.',
  },
]

export const CLIENT_CAPABILITIES: ClientCapability[] = [
  {
    title: 'Website development',
    signal: 'Site',
    detail: 'Starter builds can include a clean business website foundation, then larger LINK packages can expand it into a full custom workspace.',
  },
  {
    title: 'Voice control',
    signal: 'Voice',
    detail: 'Growth, Creator, Mission Control, and Partnership builds can include voice control so owners can talk to LINK and move faster through daily work.',
  },
  {
    title: 'Autonomous customer replies',
    signal: 'Reply',
    detail: 'LINK can answer common questions, follow up with leads, update customer notes, and keep the CRM moving from one place.',
  },
  {
    title: 'CRM and lead recovery',
    signal: 'Recover',
    detail: 'Capture warm interest from forms, messages, calls, and DMs, then let LINK run the follow-up loop until the next step is handled.',
  },
  {
    title: 'Autonomous workflow engine',
    signal: 'Run',
    detail: 'Repeated work like CRM updates, owner reports, content tasks, reminders, and handoffs can run inside the workspace rules.',
  },
  {
    title: 'Auto logging and memory',
    signal: 'Remember',
    detail: 'Messages, links, videos, tasks, decisions, and important context can be turned into searchable notes and action history.',
  },
  {
    title: 'Beautiful custom homepage',
    signal: 'See',
    detail: 'A polished homepage can be tailored to show the owner’s priorities, customer context, content work, trading activity, revenue actions, and status in one place.',
  },
  {
    title: 'Autonomous social media',
    signal: 'Create',
    detail: 'Turn raw video, notes, links, and ideas into posts, captions, vlog outlines, customer notes, and reusable content assets.',
  },
  {
    title: 'Creator Learning Center',
    signal: 'Teach',
    detail: 'Build a polished learning hub with lessons, quizzes, reference libraries, practice prompts, and topic-specific chat.',
  },
  {
    title: 'Autonomous trading workflows',
    signal: 'Trade',
    detail: 'Run market monitoring, watchlists, strategy execution, trade journals, and real-money trading support only inside approved account and risk rules.',
  },
  {
    title: 'Continual upgrades',
    signal: 'Grow',
    detail: 'The system can keep improving over time as new LINK features are built, released, and added to the customer’s current workflow.',
  },
]

export const CLIENT_OPERATING_LANES = [
  {
    title: 'What comes in',
    detail: 'Messages, calls, forms, videos, links, trading signals, and owner tasks are collected in one place.',
  },
  {
    title: 'What LINK runs',
    detail: 'LINK follows the rules, answers customers, updates records, creates content, runs trading workflows, and logs results.',
  },
  {
    title: 'What you get back',
    detail: 'Replies, posts, trading logs, dashboards, lessons, reports, and follow-ups become visible work the owner can trust.',
  },
  {
    title: 'What gets remembered',
    detail: 'Decisions, follow-ups, clips, plans, and results are saved so the business gets easier to run over time.',
  },
]

export const CLIENT_SAFETY_POINTS: ClientSafetyPoint[] = [
  {
    title: 'Autonomous with owner rules',
    detail: 'LINK can run the workflow, while sensitive sends, publishing, spending, account changes, and live-trading rules stay inside clear owner controls.',
  },
  {
    title: 'Clear responsibility boundaries',
    detail: 'Each build defines what LINK can run automatically, what needs approval, what gets logged, and what still needs a person.',
  },
  {
    title: 'Visible logs and memory',
    detail: 'Important messages, decisions, outputs, and follow-ups can be saved so the business can see what happened and improve the system over time.',
  },
  {
    title: 'Always room to build',
    detail: 'Start with the most useful version, then keep upgrading the homepage, workflows, and new feature lanes as the business grows.',
  },
]

export const CLIENT_SITE_NAVIGATION: ClientSiteNavigationTarget[] = [
  {
    id: 'top',
    label: 'Start',
    detail: 'Use this when someone needs the quick overview of what LINK is.',
  },
  {
    id: 'capabilities',
    label: 'What LINK runs',
    detail: 'Use this when someone wants a fast scan of customizable autonomous CRM, social media, trading, video, learning, and dashboards.',
  },
  {
    id: 'packages',
    label: 'Packages',
    detail: 'Use this when someone needs to compare Starter, Growth, Creator, Mission Control, and Partnership options.',
  },
  {
    id: 'safety',
    label: 'Safety',
    detail: 'Use this when someone asks about boundaries, sensitive actions, or rollout control.',
  },
  {
    id: 'consult',
    label: 'Talk to LINK',
    detail: 'Use this when someone is ready to describe their business and build a first-fit plan.',
  },
]

export const CLIENT_HERO_SIGNALS = [
  'Fully customizable',
  'Built around your business',
  'Website development',
  'Voice control',
  'Beautiful homepage setup',
  'Continual upgrades',
  'New features coming',
  'Faster customer replies',
  'Autonomous CRM',
  'Autonomous social media',
  'Autonomous trading workflows',
  'Video notes and edit plans',
  'Auto vlogging',
  'Customer message help',
  'Lead recovery',
  'LINK-run workflows',
  'Automatic notes and logs',
  'Creator package',
  'Learning Center',
  'Owner dashboards',
]

export function packageById(id: ClientPackageId | string | undefined): ClientPackage {
  return CLIENT_PACKAGES.find((pkg) => pkg.id === id) || CLIENT_PACKAGES[1]
}

export function recommendPackageFromText(text: string): ClientPackage {
  const normalized = text.toLowerCase()
  const wantsCreatorSystem = /\b(creator|course|lesson|learning center|teach|training|quiz|study|content hub|j[ .-]?cole|tour learning|video|editing|edit|vlog|vlogging|clip|caption|content calendar|content planning)\b/.test(normalized)
  const wantsTradingSystem = /\b(trading|trade|market|portfolio|watchlist|paper[- ]?trading|journal)\b/.test(normalized)
  const wantsVoiceControl = /\b(voice|voice control|talk to link|talking to link|microphone|speak|speech)\b/.test(normalized)
  const wantsWebsite = /\b(website|web site|landing page|site build|web development|website development)\b/.test(normalized)
  const wantsCustomSystem = /\b(custom|integrat|dashboard|homepage|home page|homebase|home base|internal|operations|multiple|team|workflow|automations?|logging|command center)\b/.test(normalized)
  const wantsBusinessSystem = /\b(content|social|revenue|growth|leads|customers|crm|pipeline|contacts?|follow[- ]?up|manager|board|dm|messages?|calls?|forms?)\b/.test(normalized)

  if (/\b(monthly|ongoing|maintain|support|retainer|every month|monitor|always[- ]?on|operate|upgrade|new features?|feature releases?|continual)\b/.test(normalized)) {
    return packageById('partnership')
  }
  if (wantsCreatorSystem && !wantsTradingSystem && !wantsCustomSystem && !wantsBusinessSystem) {
    return packageById('creator')
  }
  if (wantsCustomSystem || wantsTradingSystem || (wantsCreatorSystem && wantsBusinessSystem)) {
    return packageById('mission-control')
  }
  if (wantsVoiceControl && !wantsCreatorSystem) {
    return packageById('growth')
  }
  if (wantsCreatorSystem) {
    return packageById('creator')
  }
  if (wantsBusinessSystem) {
    return packageById('growth')
  }
  if (wantsWebsite) {
    return packageById('starter')
  }
  return packageById('starter')
}
