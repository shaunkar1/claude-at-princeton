# Claude@Princeton

The community site for Claude@Princeton, Princeton's Claude Builder Club (supported by Anthropic). It's deliberately bare for now: the next event, a "Share your artifact" form that gives each member's artifact its own page, a gallery of approved artifacts, and the campus leads.

Live at **https://shaunkar1.github.io/claude-at-princeton/** for now. It moves to **https://claudeatprinceton.org** once that domain is registered (see "Switch to the custom domain" below).

## What's here

```
index.html            The whole site: one file, vanilla HTML/CSS/JS, no build step
apps-script/Code.gs   Backend for "Share your artifact": runs inside the submissions Google Sheet
join/index.html       The short link (/join): holds the sign-up form URL and forwards to it
tabling/index.html    Printable tabling sign with the QR code (officers only, not linked from the site)
404.html              Not-found page (GitHub Pages serves it for any missing URL)
assets/               favicon, social card, join QR code, Nassau Hall drawing, screenshots, lead photos
docs/ADDING_CONTENT.md  How officers edit events, leads and links, and review artifacts
docs/PHASE2.md        Older plan for a Firebase backend, not built
docs/og-image.html    Source for assets/og-image.png
docs/make-qr.swift    Regenerates assets/join-qr.svg (macOS)
CNAME                 Custom domain for GitHub Pages (back once the domain is live)
```

External resources: Google Fonts (Source Serif 4 and Inter), and the Apps Script web app that stores artifact submissions in a Google Sheet. There are no trackers or analytics.

## Run it locally

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000. Opening `index.html` straight from disk also works.

## Add content

Content lives in blocks at the top of the `<script>` in `index.html`: `LINKS`, `SUBMISSIONS_API`, `EVENTS` and `LEADS`. Each has a commented example entry. Paste one object into an array, preview, and push. You never touch layout code. The sign-up form's URL is in `join/index.html`. The full walkthrough, including how to review artifacts, is in [docs/ADDING_CONTENT.md](docs/ADDING_CONTENT.md).

The fuller site (Builds, Library, past events, hackathon winners, FAQ) is in git history at commit `526e027`, ready to bring back section by section.

## Artifact submissions

The "Share your artifact" form posts to a Google Apps Script web app, which appends a row to the **Claude@Princeton artifact submissions** Google Sheet (owned by sk4195@princeton.edu). Each submission gets its own page right away at `#artifact/<id>`, marked as waiting for review. Ticking **Approved** in the Sheet adds it to the gallery. The Sheet's Email column is never sent to the site.

Setting it up (already done once; repeat only for a new Sheet):

1. In the Sheet, open **Extensions → Apps Script**, replace `Code.gs` with [apps-script/Code.gs](apps-script/Code.gs) and save.
2. Pick **setup** in the function menu and click **Run**. Approve the permissions it asks for.
3. **Deploy → New deployment → Web app**, with **Execute as: Me** and **Who has access: Anyone**. Copy the web app URL (it ends in `/exec`).
4. Put that URL in `SUBMISSIONS_API` in `index.html` and push.

To change the script later, edit it in the Apps Script editor (keep [apps-script/Code.gs](apps-script/Code.gs) in sync), then use **Deploy → Manage deployments → Edit → Version: New version**. That keeps the same URL, so the site needs no change.

## Deploy

GitHub Pages serves the `main` branch from the repo root. Every push to `main` goes live in a minute or two.

### Switch to the custom domain

The site is served from the github.io address until `claudeatprinceton.org` is registered. To move it over, revert the commit "Serve from github.io until the domain is registered" (it restores `CNAME`, the canonical and social-card URLs, and the 404 page's paths), push, enter `claudeatprinceton.org` under the repo's Settings → Pages → Custom domain, and set the DNS records below.

### Custom domain DNS

At the domain registrar for `claudeatprinceton.org`:

| Type | Host | Value |
| --- | --- | --- |
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| AAAA | `@` | `2606:50c0:8000::153` |
| AAAA | `@` | `2606:50c0:8001::153` |
| AAAA | `@` | `2606:50c0:8002::153` |
| AAAA | `@` | `2606:50c0:8003::153` |
| CNAME | `www` | `shaunkar1.github.io` |

Then, in GitHub:

1. Settings → Pages: confirm the custom domain reads `claudeatprinceton.org`. Once the certificate is issued (this can take up to an hour after DNS resolves), tick **Enforce HTTPS**.
2. Your profile Settings → Pages → **Add a domain**: verify `claudeatprinceton.org` with the TXT record GitHub gives you. This stops anyone else from claiming the domain on GitHub Pages.

### Regenerate the social card

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --hide-scrollbars --window-size=1200,630 --virtual-time-budget=5000 --screenshot="$PWD/assets/og-image.png" "file://$PWD/docs/og-image.html"
```

## Tabling kit

Open `/tabling/` on the live site and press Print for a one-page sign with a QR code. The code points at `/join/`, which forwards to the sign-up form, so swapping in a new form (in `join/index.html`) never breaks a printed code. Codes printed today keep working after the move to `claudeatprinceton.org`, because GitHub redirects the old address. To print a shorter code once the domain is live, regenerate it (macOS):

```bash
swift docs/make-qr.swift "https://claudeatprinceton.org/join/" assets/join-qr.svg
```

## Open TODOs

- Confirm logo usage with our Anthropic club contact before adding any official marks. The wordmark is text-only for now.
- Confirm the "free Claude Pro and API credits" wording with Anthropic.
- Fill in the group chat link and the contact email in `LINKS`.
- Add LinkedIn, email and photos for the campus leads.

## License

MIT. See [LICENSE](LICENSE).
