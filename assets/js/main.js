// 4C Construction Systems — shared site shell (header, nav, footer)
//
// The header and footer are now written into every page as real HTML, so the
// navigation and footer link graph are in the served markup and don't depend
// on this file running — crawlers that skip JavaScript still see every
// internal link. The render functions below stay as a fallback for any page
// that still ships the old empty <div id="site-header"> mount, and they bail
// out the moment a real shell is already on the page so nothing is duplicated.
//
// Because the markup is now baked into all 20 pages, a nav or footer change
// has to be applied to those pages as well as to the definitions here.

const CCC_NAV = [
  { url: "index.html", label: "Home" },
  { url: "systems.html", label: "Our Process" },
  { url: "projects.html", label: "Projects" },
  {
    label: "Who We Serve",
    dropdown: [
      { url: "partners.html", label: "Overview" },
      { url: "owners-developers.html", label: "Owners & Property Developers" },
      { url: "architects-designers.html", label: "Architects & Designers" },
      { url: "builders-contractors.html", label: "Builders & General Contractors" },
    ],
  },
  { url: "about.html", label: "About" },
];

function cccLogoMark(prefix, variant) {
  // The footer sits on a dark background, where the dark-text "logo-full"
  // wordmark is effectively invisible — it needs the white-text variant.
  const file = variant === "white" ? "logo-white.webp" : "logo-full.webp";
  return `<img class="mark-full" src="${prefix || ""}assets/img/${file}" alt="4C Construction Systems" width="600" height="${
    variant === "white" ? 288 : 279
  }" />`;
}

function cccBlueprintBg(idSuffix) {
  const id = "bp-grid-" + (idSuffix || "0");
  return `
  <svg class="blueprint-bg" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="${id}" width="46" height="46" patternUnits="userSpaceOnUse">
        <path d="M 46 0 L 0 0 0 46" fill="none" stroke="currentColor" stroke-width="1"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#${id})" />
  </svg>`;
}

function cccCurrentFile() {
  const path = window.location.pathname;
  return path.substring(path.lastIndexOf("/") + 1) || "index.html";
}

function cccIsInLocations() {
  return window.location.pathname.includes("/locations/");
}

function cccPrefix() {
  return cccIsInLocations() ? "../" : "";
}

function cccRenderHeader() {
  const header = document.getElementById("site-header");
  // Already served as real markup — leave it alone.
  if (!header || header.tagName === "HEADER") return;
  const current = cccCurrentFile();
  const prefix = cccPrefix();

  const navHtml = CCC_NAV.map((item) => {
    if (item.dropdown) {
      const links = item.dropdown
        .map((d) => `<a href="${prefix}${d.url}">${d.label}</a>`)
        .join("");
      return `
        <div class="dropdown">
          <a href="${prefix}${item.dropdown[0].url}">${item.label}</a>
          <div class="dropdown-panel">${links}</div>
        </div>`;
    }
    const active = item.url === current;
    return `<a href="${prefix}${item.url}"${active ? ' style="color:var(--color-accent)"' : ""}>${item.label}</a>`;
  }).join("");

  // Replace the mount div's outerHTML (not innerHTML) so <header> sits
  // directly in the body with no wrapping div — a wrapping div here
  // breaks position:sticky on the header in some browsers.
  header.outerHTML = `
    <header class="site-header" id="site-header">
      <div class="wrap">
        <a class="brand" href="${prefix}index.html">
          ${cccLogoMark(prefix)}
        </a>
        <nav class="main-nav" aria-label="Primary">
          ${navHtml}
        </nav>
        <a class="header-phone" href="tel:6502003182">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.36 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.34 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
          650-200-3182
        </a>
        <a class="btn btn-primary header-cta" href="${prefix}contact.html">Talk to Us</a>
        <button class="menu-toggle" id="menu-toggle" aria-label="Toggle navigation" aria-expanded="false">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
      </div>
    </header>
  `;
}

// Keeps the served copyright year current without making the year itself
// depend on JavaScript — the markup ships with a real year already in place.
function cccSyncFooterYear() {
  const slot = document.getElementById("footer-year");
  const year = String(new Date().getFullYear());
  if (slot && slot.textContent !== year) slot.textContent = year;
}

