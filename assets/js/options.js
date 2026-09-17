/* ============================================================================
   CTM Professional Services — options.js  (selection stage only)
   ----------------------------------------------------------------------------
   A palette switcher bar, so the colour decision is made against the real
   pages rather than against swatches on a PDF.

   Loaded only when the URL carries ?options=1 — see the loader at the end of
   site.js. The choice is remembered in localStorage, so you can click through
   Home → Services → Contact and keep comparing in the same colours.

   Delete this file, themes.css and the two loader blocks in site.js at launch;
   the palette you pick gets pasted into the :root block in base.css.
   ========================================================================== */

(function () {
  "use strict";

  var THEMES = [
    { id: "ctm",      name: "CTM navy",  swatch: "#3CB1F0", ground: "#0B1626",
      note: "Your existing brand blue, taken from the current logo." },
    { id: "graphite", name: "Graphite",  swatch: "#2ED3B7", ground: "#0E1113",
      note: "Near-black with a cool accent. The most enterprise-software of the four." },
    { id: "oxford",   name: "Oxford",    swatch: "#F2B705", ground: "#0B142B",
      note: "Deep navy and gold. Reads as established professional services." },
    { id: "violet",   name: "Violet",    swatch: "#9B7CFF", ground: "#131320",
      note: "Charcoal and a modern violet — closest to how DXC uses one saturated accent." }
  ];

  var KEY = "ctm-theme";

  var css = document.createElement("style");
  css.textContent = [
    /* Bottom-RIGHT, not bottom-centre: centred it sat on top of the hero
       call-to-action buttons, which are part of what is being judged. */
    ".op-bar{position:fixed;right:16px;bottom:16px;z-index:300;",
    "  display:flex;align-items:center;gap:6px;background:#fff;border:1px solid #E3E7EC;",
    "  padding:8px;box-shadow:0 22px 50px -26px rgba(11,22,38,.6);font-family:system-ui,sans-serif;",
    "  max-width:min(92vw,430px);flex-wrap:wrap;justify-content:flex-end}",
    ".op-bar>b{font-size:10px;letter-spacing:.11em;text-transform:uppercase;color:#5E6B7B;",
    "  padding:0 8px 0 6px;font-weight:700}",
    ".op-sw{display:flex;align-items:center;gap:7px;border:1px solid transparent;background:#F6F8FA;",
    "  padding:7px 11px;cursor:pointer;font:600 12px system-ui,sans-serif;color:#0E1C2F;border-radius:2px}",
    ".op-sw:hover{border-color:#9AA6B4}",
    '.op-sw[aria-pressed="true"]{border-color:#0E1C2F;background:#fff}',
    ".op-sw i{width:13px;height:13px;border-radius:50%;display:block;flex:0 0 13px;",
    "  box-shadow:inset 0 0 0 3px var(--sw-g)}",
    ".op-note{flex-basis:100%;text-align:center;font-size:11px;color:#5E6B7B;line-height:1.45;",
    "  padding:2px 6px 0}",
    "@media(max-width:600px){.op-bar>b{flex-basis:100%;text-align:center;padding-bottom:4px}}"
  ].join("");
  document.head.appendChild(css);

  var bar = document.createElement("div");
  bar.className = "op-bar";
  bar.innerHTML = "<b>Palette</b>";

  var note = document.createElement("span");
  note.className = "op-note";

  var current = localStorage.getItem(KEY) || "ctm";

  THEMES.forEach(function (t) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "op-sw";
    b.setAttribute("aria-pressed", String(t.id === current));
    b.innerHTML = '<i style="background:' + t.swatch + ";--sw-g:" + t.ground + '"></i>' + t.name;
    b.addEventListener("click", function () {
      apply(t.id);
      Array.prototype.forEach.call(bar.querySelectorAll(".op-sw"), function (el) {
        el.setAttribute("aria-pressed", String(el === b));
      });
      note.textContent = t.note;
    });
    bar.appendChild(b);
  });

  bar.appendChild(note);
  document.body.appendChild(bar);

  var startingNote = THEMES.filter(function (t) { return t.id === current; })[0];
  note.textContent = startingNote ? startingNote.note : "";

  function apply(id) {
    if (id === "ctm") document.documentElement.removeAttribute("data-theme");
    else document.documentElement.setAttribute("data-theme", id);
    try { localStorage.setItem(KEY, id); } catch (e) { /* private mode */ }
  }
})();
