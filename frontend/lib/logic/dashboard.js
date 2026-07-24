'use client';
import React from 'react';
import { DCLogic } from '@/lib/dc';
import { SESSION } from '@/lib/workshop-content';

class Component extends DCLogic {
  // link/note/submit fields are dormant (the assignment-submission form is not
  // rendered in the new design — kept for when it's re-enabled). avatar: null =
  // show the session avatar (props.avatarUrl); '' = initials; string = local preview.
  // tab: 'upcoming' | 'past' — the workshops list toggle.
  state = { link: '', note: '', submitted: false, submitting: false, menuOpen: false, avatar: null, tab: 'upcoming', now: Date.now() };
  // Session start, from the shared SESSION so the badge can't drift from the copy.
  _target = new Date(SESSION.startsAt).getTime();
  fmtCountdown() {
    let d = Math.max(0, Math.floor((this._target - this.state.now) / 1000));
    const days = Math.floor(d / 86400); d -= days * 86400;
    const h = Math.floor(d / 3600); d -= h * 3600;
    const m = Math.floor(d / 60);
    return days > 0 ? days + 'd ' + h + 'h left' : h > 0 ? h + 'h ' + m + 'm left' : m + 'm left';
  }
  setTab = (tab) => this.setState({ tab });
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
  // A generic default user silhouette — used for the nav avatar next to Sign out
  // so it never shows the account photo or initials.
  defaultAvatarEl(iconSize) {
    return React.createElement('span', { style: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface2)', color: 'var(--muted)' } },
      React.createElement('svg', { width: iconSize, height: iconSize, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' }, [
        React.createElement('path', { key: 'b', d: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' }),
        React.createElement('circle', { key: 'h', cx: 12, cy: 7, r: 4 }),
      ]));
  }
  _onDocClick = (e) => { if (this.state.menuOpen && this._menuWrap && !this._menuWrap.contains(e.target)) this.setState({ menuOpen: false }); };
  _onKey = (e) => { if (e.key === 'Escape' && this.state.menuOpen) this.setState({ menuOpen: false }); };
  componentDidMount() { document.addEventListener('mousedown', this._onDocClick); document.addEventListener('keydown', this._onKey); this._tick = setInterval(() => this.setState({ now: Date.now() }), 60000); }
  componentWillUnmount() { document.removeEventListener('mousedown', this._onDocClick); document.removeEventListener('keydown', this._onKey); if (this._tick) clearInterval(this._tick); }
  onLink = (e) => this.setState({ link: e.target.value });
  onNote = (e) => this.setState({ note: e.target.value });
  onSubmit = () => { if (!this.state.link.trim() || this.state.submitting) return; this.setState({ submitting: true }); setTimeout(() => this.setState({ submitting: false, submitted: true }), 1100); };
  onReset = () => this.setState({ link: '', note: '', submitted: false, submitting: false });
  renderVals() {
    const s = this.state;
    const enabled = s.link.trim().length > 0;
    const submitClass = 'btn btn--primary btn--lg btn--block' + (s.submitting ? ' btn--loading' : '');
    const submitDisabled = !enabled || s.submitting;
    return {
      link: s.link, note: s.note, onLink: this.onLink, onNote: this.onNote,
      onSubmit: this.onSubmit, onReset: this.onReset, submitClass, submitDisabled,
      notSubmitted: !s.submitted, submitted: s.submitted,
      menuOpen: s.menuOpen, toggleMenu: this.toggleMenu, setMenuWrap: this.setMenuWrap,
      setFileInput: this.setFileInput, onEdit: this.onEdit, onDelete: this.onDelete, onFile: this.onFile,
      navAvatar: this.defaultAvatarEl(18), cardAvatar: this.avatarEl('27px'),
      name: this.props.name || 'Your profile', email: this.props.email || '',
      firstName: this.props.firstName || 'there', onSignOut: this.props.onSignOut,
      tab: s.tab, setTab: this.setTab, countdown: this.fmtCountdown(),
    };
  }
}

export default Component;
