'use client';
import { DCLogic } from '@/lib/dc';

class Component extends DCLogic {
  state = { step: 1, name: '', email: '', password: '', role: null, goals: [], tools: [], submitting: false, error: '', needsEmailConfirm: false };

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
  onEmail = (e) => this.setState({ email: e.target.value });
  onPassword = (e) => this.setState({ password: e.target.value });
  selectRole = (id) => this.setState({ role: id });
  toggle = (key, val) => this.setState(s => {
    const arr = s[key];
    return { [key]: arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val] };
  });

  emailValid() { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.state.email); }

  canNext() {
    const s = this.state;
    if (s.step === 1) return s.name.trim().length > 0 && !!s.role && this.emailValid() && s.password.length >= 8;
    if (s.step === 2) return s.goals.length > 0;
    if (s.step === 3) return s.tools.length > 0;
    return true;
  }

  // Steps 1-2 just advance; step 3's "Continue" creates the account via onFinish.
  next = () => {
    if (!this.canNext() || this.state.submitting) return;
    if (this.state.step < 3) { this.setState(s => ({ step: s.step + 1, error: '' })); return; }
    this.finish();
  };
  back = () => this.setState(s => ({ step: Math.max(1, s.step - 1), error: '' }));

  async finish() {
    const s = this.state;
    this.setState({ submitting: true, error: '' });
    let res = { ok: false, error: 'Signup is unavailable right now.' };
    try {
      res = await this.props.onFinish({
        email: s.email, password: s.password, name: s.name.trim(),
        role: s.role, goals: s.goals, tools: s.tools,
      });
    } catch (e) {
      res = { ok: false, error: (e && e.message) || 'Something went wrong.' };
    }
    if (res && res.ok) this.setState({ submitting: false, step: 4, needsEmailConfirm: !!res.needsConfirm });
    else this.setState({ submitting: false, error: (res && res.error) || 'Could not create your account.' });
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
    const roleLabel = (this.roles.find(r => r.id === s.role) || {}).title || 'your path';
    const summary = "We'll set up your home around " + roleLabel.toLowerCase() + ' · ' + s.goals.length + ' goal' + (s.goals.length === 1 ? '' : 's') + ' · ' + s.tools.length + ' tool' + (s.tools.length === 1 ? '' : 's') + '.';

    return {
      isStep1: s.step === 1, isStep2: s.step === 2, isStep3: s.step === 3, isStep4: s.step === 4,
      seg1: seg(1), seg2: seg(2), seg3: seg(3), seg4: seg(4),
      name: s.name, onName: this.onName,
      email: s.email, password: s.password, onEmail: this.onEmail, onPassword: this.onPassword,
      goalChips, toolCards,
      rStudent: roleStyle('student'), rSwitcher: roleStyle('switcher'), rJunior: roleStyle('junior'), rSenior: roleStyle('senior'), rLead: roleStyle('lead'),
      iStudent: iconWrap('student'), iSwitcher: iconWrap('switcher'), iJunior: iconWrap('junior'), iSenior: iconWrap('senior'), iLead: iconWrap('lead'),
      selStudent: () => this.selectRole('student'), selSwitcher: () => this.selectRole('switcher'), selJunior: () => this.selectRole('junior'), selSenior: () => this.selectRole('senior'), selLead: () => this.selectRole('lead'),
      continueDisabled: !enabled || s.submitting, submitting: s.submitting, onNext: this.next, onBack: this.back,
      error: s.error, needsEmailConfirm: s.needsEmailConfirm, goDashboard: this.props.goDashboard,
      summary, nameSuffix: s.name.trim() ? ', ' + s.name.trim() : '',
    };
  }
}

export default Component;