function cccRenderFooter() {
  const footer = document.getElementById("site-footer");
  // Already served as real markup — leave it alone.
  if (!footer || footer.tagName === "FOOTER") return;
  const prefix = cccPrefix();
  footer.innerHTML = `
    <footer class="site-footer">
      <div class="wrap">
        <div class="footer-grid">
          <div class="footer-brand">
            <a class="brand" href="${prefix}index.html">
              ${cccLogoMark(prefix, "white")}
            </a>
            <p>Turning building designs into certified, manufactured, installation-ready components for California's owners, architects, and builders.</p>
          </div>
          <div>
            <h2>Our Process</h2>
            <a href="${prefix}systems.html">The End-to-End Process</a>
            <a href="${prefix}manufacturing.html">Manufacturing Process</a>
            <a href="${prefix}projects.html">Project Portfolio</a>
            <a href="${prefix}sustainability.html">Sustainability</a>
          </div>
          <div>
            <h2>Locations</h2>
            <a href="${prefix}locations/altadena-construction.html">Altadena Construction</a>
            <a href="${prefix}locations/pacific-palisades-construction.html">Pacific Palisades Construction</a>
            <a href="${prefix}locations/los-angeles-construction.html">Los Angeles Construction</a>
            <a href="${prefix}locations/san-diego-construction.html">San Diego Construction</a>
            <a href="${prefix}locations/san-francisco-bay-area-construction.html">San Francisco Bay Area Construction</a>
            <a href="${prefix}locations/sacramento-construction.html">Sacramento Construction</a>
          </div>
          <div>
            <h2>Who We Serve</h2>
            <a href="${prefix}partners.html">Overview</a>
            <a href="${prefix}owners-developers.html">Owners &amp; Developers</a>
            <a href="${prefix}architects-designers.html">Architects &amp; Designers</a>
            <a href="${prefix}builders-contractors.html">Builders &amp; GCs</a>
          </div>
          <div>
            <h2>Company</h2>
            <a href="${prefix}about.html">About Us</a>
            <a href="${prefix}contact.html">Contact</a>
            <a href="tel:6502003182">650-200-3182</a>
            <a href="mailto:info@4ccs.com">info@4ccs.com</a>
          </div>
        </div>
        <div class="footer-bottom">
          <span>&copy; ${new Date().getFullYear()} 4C Construction Systems. CAB #N41299 &middot; CSLB #1145002. Hayward, CA.</span>
          <span>2447 Industrial Parkway, Hayward, CA 94545</span>
        </div>
      </div>
    </footer>
  `;
}

function cccWireMobileNav() {
  const toggle = document.getElementById("menu-toggle");
  const nav = document.querySelector(".main-nav");
  if (!toggle || !nav) return;
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open-mobile");
    toggle.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
  });
}

// Subtle shadow once the page has scrolled past the very top, so the sticky
// header reads as "lifted" over content instead of always looking the same.
function cccWireHeaderScroll() {
  const header = document.querySelector(".site-header");
  if (!header) return;
  let ticking = false;
  const update = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 8);
    ticking = false;
  };
  update();
  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    },
    { passive: true }
  );
}

