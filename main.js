// Simple SPA Router for Vanilla JS
// Place your static content files in /pages/ (e.g., home.html, about.html)

const routes = {
  '/': 'home.html',
  '/about': 'about.html',
  // Add more routes here: '/contact': 'contact.html',
};

function getPath() {
  // Remove domain and query/hash
  return location.pathname.replace(/\/index\.html$/, '') || '/';
}

function setActiveTab(path) {
  document.querySelectorAll('.tab-bar .tab').forEach(tab => {
    if (tab.getAttribute('href') === path) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });
}

function loadPage(path) {
  const page = routes[path] || routes['/'];
  fetch(`pages/${page}`)
    .then(resp => resp.ok ? resp.text() : '<h2>404 Not Found</h2>')
    .then(html => {
      document.getElementById('spa-content').innerHTML = html;
      window.scrollTo(0,0);
      setActiveTab(path);
      // Re-initialize news and widget scripts if on home page
      if (page === 'home.html') {
        if (typeof renderFeedForm === 'function') renderFeedForm();
        if (typeof loadNews === 'function') loadNews();
        if (typeof renderCredOfWeek === 'function') renderCredOfWeek();
      }
    });
}

function navigate(event) {
  // Only handle local links
  if (event.target.tagName === 'A' && event.target.hasAttribute('data-spa-link')) {
    event.preventDefault();
    const href = event.target.getAttribute('href');
    history.pushState({}, '', href);
    loadPage(getPath());
  }
}

document.addEventListener('DOMContentLoaded', function() {
  loadPage(getPath());
  setActiveTab(getPath());
  document.body.addEventListener('click', navigate);
});

window.addEventListener('popstate', function() {
  loadPage(getPath());
  setActiveTab(getPath());
});
