# brandoncharest.dev — project notes

## Palette
The Gruvbox palette reference the user pasted is the **source of truth** for all color
usage. One job per color; no hex values outside the allowed 17.

## Documented palette exceptions

These are deliberate and should NOT be "corrected" in future passes:

1. **Green (`#b8bb26`) does two jobs: the "evergreen" garden badge and the homepage
   "online" status dot.** The two contexts never co-occur — evergreen only appears on
   garden cards, online status appears once on the homepage neofetch card — and both
   carry the same meaning: stable, live, good.

2. **The neofetch swatch row** paints the accent colors decoratively (red/orange/yellow/
   green/aqua/blue/purple). It is literally a palette display, which is the conventional
   neofetch element, so accents there are not "out of role."

3. **Code blocks** use full multi-hue Gruvbox syntax highlighting — this exception is
   stated in the palette doc itself.

## Runtime gotcha
This project's `support.js` is an older DC runtime where a `style="background:{{ hole }}"`
value goes **sticky** — it will not clear once painted, even when set to `transparent` or
another explicit color. The nav active pill was stranded on one item because of this.
Render mutually exclusive visual states as separate statically-styled elements behind
`<sc-if>` instead of swapping a color through a style hole.
