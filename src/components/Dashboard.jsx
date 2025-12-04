import React, { useMemo, useState } from 'react'
import UserList from './UserList'
import AlertList from './AlertList'
import MiniChart from './MiniChart'

export default function Dashboard({ alerts = [], analysis = [], onRunAnalysis }){
  const [query, setQuery] = useState('')
  const [riskFilter, setRiskFilter] = useState('all')

  // Model Selection & File Upload States
  const [selectedModel, setSelectedModel] = useState('')
  const [selectedTool, setSelectedTool] = useState('')
  const [uploadedFile, setUploadedFile] = useState(null)

  const users = useMemo(() => {
    // derive users from analysis
    const map = new Map()
    analysis.forEach(a => {
      if(!map.has(a.username)) map.set(a.username, {username:a.username, last: a.time, risk:a.risk, events:[]})
      map.get(a.username).events.push(a)
      if(a.time > map.get(a.username).last) map.get(a.username).last = a.time
    })
    return Array.from(map.values())
  }, [analysis])

  const filtered = users.filter(u => {
    if(query && !u.username.toLowerCase().includes(query.toLowerCase())) return false
    if(riskFilter !== 'all' && u.risk !== riskFilter) return false
    return true
  })

  // Available Models
  const models = [
    { id: 'model1', name: 'Random Forest Classifier' },
    { id: 'model2', name: 'Neural Network (LSTM)' },
    { id: 'model3', name: 'Support Vector Machine' },
    { id: 'model4', name: 'Gradient Boosting' },
    { id: 'model5', name: 'Deep Learning CNN' }
  ]

  const tools = [
    { id: 'tool1', name: 'Anomaly Scoring' },
    { id: 'tool2', name: 'Session Timeline' },
    { id: 'tool3', name: 'Threat Correlation' },
    { id: 'tool4', name: 'Compliance Report' }
  ]

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      setUploadedFile(file)
    }
  }

  const handleAnalyze = () => {
    if (!selectedModel || !uploadedFile) {
      alert('Please select a model and upload a file')
      return
    }

    if (!onRunAnalysis) return

    const model = models.find(m => m.id === selectedModel)
    const tool = tools.find(t => t.id === selectedTool)
    onRunAnalysis({
      modelId: selectedModel,
      modelName: model ? model.name : selectedModel,
      toolName: tool ? tool.name : '',
      fileName: uploadedFile.name
    })
  }

  return (
    <div className="dashboard">
      <div>
        <div className="panel upload-panel">
          <div className="upload-header">
            <h3>Run a new analysis</h3>
            <p>Choose a model and optional tool, then upload your dataset.</p>
          </div>

          <div className="upload-select-row">
            <div className="upload-select">
              <label>Select model</label>
              <select
                className="filter"
                value={selectedModel}
                onChange={e => setSelectedModel(e.target.value)}
              >
                <option value="">Choose a model…</option>
                {models.map(model => (
                  <option key={model.id} value={model.id}>{model.name}</option>
                ))}
              </select>
            </div>

            <div className="upload-select">
              <label>Select tool (optional)</label>
              <select
                className="filter"
                value={selectedTool}
                onChange={e => setSelectedTool(e.target.value)}
              >
                <option value="">No tool</option>
                {tools.map(tool => (
                  <option key={tool.id} value={tool.id}>{tool.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="upload-control">
            <input
              type="file"
              onChange={handleFileUpload}
              accept=".csv,.json,.txt"
              className="input upload-input-centered"
            />
            {uploadedFile && (
              <div className="upload-file-meta">
                Selected file: <span>{uploadedFile.name}</span>
              </div>
            )}
          </div>

          <button
            className="btn primary upload-run-btn"
            onClick={handleAnalyze}
            disabled={!selectedModel || !uploadedFile}
          >
            Run analysis
          </button>
        </div>

        <div className="panel">
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <h3>Users</h3>
            <MiniChart analysis={analysis} />
          </div>

          <div className="search-row">
            <input className="input" placeholder="Search username..." value={query} onChange={e=>setQuery(e.target.value)} />
            <select className="filter" value={riskFilter} onChange={e=>setRiskFilter(e.target.value)}>
              <option value="all">All risks</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <UserList users={filtered} />
        </div>

        <div style={{marginTop:12}} className="panel">
          <h4>Recent Analysis</h4>
          {analysis.slice(0,8).map(a=> (
            <div key={a.id} style={{padding:'8px 0',borderBottom:'1px solid rgba(255,255,255,0.03)'}}>
              <div style={{display:'flex',justifyContent:'space-between'}}>
                <div style={{fontWeight:600}}>{a.username}</div>
                <div style={{color:'rgba(255,255,255,0.6)'}}>{new Date(a.time).toLocaleString()}</div>
              </div>
              <div style={{color:'rgba(255,255,255,0.7)'}}>{a.action} — risk {a.risk}</div>
            </div>
          ))}
        </div>
      </div>

      <aside>
        <div className="panel">
          <h4>Alerts</h4>
          <AlertList alerts={alerts} />
        </div>

        <div style={{marginTop:12}} className="panel">
          <h4>Overview</h4>
          <p style={{color:'rgba(255,255,255,0.7)'}}>Totals: {users.length} users — Alerts: {alerts.length}</p>
        </div>
      </aside>
    </div>
  )
}
