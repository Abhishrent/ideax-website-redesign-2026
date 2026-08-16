import React, { useEffect, useState, useRef } from 'react'

// Big ASCII art for "IdeaX" – each line is one row of the banner
const IDEAX_ASCII = [
  ' ___     _             __  __',
  '|_ _|   | |    ___    /  \\/  |',
  ' | |  _ | |   / _ \\  | |\\/| |',
  ' | | (_)| |__  __/ | | |  | |',
  '|___|   |____\\___| |_|  |_|',
]

// A large hand-crafted ASCII "X" for the right side
const X_ART = [
  '\\\\          //',
  ' \\\\        //',
  '  \\\\      //',
  '   \\\\    //',
  '    \\\\  //',
  '     \\\\// ',
  '     //\\\\  ',
  '    //  \\\\ ',
  '   //    \\\\',
  '  //      \\\\',
  ' //        \\\\',
  '//          \\\\',
]

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
  { t: 0,    text: '[    0.000] Booting MBMC IdeaX 2026 kernel...' },
  { t: 300,  text: '[    0.312] mounting /proc and /sys filesystems' },
  { t: 620,  text: '[    0.624] loading hackathon modules... OK' },
  { t: 940,  text: '[    0.936] starting register.service... OK' },
  { t: 1260, text: '[    1.260] mounting /tracks... OK' },
  { t: 1580, text: '[    1.581] mounting /prizes... OK' },
  { t: 1900, text: '[    1.901] loading ui renderer... OK' },
  { t: 2200, text: '[    2.200] ████████████████ 100%' },
  { t: 2500, text: '> System ready. Welcome.' },
]

const TOTAL_MS = 3400

export default function LoadingIntro({ onComplete }) {
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
    const interval = TOTAL_MS / steps
    let step = 0
    const pid = setInterval(() => {
      step++
      // Ease-out curve
      const raw = step / steps
      const eased = 1 - Math.pow(1 - raw, 2)
      setProgress(Math.floor(eased * 100))
      if (step >= steps) clearInterval(pid)
    }, interval)
    timerRef.current.push(pid)

    // Begin fade-out
    const done = setTimeout(() => {
      setPhase('fading')
      const unmount = setTimeout(onComplete, 700)
      timerRef.current.push(unmount)
    }, TOTAL_MS + 100)
    timerRef.current.push(done)

    return () => timerRef.current.forEach(id => clearTimeout(id))
  }, [onComplete])

  // Build text-based progress bar: [████████░░░░] 42%
  const BAR_WIDTH = 28
  const filled = Math.round((progress / 100) * BAR_WIDTH)
  const empty = BAR_WIDTH - filled
  const progressBar = `[${'\u2588'.repeat(filled)}${'\u2591'.repeat(empty)}] ${String(progress).padStart(3)}%`

  return (
    <div className={`loading-intro ${phase}`} aria-label="Loading IdeaX">
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
        MBMC International Technology Hackathon &mdash; 2026
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
