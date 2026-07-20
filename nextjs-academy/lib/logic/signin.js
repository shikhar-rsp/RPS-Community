'use client';
import React from 'react';
import { DCLogic } from '@/lib/dc';

class Component extends DCLogic {
C = {
    play: ['M5 3l14 9-14 9V3z'],
    cal: ['M7 2v3M17 2v3M3 9h18M5 5h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z'],
    users: ['M17 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2','M9.5 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8','M22 21v-2a4 4 0 0 0-3-3.87','M16 3.13a4 4 0 0 1 0 7.75'],
    help: ['M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z','M9.2 9a3 3 0 0 1 5.6 1c0 2-3 2.5-3 4','M12 17h.01'],
    bulb: ['M9 18h6','M10 21h4','M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.3 1 2.1h5c0-.8.4-1.6 1-2.1A6 6 0 0 0 12 3z'],
    briefcaseS: ['M4 8h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z','M9 8V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3'],
    star: ['M12 3l2.5 5.5 6 .5-4.5 4 1.4 5.9L12 16l-5.4 2.9L8 13l-4.5-4 6-.5z'],
    ex: ['M9 3h6M10 3v4l-3.5 8a2 2 0 0 0 1.8 3h7.4a2 2 0 0 0 1.8-3L14 7V3'],
    check: ['M20 6L9 17l-5-5'],
    target: ['M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z','M12 6a6 6 0 1 0 0 12 6 6 0 0 0 0-12z','M12 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4z'],
    trend: ['M3 17l6-6 4 4 8-8','M17 7h4v4'],
    rocket: ['M12 3c3 1 5 4 5 8l-2 3H9l-2-3c0-4 2-7 5-8z','M9 14l-3 1 1 3 2-1','M15 14l3 1-1 3-2-1'],
    msg: ['M21 14a2 2 0 0 1-2 2H8l-4 4V6a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2z'],
    idea: ['M12 2v2M4.9 4.9l1.4 1.4M2 12h2M20 12h2M17.7 6.3l1.4-1.4','M12 8a4 4 0 0 0-2 7.5V17h4v-1.5A4 4 0 0 0 12 8z'],
    doc: ['M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z','M14 2v6h6','M9 13h6M9 17h4'],
    layers: ['M12 2l9 5-9 5-9-5 9-5z','M3 12l9 5 9-5','M3 17l9 5 9-5'],
    grid: ['M4 4h7v7H4z','M13 4h7v7h-7z','M4 13h7v7H4z','M13 13h7v7h-7z'],
    eye: ['M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z','M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z'],
    hand: ['M18 11V6a2 2 0 0 0-4 0M14 10V4a2 2 0 0 0-4 0v6M10 10.5V6a2 2 0 0 0-4 0v8a7 7 0 0 0 7 7h1a6 6 0 0 0 6-6v-3a2 2 0 0 0-4 0'],
    unlock: ['M7 11V7a5 5 0 0 1 9.5-2','M5 11h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1z'],
    shield: ['M12 2l8 3v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V5z','M9 12l2 2 4-4'],
    heart: ['M12 21C5 16 2 12 2 8a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 18 3.5 4.5 4.5 0 0 1 22 8c0 4-3 8-10 13z'],
    loop: ['M17 2l4 4-4 4','M3 11V9a4 4 0 0 1 4-4h14','M7 22l-4-4 4-4','M21 13v2a4 4 0 0 1-4 4H3'],
  };
  get cards() { const C = this.C; return [
    { title: 'Join Live Workshop',        icon: ['M15 10l4.55-2.28A1 1 0 0 1 21 8.62v6.76a1 1 0 0 1-1.45.9L15 14','M4 6h9a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z'], chips: [['Live Classes',C.play],['Weekly Sessions',C.cal],['Community',C.users],['Q&A',C.help]] },
    { title: 'Learn from Industry Experts', icon: ['M22 10L12 5 2 10l10 5 10-5z','M6 12v4c0 1.1 2.7 3 6 3s6-1.9 6-3v-4'], chips: [['Practical Knowledge',C.bulb],['Industry Experience',C.briefcaseS],['Best Practices',C.star],['Real Examples',C.layers]] },
    { title: 'Complete Assessments',      icon: ['M9 3h6a1 1 0 0 1 1 1v1H8V4a1 1 0 0 1 1-1z','M8 4H6a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2','M9 13l2 2 4-4'], chips: [['Skill Validation',C.check],['Assignments',C.ex],['Practice',C.target],['Improvement',C.trend]] },
    { title: 'Receive Detailed Feedback', icon: ['M21 14a2 2 0 0 1-2 2H8l-4 4V6a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2z','M8 9h8','M8 12h5'], chips: [['Written Reviews',C.doc],['Actionable Insights',C.idea],['Mentor Guidance',C.msg],['Personalized Suggestions',C.target]] },
    { title: 'Build Portfolio Projects',  icon: ['M4 7h16a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1z','M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2','M3 12h18'], chips: [['Real-world Projects',C.grid],['Case Studies',C.eye],['Showcase Work',C.layers],['Hands-on Learning',C.hand]] },
    { title: 'Grow Your Career',          icon: ['M3 17l6-6 4 4 8-8','M17 7h4v4'], chips: [['Better Opportunities',C.unlock],['Strong Portfolio',C.shield],['Confidence',C.heart],['Continuous Learning',C.loop]] },
  ]; }
  state = { i: 0, prev: null };
  DUR = 4400;

