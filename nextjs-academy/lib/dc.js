'use client';
import { useRef, useReducer, useEffect } from 'react';

// Parse a CSS declaration string into a React style object.
// Handles custom properties (--x), vendor prefixes, and plain props.
export function css(str) {
  if (!str) return {};
  if (typeof str === 'object') return str;
  const out = {};
  String(str).split(';').forEach((decl) => {
    const d = decl.trim();
    if (!d) return;
    const i = d.indexOf(':');
    if (i < 0) return;
    const prop = d.slice(0, i).trim();
    const val = d.slice(i + 1).trim();
    if (prop.startsWith('--')) {
      out[prop] = val;
    } else {
      const key = prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      out[key] = val;
    }
  });
  return out;
}

// Minimal React adapter that lets the original DC logic classes run unchanged.
export class DCLogic {
  setState(patch, cb) {
    const next = typeof patch === 'function' ? patch(this.state) : patch;
    this.state = { ...this.state, ...next };
    if (this.__force) this.__force();
    if (cb) cb();
  }
  forceUpdate() {
    if (this.__force) this.__force();
  }
}

export function useDcLogic(LogicClass, props) {
  const [, force] = useReducer((x) => x + 1, 0);
  const ref = useRef(null);
  if (!ref.current) {
    const inst = new LogicClass();
    inst.props = props || {};
    inst.__force = force;
    if (inst.state === undefined) inst.state = {};
    ref.current = inst;
  }
  const inst = ref.current;
  inst.props = props || {};
  useEffect(() => {
    if (inst.componentDidMount) inst.componentDidMount();
    return () => {
      if (inst.componentWillUnmount) inst.componentWillUnmount();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return inst.renderVals ? inst.renderVals() : {};
}
