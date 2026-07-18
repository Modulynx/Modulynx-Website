/* ═══════════════════════════════════════════════════════════
   MODULYNX — the living lynx
   Eyes track the cursor with spring smoothing, random blinks,
   ear twitches, and a subtle head tilt toward the pointer.
   ═══════════════════════════════════════════════════════════ */
(function () {
  var svg = document.getElementById("lynxSvg");
  var stage = document.getElementById("lynxStage");
  if (!svg || !stage) return;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // the hero <use> instance owns the visible head; query inside the defs
  var head = svg.querySelector("#lynxHead");
  var pupilL = svg.querySelector("#pupilL");
  var pupilR = svg.querySelector("#pupilR");
  var eyeGroup = svg.querySelector(".eye-group");
  if (!head || !pupilL || !pupilR) return;

  var target = { x: 0, y: 0 };       // where the lynx wants to look (-1..1)
  var look = { x: 0, y: 0 };         // spring-smoothed current gaze
  var vel = { x: 0, y: 0 };          // spring velocity
  var STIFF = 0.08, DAMP = 0.72;     // underdamped spring — feels alive
  var MAX_PUPIL = 6;                 // px of pupil travel
  var MAX_TILT = 4;                  // degrees of head tilt

  window.addEventListener("mousemove", function (e) {
    var r = stage.getBoundingClientRect();
    var cx = r.left + r.width / 2;
    var cy = r.top + r.height / 2;
    // normalize to -1..1, clamped, with falloff so far cursors still work
    target.x = Math.max(-1, Math.min(1, (e.clientX - cx) / (window.innerWidth * 0.4)));
    target.y = Math.max(-1, Math.min(1, (e.clientY - cy) / (window.innerHeight * 0.4)));
  });

  // occasionally glance somewhere random when the cursor is idle
  var lastMove = Date.now();
  window.addEventListener("mousemove", function () { lastMove = Date.now(); });
  setInterval(function () {
    if (Date.now() - lastMove > 3500) {
      target.x = (Math.random() - 0.5) * 1.4;
      target.y = (Math.random() - 0.5) * 0.8;
    }
  }, 2600);

  // pause the gaze loop while the lynx is off-screen
  var visible = true, running = false;
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      if (visible && !running && !reduced) { running = true; requestAnimationFrame(frame); }
    }).observe(stage);
  }

  function frame() {
    if (!visible) { running = false; return; }
    // spring physics (Remotion-style)
    vel.x = (vel.x + (target.x - look.x) * STIFF) * DAMP;
    vel.y = (vel.y + (target.y - look.y) * STIFF) * DAMP;
    look.x += vel.x;
    look.y += vel.y;

    var px = look.x * MAX_PUPIL;
    var py = look.y * MAX_PUPIL * 0.7;
    pupilL.setAttribute("transform", "translate(" + px + "," + py + ")");
    pupilR.setAttribute("transform", "translate(" + px + "," + py + ")");

    var tilt = look.x * MAX_TILT;
    var shift = look.x * 4;
    var lift = look.y * 3;
    head.style.transform =
      "translate(" + shift + "px," + lift + "px) rotate(" + tilt + "deg)";

    requestAnimationFrame(frame);
  }

  // blinking runs as a pure CSS animation (see .eyelid in style.css) —
  // JS timers get throttled in background tabs and left the eyes shut.

  // ── ear twitches ──
  function scheduleTwitch() {
    var delay = 3800 + Math.random() * 6000;
    setTimeout(function () {
      var cls = Math.random() < 0.5 ? "ear-twitch-l" : "ear-twitch-r";
      svg.classList.add(cls);
      setTimeout(function () { svg.classList.remove(cls); }, 400);
      scheduleTwitch();
    }, delay);
  }

  // ── pupils dilate on hover (interest), narrow on click (focus) ──
  stage.addEventListener("mouseenter", function () {
    pupilL.setAttribute("rx", "6"); pupilR.setAttribute("rx", "6");
  });
  stage.addEventListener("mouseleave", function () {
    pupilL.setAttribute("rx", "4.2"); pupilR.setAttribute("rx", "4.2");
  });
  window.addEventListener("mousedown", function () {
    pupilL.setAttribute("rx", "2.6"); pupilR.setAttribute("rx", "2.6");
  });
  window.addEventListener("mouseup", function () {
    pupilL.setAttribute("rx", "4.2"); pupilR.setAttribute("rx", "4.2");
  });

  if (!reduced) {
    head.style.transition = "none";
    running = true;
    requestAnimationFrame(frame);
    scheduleTwitch();
  }
})();
