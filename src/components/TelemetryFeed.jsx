import React from 'react';

export default function TelemetryFeed({ analysis = [] }) {
  return (
    <div className="telemetry-feed">
      <div className="telemetry-header">
        <span className="col-time">Time</span>
        <span className="col-user">User</span>
        <span className="col-action">Action</span>
        <span className="col-resource">Resource</span>
        <span className="col-risk">Risk Score</span>
      </div>
      <div className="telemetry-list">
        {analysis.length === 0 ? (
          <div className="empty-state">No live telemetry data</div>
        ) : (
          analysis.map((event) => (
            <div key={event.id} className={`telemetry-row risk-${event.riskScore > 80 ? 'high' : event.riskScore > 50 ? 'medium' : 'low'}`}>
              <span className="col-time">{new Date(event.time).toLocaleTimeString()}</span>
              <span className="col-user" title={event.displayName}>{event.username}</span>
              <span className="col-action">{event.action.replace('_', ' ')}</span>
              <span className="col-resource">{event.resource}</span>
              <span className="col-risk">
                <div className="risk-pill">
                  {event.riskScore}
                </div>
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
