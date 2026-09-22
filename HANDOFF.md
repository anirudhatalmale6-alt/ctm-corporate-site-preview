# Elevate Technology Partners — website hand-off guide

This is the short version of the guide that ships with the finished build. It
covers the things you will actually want to do after launch, without needing a
developer or a backend.

---

## 1. What this site is

Six static HTML pages, two stylesheets, one small JavaScript file, one font.
No WordPress, no database, no plugins, no admin login.

It is deliberately NOT WordPress. WordPress would let your team edit pages from
an admin screen, but it adds a database, a plugin stack to keep patched, and
server-side work on every request. The brief asks for edits to be possible
"without touching a backend", and static files are what meet the
under-three-second load criterion with room to spare. If admin-screen editing
later matters more than speed, say so and we can revisit it — but it is a
trade, not a free upgrade.

```
/
├── index.html          Home
├── about.html          About Us
├── services.html       Services
├── insights.html       Insights
├── contact.html        Contact Us
├── privacy.html        Privacy Policy
├── contact.php         Receives the contact form and emails it to you
├── robots.txt          Tells search engines what to crawl
├── sitemap.xml         Lists the six pages for search engines
└── assets/
    ├── css/base.css    Everything you see (colours, layout, type)
    ├── css/motion.css  Only the animation. Delete it and the site still works.
    ├── js/site.js      Menu, scroll reveals, form validation
    ├── js/review.js    SELECTION STAGE ONLY — copy provenance overlay
    ├── fonts/          One self-hosted font file
    └── img/            Favicon, social-share image, service photos, partner logos
```

**To deploy:** upload the whole folder to your hosting account's public folder
(`public_html`, `httpdocs` or `www`, depending on the host). That is the entire
deployment process. There is nothing to build, compile or install.

---

## 2. Editing text

Open the page in any text editor (Notepad, TextEdit, VS Code), find the words
you want to change between the `>` and `<` of a tag, and type over them.

```html
<h3>Cloud</h3>
<p>Cloud technology offers a wide range of benefits …</p>
        ↑ change this text, leave the tags alone
```

Save, upload the one file you changed. That is it.

**Comments marked `TO DO FOR ELEVATE`** in the HTML flag the places still
holding my wording rather than Elevate's: the headline and intro on Services,
Insights and Contact, and the closing lines on Services and Insights.

One placeholder is still live everywhere: `DOMAIN-TO-BE-CONFIRMED`, in the
canonical and social tags of all six pages, in `sitemap.xml`, and as `$FROM` in
`contact.php`. Search for that string and replace it with the real domain.

---

## 2b. Review mode — checking where the words came from

Add `?review=1` to any page URL and every content block is outlined by the
origin of its text:

- **blue** — copy you supplied, verbatim
- **green** — inherited from the old CTM site. As of 22 Sep there is none
  left: the last block (About, "Our core principles") was replaced by
  Elevate's own values.
- **amber** — Elevate's wording, extended or tightened
- **red** — written by me, and needs Elevate to confirm it is true

Blocks whose label ends in "— click" carry a note explaining exactly what was
invented. This exists so nobody approves a claim about their own company by
accident (response times, service lines, how the team is structured).

It costs a normal visitor nothing: `assets/js/review.js` is only fetched when
that query string is present. Before launch, delete `review.js`, the block at
the end of `site.js` that loads it, and the `data-copy` attributes.

## 3. Changing the brand colours

Every colour in the site comes from one block at the top of
`assets/css/base.css`:

```css
:root {
  --navy-900: #050708;   /* dark sections, header, footer     */
  --navy-800: #10151A;   /* headings                          */
  --cyan-400: #00C8FF;   /* your logo cyan — DARK GROUNDS ONLY */
  --cyan-600: #00789F;   /* links and buttons                 */
}
```

Change a value there and it updates on all six pages at once. Three notes:

- The token names still say "navy" and "cyan" because they were named during
  the first build. Read them as "the dark ink" and "the accent" — renaming them
  would mean touching every file for no visual gain.
- `--cyan-400` is the bright accent and is deliberately used only on dark
  backgrounds, as a rule or a border. On white it measures 1.96:1 against a
  4.5:1 requirement, so `--cyan-600` (5.0:1) does all the work on white. For
  the same reason, a button filled with `--cyan-400` uses a near-black label:
  white on it is 1.96:1 and fails, near-black is 10.3:1.
- Nothing is hard-coded elsewhere — including the hero artwork — so you cannot
  end up with a half-rebranded site.

---

## 4. Switching the contact form on

The preview build does not send anything. To make it live:

