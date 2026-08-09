/* Garden tree filtering.
 *
 * Filters by maturity (?growth=). Folders with no surviving notes are pruned
 * entirely — a tree full of empty directories tells you nothing.
 *
 * There was a ?tag= filter here too. Nothing ever linked to it: tag pills go to
 * real /tags/<tag>/ pages, which are deep-linkable and indexable, so the tree
 * filter was unreachable unless you typed the query string by hand. Removed
 * rather than left as a second, hidden way to do the same job.
 *
 * Connectors are the fiddly part. They are rendered server-side so the tree is
 * correct without JS, but hiding rows invalidates them: the last *visible*
 * child of a folder must switch from `├─` to `└─`, and every descendant's
 * prefix must drop the `│` for ancestors that no longer have anything below
 * them. So when a filter is active the prefixes are recomputed from scratch.
 */
(function () {
  var tree = document.getElementById('tree');
  if (!tree) return;

  var rows = Array.prototype.slice.call(tree.querySelectorAll('.tree__row'));
  if (!rows.length) return;

  var params = new URLSearchParams(window.location.search);
  var growth = (params.get('growth') || 'all').toLowerCase();

  var meta = rows.map(function (el) {
    return {
      el: el,
      depth: parseInt(el.getAttribute('data-depth'), 10) || 0,
      isDir: el.classList.contains('tree__row--dir'),
      growth: (el.getAttribute('data-growth') || '').toLowerCase(),
      pre: el.querySelector('.tree__pre')
    };
  });

  function noteMatches(r) {
    return growth === 'all' || r.growth === growth;
  }

  function apply() {
    var filtering = growth !== 'all';

    if (!filtering) {
      meta.forEach(function (r) { r.el.hidden = false; });
      return 0;
    }

    var visibleNotes = 0;
    meta.forEach(function (r) {
      if (r.isDir) return;
      var ok = noteMatches(r);
      r.el.hidden = !ok;
      if (ok) visibleNotes++;
    });

    // A folder survives only if something below it does. Walking backwards
    // means a folder is decided after everything it contains.
    var keepAtDepth = [];
    for (var i = meta.length - 1; i >= 0; i--) {
      var r = meta[i];
      if (r.isDir) {
        var keep = !!keepAtDepth[r.depth + 1];
        r.el.hidden = !keep;
        keepAtDepth[r.depth + 1] = false;
        if (keep) keepAtDepth[r.depth] = true;
      } else if (!r.el.hidden) {
        keepAtDepth[r.depth] = true;
      }
    }

    redrawConnectors();
    return visibleNotes;
  }

  /* Rebuild every prefix from the surviving rows.
   *
   * One backward pass is enough: a row is the last of its group when nothing
   * at its own depth has been seen since the last shallower row, and an
   * ancestor needs a `│` exactly when it still has something below it. */
  function redrawConnectors() {
    var visible = meta.filter(function (r) { return !r.el.hidden; });
    var hasLater = [];
    var plan = [];

    for (var i = visible.length - 1; i >= 0; i--) {
      var r = visible[i];
      var d = r.depth;

      // Anything deeper than this row is now closed off.
      hasLater.length = d + 1;

      plan[i] = { isLast: !hasLater[d], ancestors: hasLater.slice(0, d) };
      hasLater[d] = true;
    }

    visible.forEach(function (r, i) {
      var p = plan[i];
      var out = '';
      for (var k = 0; k < r.depth; k++) out += p.ancestors[k] ? '\u2502\u00a0\u00a0' : '\u00a0\u00a0\u00a0';
      out += p.isLast ? '\u2514\u2500\u00a0' : '\u251c\u2500\u00a0';
      if (r.pre) r.pre.textContent = out;
    });
  }

  var count = apply();

  // Reflect the active state in the chips and the prompt.
  Array.prototype.forEach.call(document.querySelectorAll('.chip'), function (chip) {
    var v = (chip.getAttribute('data-growth') || 'all').toLowerCase();
    chip.classList.toggle('is-active', v === growth);
  });

  var promptFilter = document.querySelector('.garden__prompt .prompt__dim');
  if (promptFilter) {
    promptFilter.textContent = '--filter=' + growth;
  }

  var empty = document.getElementById('tree-empty');
  if (empty) empty.hidden = growth === 'all' || count > 0;
})();
