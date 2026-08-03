/* Code card.
 *
 * Zola 0.17 emits a bare `<pre class="language-rust z-code" data-lang="rust">`.
 * The design wants that inside a card with a filename tab, a right-aligned
 * language label and a line-number gutter. Zola 0.17 can do none of those:
 * there is no `name=` fence attribute until a later release, and `linenos` is
 * per-fence, which would mean editing 140 fences across 37 files.
 *
 * So the card is built here instead. The filename comes from a leading path
 * comment (`// src/resp.rs`) when the author wrote one — that line moves into
 * the tab rather than being duplicated. With JS off the block still renders as
 * a readable panel; this only adds chrome.
 */
(function () {
  var FILENAME = /^\s*(?:\/\/|#|--|;)\s*([\w.\-/]+\.[A-Za-z0-9]+)\s*$/;

  /* Remove the first rendered line, in place.
   *
   * Highlighted code is a tree, not a flat list: syntect wraps the whole block
   * in one `z-source` span and nests every token inside it. Editing textContent
   * anywhere above a leaf therefore replaces that entire subtree with plain
   * text — which silently destroys the highlighting. Walk to the text nodes and
   * trim only those, then discard any elements left empty. */
  function dropFirstLine(code) {
    var walker = document.createTreeWalker(code, NodeFilter.SHOW_TEXT, null, false);
    var doomed = [];
    var node;

    while ((node = walker.nextNode())) {
      var nl = node.nodeValue.indexOf('\n');
      if (nl === -1) {
        doomed.push(node);
        continue;
      }
      node.nodeValue = node.nodeValue.slice(nl + 1);
      break;
    }

    doomed.forEach(function (n) {
      if (n.parentNode) n.parentNode.removeChild(n);
    });

    // Prune scope spans the removal emptied out (the comment's own wrapper).
    Array.prototype.forEach.call(code.querySelectorAll('span'), function (s) {
      if (!s.textContent && !s.children.length && s.parentNode) {
        s.parentNode.removeChild(s);
      }
    });
  }

  function build(pre) {
    var code = pre.querySelector('code');
    if (!code || pre.closest('.code-card')) return;

    var lang = pre.getAttribute('data-lang') || '';
    var filename = '';

    // Lift a leading `// path/to/file.ext` comment into the tab.
    var firstLine = (code.textContent || '').split('\n')[0];
    var m = FILENAME.exec(firstLine);
    if (m) {
      filename = m[1];
      dropFirstLine(code);
    }

    var lines = (code.textContent || '').replace(/\n$/, '').split('\n').length;

    var card = document.createElement('div');
    card.className = 'code-card';

    var bar = document.createElement('div');
    bar.className = 'code-card__bar';

    if (filename) {
      var tab = document.createElement('span');
      tab.className = 'code-card__tab';
      var sq = document.createElement('span');
      sq.className = 'code-card__square';
      sq.setAttribute('aria-hidden', 'true');
      tab.appendChild(sq);
      tab.appendChild(document.createTextNode(filename));
      bar.appendChild(tab);
    }

    if (lang) {
      var label = document.createElement('span');
      label.className = 'code-card__lang';
      label.textContent = lang;
      bar.appendChild(label);
    }

    var body = document.createElement('div');
    body.className = 'code-card__body';

    var gutter = document.createElement('pre');
    gutter.className = 'code-card__gutter';
    gutter.setAttribute('aria-hidden', 'true');
    var nums = [];
    for (var i = 1; i <= lines; i++) nums.push(i);
    gutter.textContent = nums.join('\n');

    pre.parentNode.insertBefore(card, pre);
    if (bar.childNodes.length) card.appendChild(bar);
    card.appendChild(body);
    body.appendChild(gutter);
    body.appendChild(pre);
  }

  function run() {
    // Only Zola-highlighted blocks. Anything else that renders a <pre> — the
    // neofetch art, the dev-log gutter this script creates — is left alone.
    var blocks = document.querySelectorAll('pre.z-code, pre[data-lang]');
    Array.prototype.forEach.call(blocks, build);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
