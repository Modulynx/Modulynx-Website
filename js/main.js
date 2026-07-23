/* ═══════════════════════════════════════════════════════════
   MODULYNX — page interactions
   Custom cursor, scroll reveals, counters, magnetic buttons,
   3D card tilt, navbar behavior, mobile menu, contact form.
   ═══════════════════════════════════════════════════════════ */
(function () {
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── preloader ── */
  var preloader = document.getElementById("preloader");
  window.addEventListener("load", function () {
    setTimeout(function () {
      if (preloader) preloader.classList.add("done");
      document.body.classList.add("loaded");
    }, reduced ? 100 : 1700);
  });
  // safety: never trap the user behind the preloader
  setTimeout(function () {
    if (preloader) preloader.classList.add("done");
    document.body.classList.add("loaded");
  }, 4000);

  /* ── custom cursor (lerped ring) ── */
  var dot = document.getElementById("cursorDot");
  var ring = document.getElementById("cursorRing");
  if (dot && ring && matchMedia("(pointer: fine)").matches && !reduced) {
    var mx = -100, my = -100, rx = -100, ry = -100;
    window.addEventListener("mousemove", function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.left = mx + "px";
      dot.style.top = my + "px";
    });
    (function cursorFrame() {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      ring.style.left = rx + "px";
      ring.style.top = ry + "px";
      requestAnimationFrame(cursorFrame);
    })();
    document.querySelectorAll("a, button, .card, input, textarea").forEach(function (el) {
      el.addEventListener("mouseenter", function () { ring.classList.add("hovering"); });
      el.addEventListener("mouseleave", function () { ring.classList.remove("hovering"); });
    });
  }

  /* ── navbar: shrink on scroll, hide on scroll-down ── */
  var nav = document.getElementById("nav");
  var lastY = 0;
  window.addEventListener("scroll", function () {
    var y = window.scrollY;
    nav.classList.toggle("scrolled", y > 40);
    if (y > 300 && y > lastY + 6) nav.classList.add("hidden");
    else if (y < lastY - 6) nav.classList.remove("hidden");
    lastY = y;
  }, { passive: true });

  /* ── mobile menu ── */
  var toggle = document.getElementById("navToggle");
  var links = document.getElementById("navLinks");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        links.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ── scroll reveals with stagger (fail-open: hidden state only
        exists once body.anim-ready is set) ── */
  if (!reduced && "IntersectionObserver" in window) {
    document.body.classList.add("anim-ready");
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var siblings = Array.prototype.filter.call(
          el.parentElement.children,
          function (c) { return c.classList && c.classList.contains("reveal"); }
        );
        var idx = siblings.indexOf(el);
        el.style.transitionDelay = (idx > 0 ? idx * 0.09 : 0) + "s";
        el.classList.add("in");
        revealObserver.unobserve(el);
      });
    }, { threshold: 0.18, rootMargin: "0px 0px -40px 0px" });
    document.querySelectorAll(".reveal").forEach(function (el) { revealObserver.observe(el); });
  }

  /* ── animated counters (eased interpolation) ── */
  function easeOutExpo(t) { return t === 1 ? 1 : 1 - Math.pow(2, -10 * t); }
  var counterObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      counterObserver.unobserve(el);
      var end = parseInt(el.getAttribute("data-count"), 10) || 0;
      var start = null, DUR = 1800;
      function step(t) {
        if (!start) start = t;
        var p = Math.min((t - start) / DUR, 1);
        el.textContent = Math.round(easeOutExpo(p) * end);
        if (p < 1) requestAnimationFrame(step);
      }
      if (reduced) { el.textContent = end; }
      else requestAnimationFrame(step);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll(".stat-num").forEach(function (el) { counterObserver.observe(el); });

  /* ── magnetic buttons ── */
  if (!reduced && matchMedia("(pointer: fine)").matches) {
    document.querySelectorAll(".magnetic").forEach(function (btn) {
      btn.addEventListener("mousemove", function (e) {
        var r = btn.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * 0.28;
        var y = (e.clientY - r.top - r.height / 2) * 0.28;
        btn.style.transform = "translate(" + x + "px," + y + "px)";
      });
      btn.addEventListener("mouseleave", function () {
        btn.style.transform = "";
      });
    });
  }

  /* ── 3D tilt cards + hover spotlight ── */
  if (!reduced && matchMedia("(pointer: fine)").matches) {
    document.querySelectorAll(".tilt").forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect();
        var nx = (e.clientX - r.left) / r.width;
        var ny = (e.clientY - r.top) / r.height;
        card.style.setProperty("--mx", (nx * 100) + "%");
        card.style.setProperty("--my", (ny * 100) + "%");
        card.style.transform =
          "perspective(800px) rotateY(" + ((nx - 0.5) * 7) + "deg) rotateX(" + ((0.5 - ny) * 7) + "deg) translateY(-3px)";
      });
      card.addEventListener("mouseleave", function () {
        card.style.transform = "";
      });
    });
  }

  /* ── contact form → delivers to modulynx.project@gmail.com via FormSubmit ── */
  var form = document.getElementById("contactForm");
  var note = document.getElementById("formNote");
  if (form && note) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = form.elements.name.value.trim();
      var email = form.elements.email.value.trim();
      var msg = form.elements.message.value.trim();
      var t = window.modulynxI18n ? window.modulynxI18n.t : function (k) { return k; };
      if (!name || !email || !msg || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        note.textContent = t("form.invalid");
        note.style.color = "#e88";
        return;
      }
      var btn = form.querySelector("button[type=submit]");
      btn.disabled = true;
      note.style.color = "";
      note.textContent = t("form.sending");
      fetch("https://formsubmit.co/ajax/modulynx.project@gmail.com", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({
          "Full Name": name,
          "Email Address": email,
          "Project Details": msg,
          _subject: "Modulynx — new project inquiry from " + name,
          _cc: "mamobarjos@gmail.com",
          _replyto: email,
          _template: "table",
          _captcha: "false"
        })
      }).then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      }).then(function (json) {
        // FormSubmit returns success as the string "true"/"false"
        if (String(json.success) !== "true") throw new Error(json.message || "Send failed");
        note.textContent = t("form.success");
        form.reset();
      }).catch(function () {
        note.style.color = "#e88";
        note.innerHTML = t("form.error");
      }).finally(function () {
        btn.disabled = false;
      });
    });
  }
})();
