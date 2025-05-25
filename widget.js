// widget.js - handles the Default Cred of the Week widget

const GITHUB_API =
  "https://api.github.com/repos/danielmiessler/SecLists/contents/"
  + "Passwords/Default-Credentials";
const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;
const CACHE_KEY = "secListCache";

async function listCredFiles() {
  const res = await fetch(GITHUB_API);
  if (!res.ok) throw new Error(`GitHub API ${res.status}`);
  const json = await res.json();
  return json.filter(f => f.type === 'file').map(f => f.download_url);
}

async function fetchAllCreds(urls) {
  const all = [];
  for (const url of urls) {
    const res = await fetch(url);
    if (!res.ok) continue;
    const txt = await res.text();
    const file = url.substring(url.lastIndexOf('/') + 1);
    txt.split(/\r?\n/)
      .filter(l => l && !l.startsWith('#'))
      .forEach(line => all.push({ text: line, source: url, file }));
  }
  return all;
}

async function loadCredCache() {
  let cache = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
  if (cache && Date.now() - cache.ts < ONE_WEEK) return cache;
  const urls = await listCredFiles();
  const list = await fetchAllCreds(urls);
  const idx = list.length ? Math.floor(Math.random() * list.length) : 0;
  cache = { ts: Date.now(), list, idx };
  localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  return cache;
}

async function renderCredOfWeek() {
  try {
    const { list, idx } = await loadCredCache();
    if (!list.length) throw new Error("no creds");
    const entry = list[idx];
    const [user, pass] = entry.text.split(":", 2);
    const aside = document.getElementById("cred-of-week");
    aside.innerHTML = `
  <h3 style="margin-bottom:0.5em;">🔑 Default Cred of the Week</h3>
  <p style="font-size:1.3em; font-weight:bold; margin:0.5em 0 0.2em 0;">
    ${entry.text}
  </p>
  <div style="margin-bottom:0.5em;">
    <span style="font-size:0.95em;"><em>Source file:</em> ${entry.file}</span>
  </div>
  <div style="margin-bottom:0.5em;">
    <a href="${entry.source}" target="_blank">View raw list</a>
  </div>
  <div style="font-size:0.9em; color:var(--muted-color); margin-bottom:0.5em;">
    (entry #${idx + 1} of ${list.length})
  </div>
  <div style="font-size:0.85em; color:var(--muted-color); margin-top:1em;">
    Credit goes to <a href="https://github.com/danielmiessler/SecLists" target="_blank">SecLists</a>
  </div>
`;
  } catch (e) {
    console.error("Cred of the Week failed:", e);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderCredOfWeek();

  // Hamburger menu toggle
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const hamburgerMenu = document.getElementById('hamburger-menu');

  if (hamburgerBtn && hamburgerMenu) {
    hamburgerBtn.addEventListener('click', () => {
      hamburgerMenu.classList.toggle('open');
    });
  }

  // Theme toggle button functionality (assuming it's now inside the hamburger menu)
  // This part should ideally be handled in a separate theme.js file for better organization.
});
document.addEventListener('DOMContentLoaded', renderCredOfWeek);