// ---------- Scroll-linked motion ----------
// Drives two things from one rAF loop, so the page responds continuously to
// scroll position rather than firing one-shot entrances:
//   1. Hero    — photo zoom + copy lift/fade as the hero scrolls away.
//   2. Reveals — per-element 0→1 progress as it crosses into the viewport,
//      which naturally runs backwards when the user scrolls back up.
// Elements only get their starting (hidden/offset) state when this runs and
// reduced motion is off, so content is never dependent on JS to be visible.
function cccInitScrollMotion() {
  const prefersReduced = cccA11yPrefersReducedMotion();
  if (prefersReduced || !("IntersectionObserver" in window)) return;

  const revealSelector = [
    ".section-head",
    ".card",
    ".system-card",
    ".pillar",
    ".phase-flow-step",
    ".project-card",
    ".compare-alt-card",
    ".compare-4c-panel",
    ".value-split",
    ".exploded-diagram",
    ".partner-logo",
    ".ebook-promo-card",
    ".split-ratio",
    ".testimonial",
    ".stat-band",
    ".slideshow",
    ".full-bleed-feature",
    ".location-card",
    ".faq-item",
    ".cta-band",
  ].join(",");
  // Large standalone imagery reads better easing up in scale than sliding.
  const scaleSelector = [".overview-grid figure", ".photo-gallery figure", ".video-embed"].join(",");

  const hero = document.querySelector(".hero, .page-hero");
  const revealEls = Array.from(document.querySelectorAll(revealSelector + "," + scaleSelector));

  // Stagger siblings that cross the viewport together (cards in one grid) by
  // offsetting where each one's progress starts, capped so a long row still
  // finishes promptly.
  const seenPerParent = new Map();
  revealEls.forEach((el) => {
    const parent = el.parentElement;
    const i = seenPerParent.get(parent) || 0;
    seenPerParent.set(parent, i + 1);
    el.__cccStagger = Math.min(i, 3) * 42;
    el.classList.add(el.matches(scaleSelector) ? "scroll-reveal-scale" : "scroll-reveal");
    el.style.setProperty("--p", "0");
  });

  if (!hero && !revealEls.length) return;

  // Only elements currently near the viewport get recomputed each frame.
  const active = new Set();
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          active.add(entry.target);
        } else {
          active.delete(entry.target);
          // Settle to a clean end state so nothing is left mid-animation
          // off-screen, and drop the compositor hint.
          entry.target.style.setProperty("--p", entry.boundingClientRect.top < 0 ? "1" : "0");
          entry.target.classList.remove("is-animating");
        }
      });
      // IntersectionObserver always reports back asynchronously, after the
      // initial update() below has already run with an empty `active` set —
      // so anything already in view on page load would otherwise sit at
      // --p:0 (invisible) until the visitor scrolled and triggered a fresh
      // update(). Scheduling one here as soon as intersection state is known
      // closes that gap without waiting for a scroll.
      onScroll();
    },
    { rootMargin: "20% 0px 20% 0px" }
  );
  revealEls.forEach((el) => io.observe(el));

  const clamp01 = (n) => (n < 0 ? 0 : n > 1 ? 1 : n);
  // Gentle deceleration — matches the CSS easing language elsewhere.
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);

  let ticking = false;
  const update = () => {
    ticking = false;
    const vh = window.innerHeight || document.documentElement.clientHeight;

    if (hero) {
      const rect = hero.getBoundingClientRect();
      // 0 while the hero is fully in place, 1 once it has scrolled fully away.
      const p = clamp01(-rect.top / Math.max(rect.height, 1));
      hero.style.setProperty("--hero-p", p.toFixed(4));
    }

    active.forEach((el) => {
      const rect = el.getBoundingClientRect();
      // Reveal: begins as the element's top enters the lower part of the
      // viewport, completes by the time it has risen a comfortable distance.
      const start = vh * 0.94 - (el.__cccStagger || 0);
      const end = vh * 0.56 - (el.__cccStagger || 0);
      const raw = clamp01((start - rect.top) / Math.max(start - end, 1));
      const p = easeOut(raw);
      el.style.setProperty("--p", p.toFixed(4));
      el.classList.toggle("is-animating", p > 0.001 && p < 0.999);
    });
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  };

  update(); 
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  // Images finishing late can shift layout; recompute once they settle.
  window.addEventListener("load", update); 
}

