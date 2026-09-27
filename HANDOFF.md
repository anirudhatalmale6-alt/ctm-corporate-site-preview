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
├── .htaccess           Forces https, redirects www, blocks .log downloads
├── robots.txt          Tells search engines what to crawl
├── sitemap.xml         Lists the six pages for search engines
└── assets/
    ├── css/base.css    Everything you see (colours, layout, type)
    ├── css/motion.css  Only the animation. Delete it and the site still works.
    ├── js/site.js      Menu, scroll reveals, form validation
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

The domain is now set to `elevatetechpartners.com.au` throughout: the canonical
and social tags on all six pages, `sitemap.xml`, `robots.txt`, and `$FROM` in
`contact.php`. All 30 placeholders are gone. If the address ever changes,
search the whole folder for `elevatetechpartners.com.au` and replace it.

Note the site is addressed WITHOUT `www`. Point `www.elevatetechpartners.com.au`
at the same place and have the host redirect it to the bare domain, so the two
spellings do not compete with each other in search results.

---

## 2b. Review mode — removed at launch

During the build every block of text carried a marker saying where its words
came from — yours, CTM's, or mine — and `?review=1` switched on an overlay that
colour-coded them. That has all been removed for the live site: the overlay
file, the code that loaded it, and all 33 markers in the pages.

It did its job: there is no CTM wording left anywhere, and nothing on the site
makes a claim about Elevate that Elevate did not write. If you ever want the
tool back for a future round of copy, it is in the project history.

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

## 4. The contact form

It is already switched on:

- `$TO` is `info@etp.net.au` — where enquiries arrive.
- `$FROM` is `website@elevatetechpartners.com.au`. It must be an address on
  your own domain. If the From address were the visitor's, your host would be
  claiming to be their mail server, SPF would fail and enquiries would land in
  junk. The visitor's address goes in Reply-To, so pressing Reply still works.
  `website@` does not need to be a real mailbox — it only ever sends.
- The preview-only demo mode has been removed, so the form posts for real.

Two things to confirm with your host, once the domain is pointed at them:

1. Ask for the SPF record for your domain and make sure it is set. This is what
   keeps enquiries out of junk folders.
2. Send yourself one test enquiry and confirm it arrives.

The form includes a honeypot (an invisible field that traps bots), a 30-second
throttle per IP address, server-side validation of every field, and mail header
sanitising. All four were tested by posting to the script directly.

If the mail server is ever down the enquiry is written to a fallback log rather
than being lost. That log is written ONE LEVEL ABOVE `public_html`, not inside
it. This matters: it contains names, email addresses, phone numbers and message
text, and in the web folder anyone who guessed the filename could download it —
which is exactly what happened when it was tested. If your host will not let
PHP write above the public folder, the file lands beside `contact.php` instead
and the shipped `.htaccess` blocks `.log` downloads as a second line of
defence.

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

Measured on the finished build, first visit with an empty cache, every image
loaded (localhost, so this excludes whatever your host adds to answer the first
request):

| Page | Requests | Weight |
|---|---|---|
| Home | 6 | 138 KB |
| About Us | 12 | 246 KB |
| Services | 11 | 309 KB |
| Insights | 6 | 141 KB |
| Contact Us | 6 | 134 KB |
| Privacy Policy | 6 | 132 KB |

About and Services are the heavy ones because of the partner logos and the five
service photographs. Both are still far inside the three-second requirement,
and the images are lazy-loaded, so nothing below the fold is fetched until the
visitor scrolls to it.

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
