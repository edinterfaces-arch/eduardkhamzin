(() => {
  const root = document.documentElement;
  const system = window.matchMedia('(prefers-color-scheme: dark)');
  const key = 'site-theme';
  let preference = null;
  try {
    const saved = localStorage.getItem(key);
    if (saved === 'light' || saved === 'dark') preference = saved;
  } catch {}

  function apply() {
    const dark = preference ? preference === 'dark' : system.matches;
    root.dataset.theme = dark ? 'dark' : 'light';
    const button = document.querySelector('.theme-switch');
    if (button) {
      button.setAttribute('aria-checked', String(dark));
      button.title = dark ? 'Включить светлую тему' : 'Включить тёмную тему';
    }
  }

  // Apply before the first paint; only a local, tiny script is loaded.
  apply();
  system.addEventListener('change', () => { if (!preference) apply(); });
  document.addEventListener('DOMContentLoaded', () => {
    const button = document.querySelector('.theme-switch');
    if (!button) return;
    apply();
    button.hidden = false;
    button.addEventListener('click', () => {
      preference = root.dataset.theme === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem(key, preference); } catch {}
      apply();
    });
  });
})();
