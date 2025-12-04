import React from 'react';

export default function InfoSection() {
  return (
    <section className="info-section">
      <div className="info-content">
        <h2 className="section-title reveal">Advanced Threat Detection</h2>
        <p className="section-subtitle reveal">Our AI-powered system continuously monitors and analyzes user behavior patterns to identify potential security threats.</p>
        
        <div className="info-grid">
          <div className="info-card reveal">
            <div className="info-card-content">
              <h3>Real-time Monitoring</h3>
              <p>Continuous analysis of user activities and system events to detect anomalies instantly.</p>
            </div>
          </div>
          <div className="info-card reveal">
            <div className="info-card-content">
              <h3>Behavioral Analytics</h3>
              <p>Advanced AI algorithms learn normal patterns and flag suspicious deviations.</p>
            </div>
          </div>
          <div className="info-card reveal">
            <div className="info-card-content">
              <h3>Threat Prevention</h3>
              <p>Proactive security measures to prevent potential breaches before they occur.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}