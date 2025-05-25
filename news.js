// news.js

// 1) Feeds list
const feeds = [
  { url: 'https://krebsonsecurity.com/feed/', name: 'Krebs on Security' },
  { url: 'https://www.bleepingcomputer.com/feed/', name: 'BleepingComputer' },
  { url: 'https://www.theregister.com/security/headlines.atom', name: 'The Register Security' },
  { url: 'https://hnrss.org/newest?points=50&q=security', name: 'Hacker News' },
  { url: 'https://threatpost.com/feed/', name: 'ThreatPost' },
  { url: 'https://www.darkreading.com/rss.xml', name: 'Dark Reading' },
  { url: 'https://feeds.feedburner.com/Securityweek', name: 'SecurityWeek'}
];

// 2) Accent palette (will cycle if you add more feeds)
const ACCENT_COLORS = [
  '#e74c3c', // red
  '#3498db', // blue
  '#2ecc71', // green
  '#f39c12', // orange
  '#9b59b6', // purple
  '#16a085', // teal
  '#d35400', // dark orange
  '#2c3e50'  // dark blue
];

// 3) Proxy & parser
const CORS_PROXY = "https://api.allorigins.win/raw?url=";
const parser = new RSSParser();

// 4) Load or init selectedFeeds
let selectedFeeds = JSON.parse(localStorage.getItem('selectedFeeds') || 'null')
  || feeds.map(f => f.url);

// 5) Render the feed‑picker form (unchanged)
function renderFeedForm() {
  const container = document.getElementById('feed-settings');
  if (!container) return;
  let form = document.getElementById('feed-form');
  if (!form) {
    const details = document.createElement('details');
    details.innerHTML = `<summary>Select Feeds</summary><form id="feed-form"></form>`;
    container.appendChild(details);
    form = details.querySelector('form');
  }
  form.innerHTML = '';
  feeds.forEach(f => {
    const id = 'chk-' + btoa(f.url).slice(0, 6);
    const chk = document.createElement('input');
    chk.type = 'checkbox';
    chk.id = id;
    chk.value = f.url;
    chk.checked = selectedFeeds.includes(f.url);
    const label = document.createElement('label');
    label.htmlFor = id;
    label.textContent = ' ' + f.name;
    label.prepend(chk);
    form.appendChild(label);
  });
  form.onchange = () => {
    selectedFeeds = Array.from(form.querySelectorAll('input:checked'))
      .map(i => i.value);
    localStorage.setItem('selectedFeeds', JSON.stringify(selectedFeeds));
    loadNews();
  };
}

// 6) Helpers for cache keys
function feedKey(feed) {
  return btoa(feed.url).replace(/=/g, '');
}

// 7) Fetch raw XML
async function fetchXml(feed) {
  const maxRetries = 3;
  for (let i = 0; i < maxRetries; i++) {
    try {
      const res = await fetch(CORS_PROXY + encodeURIComponent(feed.url));
      if (!res.ok) throw new Error(`Proxy ${res.status}`);
      return await res.text();
    } catch (err) {
      console.warn(`Fetch attempt ${i + 1} failed for ${feed.name}:`, err);
      if (i === maxRetries - 1) {
        err.isProxyError = true;
        throw err; // Re-throw the error after the last attempt
      }
      await new Promise(resolve => setTimeout(resolve, 500)); // Wait before retrying
    }
  }
}

// 8) Parse XML to JS
async function parseXml(xml) {
  try {
    return await parser.parseString(xml);
  } catch (err) {
    err.isParserError = true;
    throw err;
  }
}

