/* Command palette.
 *
 * Opened by the header search button, `/`, or ⌘K / Ctrl+K. The index is a
 * compact JSON file built at compile time (see templates/search_index.xml) —
 * label, sub-label, url and type, no body text.
 *
 * The ranking is the handoff's, reproduced exactly:
 *   substring match    1000 − index*2 − lengthPenalty
 *   subsequence match  200 − lengthPenalty
 *   a match on the sub-label is worth 60 less than one on the label
 * Top 9 results. An empty query shows the pages plus the first four notes.
 */
(function () {
  var root = document.getElementById('palette');
  var input = document.getElementById('palette-input');
  var list = document.getElementById('palette-results');
  var countEl = document.getElementById('palette-count');
  var trigger = document.getElementById('search-button');
  if (!root || !input || !list) return;

  var entries = null;
  var results = [];
  var active = 0;
  var indexPromise = null;
  var lastFocus = null;

  /* --- index -------------------------------------------------------------
     Memoise the promise, not a boolean. An earlier version returned an
     already-resolved promise while a fetch was still in flight, so opening the
     palette during that window ran its `.then` against a null index and then
     never re-rendered. Hovering the button warms the index, and a tap fires
     mouseenter immediately before click — so on touch that race hit every
     single time. */

  function load() {
    if (indexPromise) return indexPromise;
    indexPromise = fetch('/search_index.xml')
      .then(function (r) { return r.json(); })
      .then(function (data) { entries = data; })
      .catch(function () { entries = []; });
    return indexPromise;
  }

  /* --- ranking ------------------------------------------------------------ */

  function score(q, text) {
    if (!q) return 1;
    text = (text || '').toLowerCase();
    var i = text.indexOf(q);
    if (i !== -1) return 1000 - i * 2 - (text.length - q.length) * 0.1;

    // Subsequence: every character of the query appears in order.
    var qi = 0;
    for (var ti = 0; ti < text.length && qi < q.length; ti++) {
      if (text[ti] === q[qi]) qi++;
    }
    return qi === q.length ? 200 - text.length * 0.1 : -1;
  }

  function search(raw) {
    var q = (raw || '').trim().toLowerCase();
    if (!entries) return [];

    if (!q) {
      var pages = entries.filter(function (e) { return e.t === 'page'; });
      var notes = entries.filter(function (e) { return e.t !== 'page' && e.t !== 'tag' && e.t !== 'dir'; });
      return pages.concat(notes.slice(0, 4));
    }

    return entries
      .map(function (e) { return { e: e, s: Math.max(score(q, e.l), score(q, e.s) - 60) }; })
      .filter(function (x) { return x.s > 0; })
      .sort(function (a, b) { return b.s - a.s; })
      .slice(0, 9)
      .map(function (x) { return x.e; });
  }

  /* --- rendering ----------------------------------------------------------- */

  function render() {
    list.textContent = '';

    if (!results.length) {
      var empty = document.createElement('div');
      empty.className = 'palette__empty';
      empty.textContent = entries && entries.length ? 'no matches.' : 'loading…';
      list.appendChild(empty);
      if (countEl) countEl.textContent = '';
      return;
    }

    results.forEach(function (e, i) {
      var a = document.createElement('a');
      a.className = 'palette__row' + (i === active ? ' is-selected' : '');
      a.href = e.u;
      a.id = 'palette-opt-' + i;
      a.setAttribute('role', 'option');
      a.setAttribute('aria-selected', i === active ? 'true' : 'false');

      var type = document.createElement('span');
      type.className = 'palette__type';
      type.textContent = e.t;

      var text = document.createElement('span');
      text.className = 'palette__text';
      var label = document.createElement('span');
      label.className = 'palette__label';
      label.textContent = e.l;
      var sub = document.createElement('span');
      sub.className = 'palette__sub';
      sub.textContent = e.s || '';
      text.appendChild(label);
      text.appendChild(sub);

      var ret = document.createElement('span');
      ret.className = 'palette__enter';
      ret.textContent = '↵';

      a.appendChild(type);
      a.appendChild(text);
      a.appendChild(ret);
      a.addEventListener('mouseenter', function () { active = i; paint(); });
      list.appendChild(a);
    });

    if (countEl) countEl.textContent = results.length + ' result' + (results.length === 1 ? '' : 's');
    announce();
  }

  /* Arrow-key selection is invisible to a screen reader unless the combobox
     points at the active option — focus never leaves the input. */
  function announce() {
    input.setAttribute('aria-expanded', results.length ? 'true' : 'false');
    input.setAttribute('aria-activedescendant', results.length ? 'palette-opt-' + active : '');
  }

  function paint() {
    Array.prototype.forEach.call(list.children, function (el, i) {
      if (!el.classList.contains('palette__row')) return;
      el.classList.toggle('is-selected', i === active);
      el.setAttribute('aria-selected', i === active ? 'true' : 'false');
    });
    announce();
  }

  function update() {
    results = search(input.value);
    active = 0;
    render();
  }

  /* --- open / close -------------------------------------------------------- */

  function isOpen() { return !root.hidden; }

  function open() {
    if (isOpen()) return;
    lastFocus = document.activeElement;
    root.hidden = false;
    input.value = '';
    results = [];
    render();
    input.focus();
    load().then(update);
  }

  function close() {
    if (!isOpen()) return;
    root.hidden = true;
    // Send focus back where it came from, not to the top of the document.
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function move(delta) {
    if (!results.length) return;
    active = (active + delta + results.length) % results.length;
    paint();
    var el = list.children[active];
    if (el && el.scrollIntoView) el.scrollIntoView({ block: 'nearest' });
  }

  /* --- events -------------------------------------------------------------- */

  // The markup ships ⌘K; only Apple platforms actually use ⌘. Everyone else
  // presses Ctrl. Rewriting here rather than in the template keeps it out of
  // the cached HTML, which is served to every platform alike.
  var kbd = document.getElementById('search-kbd');
  if (kbd && !/Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent)) {
    kbd.textContent = 'Ctrl K';
  }

  if (trigger) {
    trigger.addEventListener('click', function (e) { e.preventDefault(); open(); });
    // Warm the index on intent, so the first open renders instantly.
    trigger.addEventListener('mouseenter', load, { once: true });
  }

  Array.prototype.forEach.call(root.querySelectorAll('[data-palette-close]'), function (el) {
    el.addEventListener('click', close);
  });

  input.addEventListener('input', update);

  document.addEventListener('keydown', function (e) {
    var mod = e.metaKey || e.ctrlKey;

    if (mod && (e.key === 'k' || e.key === 'K')) {
      e.preventDefault();
      isOpen() ? close() : open();
      return;
    }

    if (isOpen()) {
      if (e.key === 'Escape') { e.preventDefault(); close(); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
      else if (e.key === 'Enter') {
        e.preventDefault();
        var hit = results[active];
        if (hit) window.location.href = hit.u;
      }
      return;
    }

    // Below here the palette is closed, so bare-key shortcuts apply — but never
    // while the user is typing into something.
    if (mod || e.altKey) return;
    var tag = (e.target && e.target.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (e.target && e.target.isContentEditable)) return;

    if (e.key === '/') { e.preventDefault(); open(); return; }

    if (e.key >= '1' && e.key <= '5') {
      var nav = document.querySelectorAll('.site-nav__item');
      var target = nav[Number(e.key) - 1];
      if (target) { e.preventDefault(); window.location.href = target.href; }
    }
  });
})();
