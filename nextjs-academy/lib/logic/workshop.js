'use client';
import React from 'react';
import { DCLogic } from '@/lib/dc';

class Component extends DCLogic {
  state = { dark: true, link: '', note: '', submitted: false, submitting: false, menuOpen: false, avatar: '/assets/vivin-avatar.png', pdfOpen: false, now: Date.now() };
  _target = new Date('2026-07-31T15:00:00').getTime();
  fmtCountdown() {
    let d = Math.max(0, Math.floor((this._target - this.state.now) / 1000));
    const days = Math.floor(d / 86400); d -= days * 86400;
    const h = Math.floor(d / 3600); d -= h * 3600;
    const m = Math.floor(d / 60); const s = d - m * 60;
    const p = n => String(n).padStart(2, '0');
    return days > 0 ? days + 'd ' + p(h) + 'h ' + p(m) + 'm' : p(h) + ':' + p(m) + ':' + p(s);
  }
  openPdf = () => this.setState({ pdfOpen: true });
  closePdf = () => this.setState({ pdfOpen: false });
  stop = (e) => e.stopPropagation();
  onDownload = () => {};
  setMenuWrap = (el) => { this._menuWrap = el; };
  setFileInput = (el) => { this._fileInput = el; };
  toggleMenu = () => this.setState(s => ({ menuOpen: !s.menuOpen }));
  onEdit = () => { if (this._fileInput) this._fileInput.click(); };
  onFile = (e) => { const f = e.target.files && e.target.files[0]; if (!f) return; this.setState({ avatar: URL.createObjectURL(f) }); };
  onDelete = () => this.setState({ avatar: '' });
  avatarEl(fontSize) {
    const av = this.state.avatar;
    if (av) return React.createElement('img', { src: av, alt: 'Vivin Richard', style: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' } });
    return React.createElement('span', { style: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize, fontWeight: 700, color: 'var(--text)' } }, 'VR');
  }
  _onDocClick = (e) => { if (this.state.menuOpen && this._menuWrap && !this._menuWrap.contains(e.target)) this.setState({ menuOpen: false }); };
  _onKey = (e) => { if (e.key === 'Escape') { if (this.state.menuOpen) this.setState({ menuOpen: false }); if (this.state.pdfOpen) this.setState({ pdfOpen: false }); } };
  onLink = (e) => this.setState({ link: e.target.value });
  onNote = (e) => this.setState({ note: e.target.value });
  onSubmit = () => { if (!this.state.link.trim() || this.state.submitting) return; this.setState({ submitting: true }); setTimeout(() => this.setState({ submitting: false, submitted: true }), 1100); };
  onReset = () => this.setState({ link: '', note: '', submitted: false, submitting: false });
  darkVars = {'--bg':'#141312','--surface':'#1d1c1b','--surface2':'#242322','--border':'rgba(255,255,255,0.09)','--text':'#ECEBE9','--muted':'#9a9993','--faint':'#6e6d6a','--glow':'rgba(150,55,25,0.26)','--navbg':'rgba(20,19,18,0.82)','--footerbg':'#0a0a0a'};
  lightVars = {'--bg':'#f4f3f1','--surface':'#ffffff','--surface2':'#efeeec','--border':'rgba(0,0,0,0.10)','--text':'#191817','--muted':'#57564f','--faint':'#8b8a85','--glow':'rgba(245,90,40,0.12)','--navbg':'rgba(244,243,241,0.82)','--footerbg':'#1a1817'};

  setRoot = (el) => { this._root = el; };

  setDotCanvas = (el) => {
    if (!el || this._dotCanvas === el) return;
    this._dotCanvas = el;
    this._dotCtx = el.getContext('2d');

    this._icons = [
      // heart
      [".............","..##.....##..",".####...####.","#############","#############","#############",".###########.","..#########..","...#######...",".....###.....","......#......"],
      // star
      ["......#......","......#......",".....###.....","#############",".###########.","..#########..","...#######...","..###...###..",".##.......##.",".#.........#.","............."],
      // diamond
      ["......#......",".....###.....","....#####....","...#######...","..#########..",".###########.","..#########..","...#######...","....#####....",".....###.....","......#......"],
      // arrow
      ["......#......","......##.....","......###....","......####...","#############","#############","......####...","......###....","......##.....","......#......","............."],
    ];
    this._iconCols = 13; this._iconRows = 11;
    this._iconIndex = 0;
    this._holdFrames = 175;
    this._frameCount = 0;
    this._revealStart = 0;

    this._resizeDots = () => {
      const rect = el.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      el.width = rect.width * dpr;
      el.height = rect.height * dpr;
      this._dotCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this._dotW = rect.width; this._dotH = rect.height;
      const spacing = 20;
      this._cols = Math.ceil(rect.width / spacing) + 1;
      this._rows = Math.ceil(rect.height / spacing) + 1;
      this._inten = new Float32Array(this._cols * this._rows);
    };
    this._resizeDots();
    window.addEventListener('resize', this._resizeDots);

    const spacing = 20, radius = 1.4;
    const tick = () => {
      const ctx = this._dotCtx, w = this._dotW, h = this._dotH;
      if (!ctx || !w || !h) { this._dotRaf = requestAnimationFrame(tick); return; }
      const cols = this._cols, rows = this._rows;

      this._frameCount++;
      if (this._frameCount >= this._holdFrames) {
        this._frameCount = 0;
        this._iconIndex = (this._iconIndex + 1) % this._icons.length;
        this._revealStart = 0;
      }
      const pat = this._icons[this._iconIndex];
      const startCol = Math.floor((cols - this._iconCols) / 2);
      const startRow = Math.floor((rows - this._iconRows) / 2);
      const cCol = (this._iconCols - 1) / 2, cRow = (this._iconRows - 1) / 2;
      // center-out reveal radius grows after each switch
      this._revealStart += (12 - this._revealStart) * 0.06;
      const revealR = this._revealStart;

      ctx.clearRect(0, 0, w, h);
      const offX = (w - (cols - 1) * spacing) / 2, offY = (h - (rows - 1) * spacing) / 2;
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const li = i - startCol, lj = j - startRow;
          let target = 0;
          if (li >= 0 && li < this._iconCols && lj >= 0 && lj < this._iconRows && pat[lj][li] === '#') {
            const d = Math.sqrt((li - cCol) * (li - cCol) + (lj - cRow) * (lj - cRow));
            target = d <= revealR ? 1 : 0;
          }
          const idx = j * cols + i;
          this._inten[idx] += (target - this._inten[idx]) * 0.14;
          const t = this._inten[idx];
          const x = offX + i * spacing, y = offY + j * spacing;
          const r = radius + t * 1.9;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fillStyle = t > 0.015
            ? `rgba(245,60,20,${0.10 + t * 0.82})`
            : 'rgba(255,255,255,0.09)';
          ctx.fill();
        }
      }
      this._dotRaf = requestAnimationFrame(tick);
    };
    this._dotRaf = requestAnimationFrame(tick);
  };

  componentDidMount() {
    document.addEventListener('mousedown', this._onDocClick);
    document.addEventListener('keydown', this._onKey);
    this._tick = setInterval(() => this.setState({ now: Date.now() }), 1000);
    const root = this._root;
    if (!root) return;
    if (this.props.accent) root.style.setProperty('--accent', this.props.accent);
    const els = Array.from(root.querySelectorAll('[data-reveal]'));
    els.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(26px)';
      el.style.transition = 'opacity .8s cubic-bezier(.16,.84,.44,1), transform .8s cubic-bezier(.16,.84,.44,1)';
      const d = el.getAttribute('data-reveal-delay');
      if (d) el.style.transitionDelay = d + 'ms';
    });
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.style.opacity = '1';
          e.target.style.transform = 'none';
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });
    els.forEach(el => io.observe(el));
    this._io = io;
    // Safety: ensure nothing stays hidden (static capture / print / no-scroll)
    this._fallback = setTimeout(() => {
      els.forEach(el => { el.style.opacity = '1'; el.style.transform = 'none'; });
    }, 2200);
    const revealAll = () => els.forEach(el => { el.style.opacity = '1'; el.style.transform = 'none'; });
    window.addEventListener('beforeprint', revealAll);
  }

  componentWillUnmount() { if (this._io) this._io.disconnect(); if (this._tick) clearInterval(this._tick); document.removeEventListener('mousedown', this._onDocClick); document.removeEventListener('keydown', this._onKey); }

  toggle = () => {
    const dark = !this.state.dark;
    this.setState({ dark });
    const vars = dark ? this.darkVars : this.lightVars;
    Object.entries(vars).forEach(([k, v]) => this._root.style.setProperty(k, v));
    if (this.props.accent) this._root.style.setProperty('--accent', this.props.accent);
  };

  renderVals() {
    const s = this.state;
    const enabled = s.link.trim().length > 0;
    const submitClass = 'btn btn--primary btn--lg btn--block' + (s.submitting ? ' btn--loading' : '');
    const submitDisabled = !enabled || s.submitting;
    return {
      setRoot: this.setRoot,
      setDotCanvas: this.setDotCanvas,
      toggle: this.toggle,
      dark: this.state.dark,
      light: !this.state.dark,
      warmGlow: this.props.warmGlow ?? true,
      link: s.link, note: s.note, onLink: this.onLink, onNote: this.onNote,
      onSubmit: this.onSubmit, onReset: this.onReset, submitClass, submitDisabled,
      notSubmitted: !s.submitted, submitted: s.submitted,
      menuOpen: s.menuOpen, toggleMenu: this.toggleMenu, setMenuWrap: this.setMenuWrap,
      setFileInput: this.setFileInput, onEdit: this.onEdit, onDelete: this.onDelete, onFile: this.onFile,
      navAvatar: this.avatarEl('13px'), cardAvatar: this.avatarEl('27px'),
      pdfOpen: s.pdfOpen, openPdf: this.openPdf, closePdf: this.closePdf, stop: this.stop, onDownload: this.onDownload,
      countdown: this.fmtCountdown(),
    };
  }
}

export default Component;
