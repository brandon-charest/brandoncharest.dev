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