// 9) Render items under a section
function renderItems(section, feedName, items) {
  section.querySelectorAll('.retry-button').forEach(button => button.remove());
  section.querySelectorAll('article').forEach(a => a.remove());
  if (!items.length) {
    // Ensure retry button is removed even if no items are found
    section.querySelectorAll('.retry-button').forEach(button => button.remove());
    const none = document.createElement('p');
    none.className = 'status';
    none.textContent = 'No items found.';
    section.appendChild(none);
    return;
  }
  items.slice(0, 5).forEach(item => {
    // Format the date
    const pubDate = new Date(item.pubDate);
    const formattedDate = `${(pubDate.getMonth() + 1).toString().padStart(2, '0')}-${pubDate.getDate().toString().padStart(2, '0')}-${pubDate.getFullYear()}`;

    // Format the time in 12-hour format
    let hours = pubDate.getHours();
    const minutes = pubDate.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'

    const art = document.createElement('article');
    art.innerHTML = `
      <header><h3><a href="${item.link}" target="_blank">${item.title}</a></h3></header>
      <footer>
 <small>
 ${formattedDate} - ${hours}:${minutes} ${ampm} | ${feedName}${item.author ? ` - ${item.author}` : ''}
        </small>
 </footer>
    `;

    // Create article for the rest of the content (footer)
    const articleContent = document.createElement('article');
    articleContent.innerHTML = footerHTML;
    details.appendChild(articleContent);

    section.appendChild(details);
    section.appendChild(art);
}

// 10) For each feed: placeholder + cache + background fetch
async function handleFeed(feed) {
  const container = document.getElementById('news-feed');
  const sectionId = 'sec-' + feedKey(feed);

  // build section if absent
  let section = document.getElementById(sectionId);
  if (!section) {
    section = document.createElement('section');
    section.id = sectionId;
    section.classList.add('feed-section');

    // dynamic accent based on feed index
    const idx = feeds.findIndex(f => f.url === feed.url);
    const color = ACCENT_COLORS[idx % ACCENT_COLORS.length];
    section.style.borderLeftColor = color;

    section.innerHTML = `<h2>${feed.name}</h2>`;
    const h2 = section.querySelector('h2');
    // Add event listener to toggle collapsed class on the section
    h2.addEventListener('click', () => {
      section.classList.toggle('collapsed');
    });
    const status = document.createElement('p');

    status.className = 'status';
    status.textContent = 'Loading…';
    section.appendChild(status);
    container.appendChild(section);
  }
  // Remove any existing error class before attempting to load
  section.classList.remove('feed-error');
  const status = section.querySelector('.status');
  const cacheKey = 'xmlCache_' + feedKey(feed);
  const raw = localStorage.getItem(cacheKey);

  // 10a) render from cache immediately
  if (raw) {
    try {
      const { xml } = JSON.parse(raw);
      const data = await parseXml(xml);
      status.remove();
      renderItems(section, feed.name, data.items);
    } catch (e) {
      console.warn('Cache parse error', e);
    }
  }

  // 10b) fetch fresh in background
  try {
    const freshXml = await fetchXml(feed);
    const prevXml = raw ? JSON.parse(raw).xml : null;
    if (freshXml !== prevXml) {
      localStorage.setItem(cacheKey,
        JSON.stringify({ timestamp: Date.now(), xml: freshXml })
      );
      const freshData = await parseXml(freshXml);
      section.querySelectorAll('.status, article, details.feed-item-collapsible').forEach(n => n.remove()); // Also remove details
 renderItems(section, feed.name, freshData.items);
    }
  } catch (err) {
    // Remove any existing retry button before showing the error
    section.querySelectorAll('.retry-button').forEach(button => button.remove());

    console.error(`Failed to update ${feed.name}`, err);
    if (section.querySelector('.status')) {
      // More specific error messages
      if (err.isProxyError) {
        status.textContent = `Couldn’t load ${feed.name}: News CORS proxy unavailable.`;
      } else if (err.isParserError) {
        status.textContent = `Couldn’t load ${feed.name}: RSS parser failed (possibly CDN down).`;
      } else {
        status.textContent = `Couldn’t load ${feed.name}.`;
      }
      status.classList.add('error');
      // Add visual indicator for failed feed
      section.classList.add('feed-error');

      // Only add the retry button if one doesn't already exist
      if (!section.querySelector('.retry-button')) {
        const retryButton = document.createElement('button');
        retryButton.textContent = 'Retry';
        retryButton.classList.add('retry-button'); // Add a class for easy selection
        retryButton.addEventListener('click', () => handleFeed(feed));
        section.appendChild(retryButton);
      }

    }
  }
}

// 11) Load all selected feeds
function loadNews() {
  const container = document.getElementById('news-feed');
  container.innerHTML = '';
  feeds.filter(f => selectedFeeds.includes(f.url))
    .forEach(f => handleFeed(f));
}