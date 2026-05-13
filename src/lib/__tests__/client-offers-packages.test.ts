import { describe, expect, it } from 'vitest'
import { CLIENT_PACKAGES, packageById, recommendPackageFromText } from '@/lib/client-offers'

describe('client offer package features', () => {
  it('keeps website development in the starter package without adding voice control', () => {
    const starter = packageById('starter')
    const starterText = [...starter.outcomes, ...starter.includes].join(' ').toLowerCase()

    expect(starterText).toContain('website development')
    expect(starterText).not.toContain('voice control')
  })

  it('adds voice control to every package after starter', () => {
    const advancedPackages = CLIENT_PACKAGES.filter((pkg) => pkg.id !== 'starter')

    expect(advancedPackages.length).toBeGreaterThan(0)
    for (const pkg of advancedPackages) {
      const packageText = [...pkg.outcomes, ...pkg.includes].join(' ').toLowerCase()
      expect(packageText).toContain('voice control')
    }
  })

  it('routes website-only interest to starter and voice interest above starter', () => {
    expect(recommendPackageFromText('I need a basic website for my new business').id).toBe('starter')
    expect(recommendPackageFromText('I want voice control so I can talk to LINK while I work').id).toBe('growth')
  })
})
