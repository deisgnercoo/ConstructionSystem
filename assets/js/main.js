// 4C Construction System — shared site shell (header, nav, footer)
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
  return `<img class="mark-full" src="${prefix || ""}assets/img/${file}" alt="4C Construction System" width="600" height="${
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
          <span>&copy; ${new Date().getFullYear()} 4C Construction System. CAB #N41299 &middot; CSLB #1145002. Hayward, CA.</span>
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
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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

function cccShowFormSuccess(form, viaEmail) {
  const message = document.createElement("div");
  message.className = "callout form-success";
  message.style.marginTop = "20px";
  message.innerHTML = viaEmail
    ? '<p>Thanks! Your email app should now open with your request ready to send. If it doesn\'t open automatically, email us directly at <a href="mailto:info@4ccs.com">info@4ccs.com</a>.</p>'
    : "<p>Thanks! Your request has been sent to our team.</p>";
  form.replaceWith(message);
}

function cccWireForms() {
  // Submissions post to /api/submit-form (a Vercel serverless function that
  // relays them to Slack). If that call fails for any reason — the function
  // isn't deployed yet, SLACK_WEBHOOK_URL isn't set, a network hiccup — the
  // request still reaches the team as a pre-filled email instead of vanishing.
  document.querySelectorAll("form.form-grid").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const fields = [];
      form.querySelectorAll("input[name], select[name], textarea[name]").forEach((field) => {
        const value = field.value.trim();
        if (!value) return;
        const label = form.querySelector(`label[for="${field.id}"]`);
        fields.push({ name: field.name, label: label ? label.textContent : field.name, value });
      });
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

      fetch("/api/submit-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formName, fields }),
      })
        .then((res) => {
          if (!res.ok) throw new Error("submit-form request failed");
          cccShowFormSuccess(form, false);
        })
        .catch(() => {
          const subject = encodeURIComponent("New inquiry from 4ccs.com");
          const body = encodeURIComponent(fields.map((f) => `${f.label}: ${f.value}`).join("\n"));
          window.location.href = `mailto:info@4ccs.com?subject=${subject}&body=${body}`;
          cccShowFormSuccess(form, true);
        })
        .finally(() => {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalLabel;
          }
        });
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  cccRenderHeader();
  cccRenderFooter();
  cccSyncFooterYear();
  cccWireMobileNav();
  cccWireHeaderScroll();
  cccWireForms();
  cccInitScrollMotion();
  document.querySelectorAll(".blueprint-bg-slot").forEach((slot, i) => {
    slot.outerHTML = cccBlueprintBg(i);
  });
});
