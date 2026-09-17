/* ============================================================================
   Elevate Technology Partners — site.js
   ----------------------------------------------------------------------------
   One small file, no framework, no dependencies (about 4 KB before gzip).
   Everything here is an ENHANCEMENT: if this file fails to load, every page
   still renders, every link still works, and the contact form still submits
   to the server the normal way.

   Contents:
     1. Motion switch        — turns motion.css on, unless "reduce motion" is set
     2. Mobile navigation    — open/close, Escape key, focus handling
     3. Scroll reveal        — IntersectionObserver, one-shot
     4. Header shadow        — on scroll
     5. Counting facts       — number roll-up, one-shot
     6. Contact form         — inline validation + AJAX submit with fallback
     7. Footer year
   ========================================================================== */

(function () {
  "use strict";

  var doc = document;
  var root = doc.documentElement;

  /* -- 1. Motion switch ---------------------------------------------------- */
  /* The visitor's operating system preference wins. Anyone who has ticked
     "reduce motion" (common for vestibular conditions) gets the static site. */

  var prefersReduced = window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

  if (!prefersReduced) {
    root.setAttribute("data-motion", "on");
  }

  /* -- 2. Mobile navigation ------------------------------------------------ */

  var toggle = doc.querySelector(".nav-toggle");
  var nav = doc.getElementById("primary-nav");
  var DESKTOP = window.matchMedia("(min-width: 960px)");

  function setNav(open) {
    if (!nav || !toggle) return;
    if (open) {
      nav.hidden = false;
      nav.classList.add("is-open");
    } else {
      nav.hidden = true;
      nav.classList.remove("is-open");
    }
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }

  /* The menu starts closed on phones, but must never be left hidden if the
     window is widened to desktop — hence syncNav() on resize as well.        */
  function syncNav() {
    if (!nav) return;
    if (DESKTOP.matches) {
      nav.hidden = false;
      nav.classList.remove("is-open");
      if (toggle) toggle.setAttribute("aria-expanded", "false");
    } else if (!nav.classList.contains("is-open")) {
      nav.hidden = true;
    }
  }

  if (toggle && nav) {
    syncNav();
    toggle.addEventListener("click", function () {
      setNav(nav.hidden);
    });

    /* Tapping a link inside the panel should close it. */
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a") && !DESKTOP.matches) setNav(false);
    });

    doc.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !nav.hidden && !DESKTOP.matches) {
        setNav(false);
        toggle.focus();
      }
    });

    /* addEventListener on a MediaQueryList is not supported in older Safari,
       so fall back to the deprecated addListener there. */
    if (DESKTOP.addEventListener) DESKTOP.addEventListener("change", syncNav);
    else if (DESKTOP.addListener) DESKTOP.addListener(syncNav);
  }

  /* -- 3. Scroll reveal ---------------------------------------------------- */
  /* Elements marked data-reveal get the .reveal class HERE, in JavaScript,
     rather than in the HTML. That is deliberate: the class that hides an
     element must only ever exist when the code that shows it again is running. */

  var revealables = doc.querySelectorAll("[data-reveal]");

  if (revealables.length && !prefersReduced && "IntersectionObserver" in window) {
    Array.prototype.forEach.call(revealables, function (el) {
      el.classList.add("reveal");
    });

    /* Stagger: give each child of a group its index so motion.css can offset
       the transition-delay. */
    Array.prototype.forEach.call(doc.querySelectorAll(".reveal-group"), function (group) {
      Array.prototype.forEach.call(group.children, function (child, i) {
        child.style.setProperty("--i", i);
      });
    });

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          el.classList.add("is-in");
          io.unobserve(el); // one-shot: never animate the same element twice
          window.setTimeout(function () { el.classList.add("is-done"); }, 800);
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 }
    );

    Array.prototype.forEach.call(revealables, function (el) { io.observe(el); });
  }

  /* -- 4. Header shadow ---------------------------------------------------- */

  var header = doc.querySelector(".header");
  if (header) {
    var ticking = false;
    var onScroll = function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        header.classList.toggle("is-scrolled", window.scrollY > 8);
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* -- 5. Counting facts --------------------------------------------------- */
  /* <span class="fact__value" data-count-to="12" data-count-suffix="+">12+</span>
     The final value is already in the HTML, so a visitor without JavaScript
     (or a search engine) reads the real number, not a zero. */

  var counters = doc.querySelectorAll("[data-count-to]");
  if (counters.length && !prefersReduced && "IntersectionObserver" in window) {
    var cio = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          countUp(entry.target);
          cio.unobserve(entry.target);
        });
      },
      { threshold: 0.4 }
    );
    Array.prototype.forEach.call(counters, function (el) { cio.observe(el); });
  }

  function countUp(el) {
    var target = parseFloat(el.getAttribute("data-count-to"));
    var suffix = el.getAttribute("data-count-suffix") || "";
    var prefix = el.getAttribute("data-count-prefix") || "";
    if (isNaN(target)) return;

    var duration = 900;
    var start = null;

    function frame(ts) {
      if (start === null) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      /* ease-out: fast at first, settles gently */
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = prefix + Math.round(target * eased) + suffix;
      if (progress < 1) window.requestAnimationFrame(frame);
      else el.textContent = prefix + target + suffix;
    }
    window.requestAnimationFrame(frame);
  }

  /* -- 6. Contact form ----------------------------------------------------- */
  /* Validation runs in the browser for a fast answer, and again on the server
     in contact.php — browser checks can always be bypassed, so the server is
     the one that actually decides.                                           */

  var form = doc.getElementById("contact-form");
  if (form) {
    var status = doc.getElementById("form-status");
    var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    function fieldError(input, message) {
      var holder = input.closest(".field");
      var slot = holder ? holder.querySelector(".field__error") : null;
      if (message) {
        input.setAttribute("aria-invalid", "true");
        if (slot) slot.textContent = message;
      } else {
        input.removeAttribute("aria-invalid");
        if (slot) slot.textContent = "";
      }
    }

    function validate(input) {
      var value = (input.value || "").trim();
      var label = input.getAttribute("data-label") || "This field";

      if (input.required && !value) {
        fieldError(input, label + " is required.");
        return false;
      }
      if (input.type === "email" && value && !EMAIL.test(value)) {
        fieldError(input, "Please enter a valid email address.");
        return false;
      }
      if (input.name === "message" && value && value.length < 20) {
        fieldError(input, "Please give us a little more detail (20 characters or more).");
        return false;
      }
      fieldError(input, "");
      return true;
    }

    var inputs = form.querySelectorAll("input, select, textarea");

    Array.prototype.forEach.call(inputs, function (input) {
      if (input.type === "hidden" || input.closest(".hp")) return;
      /* Validate on blur, then live once the field has already been marked
         invalid — nagging someone mid-word is the usual mistake here. */
      input.addEventListener("blur", function () { validate(input); });
      input.addEventListener("input", function () {
        if (input.getAttribute("aria-invalid") === "true") validate(input);
      });
    });

    form.addEventListener("submit", function (e) {
      var firstBad = null;
      Array.prototype.forEach.call(inputs, function (input) {
        if (input.type === "hidden" || input.closest(".hp")) return;
        if (!validate(input) && !firstBad) firstBad = input;
      });

      if (firstBad) {
        e.preventDefault();
        firstBad.focus();
        showStatus("Please check the highlighted fields and try again.", true);
        return;
      }

      /* DEMO MODE ------------------------------------------------------------
         While the site is on a static preview host there is no PHP to receive
         the form, so we stop the submit and show the success message instead.
         On the live host, delete the block between the two DEMO markers and
         the form posts to contact.php normally.                              */
      if (form.getAttribute("data-demo") === "true") {
        e.preventDefault();
        showStatus(
          "Thanks — this is the preview build, so nothing was sent. On the live site this message is delivered to the Elevate inbox and you receive an automatic acknowledgement.",
          false
        );
        form.reset();
        return;
      }
      /* END DEMO ----------------------------------------------------------- */

      /* Live mode: submit in the background so the visitor is not bounced to a
         blank "thank you" page. If fetch is unavailable the default submit
         goes ahead untouched. */
      if (!window.fetch) return;

      e.preventDefault();
      var button = form.querySelector("[type=submit]");
      if (button) { button.disabled = true; button.textContent = "Sending…"; }

      fetch(form.action, { method: "POST", body: new FormData(form) })
        .then(function (r) { return r.json().catch(function () { return { ok: r.ok }; }); })
        .then(function (data) {
          if (data.ok) {
            showStatus(data.message || "Thank you — your message is on its way. We reply within one business day.", false);
            form.reset();
          } else {
            showStatus(data.message || "Sorry, we could not send that. Please email EMAIL-TO-BE-CONFIRMED.", true);
          }
        })
        .catch(function () {
          showStatus("Sorry, we could not reach the server. Please email EMAIL-TO-BE-CONFIRMED.", true);
        })
        .then(function () {
          if (button) { button.disabled = false; button.textContent = "Send message"; }
        });
    });

    function showStatus(message, isError) {
      if (!status) return;
      status.hidden = false;
      status.textContent = message;
      status.style.borderLeftColor = isError ? "#C8322F" : "";
      /* role="status" on the element means screen readers announce this
         without us having to move focus. */
    }
  }

  /* -- 7. Footer year ------------------------------------------------------ */

  var year = doc.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  /* -- 8. Copy-review overlay (approval stage only) ------------------------- */
  /* Adding ?review=1 to any URL loads review.js, which outlines each block by
     where its words came from. A normal visitor never requests the file, so it
     costs nothing. Delete this block and review.js before launch. */

  if (/[?&]review=1(&|$)/.test(window.location.search)) {
    var rv = doc.createElement("script");
    rv.src = "assets/js/review.js";
    rv.defer = true;
    doc.body.appendChild(rv);
  }

})();
