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

  // ── tail ripple + shoulder-line tracking (see frame() below) ──
  var tailEdge = document.getElementById("tailEdge");
  var tailFill = document.getElementById("tailFill");
  var shoulderL = document.querySelector(".shoulder-line-l");
  var shoulderR = document.querySelector(".shoulder-line-r");
  var bodySvg = document.querySelector(".lynx-body-svg");
  var pawL = document.getElementById("pawL");
  var pawR = document.getElementById("pawR");
  // the tail's own control points, in order along the curve — index 0 is the
  // fixed root (behind the body's right side), the curve hangs down then
  // curls back up and OUTWARD (away from the body) toward the tip — every
  // later point gets more ripple the further out it is. Kept short enough
  // vertically to clear the real front paw, but pushed further out
  // horizontally so it visibly exits past the body's own right edge
  // instead of staying hidden underneath it.
  // rebuilt as one continuously smooth curve — the tangent direction is
  // matched exactly across both internal joints (points 3→4 and 6→7 each
  // continue the same direction as the segment before them), so the base
  // shape has no corners at all, only a gentle curl at the very tip
  var tailPts = [
    [204, 155], [210, 153], [216, 150], [221, 146],
    [226, 142], [231, 138], [235, 133],
    [239, 128], [241, 122], [238, 116]
  ];
  function buildTailD(pts) {
    return "M" + pts[0][0].toFixed(1) + " " + pts[0][1].toFixed(1) +
      " C " + pts[1][0].toFixed(1) + " " + pts[1][1].toFixed(1) + ", " +
               pts[2][0].toFixed(1) + " " + pts[2][1].toFixed(1) + ", " +
               pts[3][0].toFixed(1) + " " + pts[3][1].toFixed(1) +
      " C " + pts[4][0].toFixed(1) + " " + pts[4][1].toFixed(1) + ", " +
               pts[5][0].toFixed(1) + " " + pts[5][1].toFixed(1) + ", " +
               pts[6][0].toFixed(1) + " " + pts[6][1].toFixed(1) +
      " C " + pts[7][0].toFixed(1) + " " + pts[7][1].toFixed(1) + ", " +
               pts[8][0].toFixed(1) + " " + pts[8][1].toFixed(1) + ", " +
               pts[9][0].toFixed(1) + " " + pts[9][1].toFixed(1);
  }
  // where a shoulder line should touch the paw — just inside its top edge
  function pawAttachPoint(paw) {
    var r = paw.getBoundingClientRect();
    return { x: r.left + r.width * 0.5, y: r.top + r.height * 0.18 };
  }
  function toBodySvgPoint(screenX, screenY) {
    var pt = bodySvg.createSVGPoint();
    pt.x = screenX; pt.y = screenY;
    return pt.matrixTransform(bodySvg.getScreenCTM().inverse());
  }

  var target = { x: 0, y: 0 };       // where the lynx wants to look (-1..1)
  var look = { x: 0, y: 0 };         // spring-smoothed current gaze
  var vel = { x: 0, y: 0 };          // spring velocity
  var STIFF = 0.08, DAMP = 0.72;     // underdamped spring — feels alive
  var MAX_PUPIL = 4;                 // px of pupil travel — kept inside the eye-shape outline
  var MAX_TILT = 4;                  // degrees of head tilt
  var headScale = 1;                 // eased toward a bigger value when a button is hovered

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
    // head grows slowly and gradually while a nav/CTA button stays hovered
    // (not a quick snap to full size) — as if the lynx is leaning in toward
    // you for as long as you keep pointing at the button
    var targetHeadScale = stage.classList.contains("is-excited") ? 1.18 : 1;
    headScale += (targetHeadScale - headScale) * 0.016;
    head.style.transform =
      "translate(" + shift + "px," + lift + "px) rotate(" + tilt + "deg) scale(" + headScale.toFixed(3) + ")";

    // ── tail: ripple the curve itself (per-point phase/amplitude) instead
    //    of rotating the whole shape rigidly — stays one seamless path but
    //    reads as genuinely alive. Grows with the same proximity value the
    //    claws use. ──
    if (tailEdge && tailFill) {
      var reveal = parseFloat(getComputedStyle(docEl).getPropertyValue("--claw-reveal")) || 0;
      var now = performance.now() / 1000;
      var newPts = tailPts.map(function (p, i) {
        if (i === 0) return p; // root stays anchored to the body
        // amplitude grows with distance from the root on a curve (not
        // linearly), so the base barely moves while the tip whips — and a
        // wider phase spread along the length gives the wave time to travel
        // the tail is short now — the old amplitude was tuned for a much
        // longer reach and made the short segments whip into sharp,
        // "broken"-looking angles instead of a smooth realistic sway.
        // Excitement (button hover / approach, via --claw-reveal) now makes
        // it noticeably livelier — bigger AND quicker swishing, like a real
        // cat's tail picking up energy — not just the faint idle sway.
        var t = i / (tailPts.length - 1);
        var amp = Math.pow(t, 1.7) * 2.5 * (1 + reveal * 2.2);
        var speed = 1.7 + reveal * 2.8;
        var angle = now * speed - t * 3.6;
        var dx = Math.sin(angle) * amp;
        var dy = Math.cos(angle * 0.85 + 0.5) * amp * 0.55;
        // extra fast flutter right at the tip — like a real tail-tip snap,
        // not just a smooth swing
        if (i >= tailPts.length - 3) {
          var flutter = (i - (tailPts.length - 4)) * 0.25;
          dx += Math.sin(now * 4.4 + i * 1.3) * amp * flutter * 0.15;
          dy += Math.cos(now * 3.8 + i * 1.1) * amp * flutter * 0.12;
        }
        return [p[0] + dx, p[1] + dy];
      });
      var tailD = buildTailD(newPts);
      tailEdge.setAttribute("d", tailD);
      tailFill.setAttribute("d", tailD);
    }

    // ── shoulder lines: redraw the bottom endpoint to match wherever the
    //    paw actually is on screen right now, so the two never separate no
    //    matter what moved the paw (idle sway, hover, a button gesture) ──
    if (bodySvg && shoulderL && pawL) {
      var pL = pawAttachPoint(pawL);
      var svgL = toBodySvgPoint(pL.x, pL.y);
      shoulderL.setAttribute("d", "M26 155 C 34 185, 39 200, " + svgL.x.toFixed(1) + " " + svgL.y.toFixed(1));
    }
    if (bodySvg && shoulderR && pawR) {
      var pR = pawAttachPoint(pawR);
      var svgR = toBodySvgPoint(pR.x, pR.y);
      shoulderR.setAttribute("d", "M214 155 C 206 185, 201 200, " + svgR.x.toFixed(1) + " " + svgR.y.toFixed(1));
    }

    requestAnimationFrame(frame);
  }

  // blinking runs as a pure CSS animation (see .eyelid in style.css) —
  // JS timers get throttled in background tabs and left the eyes shut.

  // ── claw-mark clip (pre-rendered with Remotion, marks only — no paw of
  //    its own). Reusable so it can appear wherever the interaction is:
  //    at the paw when you approach the lynx directly, or AT THE BUTTON
  //    when you hover a nav/CTA button — never floating unrelated to
  //    whatever the user is actually pointing at. ──
  var swipeVideo = document.getElementById("pawSwipeVideo");
  var swipeTimer = null;
  var pupilNarrowTimer = null;
  function positionSwipeVideo(targetEl, dx, dy) {
    var r = targetEl.getBoundingClientRect();
    var w = swipeVideo.offsetWidth || 130;
    var h = swipeVideo.offsetHeight || 130;
    swipeVideo.style.left = (r.left + r.width / 2 - w / 2 + dx) + "px";
    swipeVideo.style.top = (r.top + r.height / 2 - h / 2 + dy) + "px";
  }
  function triggerSwipeAt(targetEl, dx, dy) {
    if (!swipeVideo || reduced) return;
    clearTimeout(swipeTimer);
    clearTimeout(pupilNarrowTimer);
    swipeVideo.pause();
    swipeVideo.classList.remove("is-active");
    pupilNarrowTimer = setTimeout(function () {
      pupilL.setAttribute("rx", "1.2"); pupilR.setAttribute("rx", "1.2");
    }, 150);
    swipeTimer = setTimeout(function () {
      positionSwipeVideo(targetEl, dx, dy);
      swipeVideo.classList.add("is-active");
      try {
        swipeVideo.currentTime = 0;
        swipeVideo.play();
      } catch (err) { /* autoplay can be blocked; the paw itself still reacts */ }
      dilate(); // back to normal interest once the swipe has landed
    }, 420); // ~70% through pawSwipeR's .65s, right as the paw lands
  }
  function cancelSwipe() {
    clearTimeout(swipeTimer);
    clearTimeout(pupilNarrowTimer);
    if (swipeVideo) { swipeVideo.pause(); swipeVideo.classList.remove("is-active"); }
  }
  if (swipeVideo && !reduced) {
    stage.addEventListener("mouseenter", function () { triggerSwipeAt(pawR, -12, 15); });
    stage.addEventListener("mouseleave", cancelSwipe);
  }

  // ── every 30s, an unprompted yawn — bares the fangs and opens the mouth
  //    on its own, not tied to hover/approach at all ──
  if (!reduced) {
    setInterval(function () {
      stage.classList.add("is-yawning");
      setTimeout(function () { stage.classList.remove("is-yawning"); }, 1300);
    }, 30000);
  }

  // ── once the visitor has gone 20s without taking any action (no move,
  //    click, key, scroll, touch), an idle "quizzical" brow raise —
  //    alternating which side lifts — expresses puzzlement, repeating every
  //    20s for as long as they stay inactive. Any real activity resets the
  //    clock. Skipped while genuinely interacting so it never fights the
  //    hover/excited/angry expressions. ──
  if (!reduced) {
    var quizzicalToggle = false;
    var lastActivity = Date.now();
    var lastQuizzical = 0;
    ["mousemove", "mousedown", "keydown", "scroll", "touchstart"].forEach(function (evt) {
      window.addEventListener(evt, function () { lastActivity = Date.now(); }, { passive: true });
    });
    setInterval(function () {
      var idleFor = Date.now() - lastActivity;
      if (idleFor < 20000 || Date.now() - lastQuizzical < 20000) return;
      if (stage.matches(":hover") || stage.classList.contains("is-excited") ||
          stage.classList.contains("is-angry") || stage.classList.contains("is-yawning")) return;
      lastQuizzical = Date.now();
      var cls = quizzicalToggle ? "is-quizzical-b" : "is-quizzical-a";
      quizzicalToggle = !quizzicalToggle;
      stage.classList.add(cls);
      setTimeout(function () { stage.classList.remove(cls); }, 1200);
    }, 4000);
  }

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

  // ── pupils dilate on hover (interest), narrow on click (focus) —
  //    kept small enough to stay inside the eye-shape outline. Buttons get
  //    an even bigger dilation (dilateMore) — more excitement/readiness. ──
  function dilate() { pupilL.setAttribute("rx", "3.6"); pupilR.setAttribute("rx", "3.6"); }
  function dilateMore() { pupilL.setAttribute("rx", "4.6"); pupilR.setAttribute("rx", "4.6"); }
  function undilate() { pupilL.setAttribute("rx", "2.6"); pupilR.setAttribute("rx", "2.6"); }
  stage.addEventListener("mouseenter", dilate);
  stage.addEventListener("mouseleave", undilate);
  window.addEventListener("mousedown", function () {
    pupilL.setAttribute("rx", "1.2"); pupilR.setAttribute("rx", "1.2");
  });
  window.addEventListener("mouseup", undilate);

  // ── staying close: surprised brows the instant you approach, then — if
  //    you're still there after a couple of seconds — angry brows, a wider
  //    open mouth, all while the claws/tail keep going on their own ──
  var angryTimer = null;
  stage.addEventListener("mouseenter", function () {
    clearTimeout(angryTimer);
    angryTimer = setTimeout(function () { stage.classList.add("is-angry"); }, 2200);
  });
  stage.addEventListener("mouseleave", function () {
    clearTimeout(angryTimer);
    stage.classList.remove("is-angry");
  });

  // ── hovering the nav toggle or a hero CTA mirrors the exact excitement of
  //    approaching the lynx directly: fangs, claws, dilated pupils, AND the
  //    same body/tail motion intensity as being right next to it (forcing
  //    --claw-reveal to max) — like it's coiled and about to launch forward ──
  var bodyStage = document.querySelector(".lynx-body-stage");
  var returnTimer = null;
  var excitementTriggers = document.querySelectorAll("#navToggle, .btn-primary, .btn-ghost");
  excitementTriggers.forEach(function (el) {
    // the nav toggle gets the excited look but no hands — just the head
    // leaning forward, per the brief. The two CTA buttons get the full
    // scratch: the marks land ON the button, not back at the lynx.
    var doesSwipe = el.id !== "navToggle";
    el.addEventListener("mouseenter", function () {
      clearTimeout(returnTimer);
      if (bodyStage) bodyStage.classList.remove("is-returning");
      stage.classList.add("is-excited"); dilateMore();
      document.documentElement.style.setProperty("--claw-reveal", "1");
      if (doesSwipe) triggerSwipeAt(el, 0, 0);
    });
    el.addEventListener("mouseleave", function () {
      stage.classList.remove("is-excited"); undilate();
      document.documentElement.style.setProperty("--claw-reveal", "0");
      if (doesSwipe) cancelSwipe();
      // hold a smooth, slow transition back to neutral (matching the head's
      // own slow return) instead of snapping straight into the idle sway
      if (bodyStage) {
        bodyStage.classList.add("is-returning");
        clearTimeout(returnTimer);
        returnTimer = setTimeout(function () { bodyStage.classList.remove("is-returning"); }, 2900);
      }
    });
  });

  // ── claws bare further, and the body/tail sway more, the closer the cursor
  //    gets — set on <html> (not just .lynx-stage) so the body/tail SVG,
  //    which is a sibling of .lynx-stage, can read the same live value.
  //    While actually hovering the lynx itself, this snaps straight to max
  //    (1) — same as a button's forced value — so the tail/claws move with
  //    identical energy on direct approach as they do on a button hover,
  //    instead of only reaching whatever the distance-to-center happened
  //    to work out to. ──
  if (!reduced) {
    var CLAW_RANGE = 260; // px from stage center where the reveal starts
    var docEl = document.documentElement;
    window.addEventListener("mousemove", function (e) {
      // a button's mouseenter forces --claw-reveal to 1 (see below); don't
      // let this distance-based calc race it back down while that's active
      if (stage.classList.contains("is-excited")) return;
      if (stage.matches(":hover")) { docEl.style.setProperty("--claw-reveal", "1"); return; }
      var r = stage.getBoundingClientRect();
      var cx = r.left + r.width / 2;
      var cy = r.top + r.height / 2;
      var dist = Math.hypot(e.clientX - cx, e.clientY - cy);
      var proximity = Math.max(0, 1 - dist / CLAW_RANGE);
      docEl.style.setProperty("--claw-reveal", proximity.toFixed(3));
    });
  }

  if (!reduced) {
    head.style.transition = "none";
    running = true;
    requestAnimationFrame(frame);
    scheduleTwitch();
  }
})();
