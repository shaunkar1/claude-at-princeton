# Adding content

The site is deliberately bare for now: the next event, the "Share your artifact" form (plus a gallery once artifacts are approved) and the campus leads. Officers edit three blocks at the top of the `<script>` in `index.html`: `LINKS`, `EVENTS` and `LEADS`. Each has a commented example entry right above it. The sign-up form's URL is the one exception: it lives in `join/index.html` (see "Tabling kit" below).

Artifacts don't need any code changes. Members submit them on the site, and they land in the submissions Google Sheet (see "Reviewing artifacts").

## Editing events, leads and links

1. **Paste one object into the right array.** Copy the example from the comment above the array, paste it inside the `[ ]`, and fill in the fields. Mind the commas between objects. Write plain text: the site escapes everything, so quotes and `<` are fine. Use `"YYYY-MM-DD"` for dates and 24-hour `"HH:MM"` for event times (Princeton time).
2. **Add any photos to `/assets`.** Lead photos go in `assets/leads/` (for example `assets/leads/first-last.jpg`), square and at least 192×192. Use relative paths (`assets/...`, no leading slash).
3. **Preview locally.** From the repo folder run `python3 -m http.server 8000` and open <http://localhost:8000>. If the page goes blank, the browser console will point to a missing comma or quote.
4. **Commit and push to `main`.** GitHub Pages republishes in a minute or two.

## Field notes

| Block | Notes |
| --- | --- |
| `EVENTS` | Only upcoming events show. Each one drops off by itself once it ends, so there's nothing to clean up. The soonest gets the dark "Next up" card with a countdown. `rsvpUrl` is optional and adds an RSVP button. With no upcoming events, the section says nothing is scheduled and points to the sign-up form. |
| `LEADS` | Shown in array order. `photo: ""` shows initials. LinkedIn and email buttons only appear once they're filled in. |
| `LINKS` | A value that is empty or still starts with `TODO` is hidden rather than shown as a dead link. Leave `join` as `join/index.html`; the form URL goes in that file. `community` is the group chat. |
| `SUBMISSIONS_API` | The Apps Script web app URL (ends in `/exec`). Set it once; see README.md, "Artifact submissions". |

## Reviewing artifacts

Submissions go to the **Claude@Princeton artifact submissions** Google Sheet, one row each.

- **New rows start unapproved.** The submitter's page (`#artifact/<id>`) works right away and says it's waiting for review.
- **Approve** by ticking the Approved box. The artifact joins "What members built" on the next page load. Artifacts with a working link come first, then newest first.
- **Edit** a title or description by editing its cell. Changes show on the next page load.
- **Take one down** by deleting its row. Its link then says the artifact couldn't be found.
- **Email (private)** is never sent to the site; only people with access to the Sheet see it.
- **Artifact link** can be left empty. Check each link in a private window, since an artifact that isn't public asks visitors to sign in. A card with no link still shows the title, description and story.
- **Notes (private)** and any columns after it never reach the site.
- **Original submissions** is a copy of the first 12 raw rows, kept before they were merged to one per person. Nothing reads it, so it's safe to delete.
- **The saved copy:** `SAVED_ARTIFACTS` in `index.html` shows the section instantly while the Sheet loads, and the Sheet then replaces it. Refresh it now and then from the web app's output; it never needs emails.
- Don't reorder the columns; the script reads them by position.

The site only accepts artifact links on `claude.ai` (and the older `claude.site`), which is what Claude's Publish button gives.

## Tabling kit

- **Sign-up form:** set `JOIN_FORM_URL` in `join/index.html`. Every "Join" button, the short link (`/join`) and the QR code go through that page, so you only ever change the form in one place.
- **Printed sign:** open `/tabling/` on the live site and press Print. It's one US Letter page with the Nassau Hall drawing, a short pitch and the QR code.
- **QR code:** `assets/join-qr.svg` points at the site's `/join/` page. Regenerate it only if the site's address changes: `swift docs/make-qr.swift "https://claudeatprinceton.org/join/" assets/join-qr.svg` (macOS, run from the repo root).

## Bringing back the bigger site

The fuller version, with Builds and filters, the Claude Library, past events with calendar files, hackathon winners and the FAQ, is in git history at commit `526e027`. Copy sections back from there when the club has content for them.
