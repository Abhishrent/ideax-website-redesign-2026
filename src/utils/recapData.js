export const recaps = [
  {
    year: 2023,
    theme: 'Preserve \u2022 Promote \u2022 Revitalize',
    stats: {
      participants: '100+',
      teams: '21 finalists',
      tracks: 4,
      submissions: '21+',
    },
    highlights: [
      'Nepal\u2019s first hackathon focused on indigenous languages using ICT',
      '48-hour on-site event at MBM College, Kathmandu',
      'Gender-balanced participation: 53.4% male, 46.6% female',
      'Supported by UNESCO, Ministry of Education, and 15+ sponsors',
    ],
    winner: {
      team: 'Team Xenon',
      project: 'Xeno Lingo',
      track: 'Winner',
    },
    runnerUp: {
      team: 'Team Lipi',
      project: 'Lipi',
    },
  },
  {
    year: 2024,
    theme: 'IdeaX Innovation',
    stats: {
      participants: '250+',
      teams: '50+',
      tracks: 6,
      submissions: '50+',
    },
    highlights: [
      'Expanded to 6 tracks: Open, Healthcare, Fin-Tech, Environment, Travel & Tourism, Agro-Tech',
      'Scaled from ~100 to 250+ participants across Nepal',
      'Strong focus on AI/ML solutions across all tracks',
      'NPR 3 Lakh+ in prizes awarded',
    ],
    winner: {
      team: 'Team Pookie Blinders',
      project: 'PhysioNep',
      track: 'Grand Winner',
    },
    runnerUp: {
      team: 'Team Batti Balyo',
      project: 'Home Link',
    },
  },
  {
    year: 2025,
    theme: 'IdeaX Innovation',
    stats: {
      participants: 'TBA',
      teams: '6 track winners',
      tracks: 6,
      submissions: 'TBA',
    },
    highlights: [
      'Third edition of MBMC IdeaX — Oct 31 to Nov 2, 2025',
      '6 tracks: Travel & Tourism, AgroTech, Healthcare, Cultural Identity, FinTech, Open',
      'Track winners: No Cactus, Dev Coders, Tech Tacticos, Digikrit, Code2Convert, Team Enigma',
      'Strong representation across all tracks with multi-member teams',
    ],
    winner: {
      team: 'Runtime Terrors',
      project: '',
      track: 'Grand Winner',
    },
    runnerUp: {
      team: 'Dev Coders',
      project: '',
    },
  },
]

export function getRecap(year) {
  return recaps.find(r => r.year === year) || null
}
