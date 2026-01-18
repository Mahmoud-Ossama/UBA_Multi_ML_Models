import React from 'react';
import UserJourneyTimeline from './UserJourneyTimeline';

export default function RiskDetailModal({ isOpen, onClose, alert, userEvents = [] }) {
  if (!isOpen || !alert) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Alert Triage: {alert.title}</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <div className="modal-body">
          <div className="alert-meta">
            <div className={`risk-gauge score-${alert.riskScore}`}>
              <span className="score-value">{alert.riskScore}</span>
              <span className="score-label">Risk Score</span>
            </div>
            <div className="alert-details">
              <p><strong>Affected User:</strong> {alert.displayName || alert.user}</p>
              <p><strong>Severity:</strong> <span className={`severity-${alert.severity}`}>{alert.severity.toUpperCase()}</span></p>
              <p><strong>Primary Concern:</strong> {alert.desc}</p>
            </div>
          </div>

          <div className="timeline-section">
            <h3>User Journey (Last 24h)</h3>
            <UserJourneyTimeline events={userEvents} />
          </div>

          <div className="action-row">
            <button className="btn danger" onClick={() => alert('IP Blocked')}>Block Source IP</button>
            <button className="btn warning" onClick={() => alert('User Quarantined')}>Quarantine User</button>
            <button className="btn secondary" onClick={() => alert('Logs Exported')}>Export Evidence</button>
          </div>
        </div>
      </div>
    </div>
  );
}
