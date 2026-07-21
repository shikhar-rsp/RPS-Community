'use client';
import { DCLogic } from '@/lib/dc';

class Component extends DCLogic {
  state = { dark: true };
  darkVars = {'--bg':'#141312','--surface':'#1d1c1b','--surface2':'#242322','--border':'rgba(255,255,255,0.09)','--text':'#ECEBE9','--muted':'#9a9993','--faint':'#6e6d6a','--glow':'rgba(150,55,25,0.26)','--navbg':'rgba(20,19,18,0.82)','--footerbg':'#0a0a0a'};
  lightVars = {'--bg':'#f4f3f1','--surface':'#ffffff','--surface2':'#efeeec','--border':'rgba(0,0,0,0.10)','--text':'#191817','--muted':'#57564f','--faint':'#8b8a85','--glow':'rgba(245,90,40,0.12)','--navbg':'rgba(244,243,241,0.82)','--footerbg':'#1a1817'};

  setRoot = (el) => { this._root = el; };
  componentDidMount() {
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

  componentWillUnmount() { if (this._io) this._io.disconnect(); }

  toggle = () => {
    const dark = !this.state.dark;
    this.setState({ dark });
    const vars = dark ? this.darkVars : this.lightVars;
    Object.entries(vars).forEach(([k, v]) => this._root.style.setProperty(k, v));
    if (this.props.accent) this._root.style.setProperty('--accent', this.props.accent);
  };

  renderVals() {
    return {
      setRoot: this.setRoot,
      toggle: this.toggle,
      dark: this.state.dark,
      light: !this.state.dark,
      warmGlow: this.props.warmGlow ?? true,
    };
  }
}

export default Component;
