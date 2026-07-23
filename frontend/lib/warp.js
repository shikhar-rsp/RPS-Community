// TEMPORARY launch warp effect — self-contained canvas hyperspace burst, no
// dependencies. Ported from https://github.com/jagankaranth/rps-academy
// (script.js's startLaunchAnimation), which already used this exact palette
// and button styling — built as a companion to this design system.
// Fired once on the landing page when a visitor arrives from the /launch gate.
// To remove after launch: delete this file, the app/launch folder, and the
// fenced "launch warp" effect in app/page.jsx (search: launched).
export function fireWarp() {
  if (typeof document === 'undefined') return;
  // Respect reduced-motion preferences — no warp burst for users who opt out.
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9999';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  // Paint solid before the first animation frame — belt-and-suspenders against
  // any single-frame gap where the destination page could show through, on top
  // of the trailing-fill effect's own gradual translucent buildup.
  ctx.fillStyle = '#141312';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const colors = ['#F5330A', '#FF7C48', '#B4260B', '#ECEBE9'];
  const particles = [];

  class Particle {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = (Math.random() - 0.5) * canvas.width * 2;
      this.y = (Math.random() - 0.5) * canvas.height * 2;
      this.z = Math.random() * canvas.width;
      this.color = colors[(Math.random() * colors.length) | 0];
      this.speed = 0;
      this.baseSize = Math.random() * 1.5 + 0.5;
    }
    update(acceleration) {
      this.speed += acceleration;
      this.z -= this.speed;
      if (this.z <= 0) {
        this.z = canvas.width;
        this.x = (Math.random() - 0.5) * canvas.width * 2;
        this.y = (Math.random() - 0.5) * canvas.height * 2;
        this.speed = 0;
      }
    }
    draw(centerX, centerY) {
      const sx = (this.x / this.z) * canvas.width + centerX;
      const sy = (this.y / this.z) * canvas.height + centerY;
      const depthRatio = 1 - this.z / canvas.width;
      const size = Math.max(0.1, depthRatio * this.baseSize * 4);
      if (sx < 0 || sx > canvas.width || sy < 0 || sy > canvas.height) return;

      ctx.beginPath();
      ctx.arc(sx, sy, size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();

      // Trail behind fast-moving particles — the "warp" streak.
      if (this.speed > 2) {
        const px = (this.x / (this.z + this.speed * 3)) * canvas.width + centerX;
        const py = (this.y / (this.z + this.speed * 3)) * canvas.height + centerY;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(sx, sy);
        ctx.strokeStyle = this.color;
        ctx.lineWidth = size;
        ctx.globalAlpha = depthRatio;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }
  }

  for (let i = 0; i < 400; i++) particles.push(new Particle());

  let acceleration = 0.05;
  let phase = 'accelerating'; // accelerating -> cruising -> fading -> finished
  let alpha = 1;
  let raf;

  function frame() {
    if (phase === 'finished') return;

    // Translucent fill (not clearRect) so fast particles leave motion trails.
    ctx.fillStyle = 'rgba(20,19,18,0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (phase === 'accelerating') {
      acceleration += 0.05;
      if (acceleration > 8) {
        phase = 'cruising';
        setTimeout(() => { if (phase === 'cruising') phase = 'fading'; }, 1500);
      }
    } else if (phase === 'cruising') {
      acceleration = Math.max(0.6, acceleration - 0.03);
    } else if (phase === 'fading') {
      alpha -= 0.02;
      canvas.style.opacity = Math.max(0, alpha);
      if (alpha <= 0) {
        phase = 'finished';
        cleanup();
        return;
      }
    }

    ctx.globalAlpha = Math.max(0, alpha);
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    particles.forEach((p) => {
      p.update(Math.max(0.6, acceleration));
      p.draw(centerX, centerY);
    });
    ctx.globalAlpha = 1;

    raf = requestAnimationFrame(frame);
  }

  function cleanup() {
    cancelAnimationFrame(raf);
    window.removeEventListener('resize', resize);
    canvas.remove();
  }

  raf = requestAnimationFrame(frame);
  // Safety net in case something stalls the loop.
  setTimeout(cleanup, 9000);
}
