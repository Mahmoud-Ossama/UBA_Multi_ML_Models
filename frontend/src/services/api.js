// API service - connects to FastAPI backend
// Use relative URLs so Vite proxy can forward to backend
const API_BASE = import.meta.env.VITE_API_URL || "";

/**
 * Fetch available ML models from backend
 */
export async function fetchModels() {
  const res = await fetch(`${API_BASE}/api/models`);
  if (!res.ok) throw new Error(`Failed to fetch models: ${res.statusText}`);
  const json = await res.json();
  return json.data || [];
}

/**
 * Run ML analysis on uploaded file
 * @param {string} modelId - Model ID from registry
 * @param {File} file - CSV file to analyze
 */
export async function runAnalysis(modelId, file) {
  const formData = new FormData();
  formData.append("model_id", modelId);
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/api/analyze`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Analysis failed");
  }

  const json = await res.json();
  return json.data;
}

/**
 * Fetch recent alerts from output directory
 */
export async function fetchAlerts() {
  const res = await fetch(`${API_BASE}/api/alerts`);
  if (!res.ok) throw new Error(`Failed to fetch alerts: ${res.statusText}`);
  const json = await res.json();
  return json.data || [];
}

/**
 * Fetch analysis/activity data
 * TODO: Implement real user activity tracking endpoint
 * For now, returns empty array - user activity features not yet implemented
 */
export async function fetchAnalysis() {
  // Return empty array - user activity tracking is planned for Phase 2
  // This will be replaced with a real endpoint when user session tracking is implemented
  return Promise.resolve([]);
}

