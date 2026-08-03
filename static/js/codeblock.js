/* Code card.
 *
 * Zola emits `<pre class="language-rust z-code" data-lang="rust"
 * data-name="src/resp.rs">`. The design wants that inside a card with a
 * filename tab, a right-aligned language label and a line-number gutter.
 *
 * The filename comes from the fence itself (```rust,name=src/resp.rs), added
 * in Zola 0.20. An earlier version of this file parsed a leading `// path`
 * comment out of the highlighted markup instead, which was both fragile and
 * genuinely dangerous: highlighted code is a tree, so trimming text anywhere
 * above a leaf replaced that whole subtree with plain text and silently
 * flattened the highlighting.
 *
 * Line numbers still need JS — `linenos` is per-fence, so using it would mean
 * annotating 140 fences. With JS off the block still renders as a readable bg1
 * panel; this only adds chrome.
 */
(function () {
  function build(pre) {
    var code = pre.querySelector('code');
    if (!code || pre.closest('.code-card')) return;

    var lang = pre.getAttribute('data-lang') || '';
    var filename = pre.getAttribute('data-name') || '';
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
    // neofetch art, the gutter this script creates — is left alone.
    var blocks = document.querySelectorAll('pre.z-code, pre[data-lang]');
    Array.prototype.forEach.call(blocks, build);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
