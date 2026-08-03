/* Dev-log entries.
 *
 * Entries are authored as ordinary markdown — `## 2026-05-08 — Back to Basics`
 * — so they stay easy to write and readable in the source. Here each dated
 * heading gets a git-log-style short hash (the date as yymmdd) and is grouped
 * with the content that follows it into one tinted block, which CSS cannot do
 * on its own: there is no selector that wraps an element together with its
 * following siblings.
 *
 * With JS off, the headings simply render as normal section headings.
 */
(function () {
  var prose = document.querySelector('.prose[data-log]');
  if (!prose) return;

  var DATE = /^(\d{4})-(\d{2})-(\d{2})\s*(?:[—–-]\s*)?(.*)$/;

  Array.prototype.slice.call(prose.children).forEach(function (node) {
    if (node.tagName !== 'H2') return;

    // Every section becomes a block, dated or not. Wrapping only the dated ones
    // left "The Problem" and "What's Next" floating outside the rhythm, which
    // read as a rendering fault rather than a distinction.
    var m = DATE.exec(node.textContent.trim());

    if (m) {
      var hash = m[1].slice(2) + m[2] + m[3];
      var title = m[4] || node.textContent.trim();
      node.textContent = '';
      var h = document.createElement('span');
      h.className = 'devlog-hash';
      h.textContent = hash;
      node.appendChild(h);
      node.appendChild(document.createTextNode(title));
    }

    var entry = document.createElement('div');
    entry.className = 'devlog-entry';
    node.parentNode.insertBefore(entry, node);

    // Move the heading and everything up to the next h2 into the block.
    var next;
    while ((next = entry.nextSibling)) {
      if (next.nodeType === 1 && next.tagName === 'H2' && next !== node) break;
      entry.appendChild(next);
    }
  });
})();

/* Table-of-contents scroll spy.
 *
 * Marks the TOC entry for whichever heading you are currently reading. Uses an
 * IntersectionObserver with a top-heavy root margin so a heading counts as
 * "current" from the moment it reaches the sticky header, and stays current
 * until the next one does — rather than only while it is on screen, which
 * leaves long sections with nothing highlighted.
 */
(function () {
  var items = Array.prototype.slice.call(document.querySelectorAll('.toc__item'));
  if (!items.length || !('IntersectionObserver' in window)) return;

  var headings = items
    .map(function (a) {
      var id = decodeURIComponent(a.getAttribute('href') || '').slice(1);
      return id ? document.getElementById(id) : null;
    })
    .filter(Boolean);

  if (!headings.length) return;

  var visible = new Set();

  function paint() {
    var current = null;

    if (visible.size) {
      // Topmost heading currently in the reading band.
      headings.forEach(function (h) {
        if (visible.has(h) && current === null) current = h;
      });
    } else {
      // Between headings: the last one we scrolled past.
      var top = window.scrollY + 90;
      headings.forEach(function (h) {
        if (h.offsetTop <= top) current = h;
      });
    }

    items.forEach(function (a, i) {
      a.classList.toggle('is-active', headings[i] === current);
    });
  }

  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) visible.add(e.target);
        else visible.delete(e.target);
      });
      paint();
    },
    { rootMargin: '-78px 0px -70% 0px', threshold: 0 }
  );

  headings.forEach(function (h) {
    io.observe(h);
  });
  paint();
})();

/* Back to top.
 *
 * Only useful where the sticky TOC is not: below 820px there is no sidebar, and
 * a dev log runs to several screens. Appears once you are a viewport down.
 */
(function () {
  var btn = document.getElementById('to-top');
  if (!btn) return;

  function sync() {
    btn.hidden = window.scrollY < window.innerHeight;
  }

  btn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  });

  window.addEventListener('scroll', sync, { passive: true });
  sync();
})();
