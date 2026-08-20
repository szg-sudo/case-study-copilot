# Customer Success Copilot — case study

A single static page. No build step, no dependencies. Open `index.html` in a
browser and it works; push it to GitHub Pages and it works there.

```
index.html      the page — markup with inline styles, as authored
tokens.css      design tokens measured from shamraizgul.com (source of truth for values)
styles.css      the handful of rules inline styles can't express
script.js       scroll reveal, count-up stats, hover-to-source, nav progress
CNAME           the subdomain this deploys to
.nojekyll       stops GitHub Pages running the files through Jekyll
assets/         9 images, 1 video
```

## Deploying

1. Push this folder to a repo — either as the repo root on the `main` branch,
   or into `/docs` if you'd rather keep it in a subfolder.
2. Settings → Pages → Source: `main`, folder `/` (or `/docs`).
3. Settings → Pages → Custom domain: enter the domain in `CNAME`, and tick
   **Enforce HTTPS** once the certificate is issued (a few minutes).
4. In Squarespace, DNS Settings → add a `CNAME` record:
   host `work`, value `<your-github-username>.github.io`.
5. Link to it from the portfolio. The page links back to
   `https://shamraizgul.com` from the nav wordmark and the footer.

Change the subdomain by editing `CNAME` and the `og:url` / `canonical` /
`og:image` URLs in `index.html`.

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

`assets/images/01-zendesk-panel-in-situ.png` has blur redactions baked into
the pixels, covering a policy number in three places. Don't swap it for an
unredacted export.
