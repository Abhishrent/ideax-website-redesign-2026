import React from 'react'
import './Conduct.css'

export default function Conduct({ onReturn }) {
  return (
    <div className="conduct-stage">
      <div className="crt-overlay" />
      <div className="fullscreen-vignette" />

      <div className="conduct-container">
        <h1 className="conduct-title">Code of Conduct</h1>
        <div className="conduct-content">
          <h3>code-of-conduct.md</h3>
          <p>
            At <span className="strong">IdeaX</span>, we believe in building not only the future of technology and innovation but also a community rooted in respect, inclusivity, and collaboration. As organizers, it is our responsibility to ensure a safe, welcoming, and empowering environment for all participants—especially those from underrepresented or marginalized backgrounds.
          </p>

          <h4>Scope of Application</h4>
          <p>Applies to all participants, mentors, sponsors, partners, volunteers, judges, and anyone affiliated with IdeaX across all official online and physical spaces.</p>

          <h4>Our Commitment</h4>
          <p>IdeaX is committed to providing a harassment-free and inclusive experience for everyone, regardless of gender identity, sexual orientation, disability or health condition, age, or technological background.</p>

          <h4>Expected Behaviour</h4>
          <ul>
            <li>Be respectful of others' opinions, work, and personal space.</li>
            <li>Use inclusive language and maintain professionalism at all times.</li>
            <li>Embrace diverse ideas and interdisciplinary collaboration.</li>
            <li>Respect event schedules, deadlines, and community guidelines.</li>
            <li>Seek consent before photographing or recording others.</li>
          </ul>

          <h4>Prohibited Conduct</h4>
          <ul>
            <li>Harassment in any form, including verbal abuse or unwelcome advances.</li>
            <li>Offensive or discriminatory speech, visuals, or gestures.</li>
            <li>Plagiarism or misrepresentation of work.</li>
            <li>Intoxication or possession of illegal substances on event premises.</li>
            <li>Sabotaging, disrupting, or intimidating fellow participants.</li>
          </ul>

          <h4>Participation & Team Guidelines</h4>
          <ul>
            <li>Open to students and young innovators between <strong>18 and 26 years of age</strong>.</li>
            <li>Teams must consist of <strong>2 to 4 members</strong> (interdisciplinary teams encouraged).</li>
            <li>Each individual may participate in only one team.</li>
            <li>Valid photo ID (e.g. student ID) required upon request.</li>
          </ul>

          <h4>Project & Submission Guidelines</h4>
          <ul>
            <li>All submissions must be initiated and completed during the official event timeline.</li>
            <li>No code or final assets may be created beforehand (sketching & planning allowed).</li>
            <li>Projects must respect ethical standards and avoid violence or hate speech.</li>
            <li>At least one team member must present during the final showcase.</li>
          </ul>

          <h4>Reporting Concerns & Consequences</h4>
          <p>Report issues immediately to organizing committee members (recognized by official IdeaX badges & T-shirts). Violations may result in verbal warnings, disqualification, or removal.</p>

          <div className="conduct-meta">
            Need Assistance? Krishna Adhikari: <a href="tel:+9779842362679">9842362679</a> &middot; Krijal Paneru: <a href="tel:+9779744289830">9744289830</a>
          </div>
        </div>

        {onReturn && (
          <button className="return-btn" onClick={onReturn}>
            ← back to terminal
          </button>
        )}
      </div>
    </div>
  )
}
