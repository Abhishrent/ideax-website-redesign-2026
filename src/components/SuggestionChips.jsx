import React from 'react'

export default function SuggestionChips({ onRunCommand }) {
  const chips = [
    { label: '$ about', cmd: 'about' },
    { label: '$ participation', cmd: 'participation' },
    { label: '$ home', cmd: 'home' },
    { label: '$ help', cmd: 'help' },
    { label: '$ tracks', cmd: 'tracks' },
    { label: '$ timeline', cmd: 'timeline' },
    { label: '$ register', cmd: 'register' },
    { label: '$ prizes', cmd: 'prizes' },
    { label: '$ conduct', cmd: 'conduct' },
    { label: '$ faq', cmd: 'faq' }
    { label: '$ countdown', cmd: 'countdown' },
    { label: '$ recap', cmd: 'recap' },
    { label: '$ discord', cmd: 'discord' },
    { label: '$ testimonials', cmd: 'testimonials' },
    { label: '$ gallery', cmd: 'gallery' },
    { label: '$ hall', cmd: 'hall' }
  ]

  return (
    <div className="chips" aria-label="quick commands">
      {chips.map(chip => (
        <button
          key={chip.cmd}
          className={chip.isPrimary ? 'chip-primary' : chip.isSecondary ? 'chip-secondary' : ''}
          onClick={() => onRunCommand(chip.cmd)}
        >
          {chip.label}
        </button>
      ))}
    </div>
  )
}
