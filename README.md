# Customer Success Copilot — case study

A single static page. No build step, no dependencies. Open `index.html` in a
browser and it works; push it to GitHub Pages and it works there.

```
index.html      the page — markup with inline styles, as authored
tokens.css      design tokens measured from shamraizgul.com (source of truth for values)
styles.css      the handful of rules inline styles can't express
script.js       scroll reveal, count-up stats, hover-to-source, nav progress
favicon.svg     SG monogram
.nojekyll       stops GitHub Pages running the files through Jekyll
assets/         9 images (.webp served, .png masters kept), 1 video
```

## Deploying

Live at `https://szg-sudo.github.io/case-study-copilot/`.

1. Push this folder to the repo root on `main`.
2. Settings > Pages > Source: `main`, folder `/`.
3. Link to it from the portfolio. The page links back to
   `https://shamraizgul.com` from the nav wordmark and the footer.

**There is deliberately no `CNAME` file right now.** The custom domain is not
working yet, so the canonical and `og:` URLs in `index.html` point at the
`github.io` address, which is the URL that actually resolves. That matters:
link previews and Google both follow those tags, and pointing them at a host
without a valid certificate means no preview card and no indexing.

When DNS is ready, in one pass:

1. Add a `CNAME` file containing `casestudy.shamraizgul.com`.
2. In Squarespace, DNS Settings > add a `CNAME` record: host `casestudy`,
   value `szg-sudo.github.io`.
3. Settings > Pages > Custom domain: `casestudy.shamraizgul.com`, then tick
   **Enforce HTTPS** once the certificate is issued.
4. Swap `canonical`, `og:url` and `og:image` in `index.html` over to the new
   host. Nothing else in the page hardcodes a domain.

## Editing

Copy and layout live in `index.html`. Styling is inline on the elements —
that's deliberate, carried over from how the page was designed, and it means
you edit text and its styling in one place. Values come from `tokens.css`;
if you change a token there, the inline values won't follow, so grep for the
hex you're replacing.

`script.js` has four behaviors, each in its own function and commented. Two
things in it are load-bearing:

- Reveal elements start at `opacity: 0`. There's a 3-second fallback that
  force-reveals anything the observer missed. Don't remove it — without it a
  failed observer leaves the page blank.
- The stat numbers are observed individually at a 0.85 threshold, not by
  section. Observing the section fires the count while the numbers are still
  below the fold.

Both animations are skipped under `prefers-reduced-motion`.

## Assets

The page serves `.webp`. The `.png` files beside them are the masters those
were made from, kept for re-exporting; nothing on the page references them.
Served image weight is about 1.1MB, down from 5MB of PNGs.

`assets/images/01-zendesk-panel-in-situ.png` and its `.webp` have blur
redactions baked into the pixels, covering a policy number in three places.
Don't swap either for an unredacted export.

`assets/images/og-cover.jpg` is the link-preview image, deliberately a JPEG
at 1600x838 because several link scrapers still refuse WebP.
