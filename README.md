# Claude@Princeton

The community site for Claude@Princeton, Princeton's Claude Builder Club (supported by Anthropic). It showcases what Princeton students are building with Claude Code and other AI tools, plus the club's guides, events, hackathon winners and campus leads.

Live at **https://claudeatprinceton.org**

## What's here

```
index.html            The whole site: one file, vanilla HTML/CSS/JS, no build step
404.html              Not-found page (GitHub Pages serves it for any missing URL)
assets/               favicon, social card, build screenshots, lead photos
docs/ADDING_CONTENT.md  How officers add builds, resources, events, winners and leads
docs/PHASE2.md        Plan for live submissions (Firebase), not built yet
docs/og-image.html    Source for assets/og-image.png
CNAME                 Custom domain for GitHub Pages
```

The only external resource is Google Fonts (Source Serif 4 and Inter). There are no trackers or analytics.

## Run it locally

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000. Opening `index.html` straight from disk also works.

## Add content

All content lives in six arrays at the top of the `<script>` in `index.html`: `LINKS`, `BUILDS`, `LIBRARY`, `EVENTS`, `WINNERS` and `LEADS`. Each has a commented example entry. Paste one object into an array, preview, and push. You never touch layout code. The full walkthrough is in [docs/ADDING_CONTENT.md](docs/ADDING_CONTENT.md).

Submissions come in through external forms (URLs in `LINKS`). There's no backend in v1.

## Deploy

GitHub Pages serves the `main` branch from the repo root. Every push to `main` goes live in a minute or two.

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

## Open TODOs

- Confirm logo usage with our Anthropic club contact before adding any official marks. The wordmark is text-only for now.
- Confirm the "free Claude Pro and API credits" wording with Anthropic.
- Fill in the form URLs and contact email in `LINKS`.
- Add the other campus leads, plus photos in `assets/leads/`.
- Replace the `[Placeholder]` entries with real content.

## License

MIT. See [LICENSE](LICENSE).
