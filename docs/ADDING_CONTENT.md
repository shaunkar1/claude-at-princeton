# Adding content

The site has no backend yet. Submissions come in through external forms, and an officer copies each one into `index.html` and pushes. It takes about five minutes per entry.

All content lives in blocks at the top of the `<script>` in `index.html`: `LINKS`, `BUILDS`, `LIBRARY`, `EVENTS`, `WINNERS`, `LEADS` and `FAQ`. Each block has a commented example entry right above it. The one exception is the sign-up form's URL, which lives in `join/index.html` (see "Tabling kit" below).

## The five steps

1. **Read the submission.** Open the form's responses (the "Share your build", "Suggest a resource" or "Join" form linked from `LINKS`). Check that it's a Princeton student's work and that the links open.

2. **Add any images to `/assets`.**
   - Build screenshots go in `assets/builds/`, named after the build's `id` (for example `assets/builds/project-name.png`). Use 16:9, about 1600×900, PNG or JPG, under 300 KB.
   - Lead photos go in `assets/leads/` (for example `assets/leads/first-last.jpg`). Use a square at least 192×192.
   - Use relative paths (`assets/...`, no leading slash) so the site also works when opened from disk.

3. **Paste one object into the right array.** Copy the example from the comment above the array, paste it inside the `[ ]`, and fill in the fields. Mind the commas between objects. Write plain text: the site escapes everything, so you don't need to worry about quotes or `<` in descriptions. Use `"YYYY-MM-DD"` for dates and 24-hour `"HH:MM"` for event times (Princeton time). Delete the `[Placeholder]` entries once real ones exist.

4. **Preview locally.** From the repo folder run `python3 -m http.server 8000` and open <http://localhost:8000>. Check the new card, the filters it shows up under, and the "How I built this" modal. If the page goes blank, the browser console will point to a missing comma or quote.

5. **Commit and push to `main`.** For example `git commit -am "Add <project name> to builds" && git push`. GitHub Pages republishes in a minute or two. Reload claudeatprinceton.org to confirm.

## Field notes

| Array | Notes |
| --- | --- |
| `BUILDS` | `id` must be unique, lowercase with dashes. `featured: true` pins a build to the front (leads only). Builds sort by featured, then newest `addedAt`. `claudeTools` and `categories` become the filter chips, so reuse the existing spellings. |
| `LIBRARY` | `type` is one of Guide, Video, Workshop slides, Prompt pack, Docs. Cards open `url` in a new tab. |
| `EVENTS` | Upcoming and past are worked out from `date` and `end` automatically, so there's nothing to move when an event ends. The soonest upcoming event gets the dark "Next up" card with a countdown. Locations link to a map search on their own; set `mapUrl` to use a specific map link, and online events (Zoom, "Online", "TBD") get no map link. |
| `WINNERS` | `place` is 1, 2 or 3 for the podium, or `"HM"` for honorable mentions. Entries are grouped by `event`. An empty array hides the whole block. |
| `LEADS` | Shown in array order. `photo: ""` shows initials. |
| `FAQ` | Questions at the bottom of About, in array order. Plain text; separate paragraphs with a blank line. An empty array hides the block. |
| `LINKS` | Any value that still starts with `TODO` renders as a dead link, so nothing breaks before the forms exist. Leave `join` as `join/index.html`; the form URL goes in that file. `community` is the group chat. |

Every build's write-up has its own link, `#build/<id>`, and the "Copy link" button in the write-up copies it. Builders can share that link directly, so pick an `id` you won't need to change.

## Tabling kit

- **Sign-up form:** set `JOIN_FORM_URL` in `join/index.html`. Every "Join" button, the short link (`/join`) and the QR code go through that page, so you only ever change the form in one place.
- **Printed sign:** open `/tabling/` on the live site and press Print. It's one US Letter page with the Nassau Hall drawing, a short pitch and the QR code.
- **QR code:** `assets/join-qr.svg` points at the site's `/join/` page. Regenerate it only if the site's address changes: `swift docs/make-qr.swift "https://claudeatprinceton.org/join/" assets/join-qr.svg` (macOS, run from the repo root).

New categories, products or types appear as chips automatically. To control their order, edit `CATEGORY_ORDER`, `PRODUCT_ORDER` and `TYPE_ORDER` just below the content blocks.
