# Elevate Technology Partners — website hand-off guide

This is the short version of the guide that ships with the finished build. It
covers the things you will actually want to do after launch, without needing a
developer or a backend.

---

## 1. What this site is

Five static HTML pages, two stylesheets, one small JavaScript file, one font.
No WordPress, no database, no plugins, no admin login.

It is deliberately NOT WordPress. WordPress would let your team edit pages from
an admin screen, but it is also what makes the current DOMAIN-TO-BE-CONFIRMED take 2.3
seconds to return its first byte, and your brief asks for edits to be possible
"without touching a backend". Static files are what meet the under-three-second
criterion with room to spare. If admin-screen editing later matters more than
speed, say so and we can revisit it — but it is a trade, not a free upgrade.

```
/
├── index.html          Home
├── about.html          About Us
├── services.html       Services
├── insights.html       Insights
├── contact.html        Contact Us
├── contact.php         Receives the contact form and emails it to you
├── robots.txt          Tells search engines what to crawl
├── sitemap.xml         Lists the five pages for search engines
└── assets/
    ├── css/base.css    Everything you see (colours, layout, type)
    ├── css/motion.css  Only the animation. Delete it and the site still works.
    ├── css/themes.css  SELECTION STAGE ONLY — the alternative palettes
    ├── js/site.js      Menu, scroll reveals, form validation
    ├── js/review.js    SELECTION STAGE ONLY — copy provenance overlay
    ├── js/options.js   SELECTION STAGE ONLY — palette switcher
    ├── fonts/          One self-hosted font file
    └── img/            Favicon and social-share image
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

**Comments marked `TO DO FOR ELEVATE`** in the HTML flag the places currently
holding placeholder content (UK address, client logos, the three fact tiles,
the Insights articles).

---

## 2b. Review mode — checking where the words came from

Add `?review=1` to any page URL and every content block is outlined by the
origin of its text:

- **green** — verbatim, or near-verbatim, from DOMAIN-TO-BE-CONFIRMED
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
  --navy-900: #0E1113;   /* dark sections                    */
  --navy-800: #15191C;   /* headings                         */
  --cyan-400: #2ED3B7;   /* bright accent — DARK GROUNDS ONLY */
  --cyan-600: #0A7C69;   /* links and buttons                 */
}
```

Change a value there and it updates on all five pages at once. Three notes:

- The token names still say "navy" and "cyan" because they were named during
  the first build. Read them as "the dark ink" and "the accent" — renaming them
  would mean touching every file for no visual gain.
- `--cyan-400` is the bright accent and is deliberately used only on dark
  backgrounds, as a rule or a border. On white it measures 1.9:1 against a
  4.5:1 requirement, so `--cyan-600` (5.1:1) does all the work on white. The
  same rule held for the original Elevate blue, which was 2.4:1 on white.
- Nothing is hard-coded elsewhere — including the hero artwork — so you cannot
  end up with a half-rebranded site.

---

## 4. Adding an Insights article

`insights.html` is a hand-edited list, not a blog engine. To add an article,
copy one `<div class="post-row">…</div>` block, paste it above the others, and
change the three things inside it — the category in `post-row__cat`, the `<h3>`
title, and the `<p>` summary. No database, nothing to break.

If you later want Elevate staff to publish without touching HTML, that is the point
at which a small CMS becomes worth adding — tell me and we will talk about it
then, not before.

---

## 5. Switching the contact form on

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

## 6. SEO

Each page already carries its own `<title>`, meta description, canonical URL and
social-share tags. When you edit a page's content, update its title and
description in the `<head>` to match. The two rules worth keeping:

- Title under about 60 characters, description under about 155 — longer and
  Google truncates them.
- One `<h1>` per page. Everything else is `<h2>` and below.

`sitemap.xml` lists the five pages. Update the `<lastmod>` dates when you make a
significant change, or leave them — it is a hint, not a rule.

---

## 7. Accessibility and motion

- All animation is confined to `motion.css` and only runs when the visitor has
  **not** asked their device to reduce motion. Delete that one file and the
  site is fully functional and static.
- Every page works with JavaScript switched off.
- Colour contrast meets WCAG AA on body text and buttons.
- The site is keyboard navigable, with a skip link and visible focus outlines.

---

## 8. Performance

Measured on the preview build (each page, first visit, empty cache):

| | This build | Current DOMAIN-TO-BE-CONFIRMED |
|---|---|---|
| Page weight | ~58 KB over the wire | ~1,038 KB |
| Requests | 6 | 14+ |
| Third-party requests | 0 | Google Fonts + others |

The 58 KB includes `themes.css`, which only exists while a palette is being
chosen. Deleting it at launch takes the page back to 5 requests and ~56 KB.

Keep it that way by compressing any photograph you add: export at the size it
will actually display, save as WebP or JPEG at ~75% quality, and keep each image
under about 150 KB. One 360 KB hero photo will cost you more load time than the
entire rest of the site put together.

Ask your host to enable gzip/Brotli compression and browser caching — most have
it on by default, and it is what turns 96 KB of files into 53 KB of transfer.
