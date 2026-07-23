// TEMPORARY launch confetti — self-contained canvas burst, no dependencies.
// Fired once on the landing page when a visitor arrives from the /launch gate.
// To remove after launch: delete this file, the app/launch folder, and the
// fenced "launch confetti" effect in app/page.jsx (search: launched).
export function fireConfetti() {
  if (typeof document === 'undefined') return;
  // Respect reduced-motion preferences — no confetti for users who opt out.
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9999';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const W = () => window.innerWidth;
  const H = () => window.innerHeight;
  const resize = () => {
    canvas.width = W() * dpr;
    canvas.height = H() * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  window.addEventListener('resize', resize);

  const colors = ['#F5330A', '#FF7C48', '#FFD166', '#3ecf8e', '#4aa3ff', '#ECEBE9'];
  const parts = [];

  function spawn(x, y, n, spread, power) {
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + (Math.random() - 0.5) * spread;
      const v = power * (0.6 + Math.random() * 0.8);
      parts.push({
        x, y,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v,
        g: 0.18 + Math.random() * 0.12,
        w: 6 + Math.random() * 6,
        h: 9 + Math.random() * 8,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.3,
        color: colors[(Math.random() * colors.length) | 0],
        life: 0,
        max: 150 + Math.random() * 90,
      });
    }
  }
  // Two cannons from the bottom corners, plus a sprinkle from the top.
  spawn(W() * 0.14, H() + 10, 90, 0.9, 15);
  spawn(W() * 0.86, H() + 10, 90, 0.9, 15);
  spawn(W() * 0.5, -10, 60, 2.6, 6);

  let raf;
  function frame() {
    ctx.clearRect(0, 0, W(), H());
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.vy += p.g;
      p.vx *= 0.995;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      p.life++;
      if (p.y > H() + 50 || p.life > p.max) { parts.splice(i, 1); continue; }
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = Math.max(0, 1 - p.life / p.max);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
    if (parts.length) raf = requestAnimationFrame(frame);
    else cleanup();
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
