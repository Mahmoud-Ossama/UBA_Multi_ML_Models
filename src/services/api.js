// Mock API service for frontend during development
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

export async function fetchAlerts() {
  const alerts = [
    {
      id: 1,
      title: "Unusual download volume",
      desc: "User bob downloaded 3.2GB in 10 minutes",
      severity: "high",
    },
    {
      id: 2,
      title: "Multiple failed logins",
      desc: "5 failed logins for user alice from new IP",
      severity: "medium",
    },
  ];
  return Promise.resolve(alerts);
}

export async function fetchModels() {
  // Try to fetch from backend endpoint first
  try {
    const res = await fetch("/api/models");
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (e) {
    // network error or endpoint missing - fall back to mock
  }

  // Fallback mock models with example metric schemas
  const models = [
    {
      id: "model_rf",
      name: "Random Forest Classifier",
      metrics: ["accuracy", "precision", "recall"],
    },
    {
      id: "model_lstm",
      name: "Neural Network (LSTM)",
      metrics: ["loss", "auc", "f1"],
    },
    {
      id: "model_svm",
      name: "Support Vector Machine",
      metrics: ["accuracy", "support"],
    },
    {
      id: "model_xgb",
      name: "Gradient Boosting",
      metrics: ["accuracy", "precision", "recall", "f1"],
    },
    {
      id: "model_cnn",
      name: "Deep Learning CNN",
      metrics: ["loss", "accuracy"],
    },
  ];
  return Promise.resolve(models);
}
