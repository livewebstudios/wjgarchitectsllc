# Session A summary: WJG Architects home page demos

2026-11-16. Session A of two. Nothing has been pushed. No GitHub repo, no Netlify site yet.

## What exists

- `build/` is a git repo on `main` with two local commits. 114 tracked files.
- Demo chooser (`index.html`), the `/soon/` stub, and four complete home pages under `demos/`.
- One shared design system (`css/base.css`, `css/kit.css`, `js/kit.js`), one stylesheet and one script per demo. No section CSS is shared between demos.
- GSAP 3.15.1 + ScrollTrigger and four font families, all vendored. No CDN.
- 26 of Wayne's photos and construction documents and all ten Higgsfield renders, processed. Nothing over 300KB.
- `netlify.toml`, `_redirects`, `robots.txt`, `sitemap.xml` stub, `README.md`, `OPEN_QUESTIONS.md`.

## git log --oneline

```
f337ac1 Demos 2, 3 and 4, kit fixes, README and open questions [skip netlify]
4d8f383 Scaffold, assets, shared kit, chooser and demo 1 GOLDEN SECTION [skip netlify]
```

(This file is committed in a third commit after the two above.)

## What was verified, and how

All checks ran in headless Chrome against the files on disk.

| Check | Result |
|---|---|
| Root-relative or absolute internal paths | 0 on all six pages (canonical and OG tags excepted) |
| Inline `style` attributes | 0 |
| `<h1>` per page | exactly 1 |
| Heading levels | never skip |
| Em dashes, banned phrases | 0 in every HTML, CSS and JS file |
| Nav, menu and footer link labels | all capitals, typed that way |
| Spiral path | byte for byte in demos 1 and 3; absent from demos 2 and 4 |
| Every referenced file exists | yes |
| Copy | every deck string present in all four demos |
| Horizontal scroll at 360, 390, 768, 1024, 1440, 1920 | none on any page |
| Console errors | none on any page |
| Reduced motion, JS off | every page renders complete |
| Text left hidden after a full scroll | none |
| Contact form (all four demos) | empty send shows text errors and focuses the first bad field; filled send shows the inline success line |
| Total JS, gzipped | under 120KB including GSAP |
| Images | none over 300KB; hero photos under 220KB |

Full-page screenshots of all five pages at 390 and 1440 are in `qa/` (gitignored).

## Decisions that differ from INSTRUCTIONS.md

- Image folder is `images/` and the logo is `images/logoRGB.png`, per the LWS hard-stop rules.
- Footer credit is "Powered by Live Web Studios" with the badge at its native 150 x 37, per the `/powered-by` skill.
- Canonical and `og:url` tags added; meta description trimmed to 146 characters; JSON-LD gained a `description`.
- Copy lightly edited after Jon unlocked the deck (see `OPEN_QUESTIONS.md` B2).
- The Schell porch "after" photo was rejected. Demo 4's before and after card uses the O'Hara pair.
- The two ground textures ship as JPG only.
- The nav CALL button is an outline, so the hero's LET'S TALK. is the one filled button in the first screen.

## How it was built

Scaffold, assets, the kit and demo 1 were built and verified first. Demos 2, 3 and 4 were then built in parallel by three agents against that kit and the same copy, each reviewed afterward. Fixes they surfaced were folded back into the shared kit: the drag handle icon, focus rings on dark surfaces, arriving on a `#hash` from another page, the spiral stopping short of its eye when shown wider than 987px, and a layout shift that could swallow a click on SEND IT.

## Session B, still to do

1. `/polish`, `/colorize`, `/layout`, `/animate` on each demo, in that order.
2. UI/UX Pro Max pass.
3. Safari, Firefox and real phone checks. Lighthouse.
4. Create `livewebstudios/wjgarchitectsllc` (private), push, connect Netlify, confirm the deploy and the `X-Robots-Tag` header with `curl -I`.
5. Final summary and the preview URL.
