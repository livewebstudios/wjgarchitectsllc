# Open questions: WJG Architects home page demos

Started 2026-11-16. Everything here was decided so the build would not block. Each item says what shipped and what would change it.

## A. For Wayne (through Jon)

1. **Vector logo.** The only logo file is a 433 x 65 PNG. It ships as `images/logoRGB.png`, capped at 216px wide so it stays sharp. Ask Wayne for the original art, or approve a careful redraw.
2. **Favicon.** Built from `cropped-icon.png`, which is a soft upscaled W. Needs the vector too.
3. **The six traced drawings.** Wayne will read linework like a contractor reads a level. Show him the six files in `images/drawn/` before he sees them on a page. All six registered with their photos (see D). One note: the 670 Belleville drawing shows entry steps and railings where the photo has shrubs in front of them. They look like the real steps, but he should confirm.
4. **The drafting table still** (`images/texture/drafting-table.jpg`, demos 1 and 2, "The firm"). It passed the handoff's checks (no text, no people, blank scale rule). But the vellum in it shows a house that is not a WJG project. If Wayne objects, swap it for his real wall section, `images/condocs/wall-section-55-railroad.jpg`, in the same frame. One line in each demo.
5. **The two ground textures** carry faint invented linework (a floor plan on the paper one, a building section on the night one) at low opacity. Real alternatives exist: `floor-plan-117-woodcliff.jpg` and `elevation-760-washington.jpg`.
6. **SunGard photos.** The data center photos were filed as "410 Comm". They are captioned SunGard CRL4-5, Carlstadt. Confirm.
7. **Schell porch.** The "Proposed" photo is not the finished porch. It is mid-construction: a roofer on the porch roof, a second person on the porch, a ladder, a bare plywood gable. It was not used. Demo 4's before and after card uses the O'Hara warehouse-to-offices pair instead. The range line ("350 square foot front porch") is unchanged. A finished Schell photo would let the porch back in.
8. **Proportion note** (demos 1 and 3): "1 : 1.618. The golden ratio. It has guided good proportion for a few thousand years." Wayne may want his own words.
9. **Focal point notes in demo 3.** Each plate carries one short gold note that is true of its crop: THE CORNER ENTRY SITS IN THE EYE, THE LANDING MEETS THE GOLDEN LINES, THE GABLE SITS WHERE THE LINES CROSS, THE SIGN SITS IN THE EYE, THE DOOR STANDS ON THE GOLDEN LINE. They are accurate but they are our words.
10. **Demo 3 hero.** The spiral's eye lands on the seating group in the Brastad great room (the cat on the sofa back, to be exact). The fireplace could not be used: putting it on the eye needs the photo enlarged past its native size. Confirm Wayne and the homeowner are fine with it.
11. **Demo 2 drafting notes and captions.** TIMBER FRAME, 7,000 SF, WOODCLIFF LAKE, NJ on the hero. Captions: SITE PLAN · NEWARK MIXED USE, HAND SKETCHED DESIGN ELEVATIONS, WALL SECTION AT BUILDING ENTRY · 55 RAILROAD AVENUE, 55 RAILROAD AVENUE · BUILT. Confirm the wording, and that the Newark site plan can be shown publicly.
12. **Davenport House** (demo 4, AN ADDITION chip): "New Milford, NJ. A second floor added over the existing house. 2,600 sf." From the handoff only. Confirm.
13. **760 Washington Avenue** (demo 4, How we work photo). No town in our notes. Alt text reads "760 Washington Avenue, the brick and glass entry".
14. **Stat label.** "3 · STATES: NJ, NY, PA AND MORE" shipped as written. "3" and "and more" pull against each other. Which states, exactly?
15. **Carried from the handoff, not needed for the home page:** who is on the new About page (Tony Bustamante, John Monchak, William Severino, John Braun), Turning Point count (three or five), Finkel or Finkle, project costs on or off the project pages.

## B. For Jon

1. **Pick a demo.** Everything below gets easier once three are deleted.
2. **Copy changes made** after you unlocked the deck. Every fact and subject is intact.
   - The eyebrow "HILLSDALE, NEW JERSEY · ARCHITECTS SINCE 2004" now sits inside the `<h1>`, ahead of "Mastering every space." That puts the keyword and the city in the H1 without touching Wayne's tagline.
   - The hero sub now starts "WJG Architects designs homes, restaurants, stores..." (was "Homes, restaurants, stores...").
   - How we work H2: "What your architect does, from first meeting to final inspection." (was "From first meeting to final inspection.").
   - Meta description trimmed from 167 to 146 characters.
   - Each How we work step lists its services by name, so all thirteen are on the page.
