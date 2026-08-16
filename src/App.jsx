import React, { useState, useEffect, useRef } from 'react'
import TitleBar from './components/TitleBar'
import OutputPane from './components/OutputPane'
import SuggestionChips from './components/SuggestionChips'
import CommandLine from './components/CommandLine'
import { executeCommand } from './utils/commandHandler'

export default function App() {
  const [items, setItems] = useState([])
  const [history, setHistory] = useState([])
  const outputRef = useRef(null)
  const inputRef = useRef(null)

  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  // Boot sequence
  useEffect(() => {
    let isCancelled = false
    let timeoutIds = []

    setItems([])

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      document.body.classList.add('reduced-motion')
    }

    const bootTimer = setTimeout(() => {
      if (!isCancelled) {
        document.body.classList.remove('boot')
      }
    }, 1000)
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
        setItems(prev => [
          ...prev,
          { type: 'BLANK' },
          { type: 'FASTFETCH' },
          { type: 'BLANK' },
          { type: 'TEXT', text: 'welcome to MBMC IdeaX 2026.', cls: 'strong' },
          { type: 'TEXT', text: "type 'help' to see available commands, or click a suggestion below.", cls: 'dim' },
          { type: 'BLANK' }
        ])
        const t = setTimeout(focusInput, 50)
        timeoutIds.push(t)
      }
    }

    step()

    return () => {
      isCancelled = true
      timeoutIds.forEach(id => clearTimeout(id))
    }
  }, [])

  const handleRunCommand = (raw) => {
    const trimmed = (raw || '').trim()
    
    // Always add command history if non-empty
    if (trimmed !== '') {
      setHistory(prev => [...prev, trimmed])
    }

    const echoItem = { type: 'ECHO', command: raw }
    const result = executeCommand(raw, { history, onRunCommand: handleRunCommand })

    if (result && result.type === 'CLEAR') {
      setItems([])
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

  const handleReplayFetch = () => {
    handleRunCommand('fastfetch')
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

  return (
    <>
      <div className="scanlines" aria-hidden="true" />
      <div className="vignette" aria-hidden="true" />

      <div className="app" id="app">
        <TitleBar
          onClear={handleClearTerminal}
          onFetch={handleReplayFetch}
          onFocus={handleFocusInput}
        />

        <OutputPane
          items={items}
          onRunCommand={handleRunCommand}
          outputRef={outputRef}
          onFocusInput={handleFocusInput}
        />

        <SuggestionChips onRunCommand={handleRunCommand} />

        <CommandLine
          inputRef={inputRef}
          history={history}
          onRunCommand={handleRunCommand}
          onAppendText={handleAppendText}
        />
      </div>
    </>
  )
}
