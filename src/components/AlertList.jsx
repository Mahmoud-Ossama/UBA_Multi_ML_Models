import React from 'react';

export default function AlertList({ alerts = [], onSelectAlert }) {
  if (alerts.length === 0) return <div className="empty-alerts">No active threats detected</div>;

  return (
    <div className="alert-list-container">
      {alerts.map(alert => (
        <div 
          key={alert.id} 
          className={`alert-card severity-${alert.severity} ${alert.riskScore > 80 ? 'pulse-heavy' : ''}`}
          onClick={() => onSelectAlert && onSelectAlert(alert)}
        >
          <div className="alert-badge">
            <span className="risk-score">{alert.riskScore}</span>
          </div>
          <div className="alert-info">
            <div className="alert-title">{alert.title}</div>
            <div className="alert-desc">{alert.desc}</div>
            <div className="alert-footer">
              <span className="alert-user">@{alert.user}</span>
              <span className="alert-time">{new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
          <div className="alert-action-hint">TRIAGE &rarr;</div>
        </div>
      ))}
    </div>
  );
}
