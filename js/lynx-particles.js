/* ═══════════════════════════════════════════════════════════
   MODULYNX — hero particle field
   Amber embers + ice dust drifting with cursor parallax,
   nearby particles link into faint constellations.
   ═══════════════════════════════════════════════════════════ */
(function () {
  var canvas = document.getElementById("particles");
  if (!canvas) return;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var ctx = canvas.getContext("2d");
  var W = 0, H = 0, DPR = Math.min(window.devicePixelRatio || 1, 2);
  var particles = [];
  var mouse = { x: -9999, y: -9999, sx: -9999, sy: -9999 };
  var LINK_DIST = 110;

  function resize() {
    W = canvas.clientWidth;
    H = canvas.clientHeight;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    seed();
  }

  function seed() {
    var count = Math.min(110, Math.floor((W * H) / 16000));
    particles = [];
    for (var i = 0; i < count; i++) {
      var amber = Math.random() < 0.6;
      particles.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: 0.6 + Math.random() * 1.8,
        vx: (Math.random() - 0.5) * 0.22,
        vy: -0.05 - Math.random() * 0.28,          // embers drift upward
        depth: 0.3 + Math.random() * 0.7,           // parallax layer
        tw: Math.random() * Math.PI * 2,            // twinkle phase
        color: amber ? "242,168,59" : "143,199,221"
      });
    }
  }

  window.addEventListener("mousemove", function (e) {
    var rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });
  window.addEventListener("resize", resize);

  // stop burning frames while the hero is off-screen
  var visible = true, running = false;
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      if (visible && !running && !reduced) { running = true; requestAnimationFrame(frame); }
    }).observe(canvas);
  }

  function frame(t) {
    if (!visible) { running = false; return; }
    ctx.clearRect(0, 0, W, H);

    // spring-smooth the mouse (Remotion-style interpolation)
    mouse.sx += (mouse.x - mouse.sx) * 0.06;
    mouse.sy += (mouse.y - mouse.sy) * 0.06;
    var cx = W / 2, cy = H / 2;
    var px = (mouse.sx - cx) / Math.max(cx, 1);
    var py = (mouse.sy - cy) / Math.max(cy, 1);

    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.tw += 0.02;
      if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; }
      if (p.x < -10) p.x = W + 10;
      if (p.x > W + 10) p.x = -10;

      var ox = -px * 26 * p.depth;
      var oy = -py * 18 * p.depth;
      var alpha = (0.25 + 0.45 * Math.abs(Math.sin(p.tw))) * p.depth;

      ctx.beginPath();
      ctx.arc(p.x + ox, p.y + oy, p.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(" + p.color + "," + alpha.toFixed(3) + ")";
      ctx.fill();
    }

    // constellation links near the cursor
    for (var a = 0; a < particles.length; a++) {
      var pa = particles[a];
      var dxm = pa.x - mouse.sx, dym = pa.y - mouse.sy;
      if (dxm * dxm + dym * dym > 180 * 180) continue;
      for (var b = a + 1; b < particles.length; b++) {
        var pb = particles[b];
        var dx = pa.x - pb.x, dy = pa.y - pb.y;
        var d2 = dx * dx + dy * dy;
        if (d2 < LINK_DIST * LINK_DIST) {
          var la = (1 - Math.sqrt(d2) / LINK_DIST) * 0.16;
          ctx.beginPath();
          ctx.moveTo(pa.x, pa.y);
          ctx.lineTo(pb.x, pb.y);
          ctx.strokeStyle = "rgba(242,168,59," + la.toFixed(3) + ")";
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(frame);
  }

  resize();
  if (reduced) {
    // static single frame for reduced-motion users
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(" + p.color + ",0.4)";
      ctx.fill();
    }
  } else {
    running = true;
    requestAnimationFrame(frame);
  }
})();
