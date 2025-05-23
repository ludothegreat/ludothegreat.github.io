// creds.js - handles faux address bar, credential randomization, and dropdown history

const defaultCreds = [
  { user: "admin", pass: "admin" },
  { user: "admin", pass: "password" },
  { user: "admin", pass: "1234" },
  { user: "admin", pass: "12345" },
  { user: "admin", pass: "123456" },
  { user: "root", pass: "root" },
  { user: "root", pass: "admin" },
  { user: "root", pass: "password" },
  { user: "user", pass: "user" },
  { user: "user", pass: "password" },
  { user: "guest", pass: "guest" },
  { user: "test", pass: "test" },
  { user: "support", pass: "support" },
  { user: "administrator", pass: "admin" },
  { user: "administrator", pass: "password" },
  { user: "cisco", pass: "cisco" },
  { user: "ubnt", pass: "ubnt" },
  { user: "pi", pass: "raspberry" },
  { user: "ftp", pass: "ftp" },
  { user: "admin", pass: "changeme" }
];

function randomCred() {
  return defaultCreds[Math.floor(Math.random() * defaultCreds.length)];
}

function renderCredsHistory() {
  const historyDiv = document.getElementById('creds-history');
  historyDiv.innerHTML = '';
  defaultCreds.forEach(cred => {
    const item = document.createElement('div');
    item.className = 'history-item';
    item.tabIndex = 0;
    item.innerHTML = `<span class="protocol">https://</span>` +
      `<span class="creds">${cred.user}:<span class="password">${cred.pass}</span>@</span>` +
      `<span class="host">defaultcreds.lol</span>`;
    historyDiv.appendChild(item);
  });
}

function setFauxUrlCred(cred) {
  const credsSpan = document.querySelector('.faux-url .creds');
  if (credsSpan) {
    credsSpan.innerHTML = `${cred.user}:<span class="password">${cred.pass}</span>@`;
  }
  const fauxUrl = document.getElementById('faux-url');
  if (fauxUrl) {
    const desc = `Site logo: example of default credentials in a URL bar, ${cred.user}:${cred.pass}@defaultcreds.lol`;
    fauxUrl.setAttribute('aria-label', desc);
    fauxUrl.setAttribute('title', desc);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Randomize main header on load
  const cred = randomCred();
  setFauxUrlCred(cred);

  // Dropdown interaction
  const fauxUrl = document.getElementById('faux-url');
  const credsHistory = document.getElementById('creds-history');
  if (fauxUrl && credsHistory) {
    fauxUrl.style.cursor = 'pointer';
    let open = false;

    function closeDropdown() {
      credsHistory.hidden = true;
      open = false;
    }

    function openDropdown() {
      credsHistory.hidden = false;
      renderCredsHistory();
      open = true;
    }

    fauxUrl.addEventListener('click', e => {
      e.stopPropagation();
      if (open) {
        closeDropdown();
      } else {
        openDropdown();
      }
    });

    // Event delegation: handle clicks on history items
    credsHistory.addEventListener('click', (e) => {
      const item = e.target.closest('.history-item');
      if (item) {
        // Find which credential this is by index
        const idx = Array.from(credsHistory.children).indexOf(item);
        if (idx >= 0) {
          setFauxUrlCred(defaultCreds[idx]);
        }
        closeDropdown();
      }
    });

    // Hide on click outside
    document.addEventListener('click', (e) => {
      if (
        open &&
        !fauxUrl.contains(e.target) &&
        !credsHistory.contains(e.target)
      ) {
        closeDropdown();
      }
    });

    // Hide on escape
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && open) {
        closeDropdown();
      }
    });
  }
});
