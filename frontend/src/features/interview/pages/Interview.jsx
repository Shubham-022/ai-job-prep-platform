import React, { useState } from 'react';
import '../style/interview.scss';
import { useParams } from 'react-router';
import { useInterview } from '../hooks/useInterview';





function Interview() {
  const [activeTab, setActiveTab] = useState('technical');
  const [expandedCards, setExpandedCards] = useState({});
  const { report } = useInterview();

  const toggleCard = (key) => {
    setExpandedCards(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (!report) {
    return (
      <div className="interview-dashboard">
        <div style={{ margin: 'auto', textAlign: 'center', color: '#a1a1aa' }}>
          <p style={{ fontSize: '2rem' }}>📋</p>
          <p>No report loaded. Please generate a report first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="interview-dashboard">
      
      {/* LEFT SIDEBAR: Navigation */}
      <div className="sidebar-nav">
        <button 
          className={`nav-item ${activeTab === 'technical' ? 'active' : ''}`}
          onClick={() => setActiveTab('technical')}
        >
          Technical questions
        </button>
        <button 
          className={`nav-item ${activeTab === 'behavioral' ? 'active' : ''}`}
          onClick={() => setActiveTab('behavioral')}
        >
          Behavioral questions
        </button>
        <button 
          className={`nav-item ${activeTab === 'roadmap' ? 'active' : ''}`}
          onClick={() => setActiveTab('roadmap')}
        >
          Road Map
        </button>
      </div>

      {/* MIDDLE CONTENT: Questions / Roadmap */}
      <div className="main-content">
        <div className="content-header">
          <h2>
            {activeTab === 'technical' && 'Technical Questions'}
            {activeTab === 'behavioral' && 'Behavioral Questions'}
            {activeTab === 'roadmap' && 'Your Preparation Roadmap'}
          </h2>
          <p>
            {activeTab === 'technical' && 'Review these technical questions tailored to your profile and the job description.'}
            {activeTab === 'behavioral' && 'Prepare for these behavioral questions using the STAR method.'}
            {activeTab === 'roadmap' && 'Follow this day-by-day plan to maximize your chances.'}
          </p>
        </div>

        {(activeTab === 'technical' || activeTab === 'behavioral') && (() => {
          const questions = activeTab === 'technical' ? report.technicalQuestions : report.behavioralQuestions;
          return (
            <div className="questions-list">
              {questions.map((q, idx) => {
                const key = `${activeTab}-${idx}`;
                const isOpen = !!expandedCards[key];
                return (
                  <div key={idx} className={`question-card ${isOpen ? 'open' : ''}`}>
                    <div className="question-header" onClick={() => toggleCard(key)}>
                      <span className="q-number">Q{idx + 1}</span>
                      <h3 className="question-title">{q.question}</h3>
                      <button className={`toggle-btn ${isOpen ? 'open' : ''}`} aria-label="Toggle answer">
                        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                      </button>
                    </div>
                    {isOpen && (
                      <div className="question-body">
                        <div className="section-block intention-block">
                          <span className="block-label intention-label">INTENTION</span>
                          <p>{q.intention}</p>
                        </div>
                        <div className="section-block answer-block">
                          <span className="block-label answer-label">MODEL ANSWER</span>
                          <p>{q.answer}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })()}

        {activeTab === 'roadmap' && (
          <div className="roadmap-timeline">
            {report.preparationPlan.map((plan, idx) => (
              <div key={idx} className="timeline-item">
                <div className="timeline-line-col">
                  <div className="timeline-dot"></div>
                  {idx < report.preparationPlan.length - 1 && <div className="timeline-line"></div>}
                </div>
                <div className="timeline-content">
                  <span className="day-badge">Day {plan.day}</span>
                  <h3 className="focus-title">{plan.focus}</h3>
                  <ul>
                    {plan.tasks.map((task, i) => (
                      <li key={i}>{task}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RIGHT SIDEBAR: Details & Skill Gaps */}
      <div className="sidebar-details">
        <div className="score-card">
            <div className="score-label">Resume Match Score</div>
            <div className="score-value">{report.matchScore}%</div>
        </div>

        <h3>Skill Gaps Identified</h3>
        <div className="skill-gap-tags">
          {report.skillGaps.map((gap, idx) => (
            <span key={idx} className={`skill-tag severity-${gap.severity?.toLowerCase()}`}>
              {gap.skill}
            </span>
          ))}
        </div>
      </div>

    </div>
  );
}

export default Interview;