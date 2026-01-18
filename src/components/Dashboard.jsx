import React, { useState, useEffect } from 'react'
import AlertList from './AlertList'
import { fetchModels } from '../services/api'
import MultiSelect from './MultiSelect'

export default function Dashboard({ alerts = [], analysis = [], onRunAnalysis }){
  const [query, setQuery] = useState('')
  const [riskFilter, setRiskFilter] = useState('all')

  // Model Selection & File Upload States
  const [models, setModels] = useState([])
  const [selectedModels, setSelectedModels] = useState([])
  const [selectedTool, setSelectedTool] = useState('')
  const [uploadedFile, setUploadedFile] = useState(null)

  useEffect(() => {
    let mounted = true
    fetchModels().then(ms => { if (mounted) setModels(ms || []) }).catch(()=>{ if (mounted) setModels([]) })
    return () => { mounted = false }
  }, [])

  // Users list removed — no longer deriving per-user summary from analysis

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
    if ((!selectedModels || selectedModels.length === 0) || !uploadedFile) {
      alert('Please select at least one model and upload a file')
      return
    }

    if (!onRunAnalysis) return

    const selectedInfo = models.filter(m => selectedModels.includes(m.id))
    const tool = tools.find(t => t.id === selectedTool)

    const payload = {
      modelIds: selectedModels,
      models: selectedInfo,
      toolName: tool ? tool.name : '',
      fileName: uploadedFile.name
    }
    if (selectedModels.length === 1) {
      payload.modelId = selectedModels[0]
      payload.modelName = (selectedInfo[0] && selectedInfo[0].name) || selectedModels[0]
    }

    onRunAnalysis(payload)
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
              <label>Select model(s)</label>
              <MultiSelect
                options={models}
                selected={selectedModels}
                onChange={setSelectedModels}
                placeholder="Choose model(s)"
                maxVisible={3}
              />
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
            disabled={(selectedModels.length === 0) || !uploadedFile}
          >
            Run analysis
          </button>
        </div>

          {/* Users and Recent Analysis panels removed per request */}
      </div>

      <aside>
        <div className="panel">
          <h4>Alerts</h4>
          <AlertList alerts={alerts} />
        </div>

        <div style={{marginTop:12}} className="panel">
          <h4>Overview</h4>
          <p style={{color:'rgba(255,255,255,0.7)'}}>Totals: {analysis.length} analyses — Alerts: {alerts.length}</p>
        </div>
      </aside>
    </div>
  )
}
