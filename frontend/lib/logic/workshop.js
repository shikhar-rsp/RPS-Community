'use client';
import React from 'react';
import { DCLogic } from '@/lib/dc';
import { SESSION } from '@/lib/workshop-content';

class Component extends DCLogic {
  // avatar: null = show the session avatar (props.avatarUrl); '' = show initials; a
  // string = a locally-uploaded preview (cosmetic, not persisted).
  state = { link: '', note: '', submitted: false, submitting: false, menuOpen: false, avatar: null, pdfOpen: false, now: Date.now() };
  // Session start. Sourced from SESSION.startsAt in lib/workshop-content so the
  // countdown cannot drift from the date shown in the copy.
  _target = new Date(SESSION.startsAt).getTime();
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
    const av = this.state.avatar !== null ? this.state.avatar : (this.props.avatarUrl || '');
    const name = this.props.name || 'Your profile';
    const initials = this.props.initials || 'U';
    if (av) return React.createElement('img', { src: av, alt: name, style: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' } });
    return React.createElement('span', { style: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize, fontWeight: 700, color: 'var(--text)' } }, initials);
  }
  _onDocClick = (e) => { if (this.state.menuOpen && this._menuWrap && !this._menuWrap.contains(e.target)) this.setState({ menuOpen: false }); };
  _onKey = (e) => { if (e.key === 'Escape') { if (this.state.menuOpen) this.setState({ menuOpen: false }); if (this.state.pdfOpen) this.setState({ pdfOpen: false }); } };
  onLink = (e) => this.setState({ link: e.target.value });
  onNote = (e) => this.setState({ note: e.target.value });
  onSubmit = () => { if (!this.state.link.trim() || this.state.submitting) return; this.setState({ submitting: true }); setTimeout(() => this.setState({ submitting: false, submitted: true }), 1100); };
  onReset = () => this.setState({ link: '', note: '', submitted: false, submitting: false });

  setRoot = (el) => { this._root = el; };
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

  renderVals() {
    const s = this.state;
    const enabled = s.link.trim().length > 0;
    const submitClass = 'btn btn--primary btn--lg btn--block' + (s.submitting ? ' btn--loading' : '');
    const submitDisabled = !enabled || s.submitting;
    return {
      setRoot: this.setRoot,
      warmGlow: this.props.warmGlow ?? true,
      link: s.link, note: s.note, onLink: this.onLink, onNote: this.onNote,
      onSubmit: this.onSubmit, onReset: this.onReset, submitClass, submitDisabled,
      notSubmitted: !s.submitted, submitted: s.submitted,
      menuOpen: s.menuOpen, toggleMenu: this.toggleMenu, setMenuWrap: this.setMenuWrap,
      setFileInput: this.setFileInput, onEdit: this.onEdit, onDelete: this.onDelete, onFile: this.onFile,
      navAvatar: this.avatarEl('13px'), cardAvatar: this.avatarEl('27px'),
      name: this.props.name || 'Your profile', email: this.props.email || '', onSignOut: this.props.onSignOut,
      pdfOpen: s.pdfOpen, openPdf: this.openPdf, closePdf: this.closePdf, stop: this.stop, onDownload: this.onDownload,
      countdown: this.fmtCountdown(),
    };
  }
}

export default Component;
