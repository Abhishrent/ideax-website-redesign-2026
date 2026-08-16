import React from 'react'

export default function SuggestionChips({ onRunCommand }) {
  const chips = [
    { label: '$ help', cmd: 'help' },
    { label: '$ tracks', cmd: 'tracks' },
    { label: '$ timeline', cmd: 'timeline' },
    { label: '$ prizes', cmd: 'prizes' },
    { label: '$ countdown', cmd: 'countdown' },
    { label: '$ discord', cmd: 'discord' },
    { label: '$ register', cmd: 'register' }
  ]

  return (
    <div className="chips" aria-label="quick commands">
      {chips.map(chip => (
        <button
          key={chip.cmd}
          onClick={() => onRunCommand(chip.cmd)}
        >
          {chip.label}
        </button>
      ))}
    </div>
  )
}
