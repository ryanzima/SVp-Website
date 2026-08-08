(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Lights-out intro (home page only) ---------- */
  var launchFx = document.querySelector(".launch-fx");
  var heroPunchEls = document.querySelectorAll(".hero-punch-in");
  var showHeroPunch = function (animated) {
    heroPunchEls.forEach(function (el, i) {
      if (animated) {
        setTimeout(function () { el.classList.add("show"); }, i * 130);
      } else {
        el.classList.add("show");
      }
    });
  };

  var rig = document.querySelector(".lights-out");
  if (rig) {
    if (sessionStorage.getItem("dsp_intro_played") || reduced) {
      rig.remove();
      if (launchFx) launchFx.remove();
      showHeroPunch(false);
    } else {
      document.body.classList.add("no-scroll");
      var bulbs = rig.querySelectorAll(".bulb");
      var step = 220;
      bulbs.forEach(function (bulb, i) {
        setTimeout(function () { bulb.classList.add("on"); }, step * (i + 1));
      });
      var allOnDelay = step * (bulbs.length + 1) + 260;
      setTimeout(function () {
        bulbs.forEach(function (bulb) { bulb.classList.remove("on"); });
        if (launchFx) launchFx.classList.add("fire");
        showHeroPunch(true);
      }, allOnDelay);
      setTimeout(function () {
        rig.classList.add("hide");
        document.body.classList.remove("no-scroll");
        sessionStorage.setItem("dsp_intro_played", "1");
        setTimeout(function () {
          rig.remove();
          if (launchFx) launchFx.remove();
        }, 650);
      }, allOnDelay + 320);
    }
  } else {
    showHeroPunch(false);
  }

  /* ---------- Nav toggle ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var isOpen = links.classList.toggle("open");
      toggle.classList.toggle("open", isOpen);
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
    links.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        links.classList.remove("open");
        toggle.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- Sticky header state ---------- */
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("scrolled", window.scrollY > 20);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Scroll-to-top ---------- */
  var top = document.querySelector(".scroll-top");
  if (top) {
    window.addEventListener("scroll", function () {
      top.classList.toggle("show", window.scrollY > 700);
    }, { passive: true });
    top.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll("[data-reveal]");
  if (revealEls.length) {
    if (reduced || !("IntersectionObserver" in window)) {
      revealEls.forEach(function (el) { el.classList.add("is-visible"); });
    } else {
      var counters = new WeakMap();
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          var group = el.closest("[data-reveal-group]");
          if (group) {
            var n = counters.get(group) || 0;
            el.style.setProperty("--i", n);
            counters.set(group, n + 1);
          }
          el.classList.add("is-visible");
          io.unobserve(el);
        });
      }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
      revealEls.forEach(function (el) { io.observe(el); });
    }
  }

  /* ---------- Animated counters ---------- */
  var counterEls = document.querySelectorAll("[data-counter]");
  if (counterEls.length) {
    var formatCount = function (value, decimals, useGrouping) {
      return value.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals, useGrouping: useGrouping });
    };
    var animateCount = function (el) {
      var target = parseFloat(el.getAttribute("data-counter"));
      var suffix = el.getAttribute("data-suffix") || "";
      var decimals = el.getAttribute("data-decimals") ? parseInt(el.getAttribute("data-decimals"), 10) : 0;
      var useGrouping = el.getAttribute("data-group") !== "false";
      if (reduced) {
        el.textContent = formatCount(target, decimals, useGrouping) + suffix;
        return;
      }
      var duration = 1400;
      var startTime = null;
      var step = function (ts) {
        if (!startTime) startTime = ts;
        var progress = Math.min((ts - startTime) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        var value = target * eased;
        el.textContent = formatCount(value, decimals, useGrouping) + suffix;
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    if ("IntersectionObserver" in window) {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            cio.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });
      counterEls.forEach(function (el) { cio.observe(el); });
    } else {
      counterEls.forEach(animateCount);
    }
  }

  /* ---------- Sector card tilt ---------- */
  if (!reduced && window.matchMedia("(hover: hover)").matches) {
    document.querySelectorAll(".sector-card").forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        var rect = card.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width - 0.5;
        var y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = "perspective(600px) rotateX(" + (y * -6) + "deg) rotateY(" + (x * 8) + "deg) translateY(-4px)";
      });
      card.addEventListener("mouseleave", function () {
        card.style.transform = "";
      });
    });
  }

  /* ---------- Footer year ---------- */
  var yearEl = document.querySelector("[data-year]");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