  componentDidMount() { this.schedule(); }
  componentWillUnmount() { clearTimeout(this._t); clearTimeout(this._c); }
  schedule() {
    this._t = setTimeout(() => {
      const cur = this.state.i;
      this.setState({ prev: cur, i: (cur + 1) % this.cards.length });
      clearTimeout(this._c);
      this._c = setTimeout(() => this.setState({ prev: null }), 560);
      this.schedule();
    }, this.DUR);
  }

  go(url) { window.location.href = url; }

  buildCard(idx, mode) {
    const h = React.createElement;
    const c = this.cards[idx];
    const border = h('svg', { key: 'b', width: '100%', height: '100%', viewBox: '0 0 400 300', preserveAspectRatio: 'none', style: { position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none' } }, [
      h('rect', { key: 'base', x: 1.5, y: 1.5, width: 397, height: 297, rx: 22, fill: 'none', stroke: 'rgba(255,255,255,0.11)', strokeWidth: 2 }),
      h('rect', { key: 'draw', className: mode === 'in' ? 'lj-stroke' : 'lj-strokefull', pathLength: 100, x: 1.5, y: 1.5, width: 397, height: 297, rx: 22, fill: 'none', stroke: 'rgba(245,90,45,0.5)', strokeWidth: 1.5, strokeLinecap: 'round', style: { filter: 'drop-shadow(0 0 3px rgba(245,60,20,0.28))' } }),
    ]);
    const iconBox = h('span', { key: 'ic', style: { width: '54px', height: '54px', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(245,60,20,0.13)', border: '1px solid rgba(245,60,20,0.26)' } },
      h('svg', { width: 26, height: 26, viewBox: '0 0 24 24', fill: 'none', stroke: '#F5330A', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' }, c.icon.map((d, k) => h('path', { key: k, d }))));
    const title = h('div', { key: 'ti', style: { marginTop: '20px', fontWeight: 700, fontSize: '25px', letterSpacing: '-0.028em', color: '#ECEBE9', lineHeight: 1.08 } }, c.title);
    const chips = h('div', { key: 'ch', style: { display: 'flex', flexWrap: 'wrap', gap: '9px', marginTop: 'auto' } }, c.chips.map((ch, k) => h('span', {
      key: k, className: mode === 'in' ? 'lj-chip' : '',
      style: { display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', fontWeight: 500, color: '#ECEBE9', background: 'rgba(255,255,255,0.045)', border: '1px solid rgba(255,255,255,0.08)', padding: '7px 13px 7px 10px', borderRadius: '10px', animationDelay: (0.35 + k * 0.09) + 's' },
    }, [
      h('svg', { key: 'i', width: 15, height: 15, viewBox: '0 0 24 24', fill: 'none', stroke: 'rgba(245,110,65,0.95)', strokeWidth: 1.9, strokeLinecap: 'round', strokeLinejoin: 'round', style: { flex: 'none' } }, ch[1].map((d, j) => h('path', { key: j, d }))),
      ch[0],
    ])));
    const content = h('div', { key: 'c', style: { position: 'relative', height: '100%', padding: '30px 32px', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' } }, [iconBox, title, chips]);
    const glow = h('div', { key: 'g', 'aria-hidden': true, style: { position: 'absolute', top: '-40%', right: '-20%', width: '60%', height: '80%', background: 'radial-gradient(circle,rgba(245,60,20,0.13),transparent 70%)', pointerEvents: 'none' } });
    return h('div', {
      key: mode + idx, className: mode === 'in' ? 'lj-in' : 'lj-out',
      style: { position: 'absolute', inset: 0, borderRadius: '20px', overflow: 'hidden', background: 'linear-gradient(165deg,rgba(32,30,28,0.74),rgba(19,18,17,0.86))', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', boxShadow: '0 34px 80px -36px rgba(0,0,0,0.85)' },
    }, [glow, content, border]);
  }

  renderVals() {
    const h = React.createElement;
    const layers = [];
    if (this.state.prev !== null && this.state.prev !== this.state.i) layers.push(this.buildCard(this.state.prev, 'out'));
    layers.push(this.buildCard(this.state.i, 'in'));
    const stage = h('div', { style: { position: 'absolute', inset: 0 } }, layers);
    return {
      stage,
      onSubmit: (e) => { e.preventDefault(); this.go('/onboarding'); },
      onGoogle: () => this.go('/onboarding'),
    };
  }
}

export default Component;
