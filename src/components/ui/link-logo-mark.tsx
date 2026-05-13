'use client'

type LinkLogoMarkProps = {
  compact?: boolean
  className?: string
}

const LETTERS = ['L', 'I', 'N', 'K'] as const

export function LinkLogoMark({ compact = false, className = '' }: LinkLogoMarkProps) {
  return (
    <div
      className={`link-logo-mark ${compact ? 'link-logo-mark-compact' : ''} ${className}`}
      aria-label="LINK"
    >
      <span className="link-logo-core" aria-hidden="true" />
      <span className="link-logo-scan" aria-hidden="true" />
      {LETTERS.map((letter) => (
        <span key={letter} className="link-logo-letter">{letter}</span>
      ))}
    </div>
  )
}
