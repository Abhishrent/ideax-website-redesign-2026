import { TRACKS, getDynamicTimeline, TARGET_DATE, DEADLINE_DATE } from './terminalData'
import { recaps, getRecap } from './recapData'


export function executeCommand(rawCommand, { history, onRunCommand }) {
  const trimmed = (rawCommand || '').trim()

  if (trimmed === '') {
    return null
  }

  const parts = trimmed.split(/\s+/)
  const cmd = parts[0].toLowerCase()
  const arg = parts.slice(1).join(' ')

  switch (cmd) {
    case 'help':
      return {
        type: 'HELP',
        rows: [
          ['home', 'return to the home screen'],
          ['about', 'what MBMC IdeaX actually is'],
          ['participation', 'eligibility & team requirements'],
          ['tracks', 'list the 5 problem tracks'],
          ['tracks <id>', 'detail on one track (climate / cybersec / egov / transport / fintech)'],
          ['faq', 'frequently asked questions'],
          ['conduct', 'code of conduct & hackathon rules'],
          ['hall of fame', 'visit the sponsor hall of fame'],
          ['recap', 'browse past hackathon recaps (2023-2025)'],
          ['prizes', 'prize breakdown'],
          ['timeline', 'registration + event dates'],
          ['countdown', 'time remaining until doors open'],
          ['register', 'how to sign up'],
          ['contact', 'email + phone for the organizing team'],
          ['discord', 'join the community server'],
          ['testimonials', 'what past participants say'],
          ['gallery', 'visual testimonial gallery'],
          ['ls', 'list files in this directory'],
          ['cat <file>', 'print a file, e.g. cat prizes.md'],
          ['fastfetch', 'replay the splash screen'],
          ['clear', 'clear the screen'],
          ['whoami', 'find out who you are']
        ]
      }

    case 'about':
      return { type: 'ABOUT' }

    case 'participation':
    case 'eligibility':
      return { type: 'PARTICIPATION' }

    case 'tracks': {
      if (arg) {
        const found = TRACKS.find(x => x.id === arg.toLowerCase() || x.file === arg.toLowerCase() || x.file === `${arg.toLowerCase()}.sh`)
        if (!found) {
          return { type: 'TEXT', text: `tracks: no such track "${arg}", try: tracks`, cls: 'warn' }
        }
        return { type: 'TRACK_DETAIL', track: found }
      }
      return { type: 'TRACKS_LIST', tracks: TRACKS }
    }

    case 'timeline':
      return { type: 'TIMELINE', items: getDynamicTimeline() }

    case 'prizes':
      return { type: 'PRIZES' }

    case 'conduct':
    case 'coc':
    case 'code-of-conduct':
      return { type: 'CONDUCT_VIEW' }

    case 'faq':
      return { type: 'FAQ' }

    case 'countdown': {
      return {
        type: 'COUNTDOWN',
        targetDate: TARGET_DATE,
        deadlineDate: DEADLINE_DATE,
        subText: 'until doors open, oct 02 2026, kathmandu time.'
      }
    }

    case 'register':
      return { type: 'REGISTER' }

    case 'contact':
      return { type: 'CONTACT' }

    case 'discord':
      return { type: 'DISCORD' }

    case 'testimonials':
      return { type: 'TESTIMONIALS' }

    case 'gallery':
      return { type: 'GALLERY' }

    case 'recap': {
      if (arg) {
        const year = parseInt(arg, 10)
        const recap = getRecap(year)
        if (!recap) {
          return { type: 'TEXT', text: `recap: no data for ${arg}. available years: 2023, 2024, 2025`, cls: 'warn' }
        }
        return { type: 'RECAP_DETAIL', recap }
      }
      return { type: 'RECAP_LIST', recaps }
    }

    case 'hall':
    case 'halloffame':
    case 'hall-of-fame':
    case 'fame':
    case 'museum':
      return { type: 'MUSEUM' }

    case 'home':
      return { type: 'HOME' }

    case 'fastfetch':
    case 'neofetch':
      return { type: 'FASTFETCH' }

    case 'ls': {
      if (arg === 'tracks' || arg === 'tracks/') {
        return { type: 'TEXT', text: TRACKS.map(t => t.file).join('  '), cls: 'accent2' }
      }
      return { type: 'TEXT', text: 'about.md  participation.md  tracks/  timeline.log  prizes.md  code-of-conduct.md  faq.md  register.sh  contact.md', cls: 'accent2' }
    }

    case 'cat': {
      if (!arg) {
        return { type: 'TEXT', text: 'usage: cat <file>', cls: 'warn' }
      }
      const cleanArg = arg.replace(/^\.\//, '')
      if (cleanArg.startsWith('tracks/')) {
        const fname = cleanArg.slice(7)
        const t = TRACKS.find(x => x.file === fname)
        if (t) {
          return { type: 'TRACK_DETAIL', track: t }
        }
        return { type: 'TEXT', text: `cat: ${arg}: No such file or directory`, cls: 'warn' }
      }
      
      switch (cleanArg) {
        case 'about.md': return { type: 'ABOUT' }
        case 'participation.md': return { type: 'PARTICIPATION' }
        case 'timeline.log': return { type: 'TIMELINE', items: getDynamicTimeline() }
        case 'prizes.md': return { type: 'PRIZES' }
        case 'code-of-conduct.md': return { type: 'CONDUCT' }
        case 'faq.md': return { type: 'FAQ' }
        case 'register.sh': return { type: 'REGISTER' }
        case 'contact.md': return { type: 'CONTACT' }
        default:
          return { type: 'TEXT', text: `cat: ${arg}: No such file or directory`, cls: 'warn' }
      }
    }

    case 'clear':
      return { type: 'CLEAR' }

    case 'whoami': {
      const randomTrack = TRACKS[Math.floor(Math.random() * TRACKS.length)].name.split(',')[0]
      return {
        type: 'TEXT',
        text: `guest, future champion of the ${randomTrack} track. type 'register' to make it official.`,
        cls: 'dim'
      }
    }

    case 'sudo':
      return {
        type: 'TEXT',
        text: 'guest is not in the sudoers file. this incident will be reported to the organizing committee.',
        cls: 'warn'
      }

    case 'date':
      return { type: 'TEXT', text: new Date().toString(), cls: 'dim' }

    case 'echo':
      return { type: 'TEXT', text: arg, cls: 'dim' }

    case 'history': {
      const items = history.map((h, i) => `  ${i + 1}  ${h}`)
      return { type: 'TEXT_LIST', lines: items, cls: 'faint' }
    }

    case 'exit':
    case 'logout':
      return {
        type: 'TEXT',
        text: "nice try, this session doesn't end until you register.",
        cls: 'warn'
      }

    default:
      return {
        type: 'TEXT',
        text: `command not found: ${cmd}, type 'help' for a list of commands`,
        cls: 'warn'
      }
  }
}
