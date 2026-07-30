/* ==========================================================================
   Page Loader — Fast Neumorphic Transition Loader (Main Script)
   ─────────────────────────────────────────────────────────────────
   The inline script in page-loader.liquid already handled the
   instant show/hide decision before the browser painted. This file
   handles the animation, counting, and cleanup.

   If the inline script didn't show the loader (non-transition),
   this script just arms click interceptors and exits.
   ========================================================================== */

(function () {
  "use strict";

  /* ══════════════════════════════════════════════════════════════════════
     UTILITIES
     ══════════════════════════════════════════════════════════════════════ */

  var doc = document.documentElement;

  function hideLoader() {
    if (!loader) return;
    loader.setAttribute("aria-hidden", "true");
    doc.classList.remove("page-loader-active");
  }

  /* ══════════════════════════════════════════════════════════════════════
     1. CHECK LOADER STATE
     The inline script already decided show/hide. We just read the
     current state from the DOM.
     ══════════════════════════════════════════════════════════════════════ */

  var loader = document.getElementById("page-loader");

  if (!loader || loader.getAttribute("data-loader-enabled") !== "true") {
    if (loader) loader.remove();
    armClicks();
    return;
  }

  var surface   = document.getElementById("page-loader__surface");
  var numberEl  = document.getElementById("page-loader__number");
  var percentEl = document.getElementById("page-loader__percent");
  var progressC = document.getElementById("page-loader__progress-circle");
  var checkWrap = document.getElementById("page-loader__check");
  var checkPath = document.getElementById("page-loader__check-path");

  /* Is the loader currently visible? (set by inline script) */
  var loaderIsShowing = loader.getAttribute("aria-hidden") !== "true";

  if (!loaderIsShowing || !surface || !numberEl) {
    hideLoader();
    armClicks();
    return;
  }

  /* ══════════════════════════════════════════════════════════════════════
     2. WAIT FOR GSAP — if it fails, remove loader immediately
     ══════════════════════════════════════════════════════════════════════ */

  if (typeof gsap === "undefined") {
    hideLoader();
    armClicks();
    return;
  }

  /* ══════════════════════════════════════════════════════════════════════
     3. READ SETTINGS
     ══════════════════════════════════════════════════════════════════════ */

  var EXTRA_DELAY = parseInt(loader.getAttribute("data-extra-delay"), 10);
  if (isNaN(EXTRA_DELAY) || EXTRA_DELAY < 0) EXTRA_DELAY = 0;
  if (EXTRA_DELAY > 1500) EXTRA_DELAY = 1500;

  /* ══════════════════════════════════════════════════════════════════════
     4. CONFIG & STATE
     ══════════════════════════════════════════════════════════════════════ */

  var CIRC           = 565.48;
  var SAFETY_TIMEOUT = 5000;
  var prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  function d(v) {
    return prefersReduced ? 0.01 : v;
  }

  /* Distribute extra delay: 60% into counting speed, 40% into hold */
  var countDuration = 1.2 + (EXTRA_DELAY / 1500) * 1.2;
  var holdAtHundred = (EXTRA_DELAY / 1000) * 0.4;

  var counter    = { value: 0 };
  var pageLoaded = false;
  var finishing  = false;
  var prevDigits = "0";

  /* ══════════════════════════════════════════════════════════════════════
     5. RENDER — digit roll animation
     ══════════════════════════════════════════════════════════════════════ */

  function render() {
    var val = Math.round(counter.value);
    var str = String(val);

    if (progressC) {
      progressC.style.strokeDashoffset = CIRC - (val / 100) * CIRC;
    }

    if (str === prevDigits) return;

    var frag   = document.createDocumentFragment();
    var offset = str.length - prevDigits.length;
    var i, ch, prevCh, span;

    for (i = 0; i < str.length; i++) {
      ch     = str[i];
      prevCh = prevDigits[i - offset];
      span   = document.createElement("span");

      span.className   = "loader-digit";
      span.textContent = ch;

      if (ch !== prevCh && !prefersReduced) {
        span.classList.add("is-rolling");
        (function (el) {
          el.addEventListener(
            "animationend",
            function () {
              el.classList.remove("is-rolling");
            },
            { once: true }
          );
        })(span);
      }

      frag.appendChild(span);
    }

    numberEl.textContent = "";
    numberEl.appendChild(frag);
    prevDigits = str;
  }

  /* ══════════════════════════════════════════════════════════════════════
     6. FINISH SEQUENCE
     ══════════════════════════════════════════════════════════════════════ */

  function finish() {
    if (finishing) return;
    finishing = true;
    gsap.killTweensOf(counter);

    var tl = gsap.timeline();

    /* ① Count to 100 */
    tl.to(counter, {
      value: 100,
      duration: d(0.25),
      ease: "power2.out",
      onUpdate: render,
      onComplete: function () {
        render();
        numberEl.classList.add("is-complete");
        if (percentEl) percentEl.classList.add("is-complete");
      },
    });

    /* ② Hold at 100 (from extra_delay setting) */
    if (holdAtHundred > 0.01) {
      tl.to({}, { duration: holdAtHundred });
    }

    /* ③ Button press down */
    tl.to(surface, {
      scale: 0.92,
      duration: d(0.1),
      ease: "power3.in",
      onStart: function () {
        surface.classList.add("is-pressed");
      },
    });

    /* ④ Button release spring */
    tl.to(surface, {
      scale: 1.04,
      duration: d(0.2),
      ease: "elastic.out(1, 0.6)",
      onStart: function () {
        surface.classList.remove("is-pressed");
        surface.classList.add("is-burst");
      },
    });

    /* ⑤ Cross-fade: number → checkmark */
    tl.to(
      numberEl.parentNode,
      {
        opacity: 0,
        scale: 0.85,
        duration: d(0.15),
        ease: "power2.in",
      },
      "-=0.05"
    );

    tl.to(checkWrap, {
      opacity: 1,
      scale: 1,
      duration: d(0.2),
      ease: "back.out(1.5)",
    });

    /* ⑥ Draw checkmark */
    if (checkPath) {
      tl.to(
        checkPath,
        {
          strokeDashoffset: 0,
          duration: d(0.25),
          ease: "power2.out",
        },
        "-=0.1"
      );
    }

    /* ⑦ Fade out */
    tl.to(surface, {
      opacity: 0,
      scale: 1.08,
      duration: d(0.3),
      ease: "power2.in",
      delay: d(0.15),
    });

    tl.to(
      loader,
      {
        opacity: 0,
        duration: d(0.25),
        ease: "power1.inOut",
        onComplete: cleanup,
      },
      "-=0.2"
    );
  }

  /* ══════════════════════════════════════════════════════════════════════
     7. CLEANUP — reset for next navigation
     ══════════════════════════════════════════════════════════════════════ */

  function cleanup() {
    hideLoader();

    /* Reset transforms */
    gsap.set(surface, { opacity: 0, scale: 0.9, clearProps: "boxShadow" });
    gsap.set(loader, { opacity: 1 });
    gsap.set(numberEl.parentNode, { opacity: 1, scale: 1 });
    gsap.set(checkWrap, { opacity: 0, scale: 0.5 });
    if (checkPath) checkPath.style.strokeDashoffset = "60";

    /* Reset classes */
    surface.classList.remove("is-active", "is-pressed", "is-burst");
    numberEl.classList.remove("is-complete");
    if (percentEl) percentEl.classList.remove("is-complete");

    /* Reset state */
    numberEl.textContent = "0";
    prevDigits    = "0";
    counter.value = 0;
    finishing     = false;
    pageLoaded    = false;

    armClicks();
  }

  /* ══════════════════════════════════════════════════════════════════════
     8. MAIN ENTRANCE ANIMATION
     ══════════════════════════════════════════════════════════════════════ */

  /* Clear the sessionStorage flag (inline script left it for us to read
     but the decision is already made — clean it up) */
  try {
    sessionStorage.removeItem("page-loader-nav");
  } catch (e) {}

  var main = gsap.timeline();

  /* Surface appears */
  main.to(surface, {
    opacity: 1,
    scale: 1,
    duration: d(0.35),
    ease: "back.out(1.2)",
    onComplete: function () {
      surface.classList.add("is-active");
    },
  });

  /* Count 0 → 90 */
  main.to(
    counter,
    {
      value: 90,
      duration: d(countDuration),
      ease: "power2.out",
      onUpdate: render,
      onComplete: function () {
        if (pageLoaded) {
          finish();
        } else {
          gsap.to(counter, {
            value: 99,
            duration: 4,
            ease: "none",
            onUpdate: render,
          });
        }
      },
    },
    "-=0.1"
  );

  /* ══════════════════════════════════════════════════════════════════════
     9. PAGE LOAD DETECTION
     ══════════════════════════════════════════════════════════════════════ */

  function onLoaded() {
    if (pageLoaded) return;
    pageLoaded = true;
    if (counter.value >= 90) finish();
  }

  if (document.readyState === "complete") {
    onLoaded();
  } else {
    window.addEventListener("load", onLoaded);
  }

  setTimeout(onLoaded, SAFETY_TIMEOUT);

  /* ══════════════════════════════════════════════════════════════════════
     10. CLICK INTERCEPTORS
     ══════════════════════════════════════════════════════════════════════ */

  function armClicks() {
    document.removeEventListener("click", onLinkClick);
    document.addEventListener("click", onLinkClick, { passive: true });
  }

  function onLinkClick(e) {
    var link = e.target.closest("a");
    if (!link) return;

    var href = link.getAttribute("href");
    if (!href) return;

    if (
      link.target === "_blank" ||
      link.hasAttribute("download") ||
      href.charAt(0) === "#" ||
      href.indexOf("mailto:") === 0 ||
      href.indexOf("tel:") === 0 ||
      href.indexOf("javascript:") === 0 ||
      link.hostname !== window.location.hostname
    ) {
      return;
    }

    if (
      link.pathname === window.location.pathname &&
      link.search === window.location.search
    ) {
      return;
    }

    try {
      sessionStorage.setItem("page-loader-nav", "1");
    } catch (err) {}
  }

})();