// ---------- FAQ accordion ----------
// Native <details> opens/closes instantly; this intercepts the click to
// animate the height instead, while every native behavior stays intact --
// keyboard toggling, screen-reader open/closed state, and (if this script
// fails to load) a plain instant-toggling FAQ rather than a broken one.
//
// Reduced motion is checked explicitly, live, on every click, rather than
// left to the CSS's transition-duration:0.001ms override: at a near-zero
// duration `transitionend` can fail to fire at all, and `details.open`
// is only ever set back to false from inside that event on the closing
// path -- so without this check, reduced-motion users would be the ones
// most likely to end up with a FAQ item stuck open.
function cccInitFaqAccordion() {
  document.querySelectorAll(".faq-item").forEach((details) => {
    const summary = details.querySelector("summary");
    const body = details.querySelector(".faq-body");
    if (!summary || !body) return;

    // Runs a from->to height transition, guaranteeing settle() fires exactly
    // once even if transitionend never does (near-zero duration, the
    // property never actually changing, or any other edge case).
    function animateHeight(from, to, settle) {
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        body.removeEventListener("transitionend", onEnd);
        clearTimeout(fallback);
        settle();
      };
      const onEnd = (e) => {
        if (e.target === body && e.propertyName === "height") finish();
      };
      body.style.height = from;
      body.offsetHeight; // force layout so the change to `to` below actually transitions
      body.style.height = to;
      body.addEventListener("transitionend", onEnd);
      // CSS duration tokens only ever go up to --dur-hero (900ms); 1200ms
      // comfortably covers every real transition while still recovering
      // promptly if the event is skipped entirely.
      const fallback = setTimeout(finish, 1200);
    }

    // Closing: prevent the native instant close, animate height to 0 first,
    // and only flip `open` off once that finishes.
    summary.addEventListener("click", (e) => {
      if (!details.open) return; // opening is handled by the toggle listener below
      if (cccA11yPrefersReducedMotion()) return; // let the native instant close happen
      e.preventDefault();
      animateHeight(body.getBoundingClientRect().height + "px", "0px", () => {
        details.open = false;
        body.style.height = "";
      });
    });

    // Opening: `open` is already true by the time `toggle` fires, so the
    // height is set here before the browser gets a chance to paint the
    // native (instant, full-height) state.
    details.addEventListener("toggle", () => {
      if (!details.open || cccA11yPrefersReducedMotion()) return;
      animateHeight("0px", body.scrollHeight + "px", () => {
        // Back to auto so a later resize or content change isn't stuck at
        // the height captured when it opened.
        body.style.height = "";
      });
    });
  });
}

// Replaces the form with the server-confirmed confirmation. Only ever called
// after /api/submit-form has answered 200, i.e. after Slack and the email have
// both actually gone out.
function cccShowFormSuccess(form) {
  const message = document.createElement("div");
  message.className = "callout form-success";
  message.style.marginTop = "20px";
  message.setAttribute("role", "status");
  message.innerHTML =
    "<p>Thanks for reaching out to 4C. We&rsquo;ve received your message and look forward to connecting with you.</p>";
  form.replaceWith(message);
}

// Delivery failed, so the form stays on the page and keeps the visitor's
// answers -- they can just press the button again. The message is deliberately
// vague about the cause: the specifics are in the server log, not the browser.
function cccShowFormError(form, text) {
  let box = form.querySelector(".form-error");
  if (!box) {
    box = document.createElement("div");
    box.className = "callout form-error full";
    box.setAttribute("role", "alert");
    const submitCell = form.querySelector('button[type="submit"]')?.parentElement;
    if (submitCell) form.insertBefore(box, submitCell);
    else form.appendChild(box);
  }
  box.innerHTML = `<p>${text}</p>`;
}

// Where the contact/partner forms POST. Resolved per environment so the same
// build works everywhere:
//   - localhost / 127.0.0.1 -> relative, so local testing hits the local dev
//     server's own function and never sends real mail from a dev machine.
//   - *.vercel.app          -> relative, because there the page and the
//     function are the same origin (no CORS involved).
//   - anything else (Bluehost, 4ccs.com) -> absolute to Vercel, since
//     Bluehost is static-only and has no /api to serve.
const CCC_FORM_ENDPOINT = (function () {
  const h = window.location.hostname;
  if (h === "localhost" || h === "127.0.0.1" || h.endsWith(".vercel.app")) {
    return "/api/submit-form";
  }
  return "https://construction-system-sage.vercel.app/api/submit-form";
})();

