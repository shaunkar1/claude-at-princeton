# Claude@Princeton

The community site for Claude@Princeton, Princeton's Claude Builder Club (supported by Anthropic). It showcases what Princeton students are building with Claude Code and other AI tools, plus the club's guides, events, hackathon winners and campus leads.

Live at **https://shaunkar1.github.io/claude-at-princeton/** for now. It moves to **https://claudeatprinceton.org** once that domain is registered (see "Switch to the custom domain" below).

## What's here

```
index.html            The whole site: one file, vanilla HTML/CSS/JS, no build step
join/index.html       The short link (/join): holds the sign-up form URL and forwards to it
tabling/index.html    Printable tabling sign with the QR code (officers only, not linked from the site)
404.html              Not-found page (GitHub Pages serves it for any missing URL)
assets/               favicon, social card, join QR code, Nassau Hall drawing, screenshots, lead photos
docs/ADDING_CONTENT.md  How officers add builds, resources, events, winners, leads and FAQs
docs/PHASE2.md        Plan for live submissions (Firebase), not built yet
docs/og-image.html    Source for assets/og-image.png
docs/make-qr.swift    Regenerates assets/join-qr.svg (macOS)
CNAME                 Custom domain for GitHub Pages (back once the domain is live)
```

The only external resource is Google Fonts (Source Serif 4 and Inter). There are no trackers or analytics.

## Run it locally

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000. Opening `index.html` straight from disk also works.

## Add content

All content lives in arrays at the top of the `<script>` in `index.html`: `LINKS`, `BUILDS`, `LIBRARY`, `EVENTS`, `WINNERS`, `LEADS` and `FAQ`. Each has a commented example entry. Paste one object into an array, preview, and push. You never touch layout code. The full walkthrough is in [docs/ADDING_CONTENT.md](docs/ADDING_CONTENT.md).

Submissions come in through external forms (URLs in `LINKS`; the sign-up form's URL is in `join/index.html`). There's no backend in v1.

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
- Put the sign-up form URL in `join/index.html`.
- Fill in the other form URLs, the group chat link and the contact email in `LINKS`.
- Confirm the draft answers in `FAQ`.
- Add the other campus leads, plus photos in `assets/leads/`.
- Replace the `[Placeholder]` entries with real content.

## License

MIT. See [LICENSE](LICENSE).
