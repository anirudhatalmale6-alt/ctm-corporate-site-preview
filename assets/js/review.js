/* ============================================================================
   Elevate Technology Partners — review.js
   ----------------------------------------------------------------------------
   A copy-provenance overlay for the approval stage. It is NOT part of the
   finished site: site.js only fetches this file when the URL carries
   ?review=1, so a normal visitor never downloads a single byte of it. Delete
   this file and the four lines that load it before launch and nothing changes.

   What it does: outlines every block according to where its words came from.

     blue    client   — copy Elevate supplied. Yours, verbatim.
     green   ctm      — inherited from the old CTM site. Elevate is a SEPARATE
                        business, so anything still green has to go or be
                        rewritten.
     amber   adapted  — Elevate's wording, extended or tightened
     red     written  — written by me. Elevate has to confirm it is true.

   Blocks carrying data-copy-note get a flag you can click for the detail.
   The point is that nobody approves an invented claim about their own company
   by accident.
   ========================================================================== */

(function () {
  "use strict";

  var LABELS = {
    client:  { name: "Your words",      colour: "#0A5FA8" },
    ctm:     { name: "From the old site (CTM)", colour: "#1E7A47" },
    adapted: { name: "Adapted",         colour: "#B4740B" },
    written: { name: "Written by me",   colour: "#C8322F" }
  };

  var css = document.createElement("style");
  css.textContent = [
    "[data-copy]{position:relative;outline:2px dashed var(--rv-c);outline-offset:6px}",
    /* Label sits at the top-RIGHT: page content is left-aligned, so a
       left-hand badge covers the eyebrow of the block above it. */
    "[data-copy]::after{content:attr(data-rv-label);position:absolute;top:-10px;right:0;",
    "  transform:translateY(-100%);background:var(--rv-c);color:#fff;font:700 10px/1.4 ",
    "  system-ui,sans-serif;letter-spacing:.09em;text-transform:uppercase;padding:3px 7px;",
    "  border-radius:2px;white-space:nowrap;z-index:60;pointer-events:none}",
    '[data-copy="client"]{--rv-c:' + LABELS.client.colour + "}",
    '[data-copy="ctm"]{--rv-c:' + LABELS.ctm.colour + "}",
    '[data-copy="adapted"]{--rv-c:' + LABELS.adapted.colour + "}",
    '[data-copy="written"]{--rv-c:' + LABELS.written.colour + "}",
    "[data-copy-note]{cursor:help}",
    ".rv-note{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);max-width:min(560px,90vw);",
    "  background:#0B1626;color:#fff;padding:16px 20px;font:400 14px/1.5 system-ui,sans-serif;",
    "  box-shadow:0 20px 50px -20px rgba(0,0,0,.7);z-index:300;border-left:4px solid #C8322F}",
    ".rv-note b{display:block;font-size:11px;letter-spacing:.1em;text-transform:uppercase;",
    "  color:#3CB1F0;margin-bottom:6px}",
    ".rv-key{position:fixed;top:90px;right:16px;background:#fff;border:1px solid #E3E7EC;",
    "  padding:14px 16px;font:400 12px/1.7 system-ui,sans-serif;z-index:300;",
    "  box-shadow:0 18px 40px -28px rgba(11,22,38,.55);max-width:250px}",
    ".rv-key h4{margin:0 0 8px;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:#0E1C2F}",
    ".rv-key span{display:inline-block;width:10px;height:10px;margin-right:7px;vertical-align:middle}",
    ".rv-key p{margin:9px 0 0;color:#5E6B7B;font-size:11px;line-height:1.5}"
  ].join("");
  document.head.appendChild(css);

  var blocks = document.querySelectorAll("[data-copy]");
  var tally = { client: 0, ctm: 0, adapted: 0, written: 0 };

  Array.prototype.forEach.call(blocks, function (el) {
    var kind = el.getAttribute("data-copy");
    var meta = LABELS[kind];
    if (!meta) return;
    tally[kind]++;
    el.setAttribute("data-rv-label", meta.name + (el.hasAttribute("data-copy-note") ? " — click" : ""));
    if (el.hasAttribute("data-copy-note")) {
      el.addEventListener("click", function (e) {
        e.preventDefault();
        showNote(el.getAttribute("data-copy-note"), meta);
      });
    }
  });

  var note;
  function showNote(text, meta) {
    if (!note) {
      note = document.createElement("div");
      note.className = "rv-note";
      document.body.appendChild(note);
      note.addEventListener("click", function () { note.remove(); note = null; });
    }
    note.style.borderLeftColor = meta.colour;
    note.innerHTML = "<b>" + meta.name + " — tap to dismiss</b>";
    note.appendChild(document.createTextNode(text));
  }

  var key = document.createElement("div");
  key.className = "rv-key";
  key.innerHTML =
    "<h4>Where the words came from</h4>" +
    '<div><span style="background:' + LABELS.client.colour + '"></span>Your words (' + tally.client + ")</div>" +
    '<div><span style="background:' + LABELS.ctm.colour + '"></span>Old CTM site — must go (' + tally.ctm + ")</div>" +
    '<div><span style="background:' + LABELS.adapted.colour + '"></span>Adapted (' + tally.adapted + ")</div>" +
    '<div><span style="background:' + LABELS.written.colour + '"></span>Written by me (' + tally.written + ")</div>" +
    "<p>Red blocks are claims about Elevate that I invented. Click any outlined block with " +
    "&ldquo;click&rdquo; in its label for the detail. Remove <code>?review=1</code> to see the normal page.</p>";
  document.body.appendChild(key);
})();
