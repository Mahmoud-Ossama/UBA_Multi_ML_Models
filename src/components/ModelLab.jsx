import React, { useState, useEffect } from 'react'
import { fetchModels } from '../services/api'
import MultiSelect from './MultiSelect'

export default function ModelLab({ onRunAnalysis }) {
  const [models, setModels] = useState([])
  const [selectedModels, setSelectedModels] = useState([])
  const [selectedTool, setSelectedTool] = useState('')
  const [uploadedFile, setUploadedFile] = useState(null)

  useEffect(() => {
    fetchModels().then(setModels).catch(() => setModels([]))
  }, [])

  const tools = [
    { id: 'tool1', name: 'Anomaly Scoring' },
    { id: 'tool2', name: 'Session Timeline' },
    { id: 'tool3', name: 'Threat Correlation' },
    { id: 'tool4', name: 'Compliance Report' }
  ]

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (file) setUploadedFile(file)
  }

  const handleAnalyze = () => {
    if ((!selectedModels || selectedModels.length === 0) || !uploadedFile) {
      alert('Please select at least one model and upload a file')
      return
    }
    const selectedInfo = models.filter(m => selectedModels.includes(m.id))
    const tool = tools.find(t => t.id === selectedTool)
    onRunAnalysis({
      modelIds: selectedModels,
      modelName: selectedInfo.map(m => m.name).join(', '),
      toolName: tool ? tool.name : '',
      fileName: uploadedFile.name
    })
  }

  return (
    <div className="model-lab panel">
      <div className="upload-header">
        <h3>Research & Development Lab</h3>
        <p>Manually run datasets through specific ML models for baseline testing.</p>
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
        Run Lab Analysis
      </button>
    </div>
  )
}
