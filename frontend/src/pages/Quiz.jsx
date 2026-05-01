import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import '../styles/Quiz.css';

const FALLBACK_QUESTIONS = [
  { id:1, question:'What is the minimum voting age in India?', options:['16','18','21','25'], answer:'18', explanation:'The 61st Constitutional Amendment (1989) lowered the voting age from 21 to 18 years.' },
  { id:2, question:'What does EVM stand for?', options:['Electronic Voting Machine','Electoral Vote Mechanism','Election Verified Module','Electronic Voter Management'], answer:'Electronic Voting Machine', explanation:'EVMs are standalone electronic devices used for polling in Indian elections since 1982.' },
  { id:3, question:'Which body conducts General Elections in India?', options:['Supreme Court','Parliament','Election Commission of India','President of India'], answer:'Election Commission of India', explanation:'The ECI is an autonomous constitutional authority responsible for administering Union and State election processes.' },
  { id:4, question:'What is NOTA?', options:['None Of The Above','National Online Tally Algorithm','New Order of The Assembly','National Official Tally Act'], answer:'None Of The Above', explanation:'NOTA allows voters to reject all candidates. Introduced in 2013 after a Supreme Court ruling.' },
  { id:5, question:'How often is the Lok Sabha election held?', options:['Every 3 years','Every 4 years','Every 5 years','Every 6 years'], answer:'Every 5 years', explanation:'Lok Sabha has a maximum term of 5 years unless dissolved earlier.' },
  { id:6, question:'What is the Model Code of Conduct (MCC)?', options:['IPC sections for election offenders','Guidelines for parties during elections','Rules for EVM maintenance','Voter ID verification protocol'], answer:'Guidelines for parties during elections', explanation:'MCC is a set of guidelines issued by ECI that comes into effect when the election schedule is announced.' },
  { id:7, question:'Which document is the primary Voter ID in India?', options:['PAN Card','EPIC Card','Aadhaar Card','Passport'], answer:'EPIC Card', explanation:"EPIC (Elector's Photo Identity Card) is the official Voter ID. 12 alternative IDs are also accepted." },
  { id:8, question:'What is VVPAT?', options:['Voter Verified Paper Audit Trail','Virtual Vote Processing And Tallying','Verified Voter Poll And Tally','Vote Validation Print Audit Tool'], answer:'Voter Verified Paper Audit Trail', explanation:'VVPAT is a paper receipt of your vote displayed for 7 seconds so voters can verify their choice.' },
];

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

function getResultMessage(score, total) {
  const pct = (score / total) * 100;
  if (pct === 100) return { cls:'excellent', msg:'🏆 Perfect score! You\'re an election expert!' };
  if (pct >= 75)  return { cls:'excellent', msg:'🌟 Excellent! You really know your elections!' };
  if (pct >= 50)  return { cls:'good',      msg:'👍 Good job! A bit more learning and you\'ll ace it.' };
  return { cls:'poor', msg:'📚 Keep learning! Explore our Timeline and chat with AI to improve.' };
}