function cccWireForms() {
  // Submissions post to /api/submit-form (a Vercel serverless function that
  // relays them to Slack and emails them to the internal notification
  // address set as EMAIL_TO in that file). There is no
  // mailto: fallback: handing the visitor's own email client a pre-filled
  // draft looks like a successful send but leaves nothing on the team's side,
  // which is exactly how a failing endpoint went unnoticed.
  document.querySelectorAll("form.form-grid").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      // The browser's own required/type=email checks normally run before this
      // event fires; re-running them here covers a programmatic submit() and
      // keeps the same messages the visitor already sees.
      if (typeof form.reportValidity === "function" && !form.reportValidity()) return;

      const fields = [];
      // Collected by name attribute -- ids and label text are presentation
      // only, and the server matches on "name" and "email" exactly.
      form.querySelectorAll("input[name], select[name], textarea[name]").forEach((field) => {
        const value = field.value.trim();
        if (!value) return;
        const label = field.id ? form.querySelector(`label[for="${field.id}"]`) : null;
        fields.push({ name: field.name, label: label ? label.textContent.trim() : field.name, value });
      });

      // Same two rules the server enforces, checked here so an obvious mistake
      // is caught without a round trip.
      const named = fields.find((f) => f.name === "name");
      const emailed = fields.find((f) => f.name === "email");
      if (!named || !emailed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailed.value)) {
        cccShowFormError(form, "Please enter your name and a valid email address.");
        return;
      }

      // data-form-name labels the submission explicitly; otherwise fall back to
      // the heading of the card the form sits in, as before.
      const formName =
        form.dataset.formName || form.closest(".card")?.querySelector("h3")?.textContent || "website";

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalLabel = submitBtn ? submitBtn.textContent : "";
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending...";
      }
      const existingError = form.querySelector(".form-error");
      if (existingError) existingError.remove();

      let succeeded = false;
      // Absolute, not relative: the site is served from Bluehost but this
      // endpoint is a Vercel serverless function, so a relative path would
      // resolve to Bluehost (which has no /api) and 404. The Vercel side
      // allow-lists 4ccs.com/www.4ccs.com for CORS. If the Vercel project is
      // ever renamed, or a custom api.4ccs.com domain is added, this is the
      // single line that changes.
      fetch(CCC_FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formName, fields }),
      })
        .then((res) =>
          // The endpoint sends a visitor-safe { error } string for every 4xx/5xx;
          // anything unparseable falls back to the generic wording below.
          res
            .json()
            .catch(() => ({}))
            .then((data) => {
              if (!res.ok) throw new Error(data && data.error);
              succeeded = true;
            })
        )
        .then(() => {
          cccShowFormSuccess(form);
        })
        .catch((err) => {
          cccShowFormError(
            form,
            (err && err.message) ||
              "Sorry, we couldn't send your message just now. Please try again, or email us directly at <a href=\"mailto:info@4ccs.com\">info@4ccs.com</a>."
          );
        })
        .finally(() => {
          // Skipped on success only because the form is no longer in the page.
          if (submitBtn && !succeeded) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalLabel;
          }
        });
    });
  });
}

// ---------- Accessibility controls ----------
// A small reader-preference panel: text size, a more legible font, high
// contrast, link highlighting, and reduced motion. Settings are written to
// <html> as data-a11y-* attributes (all the styling hangs off those in
// style.css) and persisted to localStorage so they survive navigation across
// the site's pages.
//
// These are accessibility enhancements. They do not by themselves constitute
// an ADA or WCAG conformance claim.
//
// The launcher/panel are injected from here rather than written into every
// page so there is a single copy to maintain, matching how the blueprint
// backgrounds are handled.

const CCC_A11Y_KEY = "ccc-a11y";
const CCC_A11Y_SCALES = [90, 100, 112, 125, 150, 175, 200];
const CCC_A11Y_DEFAULTS = { scale: 100, font: "default", contrast: "off", links: "off", motion: "auto" };

function cccA11yRead() {
  try {
    const raw = window.localStorage.getItem(CCC_A11Y_KEY);
    if (!raw) return { ...CCC_A11Y_DEFAULTS };
    return { ...CCC_A11Y_DEFAULTS, ...JSON.parse(raw) };
  } catch (e) {
    // Private-mode / disabled storage, or corrupt JSON — fall back to defaults
    // rather than letting the whole shell script fail here.
    return { ...CCC_A11Y_DEFAULTS };
  }
}

