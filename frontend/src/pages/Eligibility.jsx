import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import '../styles/Eligibility.css';

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa',
  'Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala',
  'Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland',
  'Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura',
  'Uttar Pradesh','Uttarakhand','West Bengal',
  'Delhi (NCT)','Puducherry','Jammu & Kashmir','Ladakh',
];

export default function Eligibility() {
  const [age,     setAge]     = useState(18);
  const [citizen, setCitizen] = useState(false);
  const [state,   setState]   = useState('');
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [step,    setStep]    = useState(1);   // 1=age, 2=details, 3=result
  const navigate = useNavigate();

  const handleCheck = async () => {
    setLoading(true);
    setResult(null);
    try {
      const data = await api.eligibility(age, citizen, state);
      setResult(data);
      setStep(3);
    } catch {
      const eligible = age >= 18 && citizen;
      const reasons = [];
      if (age < 18) reasons.push(`❌ Age ${age} is below the minimum 18 years required.`);
      else reasons.push(`✅ Age ${age} meets the 18-year requirement.`);
      if (!citizen) reasons.push('❌ Only Indian citizens can vote.');
      else reasons.push('✅ Indian citizenship confirmed.');
      setResult({
        eligible,
        reasons,
        next_steps: eligible ? [
          'Visit voterportal.eci.gov.in to register',
          'Fill Form 6 for new voter registration',
          'Upload Aadhaar and address proof',
          'Call Voter Helpline 1950 for help',
        ] : [],
        message: eligible
          ? '🎉 You are eligible to vote in Indian elections!'
          : '❌ You are not eligible to vote at this time.',
      });
      setStep(3);
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    setResult(null);
    setCitizen(false);
    setAge(18);
    setState('');
    setStep(1);
  };

  return (
    <div className="eligibility-page">
      <div className="container">

        {/* Info cards */}
        <div className="eligibility-info-row">
          {[
            { num:'18+',   label:'Minimum voting age' },
            { num:'🇮🇳',   label:'Must be Indian citizen' },
            { num:'543',   label:'Lok Sabha constituencies' },
            { num:'1950',  label:'Voter helpline number' },
          ].map((item, i) => (
            <div key={i} className="card eligibility-info-card">
              <h3>{item.num}</h3>
              <p>{item.label}</p>
            </div>
          ))}
        </div>

        {/* Step tracker */}
        <div className="step-tracker">
          <div className={`step-item ${step >= 1 ? (step > 1 ? 'done' : 'active') : ''}`}>
            {step > 1 ? '✅' : '1'} Age
          </div>
          <div className={`step-item ${step >= 2 ? (step > 2 ? 'done' : 'active') : ''}`}>
            {step > 2 ? '✅' : '2'} Details
          </div>
          <div className={`step-item ${step >= 3 ? 'active' : ''}`}>
            3 Result
          </div>
        </div>

        <div className="eligibility-layout">

          {/* Form Panel */}
          <div className="eligibility-form-panel">
            <div className="badge badge-success" style={{ display:'inline-flex', marginBottom:'16px' }}>
              ✅ Eligibility Checker
            </div>
            <h1>Are You Eligible <span className="gradient-text">to Vote?</span></h1>
            <p>Fill in your details below and we'll instantly tell you if you can cast your vote in Indian elections.</p>

            <div className="eligibility-form">

              {/* Age */}
              <div className="form-group">
                <label className="form-label" htmlFor="age-slider">
                  Step 1 — Your Age
                </label>
                <div className="age-input-group">
                  <div className="age-display">
                    <div>
                      <span className="age-number">{age}</span>
                      <span className="age-unit">years</span>
                    </div>
                    <div className="age-badge-wrap">
                      {age >= 18
                        ? <span className="badge badge-success">✅ Eligible age</span>
                        : <span className="badge badge-danger">❌ {18 - age} yrs to go</span>
                      }
                    </div>
                  </div>
                  <input
                    id="age-slider"
                    type="range"
                    min="5"
                    max="100"
                    value={age}
                    onChange={e => { setAge(Number(e.target.value)); setStep(Math.max(step, 2)); }}
                    className="range-slider"
                  />
                  <div className="range-labels">
                    <span>5</span><span>25</span><span>50</span><span>75</span><span>100</span>
                  </div>
                </div>
              </div>

              {/* State */}
              <div className="form-group">
                <label className="form-label" htmlFor="state-select">
                  Step 2 — State / UT <span style={{ color:'var(--text-muted)', fontWeight:400, textTransform:'none', letterSpacing:0 }}>(optional)</span>
                </label>
                <select
                  id="state-select"
                  className="form-input form-select"
                  value={state}
                  onChange={e => setState(e.target.value)}
                >
                  <option value="">Select your state...</option>
                  {INDIAN_STATES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Citizenship */}
              <div className="form-group">
                <label className="form-label">Step 3 — Citizenship</label>
                <label className="citizen-checkbox" htmlFor="citizen-check">
                  <input
                    id="citizen-check"
                    type="checkbox"
                    checked={citizen}
                    onChange={e => { setCitizen(e.target.checked); setStep(Math.max(step, 2)); }}
                  />
                  <div className="citizen-checkbox-text">
                    <h4>I am an Indian Citizen 🇮🇳</h4>
                    <p>Born in India or have naturalized Indian citizenship</p>
                  </div>
                </label>
              </div>

              {/* Submit */}
              <button
                id="check-eligibility-btn"
                className="btn btn-primary check-btn"
                onClick={handleCheck}
                disabled={loading}
              >
                {loading
                  ? <><div className="spinner" style={{ width:'20px', height:'20px', borderWidth:'2px' }} /> Checking...</>
                  : '✅ Check My Eligibility'
                }
              </button>
            </div>
          </div>

          {/* Result Panel */}
          <div className="eligibility-result-panel">
            {!result ? (
              <div className="card eligibility-result-placeholder">
                <div className="eligibility-result-placeholder-icon">🗳️</div>
                <h3 style={{ color:'var(--text-secondary)', fontSize:'1.1rem' }}>Your Result Appears Here</h3>
                <p style={{ fontSize:'0.84rem' }}>
                  Fill in your age and citizenship status, then click "Check My Eligibility".
                </p>
              </div>
            ) : (
              <div className="card eligibility-result-card animate-scale">

                {/* Result Header */}
                <div className={`result-header ${result.eligible ? 'eligible' : 'not-eligible'}`}>
                  <div className="result-icon">{result.eligible ? '🎉' : '❌'}</div>
                  <div>
                    <h2>{result.eligible ? 'You Can Vote!' : 'Not Eligible Yet'}</h2>
                    <p>{result.message}</p>
                  </div>
                </div>

                {/* Reasons */}
                <div className="result-reasons">
                  {result.reasons?.map((r, i) => (
                    <div key={i} className="result-reason-item">{r}</div>
                  ))}
                  {state && (
                    <div className="result-reason-item">
                      📍 State: <strong style={{ marginLeft:'4px', color:'var(--text-primary)' }}>{state}</strong>
                    </div>
                  )}
                </div>

                {/* Next Steps */}
                {result.eligible && result.next_steps?.length > 0 && (
                  <>
                    <div className="next-steps-title">📋 Next Steps to Register</div>
                    <div className="next-steps-list">
                      {result.next_steps.map((step, i) => (
                        <div key={i} className="next-step-item">
                          <div className="next-step-num">{i + 1}</div>
                          {step}
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* Actions */}
                <div className="result-actions">
                  {result.eligible ? (
                    <a
                      href="https://voters.eci.gov.in"
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-primary"
                    >
                      🔗 Register to Vote
                    </a>
                  ) : (
                    <button className="btn btn-secondary" onClick={() => navigate('/chat')}>
                      💬 Ask AI for Help
                    </button>
                  )}
                  <button className="btn btn-ghost" onClick={resetAll}>
                    🔄 Reset
                  </button>
                </div>
              </div>
            )}

            {/* Static info */}
            <div className="card eligibility-info-static" style={{ marginTop:'var(--space-md)' }}>
              <h4>📌 Eligibility Criteria in India</h4>
              <ul>
                <li>Age 18 or above (as of Jan 1 of election year)</li>
                <li>Indian citizen by birth or naturalization</li>
                <li>Resident of constituency for 6+ months</li>
                <li>Not barred by any court order</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
