#!/usr/bin/env sh
# Cloudflare Pages build.
#
# Every branch builds from the same config.toml, and `base_url` is baked into
# every absolute URL Zola emits. On a preview host that means the page asks
# *production* for its stylesheet and scripts — which either 404 or, worse,
# serve the previous design's main.css and render the new markup unstyled.
#
# So: production keeps the real base_url, because canonical links, og:url, the
# sitemap and the Atom feed all have to be absolute and correct. Previews are
# rebuilt against their own deployment URL instead.
set -e

if [ "$CF_PAGES_BRANCH" = "main" ] || [ -z "$CF_PAGES_URL" ]; then
    zola build
else
    zola build --base-url "$CF_PAGES_URL"

    # A preview is a byte-for-byte duplicate of the site at a guessable URL.
    # Keep it out of search results.
    printf 'User-agent: *\nDisallow: /\n' > public/robots.txt
fi
