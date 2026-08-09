/* Status-bar uptime.
 *
 * The design shows a live HH:MM:SS counter. On a single-page prototype that is
 * just "seconds since mount"; on a multi-page site a per-page timer would reset
 * on every navigation and read as broken. Anchor it to a sessionStorage
 * timestamp instead, so it measures time on the site and survives page loads.
 */
(function () {
  var el = document.getElementById('uptime');
  if (!el) return;

  var KEY = 'bc:session-start';
  var start;

  try {
    start = Number(window.sessionStorage.getItem(KEY));
    if (!start) {
      start = Date.now();
      window.sessionStorage.setItem(KEY, String(start));
    }
  } catch (e) {
    /* Private modes can throw on sessionStorage. Fall back to this page load. */
    start = Date.now();
  }

  function pad(n) {
    return n < 10 ? '0' + n : String(n);
  }

  function tick() {
    var s = Math.max(0, Math.floor((Date.now() - start) / 1000));
    el.textContent =
      pad(Math.floor(s / 3600)) + ':' + pad(Math.floor(s / 60) % 60) + ':' + pad(s % 60);
  }

  tick();
  setInterval(tick, 1000);
})();
