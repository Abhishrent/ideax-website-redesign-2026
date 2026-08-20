import React, { useState, useEffect } from 'react'
import AsciiCanvas from './AsciiCanvas'
import { testimonials } from '../utils/testimonialsData'

export default function OutputPane({ items, onRunCommand, outputRef, onFocusInput }) {

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [items, outputRef])

  const [countdown, setCountdown] = useState('')
  useEffect(() => {
    function updateCountdown() {
      const target = new Date('2026-09-01T00:00:00')
      const now = new Date()
      const diff = target - now
      if (diff <= 0) {
        setCountdown('00:00:00')
        return
      }
      const d = Math.floor(diff / (1000 * 60 * 60 * 24))
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24)
      const m = Math.floor((diff / (1000 * 60)) % 60)
      const s = Math.floor((diff / 1000) % 60)
      setCountdown(`${d}d ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`)
    }
    updateCountdown()
    const id = setInterval(updateCountdown, 1000)
    return () => clearInterval(id)
  }, [])

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
                <span className="strong">MBMC IdeaX 2026</span> is a national technology hackathon organized by Madan Bhandari Memorial College in Kathmandu, Nepal. Registration opened on <span className="strong">28th Shrawan 2083 (13th Aug)</span> and closes on <span className="strong">16th Bhadra (1st Sept)</span>. The <span className="strong">Online Round</span> runs from <span className="strong">21st–28th Bhadra (6th–13th Sept)</span>, followed by the <span className="strong">Final On-Site Hackathon Event</span> from <span className="strong">16th–18th Ashoj (2nd–4th Oct)</span>. Participants will develop innovative technology solutions across five problem tracks: Climate Change, Resilience &amp; Sustainability; Cyber Security &amp; Digital Trust; E-Governance &amp; Smart Public Services; Smart Urban Transport &amp; Road Safety; and FinTech &amp; Digital Financial Innovation.
              </p>
            </div>
          </div>
        )

      case 'PARTICIPATION':
        return (
          <div key={idx} className="line block">
            <div className="card">
              <h3>participation.md</h3>
              <p className="strong" style={{ fontSize: '1.05em', color: 'var(--accent4)' }}>
                Why participate in IdeaX?
              </p>
              <ul style={{ margin: '8px 0 8px 18px', padding: 0, color: 'var(--dim)' }}>
                <li>Solve real-world challenges aligned with national priorities.</li>
                <li>Work with experienced mentors, judges, and industry leaders.</li>
                <li>Build innovative AI-powered and technology-driven solutions.</li>
                <li>Compete on a nationally recognized innovation platform.</li>
                <li>Expand professional networks with startups, academia, government, and industry.</li>
                <li>Receive mentorship, recognition, prizes, and potential incubation opportunities.</li>
                <li>Showcase technical excellence and entrepreneurial thinking.</li>
              </ul>
              <div className="meta">&gt; Cost: Rs. 0 (100% Free) &middot; Mentorship &amp; Incubation Opportunities</div>
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

      case 'FAQ':
        return (
          <div key={idx} className="line block">
            <div className="card">
              <h3>faq.md</h3>

              <p className="strong" style={{ color: 'var(--accent4)' }}>What is MBMC IdeaX 2026?</p>
              <p style={{ marginBottom: '10px' }}>MBMC IdeaX 2026 is a national-level technology hackathon organized by Madan Bhandari Memorial College. It brings together innovators, developers, and students over 48 high-energy hours to build real-world tech solutions.</p>

              <p className="strong" style={{ color: 'var(--accent4)' }}>When is the hackathon?</p>
              <p style={{ marginBottom: '10px' }}>The Online Round runs 21st–28th Bhadra (6th–13th Sept), and the Final On-Site Event runs 16th–18th Ashoj (2nd–4th Oct 2026).</p>

              <p className="strong" style={{ color: 'var(--accent4)' }}>What is the registration deadline?</p>
              <p style={{ marginBottom: '10px' }}>Registration closes on 16th Bhadra (1st September 2026).</p>

              <p className="strong" style={{ color: 'var(--accent4)' }}>Is the hackathon online or offline?</p>
              <p style={{ marginBottom: '10px' }}>MBMC IdeaX 2026 features an Online Round (6th–13th Sept) followed by an in-person Final Event (2nd–4th Oct) at Madan Bhandari Memorial College in Kathmandu, Nepal.</p>

              <p className="strong" style={{ color: 'var(--accent4)' }}>How long is the hackathon?</p>
              <p style={{ marginBottom: '10px' }}>The hackathon runs continuously for a duration of 48 hours.</p>

              <p className="strong" style={{ color: 'var(--accent4)' }}>What are the problem tracks?</p>
              <p style={{ marginBottom: '10px' }}>The five official problem tracks are: 1) Climate Change, Resilience &amp; Sustainability, 2) Cyber Security &amp; Digital Trust, 3) E-Governance &amp; Smart Public Services, 4) Smart Urban Transport &amp; Road Safety, and 5) FinTech &amp; Digital Financial Innovation.</p>

              <p className="strong" style={{ color: 'var(--accent4)' }}>Where is the event held?</p>
              <p style={{ marginBottom: '10px' }}>The event is held at Madan Bhandari Memorial College, Kathmandu, Nepal.</p>

              <p className="strong" style={{ color: 'var(--accent4)' }}>What are the prizes?</p>
              <p style={{ marginBottom: '10px' }}>Each track winner receives a cash reward of Rs. 10,000, with a total prize pool of Rs. 111,111 (including Rs. 50,000 for the overall grand winner).</p>

              <p className="strong" style={{ color: 'var(--accent4)' }}>How do I register?</p>
              <p style={{ marginBottom: '10px' }}>You can register directly through our official website registration link or via our official Devfolio page.</p>

              <p className="strong" style={{ color: 'var(--accent4)' }}>Do I need to have a team to participate?</p>
              <p style={{ marginBottom: '10px' }}>Teams are encouraged but not required. You can register individually or with a team of up to 4 members.</p>

              <p className="strong" style={{ color: 'var(--accent4)' }}>Are there any registration or participation fees?</p>
              <p>No! MBMC IdeaX 2026 is 100% free of cost with zero registration or participation fees.</p>
            </div>
          </div>
        )

      case 'REGISTER_BANNER':
        return (
          <div key={idx} className="line block register-cta-card">
            <div className="register-cta-content">
              <div className="register-cta-header">
                <span className="pulse-dot" />
                <span className="register-cta-title">REGISTRATION IS LIVE</span>
                <span className="register-cta-badge">FREE ENTRY</span>
              </div>
              <p className="register-cta-desc">
                Ready to innovate, build, and win from the <strong className="highlight-text">Rs. 111,111</strong> prize pool? Reserve your spot now!
              </p>
              <div className="register-cta-actions">
                <a
                  href="https://forms.gle/cBgYAroPeJeZpxa6A"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="register-now-btn"
                >
                  REGISTER NOW &rarr;
                </a>
                <a
                  href="https://discord.com/invite/3RctjES2U"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="discord-cta-btn"
                >
                  JOIN DISCORD &rarr;
                </a>
                <button
                  type="button"
                  className="register-secondary-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    onRunCommand('register')
                  }}
                >
                  register.sh
                </button>
              </div>
            </div>
          </div>
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
                registration closes 16th Bhadra (1st September) &middot; teams encouraged, not required &middot; solo entries welcome
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
                <div className="k">Countdown</div><div className="v">{countdown} (until Sep 1)</div>
                <div className="k">Tracks</div><div className="v">5</div>
                <div className="k">Prize Pool</div><div className="v">Rs. 111,111</div>
                <div className="k">Shell</div><div className="v">register.sh</div>
                <div className="k">Venue</div><div className="v">Kathmandu, Nepal</div>
                <div className="k">Deadline</div><div className="v">16th Bhadra (1st Sept)</div>
                <div className="k">Online Rd</div><div className="v">21st–28th Bhadra (6th–13th Sept)</div>
                <div className="k">Final Event</div><div className="v">16th–18th Ashoj (2nd–4th Oct)</div>
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
      
      {/* SEO-friendly hidden content for search engines */}
      <div className="seo-content" aria-hidden="true">
        <h1>MBMC IdeaX 2026 - Nepal's National Hackathon</h1>
        <h2>About the Event</h2>
        <p>MBMC IdeaX 2026 is a national-level hackathon organized by Madan Bhandari Memorial College in Kathmandu, Nepal. The event brings together innovators, developers, and students to solve real-world challenges over 48 hours of intensive building and innovation.</p>
        
        <h2>Tracks</h2>
        <ul>
          <li>Climate Change, Resilience & Sustainability - Build tools for disaster preparedness and sustainable resource management</li>
          <li>Cyber Security & Digital Trust - Harden digital infrastructure and strengthen trust across systems</li>
          <li>E-Governance & Smart Public Services - Make public services faster and more transparent through technology</li>
          <li>Smart Urban Transport & Road Safety - Design solutions for safer, smarter urban mobility</li>
          <li>FinTech & Digital Financial Innovation - Build next-generation digital financial tools for inclusion</li>
        </ul>
        
        <h2>Timeline</h2>
        <p>Registration closes September 1st, 2026. Online Round: September 6-13, 2026. Final Event: October 2-4, 2026 at Madan Bhandari Memorial College, Kathmandu.</p>
        
        <h2>Prizes</h2>
        <p>Total prize pool of Rs. 111,111 distributed across winning teams in different tracks.</p>
        
        <h2>Register</h2>
        <p>Join 500+ innovators at IdeaX 2026. Form a team of 2-4 members and register before September 1st. The event is completely free to participate.</p>
      </div>
    </div>
  )
}
