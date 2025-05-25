// router.js
// This file will handle SPA navigation and content loading.

const routes = {
  '#': {
    filePath: 'news.html',
    init: () => { // Initialize news view
      renderFeedForm();
      loadNews();
    }
  },
  '#/': {
    filePath: 'news.html',
 init: () => { // Initialize news view
 renderFeedForm();
 loadNews();
    }
  },
  '#/settings': {
    filePath: 'settings.html',
    init: () => { // Initialize settings view
      renderFeedForm(); // Call renderFeedForm for the settings page
    }
  }
};

const contentArea = document.getElementById('content-area');

async function loadContent(filePath, route) {
  try {
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const html = await response.text();
    contentArea.innerHTML = html;
    // Force DOM reflow to potentially re-apply CSS/framework styling
    contentArea.classList.add('temp-reflow');
  } catch (error) {
    console.error('Failed to load content:', error);
    contentArea.innerHTML = '<p>Error loading page.</p>'; // Optional: Display an error message to the user
  }
}

function router() {
  console.log('Router function started');
 let hash = window.location.hash;
 if (hash === '') {
    hash = '#/';
  }
  const route = routes[hash];

  if (route && route.filePath) {
    console.log('Route found:', route);
    console.log('Calling loadContent with:', route.filePath);
    loadContent(route.filePath, route)
      .then(() => { // After content is loaded and inserted
        if (route.init && typeof route.init === 'function') {
          route.init(); // Call the init function if it exists
        }
      });
  } else {
 console.warn('Route not found:', hash);
 console.log('Route not found, loading default:', routes['#/'].filePath);
    loadContent(routes['#/'].filePath); // Load default home route
  }
}

// Listen for hash changes
window.addEventListener('hashchange', router);

// Load initial content on page load
document.addEventListener('DOMContentLoaded', router);