import React, { useState, useEffect } from 'react'
import Hero from './components/Hero'
import Dashboard from './components/Dashboard'
import { fetchAlerts, fetchAnalysis } from './services/api'

export default function App() {
  const [view, setView] = useState('home')
  const [alerts, setAlerts] = useState([])
  const [analysis, setAnalysis] = useState([])
  const [results, setResults] = useState(null)

  useEffect(() => {
    // Load alerts from backend (fallback to empty on error)
    fetchAlerts()
      .then(setAlerts)
      .catch(err => {
        console.warn('Failed to fetch alerts, using empty array:', err)
        setAlerts([])
      })
    
    // Load mock analysis data (user activity timeline)
    fetchAnalysis()
      .then(setAnalysis)
      .catch(err => {
        console.warn('Failed to fetch analysis:', err)
        setAnalysis([])
      })
  }, [])

  const handleRunAnalysis = (resultData) => {
    setView('results-loading')

    // Simulate slight delay for UX (backend already processed)
    setTimeout(() => {
      setResults(resultData)
      setView('results')
    }, 500)
  }

  const renderMain = () => {
    if (view === 'home') {
      return <Hero onStart={() => setView('dashboard')} />
    }

    if (view === 'dashboard') {
      return (
        <Dashboard
          alerts={alerts}
          analysis={analysis}
          onRunAnalysis={handleRunAnalysis}
        />
      )
    }

    if (view === 'results-loading') {
      return (
        <div className="loading-overlay">
          <div className="loading-inner">
            <div className="spinner" />
            <div className="loading-text">Running analysis…</div>
          </div>
        </div>
      )
    }

    // results view
    if (results) {
      return (
        <section className="results-page">
          <div className="results-container">
            <header className="results-header">
              <h2>Analysis Results</h2>
              <p>
                Model <span>{results.modelName}</span>
                {results.toolName ? <> using <span>{results.toolName}</span></> : null}
                {' '}on file <span>{results.fileName}</span>
              </p>
              <div className="results-meta-row">
                <span>Completed at {results.timestamp}</span>
              </div>
            </header>

            <div className="results-body">
              <div className="results-grid">
                <div className="results-metric">
                  <div className="metric-label">Total Rows</div>
                  <div className="metric-value">{results.totalRows?.toLocaleString() || 'N/A'}</div>
                </div>
                <div className="results-metric">
                  <div className="metric-label">Alerts Found</div>
                  <div className="metric-value">{results.totalAlerts?.toLocaleString() || 'N/A'}</div>
                </div>
                <div className="results-metric">
                  <div className="metric-label">Alert Rate</div>
                  <div className="metric-value">
                    {results.totalRows > 0 
                      ? ((results.totalAlerts / results.totalRows) * 100).toFixed(2) + '%'
                      : 'N/A'}
                  </div>
                </div>
                <div className="results-metric">
                  <div className="metric-label">Model Type</div>
                  <div className="metric-value" style={{fontSize: '16px'}}>Anomaly Detection</div>
                </div>
              </div>

              <div className="results-scroll">
                <p className="results-note">
                  Analysis completed using {results.modelName}. 
                  {results.totalAlerts > 0 
                    ? ` Found ${results.totalAlerts} suspicious activities out of ${results.totalRows} total events.`
                    : ' No anomalies detected in the dataset.'}
                </p>
                
                {results.alerts && results.alerts.length > 0 && (
                  <div style={{marginTop: '16px'}}>
                    <h4 style={{marginBottom: '8px'}}>Sample Alerts (first 5):</h4>
                    <div style={{
                      background: 'rgba(0,0,0,0.3)',
                      borderRadius: '8px',
                      padding: '12px',
                      maxHeight: '200px',
                      overflow: 'auto'
                    }}>
                      {results.alerts.slice(0, 5).map((alert, idx) => (
                        <div key={idx} style={{
                          padding: '8px 0',
                          borderBottom: idx < 4 ? '1px solid rgba(255,255,255,0.1)' : 'none',
                          fontSize: '13px'
                        }}>
                          <div style={{color: '#a78bfa'}}>
                            {alert.url || alert.request || 'N/A'}
                          </div>
                          <div style={{color: 'rgba(255,255,255,0.6)', marginTop: '4px'}}>
                            Final Alert: {alert.final_alert}, Anomaly: {alert.is_anomaly}
                            {alert.is_sqli_flag !== undefined && `, SQLi Flag: ${alert.is_sqli_flag}`}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button
              className="btn primary results-back-btn"
              onClick={() => setView('dashboard')}
            >
              Run another analysis
            </button>
          </div>
        </section>
      )
    }

    return null
  }

  return (
    <div className="app-root">
      <header className="topbar">
        <div className="brand">UBA Analytics</div>
        <nav>
          <button onClick={() => setView('home')}>Home</button>
          <button onClick={() => setView('dashboard')}>Dashboard</button>
        </nav>
      </header>
      <main>
        {renderMain()}
      </main>
      <footer className="site-footer">Cognitive UBA — University Project</footer>
    </div>
  )
}