3. **Demo 3 logo.** Shipped as the navy logo on a cream tab hanging from the top edge. The alternative is a white knockout, which needs the vector.
4. **Formspree ID** is `REPLACE_ME`. While it is a placeholder the form shows its success state without sending anything, so the preview can be clicked through. Any real ID posts for real.
5. **GA4 ID** is `G-XXXXXXXXXX`, commented out in every `<head>`.
6. **Repo visibility.** Nothing is on GitHub yet. The handoff says private now. Decap will need it public later.
7. **Schema type.** JSON-LD uses `ProfessionalService`. The LWS SEO spec maps architects to `Architect`, which is not a schema.org type. Worth correcting in `specs/seo-standards.md`.
8. **Canonical.** All four demos point at `https://wjgarchitectsllc.com/` because each is a candidate for that URL. The chooser and the stub carry a placeholder comment instead. They are deleted at launch.
9. **Insights cards** are placeholders, marked `data-placeholder` (three per demo). No dates, no authors.
10. **Mobile action bar.** Its CALL button is filled, so on a phone there are two filled buttons on screen while the hero's LET'S TALK. is in view. That follows the handoff (CALL is the primary there). Say the word and the hero button goes outline below 48rem.
11. **Demo 2 choices to confirm:** sub-sheet numbers A-4.1 (GET SET) and A-5.1 (INSIGHTS) were added so every section has a title block; labels are navy rather than gold; one redline color (`#9c3a1e`) is used for the revision cloud only.
12. **Demo 4 choices to confirm:** the data center chip shows the SunGard conference room (an interior); the hero photo covers the right three quarters of the card so nothing is upscaled; the Brastad drawing and photo are both preloaded so the first wipe is instant (about 470KB together, over the 220KB hero target; drop the drawing preload to get it back).
13. **Turning Point photo** is cropped to 1206 x 905 to remove a parked police vehicle at the left edge. It is a little soft on retina at its largest size in demo 4.

## C. Not done yet (Session B)

- The four Impeccable passes (`/polish`, `/colorize`, `/layout`, `/animate`) and the UI/UX Pro Max pass. Required before any client preview goes out.
- GitHub repo, push, Netlify connect, and the `curl -I` check for `X-Robots-Tag`.
- Lighthouse. Not run.
- Safari, Firefox and a real phone. Everything was verified in headless Chrome only. Highest risk: demo 2's sticky hero and fixed texture on iOS Safari, demo 3's leader lines (CSS `hypot()` / `atan2()`), demo 4's selector layout (CSS subgrid, `:has()`, `@property`).
- A screen reader pass.
- The `/soon/` redirects only work on Netlify. Locally those links 404. Expected.

## D. Higgsfield render inspection log (2026-11-16)

All ten files were opened and inspected. None was rejected. None was regenerated.

| File | Result | Notes |
|---|---|---|
| `drawn-brastad-exterior` | Pass | Registers with the photo. Hoses and bins left out. |
| `drawn-brastad-great-room` | Pass | Registers. Picture over the fireplace left blank, the cat left out. |
| `drawn-670-belleville` | Pass, with a note | Building registers. Vehicles and the monument sign left out. Entry steps drawn where shrubs hide them in the photo (see A3). |
| `drawn-turning-point` | Pass | Registers. Sign blank and cars removed, as prompted. Cropped with its photo. |
| `drawn-ohara-offices` | Pass | Registers. |
| `drawn-sungard-stair` | Pass | Registers. |
| `texture-paper-plan` | Pass | No text. Faint invented plan (see A5). Used at low opacity, multiply. Ships as JPG only: grain makes the WebP several times heavier. |
| `texture-blueprint-night` | Pass | No text. Faint invented section (see A5). JPG only. |
| `still-drafting-table` | Pass, with a note | No people, no text, blank scale rule. Shows an invented house (see A4). |
| `brastad-drawn-to-built.mp4` | Pass | Stepped through six frames: edges hold, camera locked, last frame matches the photo. Re-encoded to 1280 x 848, no audio, 694KB MP4 and 692KB WebM. Play on request only, never autoplay, never loop. |

Registration method: each drawing was resized to its photo and multiplied over it. Every building edge lined up within the 1.5% tolerance, so all five `.d2b` modes are allowed for all six pairs.
