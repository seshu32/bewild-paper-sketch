---
version: alpha
name: <Brand>-design-system
description: <2–3 sentences: the atmosphere, the signature colour pairing, the type voice, what sets it apart.>

colors:
  canvas: "#______"        # page background
  surface-card: "#______"  # cards
  ink: "#______"           # headings / strongest text
  body: "#______"          # body text
  muted: "#______"         # secondary text
  hairline: "#______"      # borders, dividers
  primary: "#______"       # main brand accent
  action: "#______"        # buttons / calls to action
  on-action: "#______"     # text on action

typography:
  display-xl: { fontFamily: "<family>, serif", fontSize: 72px, fontWeight: 400, lineHeight: 1.02, letterSpacing: -0.015em }
  display-lg: { fontFamily: "<family>, serif", fontSize: 56px, fontWeight: 400, lineHeight: 1.05 }
  title:      { fontFamily: "<family>, serif", fontSize: 24px, fontWeight: 400, lineHeight: 1.2 }
  body:       { fontFamily: "<family>, serif", fontSize: 18px, fontWeight: 300, lineHeight: 1.6 }
  label:      { fontFamily: "<family>, serif", fontSize: 11px, fontWeight: 400, letterSpacing: 0.16em, textTransform: uppercase }

spacing:
  xs: 8px
  sm: 12px
  md: 20px
  lg: 32px
  section: 96px

rounded:
  none: 0px
  circle: 50%

components:
  button-primary:
    backgroundColor: "{colors.action}"
    textColor: "{colors.on-action}"
    rounded: "{rounded.none}"
    padding: 14px 24px
  product-card:
    backgroundColor: "{colors.surface-card}"
    border: 1.5px solid "{colors.hairline}"
    rounded: "{rounded.none}"
---

## Overview
<What the site feels like and why. Key characteristics as a short list.>

## Colors
### Brand & Accent
### Surface
### Text
### Semantic

## Typography
### Font Family
### Hierarchy
<table: style · size · weight · line-height · where used>
### Principles

## Layout
### Spacing System
### Grid & Container
### Whitespace Philosophy

## Elevation & Depth

## Shapes
### Border Radius Scale
### Photography & Illustrations

## Components
### Navigation
### Buttons
### Cards
### Inputs & Forms
### Tags / Badges
### <site-specific components>

## Do's and Don'ts
### Do
### Don't

## Responsive Behavior
### Breakpoints
### Touch Targets
### Collapsing Strategy

## Iteration Guide
<numbered rules for building the next thing>

## Known Gaps
<what is not covered or not yet confirmed>
