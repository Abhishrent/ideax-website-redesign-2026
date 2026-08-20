import React, { useEffect, useState } from 'react'
import AsciiCanvas from './AsciiCanvas'
import { testimonials } from '../utils/testimonialsData'

function CountdownItem({ targetDate, deadlineDate, subText, countdownText, deadlineText }) {
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  if (!targetDate) {
    return (
      <div className="line block">
        <div>
          <span className="accent">{countdownText}</span>{' '}
          <span className="dim">{subText}</span>
        </div>
        {deadlineText && <div className="faint">{deadlineText}</div>}
      </div>
    )
  }

  const diff = targetDate - now
  if (diff <= 0) {
    return (
      <div className="line block">
        <span className="accent">[LIVE]</span> the build window is open. good luck.
      </div>
    )
  }

  const d = Math.floor(diff / 86400000)
  const h = Math.floor((diff % 86400000) / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  const s = Math.floor((diff % 60000) / 1000)

  const ddiff = deadlineDate - now
  let computedDeadlineText = ''
  if (ddiff > 0) {
    const dd = Math.floor(ddiff / 86400000)
    computedDeadlineText = `registration closes in ~${dd} days (sep 01 2026).`
  } else {
    computedDeadlineText = 'registration window has closed.'
  }

  return (
    <div className="line block">
      <div>
        <span className="accent">T-minus {d}d {h}h {m}m {s}s</span>{' '}
        <span className="dim">{subText}</span>
      </div>
      {computedDeadlineText && <div className="faint">{computedDeadlineText}</div>}
    </div>
  )
}

export default function OutputPane({ items, onRunCommand, outputRef, onFocusInput }) {

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [items, outputRef])

  const handlePaneClick = (e) => {
    const sel = window.getSelection()
    if (sel && sel.toString().length > 0) return
    onFocusInput()
  }

  const renderItem = (item, idx) => {
    switch (item.type) {
      case 'ECHO':
        return (
          <div key={idx} className="line echo-line">
            <span className="prompt-echo">guest@ideax:~$</span>
            {item.command}
          </div>
        )

      case 'TEXT':
        return (
          <div key={idx} className={`line ${item.cls || ''}`}>
            {item.text}
          </div>
        )

      case 'TEXT_LIST':
        return (
          <div key={idx} className="line block">
            {item.lines.map((l, i) => (
              <div key={i} className={item.cls || ''}>{l}</div>
            ))}
          </div>
        )

      case 'BLANK':
        return <div key={idx} className="line">&nbsp;</div>

      case 'HELP':
        return (
          <React.Fragment key={idx}>
            <div className="line dim">available commands</div>
            <div className="line block table">
              {item.rows.map(([cmd, desc], i) => (
                <div key={i} className="row">
                  <button
                    type="button"
                    className="cmd-link"
                    onClick={(e) => {
                      e.stopPropagation()
                      onRunCommand(cmd.split(' ')[0])
                    }}
                  >
                    {cmd}
                  </button>
                  <span className="dim">{desc}</span>
                </div>
              ))}
            </div>
            <div className="line faint">tip: click any command above, use the chips below, or just type.</div>
          </React.Fragment>
        )

      case 'ABOUT':
        return (
          <div key={idx} className="line block">
            <div className="card">
              <h3>about.md</h3>
              <p>
                <span className="strong">MBMC IdeaX</span> is a 48-hour, in-person technology hackathon organized by Madan Bhandari Memorial College in Kathmandu, Nepal. Teams get two days and two nights to design, build, and ship real solutions across five national-priority problem tracks.
              </p>
              <p style={{ marginTop: '8px' }}>
                It begins <span className="strong">2nd October 2026</span>. Registration closes <span className="strong">1st September 2026</span>. Participation is free, teams are encouraged but not required, and every track winner takes home cash prizes plus a shot at mentorship and incubation.
              </p>
            </div>
          </div>
        )

      case 'TRACKS_LIST':
        return (
          <React.Fragment key={idx}>
            <div className="line dim">$ ls tracks/</div>
            <div className="line block">
              {item.tracks.map((t) => (
                <div key={t.id} className="card">
                  <h3>
                    <button
                      type="button"
                      className="cmd-link"
                      onClick={(e) => {
                        e.stopPropagation()
                        onRunCommand(`tracks ${t.id}`)
                      }}
                    >
                      tracks/{t.file}
                    </button>
                    , {t.name}
                  </h3>
                  <p>{t.desc}</p>
                  <div className="meta">&gt; prize: Rs. 10,000</div>
                </div>
              ))}
            </div>
          </React.Fragment>
        )

      case 'TRACK_DETAIL':
        return (
          <div key={idx} className="line block">
            <div className="card">
              <h3>tracks/{item.track.file}</h3>
              <p>{item.track.desc}</p>
              <div className="meta">&gt; prize: Rs. 10,000</div>
            </div>
          </div>
        )

      case 'TIMELINE':
        return (
          <React.Fragment key={idx}>
            <div className="line dim">$ tail -f timeline.log</div>
            <div className="line block table">
              {item.items.map((item, i) => (
                <div key={i} className="row">
                  <span className="accent2">{item.date}</span>
                  <span className="dim">
                    {item.desc} <span className={`tag ${item.cls}`}>{item.tag}</span>
                  </span>
                </div>
              ))}
            </div>
          </React.Fragment>
        )

      case 'PRIZES':
        return (
          <div key={idx} className="line block">
            <div className="card">
              <h3>prize-pool.md</h3>
              <p>
                Total prize pool of <span className="strong" style={{ fontSize: '1.15em' }}>Rs. 111,111</span> up for grabs across all tracks and awards.
              </p>
            </div>
            <div className="card">
              <h3>grand-winner.md</h3>
              <p>
                <span className="strong" style={{ fontSize: '1.15em' }}>Rs. 50,000</span> awarded to the overall grand winner.
              </p>
            </div>
            <div className="card">
              <h3>per-track.md</h3>
              <p>
                <span className="strong" style={{ fontSize: '1.15em' }}>Rs. 10,000</span> awarded to each track winner (5 tracks).
              </p>
            </div>
            <div className="card">
              <h3>beyond-cash.md</h3>
              <p>Mentorship, national recognition, and potential incubation opportunities for standout projects.</p>
            </div>
            <div className="card">
              <h3>entry-fee.md</h3>
              <p>
                <span className="strong">Rs. 0</span>, completely free to join, no registration or participation fees.
              </p>
            </div>
          </div>
        )

      case 'COUNTDOWN':
        return (
          <CountdownItem
            key={idx}
            targetDate={item.targetDate}
            deadlineDate={item.deadlineDate}
            subText={item.subText}
            countdownText={item.countdownText}
            deadlineText={item.deadlineText}
          />
        )

      case 'REGISTER':
        return (
          <div key={idx} className="line block">
            <div className="card">
              <h3>register.sh</h3>
              <p>
                Fill out the official <a href="https://forms.gle/cBgYAroPeJeZpxa6A" target="_blank" rel="noopener noreferrer">Registration Form</a> to sign up your team or enter solo.
              </p>
              <p style={{ marginTop: '8px' }}>
                Join our official <a href="https://discord.com/invite/3RctjES2U" target="_blank" rel="noopener noreferrer">Discord Server</a> for team-finding, crucial announcements, and all future updates!
              </p>
              <div className="meta">
                registration closes 1st September 2026 &middot; teams encouraged, not required &middot; solo entries welcome
              </div>
            </div>
          </div>
        )

      case 'CONTACT':
        return (
          <div key={idx} className="line block">
            <div className="card">
              <h3>contact.md</h3>
              <div className="kv-grid">
                <div className="k">email</div>
                <div className="v"><a href="mailto:ideax@mbmc.edu.np">ideax@mbmc.edu.np</a></div>
                <div className="k">phone</div>
                <div className="v"><a href="tel:+9779842362679">+977-984-2362679</a></div>
                <div className="k">discord</div>
                <div className="v"><a href="https://discord.com/invite/3RctjES2U" target="_blank" rel="noopener noreferrer">discord.com/invite/3RctjES2U</a></div>
                <div className="k">venue</div>
                <div className="v">Madan Bhandari Memorial College, Kathmandu, Nepal</div>
                <div className="k">mode</div>
                <div className="v">in-person</div>
              </div>
            </div>
          </div>
        )

      case 'DISCORD':
        return (
          <div key={idx} className="line block">
            <div className="card">
              <h3>discord.invite</h3>
              <p>
                Join the server for team-finding, announcements, and mentor Q&amp;A:{' '}
                <a href="https://discord.com/invite/3RctjES2U" target="_blank" rel="noopener noreferrer">
                  discord.com/invite/3RctjES2U
                </a>
              </p>
            </div>
          </div>
        )

      case 'TESTIMONIALS':
        return (
          <React.Fragment key={idx}>
            <div className="line dim">$ cat testimonials.log</div>
            <div className="line block">
              {testimonials.map((t, i) => (
                <div key={i} className="card">
                  <h3>{t.name} <span className="dim">&mdash; {t.role}</span></h3>
                  <p style={{ fontStyle: 'italic' }}>"{t.quote}"</p>
                </div>
              ))}
            </div>
            <div className="line faint">type 'gallery' for the full visual experience.</div>
          </React.Fragment>
        )

      case 'RECAP_LIST':
        return (
          <React.Fragment key={idx}>
            <div className="line dim">$ ls recaps/</div>
            <div className="line block table">
              <div className="row" style={{ marginBottom: '4px' }}>
                <span className="strong">year</span>
                <span className="strong">theme</span>
                <span className="strong">participants</span>
                <span className="strong">winner</span>
              </div>
              {item.recaps.map((r) => (
                <div key={r.year} className="row">
                  <button
                    type="button"
                    className="cmd-link"
                    onClick={(e) => {
                      e.stopPropagation()
                      onRunCommand(`recap ${r.year}`)
                    }}
                  >
                    {r.year}
                  </button>
                  <span className="dim">{r.theme}</span>
                  <span>{r.stats.participants || '—'}</span>
                  <span className="accent2">{r.winner.team}</span>
                </div>
              ))}
            </div>
            <div className="line faint">type 'recap &lt;year&gt;' for details (e.g. recap 2024).</div>
          </React.Fragment>
        )

      case 'RECAP_DETAIL': {
        const r = item.recap
        return (
          <div key={idx} className="line block">
            <div className="card">
              <h3>IdeaX {r.year} <span className="dim">&mdash; {r.theme}</span></h3>
              <div className="kv-grid" style={{ marginTop: '10px' }}>
                <div className="k">participants</div><div className="v">{r.stats.participants || '—'}</div>
                <div className="k">teams</div><div className="v">{r.stats.teams || '—'}</div>
                <div className="k">tracks</div><div className="v">{r.stats.tracks || '—'}</div>
                <div className="k">submissions</div><div className="v">{r.stats.submissions || '—'}</div>
              </div>
            </div>
            <div className="card">
              <h3>highlights</h3>
              <ul style={{ margin: '6px 0 0 16px', padding: 0 }}>
                {r.highlights.map((h, i) => (
                  <li key={i} className="dim" style={{ marginBottom: '4px' }}>{h}</li>
                ))}
              </ul>
            </div>
             <div className="card">
              <h3>winner</h3>
              <p>
                <span className="strong">{r.winner.team}</span>
                {r.winner.project && <span className="dim"> &mdash; {r.winner.project}</span>}
                {r.winner.track && <span className="faint"> ({r.winner.track})</span>}
              </p>
            </div>
            {r.runnerUp && r.runnerUp.team && (
              <div className="card">
                <h3>runner-up</h3>
                <p>
                  <span className="strong">{r.runnerUp.team}</span>
                  {r.runnerUp.project && <span className="dim"> &mdash; {r.runnerUp.project}</span>}
                </p>
              </div>
            )}
          </div>
        )
      }

      case 'FASTFETCH':
        return (
          <div key={idx} className="line block fetch-row">
            <div className="fetch-art">
              <AsciiCanvas />
            </div>
            <div className="fetch-info">
              <div className="strong">guest<span className="dim">@</span>ideax</div>
              <div className="faint">------------------</div>
              <div className="kv-grid">
                <div className="k">OS</div><div className="v">MBMC IdeaX 2026</div>
                <div className="k">Host</div><div className="v">Madan Bhandari Memorial College</div>
                <div className="k">Kernel</div><div className="v">hackathon-6.2.2026</div>
                <div className="k">Uptime</div><div className="v">48:00:00 (build window)</div>
                <div className="k">Tracks</div><div className="v">5</div>
                <div className="k">Prize Pool</div><div className="v">Rs. 111,111</div>
                <div className="k">Shell</div><div className="v">register.sh</div>
                <div className="k">Venue</div><div className="v">Kathmandu, Nepal</div>
                <div className="k">Deadline</div><div className="v">2026-09-01</div>
                <div className="k">Event</div><div className="v">2026-10-02 &rarr; 2026-10-04</div>
              </div>
              <div className="swatches" aria-hidden="true">
                <span style={{ background: '#1d4ed8' }} />
                <span style={{ background: '#2563ff' }} />
                <span style={{ background: '#3b82f6' }} />
                <span style={{ background: '#60a5fa' }} />
                <span style={{ background: '#38bdf8' }} />
                <span style={{ background: '#7dd3fc' }} />
                <span style={{ background: '#eaf1ff' }} />
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div
      ref={outputRef}
      className="output"
      onClick={handlePaneClick}
      aria-live="polite"
      aria-label="terminal output"
    >
      {items.map(renderItem)}
    </div>
  )
}
