import React from 'react';

export default function UserJourneyTimeline({ events = [] }) {
  if (events.length === 0) return <div className="timeline-empty">No recent activity found.</div>;

  return (
    <div className="user-journey-timeline">
      {events.map((event, idx) => (
        <div key={event.id} className="timeline-item">
          <div className="timeline-marker"></div>
          <div className="timeline-content">
            <span className="time">{new Date(event.time).toLocaleString()}</span>
            <span className="action">{event.action.replace('_', ' ')}</span>
            <span className="resource">@ {event.resource}</span>
            {event.amount && <span className="amount">({event.amount})</span>}
            <div className={`risk-indicator risk-${event.riskScore > 80 ? 'high' : event.riskScore > 50 ? 'medium' : 'low'}`}>
              Risk: {event.riskScore}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
