import React, { useState, useEffect } from 'react'
import './Conduct.css'

const CONDUCT_SECTIONS = [
  {
    badge: 'SECTION 01 / 06',
    title: 'Scope & Commitment',
    subtitle: 'Our core philosophy and coverage',
    content: (
      <>
        <p>
          At <strong className="strong-text">IdeaX</strong>, we believe in building a community rooted in respect, inclusivity, and collaboration. It is our responsibility to ensure a safe, welcoming, and empowering environment for all participants.
        </p>
        <h4>Scope of Application</h4>
        <p>
          Applies to all participants, mentors, sponsors, partners, volunteers, judges, and anyone affiliated with IdeaX across all official online and physical spaces.
        </p>
        <h4>Our Commitment</h4>
        <p>
          IdeaX is committed to providing a harassment-free experience for everyone, regardless of gender identity, sexual orientation, disability, age, or tech background.
        </p>
      </>
    )
  },
  {
    badge: 'SECTION 02 / 06',
    title: 'Expected Behaviour',
    subtitle: 'Standards for all attendees',
    content: (
      <>
        <ul className="conduct-list">
          <li><strong>Respectful Interaction:</strong> Be respectful of others' opinions, work, and personal space.</li>
          <li><strong>Inclusive Language:</strong> Use inclusive language and maintain professionalism at all times.</li>
          <li><strong>Collaboration:</strong> Embrace diverse ideas and interdisciplinary collaboration.</li>
          <li><strong>Event Rules:</strong> Respect event schedules, deadlines, and community guidelines.</li>
          <li><strong>Privacy:</strong> Seek consent before photographing or recording others.</li>
        </ul>
      </>
    )
  },
  {
    badge: 'SECTION 03 / 06',
    title: 'Prohibited Conduct',
    subtitle: 'Unacceptable behaviors & zero tolerance',
    content: (
      <>
        <ul className="conduct-list warning-list">
          <li><strong>Harassment:</strong> Verbal abuse, intimidation, or unwelcome advances in any form.</li>
          <li><strong>Discrimination:</strong> Offensive speech, discriminatory visuals, or inappropriate gestures.</li>
          <li><strong>Academic Dishonesty:</strong> Plagiarism or misrepresentation of work.</li>
          <li><strong>Substance Policy:</strong> Intoxication or possession of illegal substances on premises.</li>
          <li><strong>Disruption:</strong> Sabotaging, disrupting, or intimidating fellow participants.</li>
        </ul>
      </>
    )
  },
  {
    badge: 'SECTION 04 / 06',
    title: 'Eligibility & Team Rules',
    subtitle: 'Requirements for entry',
    content: (
      <>
        <ul className="conduct-list">
          <li><strong>Age Limit:</strong> Open to students and young innovators between <strong className="strong-text">18 and 26 years of age</strong>.</li>
          <li><strong>Team Size:</strong> Teams must consist of <strong className="strong-text">2 to 4 members</strong> (interdisciplinary teams encouraged).</li>
          <li><strong>Single Team Entry:</strong> Each individual may participate in only one team.</li>
          <li><strong>Verification:</strong> Valid photo ID (e.g. student ID) required upon request.</li>
        </ul>
      </>
    )
  },
  {
    badge: 'SECTION 05 / 06',
    title: 'Project & Submissions',
    subtitle: 'Hacking rules & showcase guidelines',
    content: (
      <>
        <ul className="conduct-list">
          <li><strong>Fresh Code:</strong> All submissions must be initiated and completed during the official event timeline.</li>
          <li><strong>No Pre-made Work:</strong> No code or final assets may be created beforehand (sketching & planning allowed).</li>
          <li><strong>Ethics:</strong> Projects must respect ethical standards and avoid violence or hate speech.</li>
          <li><strong>Presentation:</strong> At least one team member must present during the final showcase.</li>
        </ul>
      </>
    )
  },
  {
    badge: 'SECTION 06 / 06',
    title: 'Reporting & Contact',
    subtitle: 'How to report issues or get help',
    content: (
      <>
        <p>
          Report issues immediately to organizing committee members (recognized by official IdeaX badges & T-shirts). Violations may result in verbal warnings, disqualification, or removal.
        </p>
        <div className="conduct-contact-card">
          <h4>Organizing Committee Hotline</h4>
          <div className="contact-person">
            <span>Krishna Adhikari:</span> <a href="tel:+9779842362679">+977-984-2362679</a>
          </div>
          <div className="contact-person">
            <span>Krijal Paneru:</span> <a href="tel:+9779744289830">+977-974-4289830</a>
          </div>
        </div>
      </>
    )
  }
]

export default function Conduct({ onReturn }) {
  const [current, setCurrent] = useState(0)

  const goTo = (idx) => setCurrent(idx)
  const prev = () => setCurrent((current - 1 + CONDUCT_SECTIONS.length) % CONDUCT_SECTIONS.length)
  const next = () => setCurrent((current + 1) % CONDUCT_SECTIONS.length)

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [current])

  return (
    <div className="conduct-stage">
      <div className="crt-overlay" />
      <div className="fullscreen-vignette" />

      <div className="conduct-container">
        <h1 className="conduct-title">Code of Conduct</h1>
        <p className="conduct-subtitle">community rules & hackathon guidelines</p>

        <div className="conduct-slider">
          <button className="conduct-arrow conduct-arrow-left" onClick={prev} aria-label="previous section">
            &#x276E;
          </button>

          <div className="conduct-viewport">
            <div
              className="conduct-track"
              style={{ transform: `translateX(-${current * 100}%)` }}
            >
              {CONDUCT_SECTIONS.map((sec, i) => (
                <div key={i} className="conduct-slide">
                  <div className="conduct-card">
                    <div className="conduct-card-header">
                      <span className="conduct-badge">{sec.badge}</span>
                      <h2 className="conduct-card-title">{sec.title}</h2>
                      <span className="conduct-card-subtitle">{sec.subtitle}</span>
                    </div>
                    <div className="conduct-card-body">
                      {sec.content}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button className="conduct-arrow conduct-arrow-right" onClick={next} aria-label="next section">
            &#x276F;
          </button>
        </div>

        <div className="conduct-dots">
          {CONDUCT_SECTIONS.map((_, i) => (
            <button
              key={i}
              className={`conduct-dot ${i === current ? 'active' : ''}`}
              onClick={() => goTo(i)}
              aria-label={`go to section ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {onReturn && (
        <button className="return-btn" onClick={onReturn}>
          &#x2190; back to terminal
        </button>
      )}
    </div>
  )
}
