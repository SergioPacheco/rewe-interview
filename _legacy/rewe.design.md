---
version: alpha
name: Just a moment...
description: "A light interface extracted from Just a moment... accented with #1c1c1c, with a 8px spacing system and a UnitRoundedOT type stack."

colors:
  primary: "#1c1c1c"
  on-primary: "#ffffff"
  background: "#f1f1f1"
  border: "#cccccc"
  text: "#1c1c1c"

typography:
  display:
    fontFamily: "ReweMato, UnitRoundedOT, sans-serif"
    fontSize: 40px
    fontWeight: 700
    lineHeight: 1.2
  heading:
    fontFamily: "UnitRoundedOT, sans-serif"
    fontSize: 20px
    fontWeight: 400
    lineHeight: 1.4
  body:
    fontFamily: "UnitRoundedOT, sans-serif"
    fontSize: 16px
    fontWeight: 500
    lineHeight: 1.5

spacing:
  base: 8px
  scale: [8, 16, 24, 32, 40, 48, 88, 96, 128, 160]

radius:
  sm: 2px

shadows:
  card: "rgb(204, 204, 204) 0px -1px 0px 0px inset"
  elevated: "rgb(204, 204, 204) 0px -1px 0px 0px inset"

motion:
  easing: "ease"

breakpoints: [768px, 920px, 1024px]
---

## Rationale

Measured design tokens extracted from https://www.rewe.de/. The frontmatter above is the design system — real colors, type scale, spacing, radius, shadows, motion, and breakpoints read from the live page. Upgrade to Pro for the full written system (rationale, component guidance, and accessibility notes).