1. Open `contact.php` and set `$TO` to the address enquiries should reach.
2. Set `$FROM` to an address **on your own domain** (e.g. `website@DOMAIN-TO-BE-CONFIRMED`).
   This matters: if the From address is the visitor's, your host is claiming to
   be their mail server, SPF fails, and enquiries land in junk. The visitor's
   address goes in Reply-To, so pressing Reply still works normally.
3. In `contact.html`, delete `data-demo="true"` from the `<form …>` tag.
4. Send yourself one test enquiry and confirm it arrives.

The form already includes a honeypot (invisible field that traps bots), a
30-second throttle per IP, server-side validation of every field, and mail
header sanitising. If the mail server is ever down, the enquiry is written to
`enquiries-fallback.log` instead of being lost.

If your host blocks PHP `mail()` — some do — the same file works with SMTP
credentials or a form service; it is a ten-minute change.

---

## 5. SEO

Each page already carries its own `<title>`, meta description, canonical URL and
social-share tags. When you edit a page's content, update its title and
description in the `<head>` to match. The two rules worth keeping:

- Title under about 60 characters, description under about 155 — longer and
  Google truncates them.
- One `<h1>` per page. Everything else is `<h2>` and below.

`sitemap.xml` lists the six pages. Update the `<lastmod>` dates when you make a
significant change, or leave them — it is a hint, not a rule.

---

## 6. Accessibility and motion

- All animation is confined to `motion.css` and only runs when the visitor has
  **not** asked their device to reduce motion. Delete that one file and the
  site is fully functional and static.
- Every page works with JavaScript switched off.
- Colour contrast meets WCAG AA on body text and buttons.
- The site is keyboard navigable, with a skip link and visible focus outlines.

---

## 7. Performance

Measured on the preview build (each page, first visit, empty cache):

| | This build |
|---|---|
| Page weight | ~55 KB over the wire (98 KB uncompressed) |
| Requests | 6 |
| Third-party requests | 0 |
| Load, 4G | 0.22 s |
| Load, slow 4G | 0.89 s |

Load times are measured on a throttled connection and exclude whatever your
host adds to answer the first request.

Keep it that way by compressing any photograph you add: export at the size it
will actually display, save as WebP or JPEG at ~75% quality, and keep each image
under about 150 KB. One 360 KB hero photo will cost you more load time than the
entire rest of the site put together.

Ask your host to enable gzip/Brotli compression and browser caching — most have
it on by default, and it is what turns 98 KB of files into 55 KB of transfer.

The Services page is the heaviest at roughly 300 KB, because of its five
photographs. They are lazy-loaded, so nothing below the fold is fetched until
you scroll to it.

### The service photographs

`assets/img/services/*.webp` — 800x500, from Unsplash (free for commercial use,
no attribution required).

The brand treatment is baked INTO the files, not applied as a CSS filter. That
is deliberate: a CSS filter costs the browser work on every repaint, and on a
mid-range phone that is visible. The consequence is that the treatment cannot
be dialled up or down in the stylesheet — the images have to be made again from
the originals.

Current recipe, applied to each photo before export:

| Step | Value |
|---|---|
| Saturation | 0.70 |
| Brightness | 0.88 |
| Blend toward #0B2E3C | 18% |
| Export | WebP, quality 76 |

Lower the blend and raise the brightness to show more of the photograph; do the
opposite to push it further toward the brand colour. The point of the treatment
is that five photographs by five different photographers read as one set rather
than five stock pictures — drop it entirely and that goes with it.

A 1px grid sits over the top, and that part IS in the stylesheet:
`.svc-card__art:has(img)::after { opacity: 0.5 }` in base.css.

To replace a photo, drop a new file in at the same path — any size works, the
panel crops it. Keep the alt text describing what the picture SHOWS.

### The partner logos

`assets/img/partners/` — aws, microsoft, hpe, fortinet, paloalto, juniper.

DO NOT drop a raw download straight into the grid. Logos arrive at wildly
different proportions (HPE is 3.5:1, Microsoft is square) and several come on
a white rectangle. Put six of those in the grid untouched and the square ones
tower over the wide ones, while the white boxes show up the moment the grid
sits on anything but white.

Each of these six was prepared the same way:

1. The white surround was flood-filled to transparent, starting from the edge
   only — a global "white to transparent" would punch holes in white INSIDE a
   mark.
2. Trimmed to the ink.
3. Re-placed on an identical 500x300 canvas, scaled to fit inside a 400x175
   box in the middle.

Because every file is now the same shape as its cell, the grid no longer
decides how big each logo looks — step 3 does, identically for all six. To add
a seventh partner, run it through the same three steps.

HPE is the one vector file. Its SVG is wrapped in an outer 500x300 SVG so it
matches the others; the original artwork is untouched inside it.
