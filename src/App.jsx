import React, { useState, useEffect } from 'react'
import Hero from './components/Hero'
import Dashboard from './components/Dashboard'
import ModelLab from './components/ModelLab'
import { fetchAlerts, fetchAnalysis } from './services/api'

export default function App() {
  const [view, setView] = useState('home')
  const [alerts, setAlerts] = useState([])
  const [analysis, setAnalysis] = useState([])
  const [results, setResults] = useState(null)

  useEffect(() => {
    // load mock data
    fetchAlerts().then(setAlerts)
    fetchAnalysis().then(setAnalysis)
  }, [])

  const handleRunAnalysis = (payload) => {
    setView('results-loading')

    setTimeout(() => {
      const accuracy = (Math.random() * (0.98 - 0.85) + 0.85).toFixed(4)
      const precision = (Math.random() * (0.96 - 0.82) + 0.82).toFixed(4)
      const recall = (Math.random() * (0.95 - 0.80) + 0.80).toFixed(4)
      const f1Score = (Math.random() * (0.94 - 0.81) + 0.81).toFixed(4)

      setResults({
        ...payload,
        accuracy,
        precision,
        recall,
        f1Score,
        timestamp: new Date().toLocaleString()
      })
      setView('results')
    }, 2000)
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
        />
      )
    }

    if (view === 'lab') {
      return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
          <ModelLab onRunAnalysis={handleRunAnalysis} />
        </div>
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
                  <div className="metric-label">Accuracy</div>
                  <div className="metric-value">{(results.accuracy * 100).toFixed(2)}%</div>
                </div>
                <div className="results-metric">
                  <div className="metric-label">Precision</div>
                  <div className="metric-value">{(results.precision * 100).toFixed(2)}%</div>
                </div>
                <div className="results-metric">
                  <div className="metric-label">Recall</div>
                  <div className="metric-value">{(results.recall * 100).toFixed(2)}%</div>
                </div>
                <div className="results-metric">
                  <div className="metric-label">F1 Score</div>
                  <div className="metric-value">{(results.f1Score * 100).toFixed(2)}%</div>
                </div>
              </div>

              <div className="results-scroll">
                <p className="results-note">
                  This results view illustrates how model performance and context
                  for a given dataset could be summarized.
                </p>
              </div>
            </div>

            <button
              className="btn primary results-back-btn"
              onClick={() => setView('lab')}
            >
              Back to Lab
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
        <div className="brand">UBA SOC Monitor</div>
        <nav>
          <button onClick={() => setView('home')}>Home</button>
          <button onClick={() => setView('dashboard')}>Dashboard</button>
          <button onClick={() => setView('lab')}>Model Lab</button>
        </nav>
      </header>
      <main>
        {renderMain()}
      </main>
      <footer className="site-footer">Cognitive UBA — SOC Edition 2026</footer>
    </div>
  )
}
