// theme.js - handles dark/light mode toggle for defaultcreds.lol

document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;
  // On load, apply saved theme:
  if (localStorage.getItem('theme') === 'dark') {
    document.documentElement.classList.add('dark');
    btn.textContent = '☀️';
  }
  // On click, flip theme + icon + store choice:
  btn.addEventListener('click', () => {
    const dark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', dark ? 'dark' : 'light');
    btn.textContent = dark ? '☀️' : '🌙';
  });
});
