'use client';
import React from 'react';
import { DCLogic } from '@/lib/dc';

class Component extends DCLogic {
  state = { step: 1, name: '', role: null, goals: [], tools: [] };

  roles = [
    { id: 'student', title: 'Design student', desc: 'Learning the craft.' },
    { id: 'switcher', title: 'Career switcher', desc: 'Coming from graphic, web, or another field.' },
    { id: 'junior', title: 'Junior designer', desc: '0–2 years in product design.' },
    { id: 'senior', title: 'Mid-level / senior', desc: '3+ years, leveling up.' },
    { id: 'lead', title: 'Lead / mentor', desc: 'Want to teach and contribute.' },
  ];
  goalsList = ['Become industry-ready','Ship faster with AI','Get better at Figma','Learn design systems','Switch from graphic design','Sharpen design critique','Build a stronger portfolio','Teach what I know'];
  toolsList = ['Figma','Framer','Webflow','Notion','Midjourney','ChatGPT','Maze','Zeplin'];

  onName = (e) => this.setState({ name: e.target.value });
  selectRole = (id) => this.setState({ role: id });
  toggle = (key, val) => this.setState(s => {
    const arr = s[key];
    return { [key]: arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val] };
  });
  next = () => { if (this.canNext()) this.setState(s => ({ step: Math.min(4, s.step + 1) })); };
  back = () => this.setState(s => ({ step: Math.max(1, s.step - 1) }));

  canNext() {
    const s = this.state;
    if (s.step === 1) return s.name.trim().length > 0 && !!s.role;
    if (s.step === 2) return s.goals.length > 0;
    if (s.step === 3) return s.tools.length > 0;
    return true;
  }

  renderVals() {
    const s = this.state;
    const seg = (n) => (s.step >= n ? '100%' : '0%');
    const cardBase = 'text-align:left;font-family:inherit;cursor:pointer;border-radius:16px;padding:18px 20px;transition:border-color .22s,background .22s,transform .18s,box-shadow .22s';
    const chipBase = 'font-family:inherit;cursor:pointer;font-weight:600;font-size:14.5px;padding:11px 18px;border-radius:999px;transition:border-color .2s,background .2s,color .2s,transform .18s';
    const toolBase = 'font-family:inherit;cursor:pointer;font-weight:600;font-size:15px;padding:16px;border-radius:14px;text-align:center;transition:border-color .2s,background .2s,color .2s,transform .18s';

    const roleStyle = (id) => cardBase + ';' + (s.role === id
      ? 'background:rgba(245,60,20,0.10);border:1px solid rgba(255,120,60,0.6);box-shadow:0 0 0 1px rgba(255,120,60,0.35),0 16px 44px -16px rgba(245,60,20,0.6);transform:translateY(-3px)'
      : 'background:var(--surface2);border:1px solid var(--border)');
    const iconWrap = (id) => 'width:40px;height:40px;flex:none;border-radius:11px;display:flex;align-items:center;justify-content:center;transition:background .22s,color .22s;' + (s.role === id
      ? 'background:rgba(245,60,20,0.16);color:#ff8a5f'
      : 'background:var(--bg);border:1px solid var(--border);color:var(--muted)');
    const goalChips = this.goalsList.map(g => {
      const sel = s.goals.includes(g);
      const style = chipBase + ';' + (sel
        ? 'background:rgba(245,60,20,0.14);border:1px solid rgba(255,120,60,0.6);color:#ff8a5f'
        : 'background:var(--surface2);border:1px solid var(--border);color:var(--text)');
      return { label: g, style, onSelect: () => this.toggle('goals', g) };
    });
    const toolCards = this.toolsList.map(t => {
      const sel = s.tools.includes(t);
      const style = toolBase + ';' + (sel
        ? 'background:rgba(245,60,20,0.12);border:1px solid rgba(255,120,60,0.6);color:#ff8a5f;transform:translateY(-2px)'
        : 'background:var(--surface2);border:1px solid var(--border);color:var(--text)');
      return { label: t, style, onSelect: () => this.toggle('tools', t) };
    });

    const enabled = this.canNext();
    const continueStyle = 'display:inline-flex;align-items:center;gap:9px;font-family:inherit;font-weight:700;font-size:15.5px;padding:13px 26px;border-radius:999px;border:none;transition:transform .2s,filter .2s,opacity .2s;' + (enabled
      ? 'background:linear-gradient(180deg,#FF6A38,#F5330A);color:#1c0a03;cursor:pointer;box-shadow:0 12px 34px -12px rgba(245,60,20,0.7)'
      : 'background:var(--surface2);color:var(--faint);cursor:not-allowed;opacity:0.7');

    const roleLabel = (this.roles.find(r => r.id === s.role) || {}).title || 'your path';
    const summary = "We'll set up your home around " + roleLabel.toLowerCase() + ' · ' + s.goals.length + ' goal' + (s.goals.length === 1 ? '' : 's') + ' · ' + s.tools.length + ' tool' + (s.tools.length === 1 ? '' : 's') + '.';

    return {
      isStep1: s.step === 1, isStep2: s.step === 2, isStep3: s.step === 3, isStep4: s.step === 4,
      seg1: seg(1), seg2: seg(2), seg3: seg(3), seg4: seg(4),
      name: s.name, onName: this.onName,
      goalChips, toolCards,
      rStudent: roleStyle('student'), rSwitcher: roleStyle('switcher'), rJunior: roleStyle('junior'), rSenior: roleStyle('senior'), rLead: roleStyle('lead'),
      iStudent: iconWrap('student'), iSwitcher: iconWrap('switcher'), iJunior: iconWrap('junior'), iSenior: iconWrap('senior'), iLead: iconWrap('lead'),
      selStudent: () => this.selectRole('student'), selSwitcher: () => this.selectRole('switcher'), selJunior: () => this.selectRole('junior'), selSenior: () => this.selectRole('senior'), selLead: () => this.selectRole('lead'),
      continueDisabled: !enabled, onNext: this.next, onBack: this.back,
      summary, nameSuffix: s.name.trim() ? ', ' + s.name.trim() : '',
    };
  }
}

export default Component;
