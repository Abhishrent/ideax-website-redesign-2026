import React from 'react'

export default function SuggestionChips({ onRunCommand }) {
  const chips = [
    { label: '$ home', cmd: 'home' },
    { label: '$ about', cmd: 'about' },
    { label: '$ participation', cmd: 'participation' },
    { label: '$ tracks', cmd: 'tracks' },
    { label: '$ faq', cmd: 'faq' },
    { label: '$ conduct', cmd: 'conduct' },
    { label: '$ hall of fame', cmd: 'halloffame' },
    { label: '$ recap', cmd: 'recap' },
    { label: '$ prizes', cmd: 'prizes' },
    { label: '$ timeline', cmd: 'timeline' },
    { label: '$ testimonials', cmd: 'gallery' },
    { label: '$ help', cmd: 'help' },
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
