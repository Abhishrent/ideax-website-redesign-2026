import React, { useEffect, useState, useRef } from 'react'

// Full combined banner (large block letters)
const BANNER_LINES = [
  '  ██╗██████╗ ███████╗ █████╗ ██╗  ██╗',
  '  ██║██╔══██╗██╔════╝██╔══██╗╚██╗██╔╝',
  '  ██║██║  ██║█████╗  ███████║ ╚███╔╝ ',
  '  ██║██║  ██║██╔══╝  ██╔══██║ ██╔██╗ ',
  '  ██║██████╔╝███████╗██║  ██║██╔╝ ██╗',
  '  ╚═╝╚═════╝ ╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝',
]

const BOOT_LOG = [
  { t: 0, text: '[    0.000] Booting MBMC IdeaX 2026 kernel...' },
  { t: 300, text: '[    0.312] mounting /proc and /sys filesystems' },
  { t: 620, text: '[    0.624] loading hackathon modules... OK' },
  { t: 940, text: '[    0.936] starting register.service... OK' },
  { t: 1260, text: '[    1.260] mounting /tracks... OK' },
  { t: 1580, text: '[    1.581] mounting /prizes... OK' },
  { t: 1900, text: '[    1.901] loading ui renderer... OK' },
  { t: 2200, text: '[    2.200] ████████████████ 100%' },
  { t: 2500, text: '> System ready. Welcome.' },
]

const TOTAL_MS = 3400

export default function LoadingIntro({ onComplete }) {
  // phases: 'running' | 'flicker1' | 'dark1' | 'flicker2' | 'dark2' | 'flicker3' | 'done'
  const [phase, setPhase] = useState('running')
  const [logLines, setLogLines] = useState([])
  const [progress, setProgress] = useState(0)
  const [bannerLine, setBannerLine] = useState(0)
  const timerRef = useRef([])

  useEffect(() => {
    // Reveal banner lines one by one
    BANNER_LINES.forEach((_, i) => {
      const t = setTimeout(() => setBannerLine(i + 1), i * 80)
      timerRef.current.push(t)
    })

    // Schedule log lines
    BOOT_LOG.forEach(({ t, text }) => {
      const id = setTimeout(() => {
        setLogLines(prev => [...prev, text])
      }, t)
      timerRef.current.push(id)
    })

    // Animate progress 0 → 100 over TOTAL_MS
    const steps = 60
    const stepInterval = TOTAL_MS / steps
    let step = 0
    const pid = setInterval(() => {
      step++
      const raw = step / steps
      const eased = 1 - Math.pow(1 - raw, 2)
      setProgress(Math.floor(eased * 100))
      if (step >= steps) clearInterval(pid)
    }, stepInterval)
    timerRef.current.push(pid)

    // CRT flicker sequence: intro → flicker pulses → hard cut
    // Each "flicker" is a quick dim → bright → dim cycle
    const seq = [
      // [delay from TOTAL_MS+100, phase]
      [0, 'flicker1'],  // first flash bright
      [80, 'dark1'],     // drop to black
      [160, 'flicker2'],  // second flash
      [240, 'dark2'],     // drop again
      [320, 'flicker3'],  // final burst
      [400, 'done'],      // hard cut — unmount
    ]

    seq.forEach(([offset, p]) => {
      const id = setTimeout(() => {
        setPhase(p)
        if (p === 'done') {
          // Add boot class so terminal CRT animation fires on mount
          document.body.classList.add('boot')
          onComplete()
        }
      }, TOTAL_MS + 100 + offset)
      timerRef.current.push(id)
    })

    return () => timerRef.current.forEach(id => clearTimeout(id))
  }, [onComplete])

  // Build text-based progress bar: [████████░░░░] 42%
  const BAR_WIDTH = 28
  const filled = Math.round((progress / 100) * BAR_WIDTH)
  const empty = BAR_WIDTH - filled
  const progressBar = `[${'█'.repeat(filled)}${'░'.repeat(empty)}] ${String(progress).padStart(3)}%`

  return (
    <div className={`loading-intro loading-intro--${phase}`} aria-label="Loading IdeaX">
      {/* Scanlines overlay within intro */}
      <div className="intro-scanlines" aria-hidden="true" />

      {/* Big ASCII banner */}
      <div className="intro-banner" aria-label="IdeaX">
        {BANNER_LINES.map((line, i) => (
          <div
            key={i}
            className="banner-line"
            style={{
              opacity: i < bannerLine ? 1 : 0,
              transform: i < bannerLine ? 'translateY(0)' : 'translateY(-8px)',
              transition: 'opacity 0.18s ease, transform 0.18s ease',
            }}
          >
            {line}
          </div>
        ))}
      </div>

      {/* Sub-title */}
      <div className="intro-subtitle">
        MBMC IdeaX 2026
      </div>

      {/* Scrolling boot log */}
      <div className="intro-log" aria-live="polite">
        {logLines.map((line, i) => (
          <div
            key={i}
            className={`intro-log-line${i === logLines.length - 1 ? ' intro-log-line--last' : ''}`}
          >
            {line}
          </div>
        ))}
      </div>

      {/* Text-based progress bar */}
      <div className="intro-progress-row">
        <span className="intro-prompt">boot@ideax:~$&nbsp;</span>
        <span className="intro-progress-bar">{progressBar}</span>
        <span className="cursor-blink">_</span>
      </div>
    </div>
  )
}
