# AGENTS.md

## Project

React 19 + Vite 6 single-page app. Terminal-themed interactive site for MBMC IdeaX 2026 (a hackathon). Users type commands to explore tracks, timeline, prizes, etc.

## Commands

- `npm run dev` — Vite dev server
- `npm run build` — production build to `dist/`
- `npm run preview` — preview production build

No lint, typecheck, formatter, or test suite configured.

## Architecture

- `src/main.jsx` → React root
- `src/App.jsx` — state owner; boot sequence, command dispatch
- `src/utils/commandHandler.js` — command parser + router (switch on command name)
- `src/utils/terminalData.js` — static data (tracks, dates)
- `src/components/` — UI: TitleBar, OutputPane, CommandLine, SuggestionChips, LoadingIntro, AsciiCanvas
- Commands are dispatched via `onRunCommand` callback chain (not a router or context)

## Conventions

- JSX, no TypeScript (despite `@types/react` in devDeps)
- All terminal output types are string constants like `'HELP'`, `'TRACKS_LIST'`, `'TEXT'` — matched in `OutputPane`
- New commands: add case in `commandHandler.js`, return a result object with a `type` key, then handle that type in `OutputPane.jsx`
