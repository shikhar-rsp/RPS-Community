'use client';
import { DCLogic } from '@/lib/dc';
import { isValidEmail, suggestEmail } from '@/lib/email';
import { passwordError, passwordScore, isValidPassword, PASSWORD_RULES, STRENGTH_LABELS } from '@/lib/password';
import { phoneError, isValidPhone, DEFAULT_DIAL_CODE } from '@/lib/phone';

/* Signup, in two steps.
   Step 1 is everything we need to create the account. Step 2 is who they are.
   Step 3 is the confirmation screen, not a form.

   Errors surface on BLUR, not only on submit, and nothing the user typed is
   ever wiped by a failed submit — the whole state lives here and the fields
   read from it. */
class Component extends DCLogic {
  state = {
    step: 1,
    // step 1
    name: '', email: '', mobile: DEFAULT_DIAL_CODE, password: '', confirm: '',
    organisation: '', terms: false, showPassword: false,
    // step 2
    role: null, goals: [], tools: [], yearOfStudy: '', department: '', howHeard: '',
    // meta
    touched: {}, submitting: false, error: '', duplicateEmail: '', needsEmailConfirm: false,
  };

  roles = [
    { id: 'student', title: 'Design student', desc: 'Learning the craft.' },
    { id: 'switcher', title: 'Career switcher', desc: 'Coming from graphic, web, or another field.' },
    { id: 'junior', title: 'Junior designer', desc: '0–2 years in product design.' },
    { id: 'senior', title: 'Mid-level / senior', desc: '3+ years, leveling up.' },
    { id: 'lead', title: 'Lead / mentor', desc: 'Want to teach and contribute.' },
  ];
  goalsList = ['Become industry-ready','Ship faster with AI','Get better at Figma','Learn design systems','Switch from graphic design','Sharpen design critique','Build a stronger portfolio','Teach what I know'];
  toolsList = ['Figma','Framer','Webflow','Notion','Midjourney','ChatGPT','Maze','Zeplin'];
  howHeardList = ['A friend or colleague','LinkedIn','Instagram','WhatsApp group','Google search','At a college or event','Somewhere else'];

  /* 'complete' = already authenticated (e.g. Google) and only filling in the
     profile. No credentials are collected in that mode. */
  get isComplete() { return this.props.mode === 'complete'; }

  maybeSeedName() {
    if (this.isComplete && !this._nameSeeded && this.props.initialName && !this.state.name) {
      this._nameSeeded = true;
      queueMicrotask(() => this.setState({ name: this.props.initialName }));
    }
  }

