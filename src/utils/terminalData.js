export const TRACKS = [
  {
    id: 'climate',
    file: 'climate.sh',
    name: 'Climate Change, Resilience & Sustainability',
    desc: 'Strengthen disaster preparedness & early warning systems, and build tools for sustainable resource management.'
  },
  {
    id: 'cybersec',
    file: 'cybersec.sh',
    name: 'Cyber Security & Digital Trust',
    desc: 'Build solutions that harden digital infrastructure and strengthen trust across public and private systems.'
  },
  {
    id: 'egov',
    file: 'egov.sh',
    name: 'E-Governance & Smart Public Services',
    desc: 'Make public services faster and more transparent through technology-driven government solutions.'
  },
  {
    id: 'transport',
    file: 'transport.sh',
    name: 'Smart Urban Transport & Road Safety',
    desc: 'Design solutions that make urban mobility safer, smarter, and easier to manage at scale.'
  },
  {
    id: 'fintech',
    file: 'fintech.sh',
    name: 'FinTech & Digital Financial Innovation',
    desc: 'Build the next generation of digital financial tools for a wider, more inclusive market.'
  }
]

export const TARGET_DATE = new Date('2026-10-02T00:00:00+05:45').getTime()
export const DEADLINE_DATE = new Date('2026-09-01T23:59:59+05:45').getTime()
export const ONLINE_START_DATE = new Date('2026-09-06T00:00:00+05:45').getTime()
export const ONLINE_END_DATE = new Date('2026-09-13T23:59:59+05:45').getTime()
export const JUDGING_START_DATE = new Date('2026-10-04T17:00:00+05:45').getTime()
export const EVENT_END_DATE = new Date('2026-10-04T23:59:59+05:45').getTime()

export function getDynamicTimeline() {
  const now = Date.now()

  return [
    {
      date: 'now',
      desc: 'Registration opens, apply as a team, completely free.',
      tag: now < DEADLINE_DATE ? '[ONGOING]' : '[PASSED]',
      cls: now < DEADLINE_DATE ? 'ok' : 'dim'
    },
    {
      date: 'sep 01 2026',
      desc: 'Registration closes, last day to lock your team in.',
      tag: now < DEADLINE_DATE ? '[UPCOMING]' : '[PASSED]',
      cls: now < DEADLINE_DATE ? 'warn' : 'dim'
    },
    {
      date: 'sep 06–13 2026',
      desc: 'Online Round',
      tag: now < ONLINE_START_DATE ? '[UPCOMING]' : (now <= ONLINE_END_DATE ? '[ONGOING]' : '[PASSED]'),
      cls: now < ONLINE_START_DATE ? 'warn' : (now <= ONLINE_END_DATE ? 'ok' : 'dim')
    },
    {
      date: 'oct 02 2026',
      desc: 'Hackathon begins, 48-hour build window opens on campus.',
      tag: now < TARGET_DATE ? '[UPCOMING]' : (now <= TARGET_DATE + 86400000 ? '[ONGOING]' : '[PASSED]'),
      cls: now < TARGET_DATE ? 'warn' : (now <= TARGET_DATE + 86400000 ? 'ok' : 'dim')
    },
    {
      date: 'oct 02–04 2026',
      desc: 'Build. Ship. Repeat. Mentorship & workshops run throughout.',
      tag: now < TARGET_DATE ? '[UPCOMING]' : (now <= EVENT_END_DATE ? '[ONGOING]' : '[PASSED]'),
      cls: now < TARGET_DATE ? 'warn' : (now <= EVENT_END_DATE ? 'ok' : 'dim')
    },
    {
      date: 'oct 04 2026',
      desc: 'Judging and winners announced, five tracks, five winners.',
      tag: now < JUDGING_START_DATE ? '[UPCOMING]' : (now <= EVENT_END_DATE ? '[ONGOING]' : '[PASSED]'),
      cls: now < JUDGING_START_DATE ? 'warn' : (now <= EVENT_END_DATE ? 'ok' : 'dim')
    }
  ]
}

export const COMMANDS = [
  'help', 'about', 'participation', 'tracks', 'timeline', 'prizes', 'conduct', 'coc', 'faq',
  'register', 'contact', 'discord', 'countdown', 'whoami', 'sudo', 'clear', 'ls', 'cat',
  'fastfetch', 'neofetch', 'date', 'echo', 'history', 'exit', 'logout'
]
