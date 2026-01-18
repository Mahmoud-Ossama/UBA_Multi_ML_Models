import React, { useState, useMemo } from 'react'
import AlertList from './AlertList'
import TelemetryFeed from './TelemetryFeed'
import RiskDetailModal from './RiskDetailModal'

export default function Dashboard({ alerts = [], analysis = [] }) {
  const [selectedAlert, setSelectedAlert] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleSelectAlert = (alert) => {
    setSelectedAlert(alert)
    setIsModalOpen(true)
  }

  // Calculate Metrics
  const metrics = useMemo(() => {
    const highRiskCount = analysis.filter(e => e.riskScore > 80).length;
    const avgRisk = analysis.length > 0 
      ? (analysis.reduce((sum, e) => sum + e.riskScore, 0) / analysis.length).toFixed(1)
      : 0;
    
    return {
      mttd: '14.2m',
      highRiskUsers: highRiskCount,
      avgRiskScore: avgRisk,
      activeSensors: 8
    };
  }, [analysis]);

  const userEvents = useMemo(() => {
    if (!selectedAlert) return [];
    return analysis.filter(e => e.username === selectedAlert.user).slice(0, 10);
  }, [selectedAlert, analysis]);

  return (
    <div className="dashboard-soc">
      <header className="soc-metrics-bar">
        <div className="metric-card">
          <label>MTTD</label>
          <div className="value">{metrics.mttd}</div>
          <span className="trend down">↓ 12%</span>
        </div>
        <div className="metric-card">
          <label>High-Risk Events</label>
          <div className="value warning">{metrics.highRiskUsers}</div>
          <span className="trend up">↑ 2</span>
        </div>
        <div className="metric-card">
          <label>Avg Risk Score</label>
          <div className="value">{metrics.avgRiskScore}</div>
        </div>
        <div className="metric-card">
          <label>Active Sensors</label>
          <div className="value success">{metrics.activeSensors}</div>
        </div>
      </header>

      <div className="main-grid">
        <section className="live-telemetry-section panel">
          <div className="panel-header">
            <h3>Live Behavior Telemetry</h3>
            <div className="live-indicator">
              <span className="dot"></span> LIVE
            </div>
          </div>
          <TelemetryFeed analysis={analysis} />
        </section>

        <aside className="alerts-sidebar">
          <section className="panel alerts-panel">
            <div className="panel-header">
              <h3>Priority Alerts</h3>
              <span className="badge danger">{alerts.length}</span>
            </div>
            <AlertList alerts={alerts} onSelectAlert={handleSelectAlert} />
          </section>

          <section className="panel overview-panel">
            <h4>Quick Stats</h4>
            <div className="stats-row">
              <span>Total Events</span>
              <strong>{analysis.length}</strong>
            </div>
            <div className="stats-row">
              <span>Unique Hosts</span>
              <strong>12</strong>
            </div>
          </section>
        </aside>
      </div>

      <RiskDetailModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        alert={selectedAlert}
        userEvents={userEvents}
      />
    </div>
  )
}
