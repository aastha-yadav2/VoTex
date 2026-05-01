import { useState, useEffect } from 'react';
import { api } from '../services/api';
import '../styles/Timeline.css';

const FALLBACK_STEPS = [
  {
    step: 1, title: 'Voter Registration', icon: '📋',
    description: 'Citizens register on the Electoral Roll via Form 6 at their local ERO office or online at voters.eci.gov.in.',
    duration: 'Ongoing (closes ~45 days before election)',
    tips: ['Register before the deadline', 'Use Voter Helpline 1950', 'Check your name online'],
  },
  {
    step: 2, title: 'Verification & Voter ID', icon: '🪪',
    description: 'Election officials verify registration. An EPIC (Voter ID) is issued. Aadhaar can also be used as alternate ID.',
    duration: '4–6 weeks after registration',
    tips: ['Keep your Voter ID safe', 'Link Aadhaar with voter ID', 'Check status on voterportal.eci.gov.in'],
  },
  {
    step: 3, title: 'Election Schedule Announced', icon: '📅',
    description: 'The ECI announces the schedule including polling dates. The Model Code of Conduct comes into effect immediately.',
    duration: '~8–10 weeks before polling',
    tips: ['Follow reliable news sources', 'Understand MCC restrictions', 'Note your constituency polling date'],
  },
  {
    step: 4, title: 'Campaigning', icon: '📣',
    description: 'Political parties and candidates campaign. ECI enforces spending limits and MCC. Campaigning stops 48 hours before voting.',
    duration: '6–8 weeks, ending 48 hrs before polling',
    tips: ['Evaluate candidates on issues', 'Report MCC violations at 1950', 'Watch official debates'],
  },
  {
    step: 5, title: 'Voting Day', icon: '🗳️',
    description: 'Voters visit their designated polling booth, carry photo ID, press the EVM button next to their candidate, and receive an indelible ink mark.',
    duration: '7 AM – 6 PM on polling date',
    tips: ['Carry Voter ID or any of 12 approved IDs', 'Check booth location in advance', 'NOTA available if you prefer none'],
  },
  {
    step: 6, title: 'Vote Counting & Results', icon: '📊',
    description: 'Votes are counted on a stipulated date. EVM votes + VVPAT slips are tallied. Results declared by ECI.',
    duration: 'Usually 1–2 days after polling',
    tips: ['Watch live on ECI website', 'Results final once declared by RO', 'New government sworn in within weeks'],
  },
];

export default function Timeline() {
  const [steps,    setSteps]    = useState(FALLBACK_STEPS);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    api.timeline()
      .then(data => setSteps(data.steps || FALLBACK_STEPS))
      .catch(() => {/* use fallback */});
  }, []);

  const toggle = (stepNum) => setExpanded(prev => prev === stepNum ? null : stepNum);

  const CardContent = ({ step }) => {
    const isOpen = expanded === step.step;
    return (
      <div className="timeline-card" onClick={() => toggle(step.step)}>
        <div className="timeline-card-step">Step {step.step}</div>
        <h3>{step.title}</h3>
        <p>{step.description}</p>
        <div className="timeline-duration">🕒 {step.duration}</div>

        {isOpen && step.tips?.length > 0 && (
          <div className="timeline-tips">
            <div className="timeline-tips-title">💡 Tips</div>
            {step.tips.map((tip, ti) => (
              <div key={ti} className="timeline-tip-item">
                <div className="timeline-tip-dot" />
                {tip}
              </div>
            ))}
          </div>
        )}

        <div className="timeline-expand-hint">
          {isOpen ? '▲ Less details' : '▼ Tips & Details'}
        </div>
      </div>
    );
  };

  return (
    <div className="timeline-page">
      <div className="container">

        {/* Hero */}
        <div className="timeline-hero">
          <div className="badge badge-blue" style={{ display:'inline-flex', marginBottom:'16px' }}>
            📅 Step-by-Step Process
          </div>
          <h1>Indian Election <span className="gradient-text-blue">Timeline</span></h1>
          <p>
            From voter registration to counting — understand every phase
            of India's democratic election process.
          </p>
          <div className="india-tricolor" style={{ maxWidth:'200px', margin:'0 auto' }} />
        </div>

        {/* Alternating Timeline */}
        <div className="timeline-track">
          {steps.map((step, idx) => {
            const isOdd = idx % 2 === 0;
            return (
              <div key={step.step} className="timeline-item">
                {isOdd ? (
                  <>
                    <div style={{ gridColumn: 1 }}>
                      <CardContent step={step} />
                    </div>
                    <div className="timeline-center" style={{ gridColumn: 2 }}>
                      <div className={`timeline-node step-${step.step}`} onClick={() => toggle(step.step)}>
                        {step.icon}
                      </div>
                      <div className="timeline-step-num">Step {step.step}</div>
                    </div>
                    <div className="timeline-empty" style={{ gridColumn: 3 }} />
                  </>
                ) : (
                  <>
                    <div className="timeline-empty" style={{ gridColumn: 1 }} />
                    <div className="timeline-center" style={{ gridColumn: 2 }}>
                      <div className={`timeline-node step-${step.step}`} onClick={() => toggle(step.step)}>
                        {step.icon}
                      </div>
                      <div className="timeline-step-num">Step {step.step}</div>
                    </div>
                    <div style={{ gridColumn: 3 }}>
                      <CardContent step={step} />
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom note */}
        <div className="timeline-note">
          📌 Click any card to expand tips. For official election information, visit{' '}
          <a href="https://eci.gov.in" target="_blank" rel="noreferrer"
            style={{ color: 'var(--color-primary-light)' }}>eci.gov.in</a>{' '}
          or call the Voter Helpline{' '}
          <strong style={{ color: 'var(--color-primary-light)' }}>1950</strong>.
        </div>
      </div>
    </div>
  );
}
