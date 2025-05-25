const routes = {
  '#': { filePath: 'news.html', init: () => { renderFeedForm(); loadNews(); } },
  '#/': { filePath: 'news.html', init: () => { renderFeedForm(); loadNews(); } },
  '#/settings': { filePath: 'settings.html', init: () => { renderFeedForm(); } },
  '#/about': { filePath: 'about.html', init: () => { /* future about page logic */ } }
};
const contentArea = document.getElementById('content-area');
async function loadContent(filePath, route) {
  try {
    const response = await fetch(filePath);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const html = await response.text();
    contentArea.innerHTML = html;
    contentArea.classList.add('temp-reflow');
  } catch (error) {
    console.error('Failed to load content:', error);
    contentArea.innerHTML = '<p>Error loading page.</p>';
  }
}
function router() {
  let hash = window.location.hash;
  if (hash === '') hash = '#/';
  const route = routes[hash];
  if (route && route.filePath) {
    loadContent(route.filePath, route)
      .then(() => { if (route.init && typeof route.init === 'function') route.init(); });
  } else {
    loadContent(routes['#/'].filePath);
  }
}
window.addEventListener('hashchange', router);
document.addEventListener('DOMContentLoaded', router);
