import React, { useState, useEffect, useRef } from 'react'
import TitleBar from './components/TitleBar'
import OutputPane from './components/OutputPane'
import SuggestionChips from './components/SuggestionChips'
import CommandLine from './components/CommandLine'
import LoadingIntro from './components/LoadingIntro'
import AsciiWorld from './components/AsciiWorld'
import Testimonials from './components/Testimonials'
import Conduct from './components/Conduct'
import { executeCommand } from './utils/commandHandler'
import { TRACKS, getDynamicTimeline } from './utils/terminalData'

const getInitialLandingItems = () => [
  { type: 'TEXT', text: '[ok] mounting /tracks', cls: 'ok' },
  { type: 'TEXT', text: '[ok] mounting /timeline', cls: 'ok' },
  { type: 'TEXT', text: '[ok] starting register.service', cls: 'ok' },
  { type: 'TEXT', text: '[ok] loading fastfetch…', cls: 'ok' },
  { type: 'BLANK' },
  { type: 'FASTFETCH' },
  { type: 'BLANK' },
  { type: 'REGISTER_BANNER' },
  { type: 'BLANK' },
  { type: 'TEXT', text: 'welcome to MBMC IdeaX 2026.', cls: 'strong' },
  { type: 'TEXT', text: "type 'help' to see available commands, or click a suggestion below.", cls: 'dim' },
  { type: 'BLANK' }
]

