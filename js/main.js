(function () {
  "use strict";

  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".site-nav");

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  var dropdown = document.querySelector(".nav-dropdown");
  var dropdownBtn = document.getElementById("nav-pages-btn");
  var dropdownMenu = document.getElementById("nav-pages-menu");

  function setDropdownOpen(open) {
    if (!dropdown || !dropdownBtn || !dropdownMenu) {
      return;
    }
    dropdown.classList.toggle("is-open", open);
    dropdownBtn.setAttribute("aria-expanded", open ? "true" : "false");
    if (open) {
      dropdownMenu.removeAttribute("hidden");
    } else {
      dropdownMenu.setAttribute("hidden", "");
    }
  }

  if (dropdown && dropdownBtn && dropdownMenu) {
    dropdownBtn.addEventListener("click", function (event) {
      event.stopPropagation();
      setDropdownOpen(dropdownBtn.getAttribute("aria-expanded") !== "true");
    });

    document.addEventListener("click", function (event) {
      if (!dropdown.contains(event.target)) {
        setDropdownOpen(false);
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        setDropdownOpen(false);
      }
    });
  }

  var filterBar = document.querySelector(".gallery-filter");
  if (filterBar) {
    var items = document.querySelectorAll(".gallery-grid [data-category]");
    filterBar.addEventListener("click", function (event) {
      var btn = event.target.closest("button[data-filter]");
      if (!btn) {
        return;
      }

      var filter = btn.getAttribute("data-filter");
      var buttons = filterBar.querySelectorAll("button");
      for (var i = 0; i < buttons.length; i++) {
        buttons[i].classList.toggle("is-active", buttons[i] === btn);
      }

      for (var j = 0; j < items.length; j++) {
        var cat = items[j].getAttribute("data-category");
        var show = filter === "all" || filter === cat;
        items[j].classList.toggle("is-hidden", !show);
      }
    });
  }

  var year = document.getElementById("year");
  if (year) {
    year.textContent = String(new Date().getFullYear());
  }

  /*
   * Fixed single background — no translate / no duplicate image.
   * On scroll only the cream scrim fades so colors look clearer.
   */
  var siteScrim = document.querySelector(".site-parallax-scrim");
  var heroEl = document.querySelector(".hero");
  var pageEls = document.querySelectorAll(".page-atmosphere");
  var ticking = false;

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  function updateBackgroundClarity() {
    ticking = false;
    var y = window.pageYOffset || document.documentElement.scrollTop || 0;
    var progress = clamp(y / Math.max(window.innerHeight * 0.9, 1), 0, 1);

    if (siteScrim) {
      /* Start readable, become more vivid (less wash) while scrolling */
      siteScrim.style.opacity = String(0.72 - progress * 0.55);
    }
    if (heroEl) {
      heroEl.style.setProperty("--hero-scrim", String(1 - progress * 0.7));
    }
    for (var i = 0; i < pageEls.length; i++) {
      pageEls[i].style.background =
        "rgba(250, 244, 242, " + (0.58 - progress * 0.2) + ")";
    }
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(updateBackgroundClarity);
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  updateBackgroundClarity();

  /* Portfolio slideshow: play when in view; pause when out. Prefer sound. */
  var slideshow = document.getElementById("portfolio-slideshow");
  if (slideshow && "IntersectionObserver" in window) {
    var slideshowWantsPlay = false;
    var slideshowNeedsUnmute = false;

    function tryPlayWithSound() {
      slideshow.muted = false;
      var playPromise = slideshow.play();
      if (!playPromise || typeof playPromise.then !== "function") {
        return;
      }
      playPromise.then(function () {
        slideshowNeedsUnmute = false;
      }).catch(function () {
        slideshow.muted = true;
        slideshowNeedsUnmute = true;
        return slideshow.play().catch(function () {
          /* Autoplay fully blocked — controls remain for manual play. */
        });
      });
    }

    function unmuteOnGesture() {
      if (!slideshowNeedsUnmute) {
        return;
      }
      slideshow.muted = false;
      slideshowNeedsUnmute = false;
      if (slideshowWantsPlay && slideshow.paused) {
        slideshow.play().catch(function () {});
      }
    }

    document.addEventListener("pointerdown", unmuteOnGesture, { passive: true });
    document.addEventListener("keydown", unmuteOnGesture);

    var slideshowObserver = new IntersectionObserver(
      function (entries) {
        for (var i = 0; i < entries.length; i++) {
          var entry = entries[i];
          if (entry.isIntersecting && entry.intersectionRatio >= 0.35) {
            slideshowWantsPlay = true;
            tryPlayWithSound();
          } else {
            slideshowWantsPlay = false;
            slideshow.pause();
          }
        }
      },
      { threshold: [0, 0.35, 0.5] }
    );

    slideshowObserver.observe(slideshow);
  }
})();
