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

// Legacy mock functions for fallback during development
const now = Date.now();
const sampleUsers = ["alice", "bob", "charlie", "diana", "eve"];

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function fetchAnalysis() {
  // return sample events
  const out = [];
  for (let i = 0; i < 40; i++) {
    const user = sampleUsers[randInt(0, sampleUsers.length - 1)];
    const time = now - randInt(0, 1000 * 60 * 60 * 24 * 10);
    const risk =
      Math.random() < 0.12 ? "high" : Math.random() < 0.25 ? "medium" : "low";
    out.push({ id: i, username: user, time, action: "login", risk });
  }
  // sort desc
  out.sort((a, b) => b.time - a.time);
  return Promise.resolve(out);
}

