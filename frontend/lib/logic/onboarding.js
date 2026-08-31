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

  // 'signup' (default) collects email + password and creates the account.
  // 'complete' is for users already authenticated (e.g. Google) who only need
  // to fill in role/goals/tools — no credentials, name pre-filled.
  get isComplete() { return this.props.mode === 'complete'; }

  // The OAuth name arrives asynchronously (fetched by the page), so seed it the
  // first time it's available rather than only at mount. Guarded so it runs once
  // and never clobbers what the user has typed.
  maybeSeedName() {
    if (this.isComplete && !this._nameSeeded && this.props.initialName && !this.state.name) {
      this._nameSeeded = true;
      queueMicrotask(() => this.setState({ name: this.props.initialName }));
    }
  }

  onName = (e) => { this._nameSeeded = true; this.setState({ name: e.target.value }); };
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
    if (s.step === 1) {
      // Complete mode: the user is already authenticated — only role is needed.
      if (this.isComplete) return s.name.trim().length > 0 && !!s.role;
      return s.name.trim().length > 0 && !!s.role && this.emailValid() && s.password.length >= 8;
    }
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
    this.maybeSeedName();
    const s = this.state;
    const enabled = this.canNext();
    const roleLabel = (this.roles.find(r => r.id === s.role) || {}).title || 'your path';
    const summary =
      "We'll set up your home around " + roleLabel.toLowerCase() +
      ' · ' + s.goals.length + ' goal' + (s.goals.length === 1 ? '' : 's') +
      ' · ' + s.tools.length + ' tool' + (s.tools.length === 1 ? '' : 's') + '.';

    return {
      // Step state. The view styles itself from CSS classes + aria-pressed, so
      // nothing here hands out colours any more.
      step: s.step,
      isStep1: s.step === 1, isStep2: s.step === 2, isStep3: s.step === 3, isStep4: s.step === 4,

      // Fields
      name: s.name, onName: this.onName,
      email: s.email, password: s.password, onEmail: this.onEmail, onPassword: this.onPassword,

      // Choices
      roles: this.roles, goalsList: this.goalsList, toolsList: this.toolsList,
      role: s.role, goals: s.goals, tools: s.tools,
      selectRole: this.selectRole,
      toggleGoal: (g) => this.toggle('goals', g),
      toggleTool: (t) => this.toggle('tools', t),

      // Flow
      continueDisabled: !enabled || s.submitting, submitting: s.submitting,
      onNext: this.next, onBack: this.back,
      error: s.error, needsEmailConfirm: s.needsEmailConfirm,
      goDashboard: this.props.goDashboard,
      summary, nameSuffix: s.name.trim() ? ', ' + s.name.trim() : '',
      isComplete: this.isComplete,
      submitLabel: this.isComplete ? 'Finish' : 'Create account',
    };
  }
}

export default Component;