function cccA11yWrite(state) {
  try {
    window.localStorage.setItem(CCC_A11Y_KEY, JSON.stringify(state));
  } catch (e) {
    /* storage unavailable — settings still apply for this page view */
  }
}

// Applied to <html> so the attributes are in place before the panel exists;
// called once at script load (before DOMContentLoaded) to minimise any flash
// of un-adjusted text, and again on every change.
function cccA11yApply(state) {
  const root = document.documentElement;
  if (state.scale !== 100) {
    root.setAttribute("data-a11y-scale", String(state.scale));
    root.style.setProperty("--a11y-scale", state.scale + "%");
  } else {
    root.removeAttribute("data-a11y-scale");
    root.style.removeProperty("--a11y-scale");
  }
  const flag = (name, value, off) => {
    if (value === off) root.removeAttribute(name);
    else root.setAttribute(name, value);
  };
  flag("data-a11y-font", state.font, "default");
  flag("data-a11y-contrast", state.contrast, "off");
  flag("data-a11y-links", state.links, "off");
  flag("data-a11y-motion", state.motion, "auto");
}

// Run immediately at parse time, not on DOMContentLoaded — the deferred script
// executes before the event fires, so saved settings land as early as possible.
let cccA11yState = cccA11yRead();
cccA11yApply(cccA11yState);

