# WJG Architects: home page demos

Three home page options for WJG Architects, LLC (Hillsdale, NJ), built from one shared design system so Wayne can pick one. A fourth (Golden Section) was built and dropped on 2026-11-17; it is in git history at commit 744581f. Private preview. Not indexed.

Built by Live Web Studios, November 2026.

## What is here

| Path | What it is |
|---|---|
| `index.html` | Welcome page for Wayne, laid out as a plain memo: the three directions, the traced drawings to check, and what we still need from him |
| `demos/drawn-to-built/` | Paper and linework. Drawings become photos on scroll. Golden ratio hidden. |
| `demos/composition/` | Dark gallery with golden overlays on black and white photos. Golden ratio visible. |
| `demos/get-set/` | Bright rounded cards with a "What are you building?" selector. Golden ratio hidden. |
| `soon/` | Stub that every not-yet-built page redirects to on Netlify |
| `css/base.css` | Fonts, tokens (color, Fibonacci spacing, phi type scale), reset |
| `css/kit.css`, `js/kit.js` | Shared components: nav, footer, action bar, overshoot corners, drawn-to-built, spiral, dimension strings, leader labels, count up, form |
| `css/demo-N.css`, `js/demo-N.js` | One skin and one script per demo. No section CSS is shared between demos. |
| `js/vendor/` | GSAP 3.15.1 and ScrollTrigger, vendored. No CDN. |
| `fonts/` | Jost (variable), Instrument Serif, IBM Plex Mono, Architects Daughter. Self-hosted woff2. |
| `images/`, `video/` | Processed assets. Originals live outside the repo in `../docs/assets/`. |
| `tools/prep-images.mjs` | Image prep (sharp). Not deployed. |

## Run it locally

Any static server works. From this folder:

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173/`. Links to inner pages (About, Services, the five project pages and so on) 404 locally. On Netlify they 302 to `/soon/`. That is expected: the inner pages are out of scope for this round.

## Rules this build follows

- Static HTML, CSS and vanilla JS. No framework, no build step in production.
- Every internal path is relative. The only absolute internal URLs are the canonical tag and the Open Graph tags.
- The logo is always `<img src="images/logoRGB.png">` (path relative to the page), never recolored or redrawn, capped at 216px wide because the only source file is 433px.
- No inline `style` attributes. Colors and fonts are CSS custom properties.
- Every building photo is a real WJG project. AI imagery is limited to six line drawings traced from Wayne's own photos, two paper textures, one drafting table still, and one drawing-to-photo clip.
- The golden spiral is one exact SVG (987 x 610). It is never stretched, only flipped.
- With JavaScript off, with GSAP blocked, or with reduced motion on, every page still renders complete: photos shown, lines drawn, numbers at their final values.

## Re-running image prep

`_src/` (renamed originals) and `_hf/` (Higgsfield renders) are staging folders and are gitignored. If you have them:

```bash
cd tools && npm install && node prep-images.mjs
```

Max 1600px wide, JPG quality 82 stepping down only to meet the size budget (300KB, 220KB for hero photos), metadata stripped, a WebP beside every JPG.

## Before launch

- Remove the `X-Robots-Tag` header in `netlify.toml`, the `noindex` meta tag on each page, and the `Disallow: /` in `robots.txt`.
- Remove the `/soon/` redirects in `_redirects` as real pages replace them. Add 301s for `/services-2/` and `/contact-us/`.
- Replace the Formspree ID (`REPLACE_ME`) and the GA4 ID (`G-XXXXXXXXXX`).
- Promote the chosen demo to `/`, delete the other two, the welcome page (`index.html`, `css/welcome.css`) and the demo bar.
- See `OPEN_QUESTIONS.md`.
