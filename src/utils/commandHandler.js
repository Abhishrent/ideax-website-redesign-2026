import { TRACKS, getDynamicTimeline, TARGET_DATE, DEADLINE_DATE } from './terminalData'


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
          ['about', 'what MBMC IdeaX actually is'],
          ['tracks', 'list the 5 problem tracks'],
          ['tracks <id>', 'detail on one track (climate / cybersec / egov / transport / fintech)'],
          ['timeline', 'registration + event dates'],
          ['prizes', 'prize breakdown'],
          ['countdown', 'time remaining until doors open'],
          ['register', 'how to sign up'],
          ['contact', 'email + phone for the organizing team'],
          ['discord', 'join the community server'],
          ['ls', 'list files in this directory'],
          ['cat <file>', 'print a file, e.g. cat prizes.md'],
          ['fastfetch', 'replay the splash screen'],
          ['clear', 'clear the screen'],
          ['whoami', 'find out who you are']
        ]
      }

    case 'about':
      return { type: 'ABOUT' }

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

    case 'fastfetch':
    case 'neofetch':
      return { type: 'FASTFETCH' }

    case 'ls': {
      if (arg === 'tracks' || arg === 'tracks/') {
        return { type: 'TEXT', text: TRACKS.map(t => t.file).join('  '), cls: 'accent2' }
      }
      return { type: 'TEXT', text: 'about.md  contact.md  prizes.md  register.sh  timeline.log  tracks/', cls: 'accent2' }
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
        case 'timeline.log': return { type: 'TIMELINE', items: getDynamicTimeline() }
        case 'prizes.md': return { type: 'PRIZES' }
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
