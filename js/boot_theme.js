(function () {
  var KEY = 'theme';
  var root = document.documentElement;
  var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  var storedRaw = null;
  var stored = null;

  try {
    storedRaw = localStorage.getItem(KEY);
    stored = storedRaw === null ? null : JSON.parse(storedRaw);
  } catch {
    stored = storedRaw;
  }

  if (stored === 'dark' || (!stored && prefersDark)) {
    root.classList.add('dark');
  }

  function persist(value) {
    try {
      localStorage.setItem(KEY, JSON.stringify(value));
    } catch {}
  }

  function updateLabel() {
    var btn = document.getElementById('themeToggleBtn');
    if (!btn) return;

    var dark = root.classList.contains('dark');
    btn.textContent = dark ? 'Light Theme' : 'Dark Theme';
    btn.setAttribute('aria-pressed', dark ? 'true' : 'false');
  }

  function bindThemeToggle() {
    var btn = document.getElementById('themeToggleBtn');
    if (!btn) return;

    btn.addEventListener('click', function () {
      var willBeDark = !root.classList.contains('dark');
      root.classList.toggle('dark');
      persist(willBeDark ? 'dark' : 'light');
      updateLabel();
    });

    updateLabel();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindThemeToggle, { once: true });
  } else {
    bindThemeToggle();
  }
})();
