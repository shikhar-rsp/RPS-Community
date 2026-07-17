// Converts an inline-CSS string ("a:b;c:d") into a React style object.
// Mirrors the behaviour of the original DC runtime's cssToObj so the inline
// styles from the source HTML can be pasted verbatim into JSX.
function kebabToCamel(s) {
  return s.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

export function css(str) {
  if (!str || typeof str !== "string") return undefined;
  const o = {};
  for (const decl of str.split(";")) {
    const i = decl.indexOf(":");
    if (i < 0) continue;
    const prop = decl.slice(0, i).trim();
    if (!prop) continue;
    const val = decl.slice(i + 1).trim();
    // Preserve CSS custom properties (--x) as-is; camelCase everything else.
    o[prop.startsWith("--") ? prop : kebabToCamel(prop)] = val;
  }
  return o;
}
