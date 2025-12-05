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
