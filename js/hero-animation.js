/**
 * Hero Section — Particle & Solar Panel Animation
 * Floating energy particles, rotating solar panel, sun rays, constellation lines, mouse interaction
 */
(function () {
  'use strict';

  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const hero = canvas.parentElement;

  /* ── configuration ── */
  const COLORS = {
    amber: 'rgba(245, 158, 11,',    // #f59e0b
    gold: 'rgba(251, 191, 36,',     // #fbbf24
    orange: 'rgba(251, 146, 60,',   // #fb923c
  };
  const COLOR_KEYS = Object.keys(COLORS);
  const CONNECTION_DIST = 100;
  const MOUSE_RADIUS = 120;
  const MOUSE_FORCE = 0.8;

  let width, height, particles, mouse, isMobile, animId;

  mouse = { x: -9999, y: -9999 };

  /* ── helpers ── */
  function rand(min, max) { return Math.random() * (max - min) + min; }

  function resize() {
    const rect = hero.getBoundingClientRect();
    width = canvas.width = rect.width;
    height = canvas.height = rect.height;
    isMobile = window.innerWidth < 768;
  }

  /* ── Particle class ── */
  function Particle() {
    this.reset(true);
  }

  Particle.prototype.reset = function (init) {
    this.x = rand(0, width);
    this.y = init ? rand(0, height) : height + rand(10, 40);
    this.size = rand(2, 6);
    this.baseAlpha = rand(0.15, 0.5);
    this.alpha = this.baseAlpha;
    this.speedY = -rand(0.3, 1.2);
    this.speedX = rand(-0.3, 0.3);
    this.colorKey = COLOR_KEYS[Math.floor(rand(0, COLOR_KEYS.length))];
    this.pulse = rand(0, Math.PI * 2);
    this.pulseSpeed = rand(0.01, 0.04);
  };

  Particle.prototype.update = function () {
    this.pulse += this.pulseSpeed;
    this.alpha = this.baseAlpha + Math.sin(this.pulse) * 0.1;

    // mouse repulsion
    var dx = this.x - mouse.x;
    var dy = this.y - mouse.y;
    var dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < MOUSE_RADIUS && dist > 0) {
      var force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS * MOUSE_FORCE;
      this.x += (dx / dist) * force;
      this.y += (dy / dist) * force;
    }

    this.x += this.speedX;
    this.y += this.speedY;

    if (this.y < -20 || this.x < -20 || this.x > width + 20) {
      this.reset(false);
    }
  };

  Particle.prototype.draw = function () {
    var a = Math.max(0, Math.min(1, this.alpha));
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = COLORS[this.colorKey] + a + ')';
    ctx.fill();

    // soft glow
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * 2.5, 0, Math.PI * 2);
    ctx.fillStyle = COLORS[this.colorKey] + (a * 0.15) + ')';
    ctx.fill();
  };

  /* ── create particles ── */
  function initParticles() {
    var count = isMobile ? 20 : 45;
    particles = [];
    for (var i = 0; i < count; i++) {
      particles.push(new Particle());
    }
  }

  /* ── connection lines ── */
  function drawConnections() {
    for (var i = 0; i < particles.length; i++) {
      for (var j = i + 1; j < particles.length; j++) {
        var dx = particles[i].x - particles[j].x;
        var dy = particles[i].y - particles[j].y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECTION_DIST) {
          var opacity = (1 - dist / CONNECTION_DIST) * 0.12;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = 'rgba(251, 191, 36, ' + opacity + ')';
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }
  }

  /* ── sun rays ── */
  var rayAngle = 0;

  function drawSunRays() {
    rayAngle += 0.002;
    var cx = width * 0.88;
    var cy = -height * 0.05;
    var rayCount = 8;
    var maxLen = Math.max(width, height) * 0.7;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rayAngle);

    for (var i = 0; i < rayCount; i++) {
      var angle = (Math.PI * 2 / rayCount) * i;
      var grad = ctx.createLinearGradient(0, 0, Math.cos(angle) * maxLen, Math.sin(angle) * maxLen);
      grad.addColorStop(0, 'rgba(251, 191, 36, 0.06)');
      grad.addColorStop(0.5, 'rgba(245, 158, 11, 0.02)');
      grad.addColorStop(1, 'rgba(245, 158, 11, 0)');

      ctx.beginPath();
      ctx.moveTo(0, 0);
      var halfSpread = 0.06;
      ctx.lineTo(Math.cos(angle - halfSpread) * maxLen, Math.sin(angle - halfSpread) * maxLen);
      ctx.lineTo(Math.cos(angle + halfSpread) * maxLen, Math.sin(angle + halfSpread) * maxLen);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();
    }

    ctx.restore();
  }

  /* ── solar panel ── */
  var panelTime = 0;

  function drawSolarPanel() {
    if (isMobile) return; // skip on mobile for cleanliness

    panelTime += 0.008;

    var cols = 5;
    var rows = 4;
    var cellW = 28;
    var cellH = 22;
    var gap = 3;
    var totalW = cols * (cellW + gap) - gap;
    var totalH = rows * (cellH + gap) - gap;

    // position: right side of hero
    var cx = width * 0.82;
    var cy = height * 0.55;

    // 3D tilt
    var tiltX = Math.sin(panelTime) * 0.15;
    var tiltY = Math.cos(panelTime * 0.7) * 0.08;

    ctx.save();
    ctx.translate(cx, cy);

    // apply perspective via scale/skew simulation
    var scaleX = 1 - Math.abs(Math.sin(panelTime)) * 0.08;
    var scaleY = 1 - Math.abs(Math.cos(panelTime * 0.7)) * 0.05;
    var skewX = tiltY * 0.3;
    var skewY = tiltX * 0.2;

    ctx.transform(scaleX, skewY, skewX, scaleY, 0, 0);
    ctx.rotate(tiltX * 0.3);

    // panel frame
    var frameP = 6;
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.12)';
    ctx.lineWidth = 2;
    ctx.strokeRect(
      -totalW / 2 - frameP,
      -totalH / 2 - frameP,
      totalW + frameP * 2,
      totalH + frameP * 2
    );

    // cells
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        var x = -totalW / 2 + c * (cellW + gap);
        var y = -totalH / 2 + r * (cellH + gap);

        // shimmer effect
        var shimmer = Math.sin(panelTime * 2 + c * 0.5 + r * 0.7) * 0.04 + 0.08;

        ctx.fillStyle = 'rgba(245, 158, 11, ' + shimmer + ')';
        ctx.fillRect(x, y, cellW, cellH);

        ctx.strokeStyle = 'rgba(245, 158, 11, 0.1)';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(x, y, cellW, cellH);
      }
    }

    // grid lines through cells
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.06)';
    ctx.lineWidth = 0.5;
    for (var c = 1; c < cols; c++) {
      var lx = -totalW / 2 + c * (cellW + gap) - gap / 2;
      ctx.beginPath();
      ctx.moveTo(lx, -totalH / 2 - frameP);
      ctx.lineTo(lx, totalH / 2 + frameP);
      ctx.stroke();
    }
    for (var r = 1; r < rows; r++) {
      var ly = -totalH / 2 + r * (cellH + gap) - gap / 2;
      ctx.beginPath();
      ctx.moveTo(-totalW / 2 - frameP, ly);
      ctx.lineTo(totalW / 2 + frameP, ly);
      ctx.stroke();
    }

    // mounting pole
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.08)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, totalH / 2 + frameP);
    ctx.lineTo(0, totalH / 2 + frameP + 40);
    ctx.stroke();

    ctx.restore();
  }

  /* ── main loop ── */
  function animate() {
    ctx.clearRect(0, 0, width, height);

    drawSunRays();
    drawSolarPanel();

    for (var i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
    }

    drawConnections();

    animId = requestAnimationFrame(animate);
  }

  /* ── events ── */
  hero.addEventListener('mousemove', function (e) {
    var rect = hero.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  hero.addEventListener('mouseleave', function () {
    mouse.x = -9999;
    mouse.y = -9999;
  });

  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      resize();
      // re-check mobile particle count
      var target = isMobile ? 20 : 45;
      if (particles.length > target) {
        particles.length = target;
      } else {
        while (particles.length < target) {
          particles.push(new Particle());
        }
      }
    }, 200);
  });

  /* ── init ── */
  resize();
  initParticles();
  animate();

  // pause when not visible
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      cancelAnimationFrame(animId);
    } else {
      animId = requestAnimationFrame(animate);
    }
  });
})();
