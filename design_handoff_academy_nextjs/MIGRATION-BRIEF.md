# Migration Brief — Next.js (Zero Visual Changes)

> This is the binding requirements document for the migration. Pair it with
> `README.md` (route map, tokens, per-page interaction inventory) and the design
> files in `design-source/`.

## Task
Convert the entire existing website to Next.js while preserving the current
website **exactly** as it is.

## Primary objective
This is strictly a **framework migration, not a redesign**. Migrate the existing
project to Next.js without making any visual, UX, interaction, or design
modifications. The final result must be **pixel-perfect** compared to the current
website.

## Critical requirement
- Do NOT redesign anything.
- Do NOT attempt to improve the UI.
- Do NOT modernize components.
- Do NOT change spacing.
- Do NOT update typography.
- Do NOT adjust colors.
- Do NOT improve responsiveness beyond what already exists.
- Do NOT introduce your own styling decisions.
- Treat the existing website as the single source of truth.

## Visual fidelity
The migrated site must match the current site in every way: layout, spacing,
margins, padding, typography, font families, sizes, weights, letter spacing, line
heights, colors, gradients, shadows, borders, border radius, images, icons, SVGs,
animations, hover effects, scroll animations, sticky sections, responsive
behavior, component sizing, section ordering, white space, visual hierarchy.
Side-by-side screenshots of the original and the Next.js version must show **no
visible differences**.

## Functional requirements
Preserve every existing interaction: navigation, buttons, links, forms, inputs,
dropdowns, accordions, tabs, carousels, sliders, scroll effects, animations,
hover states, mobile menu, responsive layouts, and any JavaScript functionality.
No existing functionality may break during migration.

## Next.js requirements
- Use the Next.js **App Router** (unless instructed otherwise).
- Organize pages using the standard Next.js structure.
- Convert reusable sections into reusable React components.
- Keep styles exactly the same; preserve the current CSS architecture where
  possible.
- Use Next.js routing instead of static HTML navigation.
- Use `next/image` **only** where it introduces no visual change (no altered
  sizing, cropping, or layout shift). When unsure, use a plain `<img>`.
- Optimize project structure without changing the rendered output.

## Performance
You may improve code organization, component structure, file organization,
reusability, and build optimization — but these must **never** affect the UI or
user experience.

## What NOT to change
Do not: redesign sections, change layouts, change spacing, change typography,
change colors, replace icons, replace images, introduce new animations, remove
existing animations, alter the UI in the name of accessibility, modify
responsiveness, change breakpoints, rearrange content, rename visible text, add
new features, or remove existing features.

## Expected deliverable
The final website must be: built entirely with Next.js, structurally clean and
maintainable, componentized where appropriate, fully functional, pixel-perfect
with the existing website, and visually indistinguishable from the original.

**Remember:** This is a technology migration only. Change the underlying framework
to Next.js while ensuring the website looks and behaves exactly the same in every
respect. No visual or UX changes unless explicitly requested later.
