# Brand Colors — RPS Academy

Use this color system: a warm-paper / ember-orange identity.

## The signature — 5 colors

| Color | Hex | Role |
| --- | --- | --- |
| Brand | `#FF630B` | The signature orange. **Fills and graphics only, never small text** — it clears just 2.97:1 on white. |
| Accent | `#C24405` | The text-safe orange: links, labels, icons, button fills. |
| Deep | `#5A2204` | An **always-dark** orange surface — stays dark in both themes, so its contents can use fixed light values. |
| Paper | `#FCFBFA` | Warm paper ground, light theme. |
| Night | `#13100E` | Warm near-black ground, dark theme. |

## Brand group — light theme

| Token | Hex | Role |
| --- | --- | --- |
| `--brand` | `#FF630B` | Signature; fills and graphics, never small text |
| `--brand-2` | `#FF8438` | Lighter brand, gradient partner |
| `--accent` | `#C24405` | Text-safe orange |
| `--accent-ink` | `#9A3604` | Pressed / stronger accent |
| `--on-accent` | `#FFFFFF` | What reads on `--accent` |
| `--accent-soft` | `#FFF1E8` | Faintest orange wash |
| `--tint` | `#FFE0CC` | Tinted fill |
| `--tint-2` | `#FFB27A` | Stronger tint, gradient end |
| `--heading` | `#6B2A05` | Headings on light surfaces |
| `--heading-2` | `#8F6041` | The quieter half of a two-tone hero line |
| `--deep` | `#5A2204` | Always-dark orange surface |

## Brand group — dark theme

Muted, not neon: same lightness, saturation pulled well back. Full-saturation
orange on near-black is what makes a palette glow.

| Token | Hex |
| --- | --- |
| `--brand` | `#DB6B2C` |
| `--brand-2` | `#E8894F` |
| `--accent` | `#E9925C` |
| `--accent-ink` | `#F0A879` |
| `--on-accent` | `#2A1203` |
| `--accent-soft` | `#2C1B11` |
| `--tint` | `#3D2415` |
| `--tint-2` | `#E3A87F` |
| `--heading` | `#FBF4EE` |
| `--heading-2` | `#C9A98F` |
| `--deep` | `#63290A` |

## Button fills — a separate pair from `--accent`

`--accent` has to stay light enough to read *as text* on a dark page; a button
fill wants to go the other way, deep enough that white sits on it. One token
each way keeps both honest.

| Theme | Fill | Hover / pressed | Ink |
| --- | --- | --- | --- |
| Light | `#C24405` | `#9A3604` | `#FFFFFF` |
| Dark | `#C4340A` | `#A62B07` | `#FFF6F0` |

## CSS

```css
:root{
  --brand:      #FF630B;
  --brand-2:    #FF8438;
  --accent:     #C24405;
  --accent-ink: #9A3604;
  --on-accent:  #FFFFFF;
  --accent-soft:#FFF1E8;
  --tint:       #FFE0CC;
  --tint-2:     #FFB27A;
  --heading:    #6B2A05;
  --heading-2:  #8F6041;
  --deep:       #5A2204;

  --paper:      #FCFBFA;
  --btn-fill:   #C24405;
  --btn-fill-2: #9A3604;
  --btn-ink:    #FFFFFF;
}

:root[data-theme="dark"]{
  --brand:      #DB6B2C;
  --brand-2:    #E8894F;
  --accent:     #E9925C;
  --accent-ink: #F0A879;
  --on-accent:  #2A1203;
  --accent-soft:#2C1B11;
  --tint:       #3D2415;
  --tint-2:     #E3A87F;
  --heading:    #FBF4EE;
  --heading-2:  #C9A98F;
  --deep:       #63290A;

  --paper:      #13100E;
  --btn-fill:   #C4340A;
  --btn-fill-2: #A62B07;
  --btn-ink:    #FFF6F0;
}
```

---

Source: `assets/css/app.css` — https://rps-academy.netlify.app/