// True when motion should be suppressed, from either the OS setting or the
// panel. cccInitScrollMotion() consults this before wiring anything up.
function cccA11yPrefersReducedMotion() {
  if (cccA11yState.motion === "reduce") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function cccA11yIcon() {
  // Standard "person" accessibility glyph, decorative — the button carries the
  // accessible name, so the SVG is hidden from assistive tech.
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
    <circle cx="12" cy="12" r="10"/><circle cx="12" cy="7.6" r="1.2" fill="currentColor" stroke="none"/>
    <path d="M7.6 10.2h8.8M12 10.6v3.2M12 13.8l-2 4.2M12 13.8l2 4.2"/>
  </svg>`;
}

function cccA11yBuildPanel() {
  const toggle = (key, label, on, off) =>
    `<button type="button" class="a11y-toggle" data-a11y-toggle="${key}" aria-pressed="false">
       <span>${label}</span><span class="a11y-state" aria-hidden="true" data-on="${on}" data-off="${off}">${off}</span>
     </button>`;

  const panel = document.createElement("div");
  panel.className = "a11y-panel";
  panel.id = "a11y-panel";
  panel.hidden = true;
  // Not a modal: it never blocks the page, so it takes a labelled group rather
  // than dialog semantics and a focus trap.
  panel.setAttribute("role", "group");
  panel.setAttribute("aria-labelledby", "a11y-panel-title");
  panel.innerHTML = `
    <h2 id="a11y-panel-title">Accessibility</h2>
    <p class="a11y-note">Your choices are saved on this device.</p>
    <div class="a11y-group">
      <h3 id="a11y-size-label">Text size</h3>
      <div class="a11y-size-row">
        <button type="button" data-a11y-size="down" aria-label="Decrease text size">&minus;</button>
        <output id="a11y-size-value">100%</output>
        <button type="button" data-a11y-size="up" aria-label="Increase text size">+</button>
      </div>
    </div>
    <div class="a11y-group">
      <h3>Display</h3>
      ${toggle("font", "Readable font", "ON", "OFF")}
      ${toggle("contrast", "High contrast", "ON", "OFF")}
      ${toggle("links", "Highlight links", "ON", "OFF")}
      ${toggle("motion", "Reduce motion", "ON", "OFF")}
    </div>
    <button type="button" class="a11y-reset" data-a11y-reset>Reset all settings</button>
    <p class="a11y-sr-only" id="a11y-status" role="status"></p>
  `;
  return panel;
}

function cccInitA11yPanel() {
  if (document.querySelector(".a11y-launcher")) return;

  const launcher = document.createElement("button");
  launcher.type = "button";
  launcher.className = "a11y-launcher";
  launcher.id = "a11y-launcher";
  launcher.setAttribute("aria-label", "Accessibility settings");
  launcher.setAttribute("aria-expanded", "false");
  launcher.setAttribute("aria-controls", "a11y-panel");
  launcher.innerHTML = cccA11yIcon();

  const panel = cccA11yBuildPanel();
  document.body.append(launcher, panel);

  const status = panel.querySelector("#a11y-status");
  const sizeOut = panel.querySelector("#a11y-size-value");
  const announce = (msg) => {
    if (status) status.textContent = msg;
  };

  const sync = () => {
    sizeOut.textContent = cccA11yState.scale + "%";
    panel.querySelectorAll("[data-a11y-toggle]").forEach((btn) => {
      const key = btn.dataset.a11yToggle;
      const on = key === "motion" ? cccA11yState.motion === "reduce" : cccA11yState[key] === "on" || cccA11yState[key] === "readable";
      btn.setAttribute("aria-pressed", String(on));
      const chip = btn.querySelector(".a11y-state");
      if (chip) chip.textContent = on ? chip.dataset.on : chip.dataset.off;
    });
  };

  const commit = () => {
    cccA11yApply(cccA11yState);
    cccA11yWrite(cccA11yState);
    sync();
  };

  const setOpen = (open) => {
    panel.hidden = !open;
    launcher.setAttribute("aria-expanded", String(open));
    if (open) {
      const first = panel.querySelector("button");
      if (first) first.focus();
    }
  };

  launcher.addEventListener("click", () => setOpen(panel.hidden));

  panel.addEventListener("click", (e) => {
    const step = e.target.closest("[data-a11y-size]");
    if (step) {
      const i = CCC_A11Y_SCALES.indexOf(cccA11yState.scale);
      const at = i === -1 ? CCC_A11Y_SCALES.indexOf(100) : i;
      const next = at + (step.dataset.a11ySize === "up" ? 1 : -1);
      if (next < 0 || next >= CCC_A11Y_SCALES.length) {
        announce("Text size " + cccA11yState.scale + " percent, limit reached");
        return;
      }
      cccA11yState.scale = CCC_A11Y_SCALES[next];
      commit();
      announce("Text size " + cccA11yState.scale + " percent");
      return;
    }

    const btn = e.target.closest("[data-a11y-toggle]");
    if (btn) {
      const key = btn.dataset.a11yToggle;
      if (key === "font") cccA11yState.font = cccA11yState.font === "readable" ? "default" : "readable";
      else if (key === "motion") cccA11yState.motion = cccA11yState.motion === "reduce" ? "auto" : "reduce";
      else cccA11yState[key] = cccA11yState[key] === "on" ? "off" : "on";
      commit();
      return;
    }

    if (e.target.closest("[data-a11y-reset]")) {
      cccA11yState = { ...CCC_A11Y_DEFAULTS };
      commit();
      announce("Accessibility settings reset to defaults");
    }
  });

  // Escape closes and returns focus to the launcher, so keyboard users are
  // never stranded inside the panel.
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !panel.hidden) {
      setOpen(false);
      launcher.focus();
    }
  });

  // Clicking or tabbing away closes it, but only once focus has genuinely left
  // both the panel and its launcher.
  document.addEventListener("pointerdown", (e) => {
    if (panel.hidden) return;
    if (!panel.contains(e.target) && !launcher.contains(e.target)) setOpen(false);
  });
  document.addEventListener("focusin", (e) => {
    if (panel.hidden) return;
    if (!panel.contains(e.target) && !launcher.contains(e.target)) setOpen(false);
  });

  sync();
}

document.addEventListener("DOMContentLoaded", () => {
  cccRenderHeader();
  cccRenderFooter();
  cccSyncFooterYear();
  cccWireMobileNav();
  cccWireHeaderScroll();
  cccWireForms();
  cccInitA11yPanel();
  cccInitScrollMotion();
  cccInitFaqAccordion();
  document.querySelectorAll(".blueprint-bg-slot").forEach((slot, i) => {
    slot.outerHTML = cccBlueprintBg(i);
  });
});