export default function App() {
  const [showIntro, setShowIntro] = useState(true)
  const [view, setView] = useState('terminal')
  const [items, setItems] = useState([])
  const [history, setHistory] = useState([])
  const outputRef = useRef(null)
  const inputRef = useRef(null)

  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  const runBootSequence = (onDone) => {
    let isCancelled = false
    let timeoutIds = []

    setItems([])

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      document.body.classList.add('reduced-motion')
    }

    const bootTimer = setTimeout(() => {
      if (!isCancelled) document.body.classList.remove('boot')
    }, 950)
    timeoutIds.push(bootTimer)

    const bootLines = [
      ['[ok] mounting /tracks', 'ok'],
      ['[ok] mounting /timeline', 'ok'],
      ['[ok] starting register.service', 'ok'],
      ['[ok] loading fastfetch…', 'ok']
    ]

    let i = 0
    const step = () => {
      if (isCancelled) return
      if (i < bootLines.length) {
        const [text, cls] = bootLines[i]
        setItems(prev => [...prev, { type: 'TEXT', text, cls }])
        i++
        const t = setTimeout(step, reduced ? 0 : 130)
        timeoutIds.push(t)
      } else {
        setItems(getInitialLandingItems())
        const t = setTimeout(() => {
          focusInput()
          if (onDone) onDone()
        }, 50)
        timeoutIds.push(t)
      }
    }

    step()

    return () => {
      isCancelled = true
      timeoutIds.forEach(id => clearTimeout(id))
    }
  }

  const bootCleanupRef = useRef(null)

  const startBootSequence = () => {
    if (bootCleanupRef.current) {
      bootCleanupRef.current()
    }
    bootCleanupRef.current = runBootSequence()
  }

  // Boot sequence
  useEffect(() => {
    if (showIntro) return
    startBootSequence()
    return () => {
      if (bootCleanupRef.current) {
        bootCleanupRef.current()
        bootCleanupRef.current = null
      }
    }
  }, [showIntro])

  // Handle URL hash on load or change
  useEffect(() => {
    if (showIntro) return

    const handleHash = () => {
      const hash = window.location.hash.replace(/^#\/?/, '').trim().toLowerCase()
      if (!hash) return

      if (['museum', 'hall', 'halloffame', 'hall-of-fame', 'fame'].includes(hash)) {
        setView('museum')
        document.title = 'Hall of Fame | MBMC IdeaX 2026'
      } else if (['gallery', 'testimonials'].includes(hash)) {
        setView('gallery')
        document.title = 'Testimonials | MBMC IdeaX 2026'
      } else if (['conduct', 'coc', 'code-of-conduct'].includes(hash)) {
        setView('conduct')
        document.title = 'Code of Conduct & Rules | MBMC IdeaX 2026'
      } else {
        handleRunCommand(hash)
      }
    }

    handleHash()
    window.addEventListener('hashchange', handleHash)
    return () => window.removeEventListener('hashchange', handleHash)
  }, [showIntro])

  const COMMAND_TITLES = {
    about: 'About MBMC IdeaX 2026 | National Hackathon',
    tracks: 'Tracks & Problem Statements | MBMC IdeaX 2026',
    timeline: 'Timeline & Important Dates | MBMC IdeaX 2026',
    prizes: 'Prizes & Rewards (Rs. 111,111) | MBMC IdeaX 2026',
    faq: 'Frequently Asked Questions (FAQ) | MBMC IdeaX 2026',
    conduct: 'Code of Conduct & Rules | MBMC IdeaX 2026',
    coc: 'Code of Conduct & Rules | MBMC IdeaX 2026',
    register: 'Register Now | MBMC IdeaX 2026',
    participation: 'Eligibility & Team Rules | MBMC IdeaX 2026',
    eligibility: 'Eligibility & Team Rules | MBMC IdeaX 2026',
    hall: 'Hall of Fame | MBMC IdeaX 2026',
    museum: 'Hall of Fame | MBMC IdeaX 2026',
    testimonials: 'Participant Testimonials | MBMC IdeaX 2026',
    gallery: 'Participant Testimonials | MBMC IdeaX 2026',
    recap: 'Past Recaps (2023-2025) | MBMC IdeaX 2026',
    contact: 'Contact & Support | MBMC IdeaX 2026',
    discord: 'Community Discord | MBMC IdeaX 2026',
    countdown: 'Countdown to Kickoff | MBMC IdeaX 2026',
    home: 'MBMC IdeaX 2026 | National Hackathon Nepal | Register Now'
  }

  const handleRunCommand = (raw) => {
    const trimmed = (raw || '').trim()
    
    // Always add command history if non-empty
    if (trimmed !== '') {
      setHistory(prev => [...prev, trimmed])
    }

    const cmdName = (trimmed.split(/\s+/)[0] || '').toLowerCase()
    if (COMMAND_TITLES[cmdName]) {
      document.title = COMMAND_TITLES[cmdName]
      if (window.location.hash !== `#${cmdName}` && cmdName !== 'home') {
        window.history.replaceState ? window.history.replaceState(null, '', `#${cmdName}`) : (window.location.hash = cmdName)
      } else if (cmdName === 'home') {
        window.history.replaceState ? window.history.replaceState(null, '', window.location.pathname) : (window.location.hash = '')
      }
    }

    const echoItem = { type: 'ECHO', command: raw }
    const result = executeCommand(raw, { history, onRunCommand: handleRunCommand })

    if (result && result.type === 'CLEAR') {
      setItems([])
    } else if (result && result.type === 'HOME') {
      setHistory([])
      document.title = 'MBMC IdeaX 2026 | National Hackathon Nepal | Register Now'
      startBootSequence()
    } else if (result && result.type === 'MUSEUM') {
      setItems(prev => [...prev, echoItem])
      setView('museum')
      document.title = 'Hall of Fame | MBMC IdeaX 2026'
    } else if (result && result.type === 'GALLERY') {
      setItems(prev => [...prev, echoItem])
      setView('gallery')
      document.title = 'Testimonials | MBMC IdeaX 2026'
    } else if (result && result.type === 'CONDUCT_VIEW') {
      setItems(prev => [...prev, echoItem])
      setView('conduct')
      document.title = 'Code of Conduct & Rules | MBMC IdeaX 2026'
    } else if (result) {
      setItems(prev => [...prev, echoItem, result])
    } else {
      setItems(prev => [...prev, echoItem])
    }

    setTimeout(focusInput, 20)
  }

  const handleClearTerminal = () => {
    setItems([])
    focusInput()
  }

  const handleHome = () => {
    setHistory([])
    document.title = 'MBMC IdeaX 2026 | National Hackathon Nepal | Register Now'
    if (window.history.replaceState) {
      window.history.replaceState(null, '', window.location.pathname)
    }
    startBootSequence()
  }

  const handleFocusInput = () => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
    focusInput()
  }

  const handleAppendText = (text, cls) => {
    setItems(prev => [...prev, { type: 'TEXT', text, cls }])
  }

  const handleReturnToTerminal = () => {
    setView('terminal')
    document.title = 'MBMC IdeaX 2026 | National Hackathon Nepal | Register Now'
    if (window.history.replaceState) {
      window.history.replaceState(null, '', window.location.pathname)
    }
  }

  return (
    <main>
      {view === 'museum' ? (
        <section aria-label="Hall of Fame">
          <AsciiWorld onReturn={handleReturnToTerminal} />
        </section>
      ) : view === 'gallery' ? (
        <section aria-label="Testimonials">
          <Testimonials onReturn={handleReturnToTerminal} />
        </section>
      ) : view === 'conduct' ? (
        <section aria-label="Code of Conduct">
          <Conduct onReturn={handleReturnToTerminal} />
        </section>
      ) : (
        <div className="terminal-app">
          <div className="scanlines" aria-hidden="true" />
          <div className="vignette" aria-hidden="true" />

          {showIntro ? (
            <LoadingIntro onComplete={() => setShowIntro(false)} />
          ) : (
            <div className="app" id="app">
              <TitleBar
                onClear={handleClearTerminal}
                onHome={handleHome}
                onFocus={handleFocusInput}
              />

              <OutputPane
                items={items}
                onRunCommand={handleRunCommand}
                outputRef={outputRef}
                onFocusInput={handleFocusInput}
              />

              <nav aria-label="Quick commands">
                <SuggestionChips onRunCommand={handleRunCommand} />
              </nav>

              <CommandLine
                inputRef={inputRef}
                history={history}
                onRunCommand={handleRunCommand}
                onAppendText={handleAppendText}
              />
            </div>
          )}
        </div>
      )}
    </main>
  )
}