export default function Quiz() {
  const [phase,     setPhase]     = useState('start');
  const [questions, setQuestions] = useState(FALLBACK_QUESTIONS);
  const [current,   setCurrent]   = useState(0);
  const [selected,  setSelected]  = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [score,     setScore]     = useState(0);
  const [loading,   setLoading]   = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.quiz()
      .then(data => setQuestions(data.questions || FALLBACK_QUESTIONS))
      .catch(() => {});
  }, []);

  const startQuiz = () => {
    setCurrent(0);
    setSelected(null);
    setIsCorrect(null);
    setScore(0);
    setPhase('game');
  };

  const handleAnswer = async (option) => {
    if (selected) return;
    setSelected(option);
    setLoading(true);

    const q = questions[current];
    let correct;
    try {
      const res = await api.checkAnswer(q.id, option);
      correct = res.correct;
    } catch {
      correct = option === q.answer;
    }
    setIsCorrect(correct);
    if (correct) setScore(s => s + 1);
    setLoading(false);
  };

  const nextQuestion = () => {
    if (current + 1 >= questions.length) {
      setPhase('result');
    } else {
      setCurrent(c => c + 1);
      setSelected(null);
      setIsCorrect(null);
    }
  };

  const q         = questions[current];
  const progress  = (current / questions.length) * 100;
  const resultMsg = getResultMessage(score, questions.length);

  return (
    <div className="quiz-page">
      <div className="container">

        <div className="quiz-hero">
          <div className="badge badge-purple" style={{ display:'inline-flex', marginBottom:'16px' }}>
            🧠 Election Knowledge Quiz
          </div>
          <h1>Test Your <span className="gradient-text-blue">Election IQ</span></h1>
          <p>How well do you know India's election process? Find out with {questions.length} questions!</p>
        </div>

        {/* ── Start Screen ── */}
        {phase === 'start' && (
          <div className="card quiz-start">
            <span className="quiz-start-icon">🧠</span>
            <h2>Ready to Play?</h2>
            <p>
              Test your knowledge on India's election system — EVM, voter registration,
              the ECI, NOTA, and more. Each question comes with a detailed explanation!
            </p>
            <div className="quiz-start-stats">
              <div className="quiz-start-stat">
                <h3>{questions.length}</h3>
                <p>Questions</p>
              </div>
              <div className="quiz-start-stat">
                <h3>~5</h3>
                <p>Minutes</p>
              </div>
              <div className="quiz-start-stat">
                <h3>MCQ</h3>
                <p>Format</p>
              </div>
            </div>
            <button id="start-quiz-btn" className="btn btn-primary quiz-start-btn btn-lg" onClick={startQuiz}>
              🚀 Start Quiz
            </button>
          </div>
        )}

        {/* ── Game Screen ── */}
        {phase === 'game' && q && (
          <div className="quiz-game">

            {/* Progress */}
            <div className="quiz-progress-header">
              <span className="quiz-progress-text">Question {current + 1} of {questions.length}</span>
              <span className="quiz-score-display">⭐ Score: {score}/{questions.length}</span>
            </div>
            <div className="quiz-progress-bar-wrap">
              <div className="quiz-progress-fill" style={{ width:`${progress}%` }} />
            </div>

            {/* Question */}
            <div className="card question-card">
              <div className="question-number">Question {current + 1}</div>
              <div className="question-text">{q.question}</div>

              <div className="options-grid">
                {q.options.map((opt, i) => {
                  let cls = 'option-btn';
                  if (selected) {
                    if (opt === q.answer)                    cls += ' correct';
                    else if (opt === selected && !isCorrect) cls += ' wrong';
                    else                                     cls += ' dimmed answered';
                  }
                  return (
                    <button
                      key={i}
                      className={cls}
                      onClick={() => handleAnswer(opt)}
                      disabled={!!selected || loading}
                    >
                      <span className="option-letter">{OPTION_LETTERS[i]}</span>
                      {opt}
                    </button>
                  );
                })}
              </div>

              {/* Explanation */}
              {selected && (
                <div className={`explanation-box ${isCorrect ? 'correct' : 'wrong'}`}>
                  {isCorrect ? '✅ Correct! ' : '❌ Not quite. '}{q.explanation}
                </div>
              )}
            </div>

            {/* Next button */}
            {selected && (
              <button className="btn btn-primary next-question-btn btn-lg" onClick={nextQuestion}>
                {current + 1 >= questions.length ? '📊 See Results' : 'Next Question →'}
              </button>
            )}
          </div>
        )}

        {/* ── Result Screen ── */}
        {phase === 'result' && (
          <div className="card quiz-results">
            <span className="quiz-result-icon">
              {score >= questions.length * 0.75 ? '🏆' : score >= questions.length * 0.5 ? '👍' : '📚'}
            </span>
            <div className="quiz-score-big gradient-text-blue">
              {score}/{questions.length}
            </div>
            <div className="quiz-score-sub">
              You scored {Math.round((score / questions.length) * 100)}%
            </div>

            <div className="quiz-result-bar-wrap">
              <div className="quiz-result-fill" style={{ width:`${(score / questions.length) * 100}%` }} />
            </div>

            <div className={`quiz-result-message ${resultMsg.cls}`}>
              {resultMsg.msg}
            </div>

            <div className="quiz-result-btns">
              <button id="retry-quiz-btn" className="btn btn-primary" onClick={startQuiz}>
                🔄 Try Again
              </button>
              <button className="btn btn-secondary" onClick={() => navigate('/chat')}>
                💬 Chat with AI
              </button>
              <button className="btn btn-ghost" onClick={() => navigate('/timeline')}>
                📅 View Timeline
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