  set = (key) => (e) => {
    const v = e && e.target ? (e.target.type === 'checkbox' ? e.target.checked : e.target.value) : e;
    this.setState({ [key]: v, error: '', duplicateEmail: '' });
  };
  onName = (e) => { this._nameSeeded = true; this.set('name')(e); };
  blur = (key) => () => this.setState((s) => ({ touched: { ...s.touched, [key]: true } }));
  toggleShowPassword = () => this.setState((s) => ({ showPassword: !s.showPassword }));
  acceptEmailSuggestion = () => {
    const fix = suggestEmail(this.state.email);
    if (fix) this.setState({ email: fix });
  };
  selectRole = (id) => this.setState({ role: id });
  toggle = (key, val) => this.setState((s) => {
    const arr = s[key];
    return { [key]: arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val] };
  });

  /* One place that decides whether a field is wrong. The view only asks
     "is this field in error, and has it been touched". */
  fieldError(key) {
    const s = this.state;
    switch (key) {
      case 'name':
        return s.name.trim().length < 2 ? 'Tell us your name.' : null;
      case 'email':
        if (this.isComplete) return null;
        if (!s.email.trim()) return 'We need an email address.';
        return isValidEmail(s.email) ? null : 'That email doesn’t look right.';
      case 'mobile':
        return phoneError(s.mobile);
      case 'password':
        if (this.isComplete) return null;
        return passwordError(s.password);
      case 'confirm':
        if (this.isComplete) return null;
        if (!s.confirm) return 'Type the password again.';
        return s.confirm === s.password ? null : 'Those don’t match.';
      case 'organisation':
        return s.organisation.trim().length < 2 ? 'Where are you studying or working?' : null;
      case 'terms':
        return s.terms ? null : 'Please accept the terms to continue.';
      default:
        return null;
    }
  }

  // Shown only once the user has left the field, so nothing screams at them mid-type.
  visibleError(key) {
    return this.state.touched[key] ? this.fieldError(key) : null;
  }

  step1Fields() {
    return this.isComplete
      ? ['name', 'mobile', 'organisation', 'terms']
      : ['name', 'email', 'mobile', 'password', 'confirm', 'organisation', 'terms'];
  }

  canNext() {
    const s = this.state;
    if (s.step === 1) return this.step1Fields().every((f) => !this.fieldError(f));
    if (s.step === 2) return !!s.role;
    return true;
  }

  /* Submitting an incomplete step marks everything touched so every problem
     appears at once, rather than one per attempt. */
  next = () => {
    if (this.state.submitting) return;
    if (!this.canNext()) {
      if (this.state.step === 1) {
        const touched = { ...this.state.touched };
        this.step1Fields().forEach((f) => { touched[f] = true; });
        this.setState({ touched });
      }
      return;
    }
    if (this.state.step < 2) { this.setState((s) => ({ step: s.step + 1, error: '' })); return; }
    this.finish();
  };
  back = () => this.setState((s) => ({ step: Math.max(1, s.step - 1), error: '' }));

  async finish() {
    const s = this.state;
    this.setState({ submitting: true, error: '', duplicateEmail: '' });
    let res = { ok: false, error: 'Signup is unavailable right now.' };
    try {
      res = await this.props.onFinish({
        email: s.email.trim().toLowerCase(),
        password: s.password,
        name: s.name.trim(),
        mobile: s.mobile.trim(),
        organisation: s.organisation.trim(),
        role: s.role,
        goals: s.goals,
        tools: s.tools,
        yearOfStudy: s.yearOfStudy.trim(),
        department: s.department.trim(),
        howHeard: s.howHeard,
        termsAcceptedAt: new Date().toISOString(),
      });
    } catch (e) {
      res = { ok: false, error: (e && e.message) || 'Something went wrong. Please try again.' };
    }

    if (res && res.ok) {
      this.setState({ submitting: false, step: 3, needsEmailConfirm: !!res.needsConfirm });
      return;
    }
    // A taken email is a routine outcome, not an error to apologise for — the
    // view turns this into a "Log in instead" button with the address carried.
    if (res && res.duplicate) {
      this.setState({ submitting: false, step: 1, duplicateEmail: s.email.trim().toLowerCase() });
      return;
    }
    this.setState({ submitting: false, error: (res && res.error) || 'Could not create your account.' });
  }

  renderVals() {
    this.maybeSeedName();
    const s = this.state;
    const roleLabel = (this.roles.find((r) => r.id === s.role) || {}).title || 'your path';
    const summary =
      "We'll set up your home around " + roleLabel.toLowerCase() +
      (s.goals.length ? ` · ${s.goals.length} goal${s.goals.length === 1 ? '' : 's'}` : '') +
      (s.tools.length ? ` · ${s.tools.length} tool${s.tools.length === 1 ? '' : 's'}` : '') + '.';

    return {
      step: s.step,
      isStep1: s.step === 1, isStep2: s.step === 2, isDone: s.step === 3,
      totalSteps: 2,

      // values + handlers
      name: s.name, onName: this.onName,
      email: s.email, onEmail: this.set('email'),
      mobile: s.mobile, onMobile: this.set('mobile'),
      password: s.password, onPassword: this.set('password'),
      confirm: s.confirm, onConfirm: this.set('confirm'),
      organisation: s.organisation, onOrganisation: this.set('organisation'),
      terms: s.terms, onTerms: this.set('terms'),
      yearOfStudy: s.yearOfStudy, onYearOfStudy: this.set('yearOfStudy'),
      department: s.department, onDepartment: this.set('department'),
      howHeard: s.howHeard, onHowHeard: this.set('howHeard'),
      onBlur: this.blur,
      err: (k) => this.visibleError(k),

      // password affordances
      showPassword: s.showPassword, toggleShowPassword: this.toggleShowPassword,
      passwordScore: passwordScore(s.password),
      passwordStrength: STRENGTH_LABELS[passwordScore(s.password)],
      passwordRules: PASSWORD_RULES.map((r) => ({ id: r.id, label: r.label, met: r.test(s.password) })),

      // email typo guard
      emailSuggestion: suggestEmail(s.email),
      acceptEmailSuggestion: this.acceptEmailSuggestion,

      // step 2
      roles: this.roles, goalsList: this.goalsList, toolsList: this.toolsList,
      howHeardList: this.howHeardList,
      role: s.role, goals: s.goals, tools: s.tools,
      selectRole: this.selectRole,
      toggleGoal: (g) => this.toggle('goals', g),
      toggleTool: (t) => this.toggle('tools', t),
      isStudent: s.role === 'student',

      // flow
      continueDisabled: s.submitting,
      submitting: s.submitting,
      onNext: this.next, onBack: this.back,
      error: s.error, duplicateEmail: s.duplicateEmail,
      needsEmailConfirm: s.needsEmailConfirm,
      goDashboard: this.props.goDashboard,
      summary, nameSuffix: s.name.trim() ? ', ' + s.name.trim().split(' ')[0] : '',
      isComplete: this.isComplete,
      submitLabel: this.isComplete ? 'Finish' : 'Create account',
    };
  }
}

export default Component;
