'use client';
import React from 'react';
import { DCLogic } from '@/lib/dc';

class Component extends DCLogic {
  state = { link: '', note: '', submitted: false, submitting: false, menuOpen: false, avatar: '/assets/vivin-avatar.png' };
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
  _onKey = (e) => { if (e.key === 'Escape' && this.state.menuOpen) this.setState({ menuOpen: false }); };
  componentDidMount() { document.addEventListener('mousedown', this._onDocClick); document.addEventListener('keydown', this._onKey); }
  componentWillUnmount() { document.removeEventListener('mousedown', this._onDocClick); document.removeEventListener('keydown', this._onKey); }
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
      navAvatar: this.avatarEl('13px'), cardAvatar: this.avatarEl('27px'),
    };
  }
}

export default Component;
