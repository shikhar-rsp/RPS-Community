"use client";

import { useState } from "react";
import { css } from "@/lib/css";

// A generic element that merges an extra style set while hovered — replaces the
// original DC runtime's `style-hover="..."` pseudo-class attribute.
//
//   <Box as="div" style="padding:20px" hover="border-color:red">…</Box>
//
// `style` / `hover` accept either a CSS string (parsed with css()) or an object.
export function Box({ as = "div", style, hover, children, ...rest }) {
  const [isHover, setHover] = useState(false);
  const base = typeof style === "string" ? css(style) : style || {};
  const over = hover ? (typeof hover === "string" ? css(hover) : hover) : null;
  const Tag = as;
  return (
    <Tag
      {...rest}
      style={isHover && over ? { ...base, ...over } : base}
      onMouseEnter={(e) => {
        setHover(true);
        rest.onMouseEnter && rest.onMouseEnter(e);
      }}
      onMouseLeave={(e) => {
        setHover(false);
        rest.onMouseLeave && rest.onMouseLeave(e);
      }}
    >
      {children}
    </Tag>
  );
}
