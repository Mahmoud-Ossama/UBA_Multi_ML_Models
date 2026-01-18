// Mock API service for frontend during development
const now = Date.now();

const sampleUsers = [
  { id: "ADM-882", name: "System Admin 882", role: "Admin" },
  { id: "SVC-OAUTH", name: "OAuth Service Account", role: "Service" },
  { id: "USR-JD-72", name: "John Doe (Marketing)", role: "User" },
  { id: "USR-AL-15", name: "Alice Lee (Finance)", role: "User" },
  { id: "USR-BK-99", name: "Bob Kelly (DevOps)", role: "User" },
  { id: "SVC-WAF", name: "WAF Monitor", role: "Service" }
];

const locations = ["NYC, USA", "London, UK", "Singapore, SG", "Frankfurt, DE", "São Paulo, BR"];
const actions = ["login_success", "login_failure", "file_download", "api_access", "privilege_escalation"];
const resources = ["AuthServer", "CloudStorage-01", "CustomerDB", "InternalWiki", "PaymentGateway"];

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateRiskScore(username, action, amount = 0) {
  let score = randInt(10, 40); // Base noise
  
  if (action === "login_failure") score += 20;
  if (action === "privilege_escalation") score += 50;
  if (action === "file_download" && amount > 1000) score += 40; // High volume
  if (username === "SVC-OAUTH" && action === "login_failure") score += 30; // Critical account

  return Math.min(100, score);
}

export async function fetchAnalysis() {
  const out = [];
  for (let i = 0; i < 40; i++) {
    const user = sampleUsers[randInt(0, sampleUsers.length - 1)];
    const time = now - randInt(0, 1000 * 60 * 60 * 24 * 10);
    const action = actions[randInt(0, actions.length - 1)];
    const resource = resources[randInt(0, resources.length - 1)];
    const amount = action === "file_download" ? randInt(10, 5000) : 0;
    const riskScore = generateRiskScore(user.id, action, amount);
    
    out.push({ 
      id: i, 
      username: user.id, 
      displayName: user.name,
      time, 
      action, 
      resource,
      riskScore,
      location: locations[randInt(0, locations.length - 1)],
      ip: `192.168.1.${randInt(1, 254)}`,
      amount: amount ? `${(amount/1024).toFixed(2)} GB` : null
    });
  }
  out.sort((a, b) => b.time - a.time);
  return Promise.resolve(out);
}

export async function fetchAlerts() {
  const alerts = [
    {
      id: 1,
      title: "Critical Exfiltration Detected",
      desc: "User USR-BK-99 (Bob Kelly) downloaded 3.2GB from CloudStorage-01 in 10 minutes",
      severity: "high",
      riskScore: 92,
      user: "USR-BK-99",
      timestamp: now - 1000 * 60 * 15
    },
    {
      id: 2,
      title: "Credential Stuffing Attempt",
      desc: "15 failed logins for user USR-AL-15 from 3 unique IPs in 2 minutes",
      severity: "high",
      riskScore: 88,
      user: "USR-AL-15",
      timestamp: now - 1000 * 60 * 45
    },
    {
      id: 3,
      title: "Anomalous Admin Access",
      desc: "ADM-882 logged in from São Paulo, BR (Unusual Location)",
      severity: "medium",
      riskScore: 65,
      user: "ADM-882",
      timestamp: now - 1000 * 60 * 120
    }
  ];
  return Promise.resolve(alerts);
}

export async function fetchModels() {
  try {
    const res = await fetch("/api/models");
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {}

  return Promise.resolve([
    { id: "model_rf", name: "Random Forest Classifier", metrics: ["accuracy", "precision", "recall"] },
    { id: "model_lstm", name: "Neural Network (LSTM)", metrics: ["loss", "auc", "f1"] },
    { id: "model_svm", name: "Support Vector Machine", metrics: ["accuracy", "support"] },
    { id: "model_xgb", name: "Gradient Boosting", metrics: ["accuracy", "precision", "recall", "f1"] },
    { id: "model_cnn", name: "Deep Learning CNN", metrics: ["loss", "accuracy"] }
  ]);
}
