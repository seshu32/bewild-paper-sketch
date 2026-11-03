---
name: design-md
description: Write, update or follow a DESIGN.md — one Markdown file that records a site's visual design system (colours, type, components, spacing, rules) so new pages stay on-brand. Use when asked to create or update DESIGN.md, document the design system, capture brand tokens, or when building any new page or component for this site (read DESIGN.md first). Format follows the DESIGN.md collection at github.com/voltagent/awesome-design-md (Google Stitch format).
---

# DESIGN.md

A DESIGN.md tells a design or coding agent how the project should **look and feel** (AGENTS.md / CLAUDE.md tell it how to build).
One file in the project root. Example files for ~80 brands: https://github.com/voltagent/awesome-design-md/tree/main/design-md
(raw file: `https://raw.githubusercontent.com/voltagent/awesome-design-md/main/design-md/<brand>/DESIGN.md`, e.g. `claude`, `stripe`, `linear.app`). MIT licensed.

## When building UI in this project
1. Read `DESIGN.md` in the project root before writing any page or component. If it is missing, offer to write it first.
2. Use its tokens (colours, type scale, spacing, radius) by name — the CSS custom properties in `assets/css/style.css` are the source of truth; never invent new hex values or font weights.
3. Follow its Do's and Don'ts exactly. If a request conflicts with a rule, say so before building.
4. After shipping a new reusable pattern, add it to DESIGN.md (Components) so the file stays true.

## Writing or updating DESIGN.md
Derive it from what is **shipped**, not from intentions: read the CSS (`:root` tokens, component rules), the HTML, and screenshots of the live pages. Every value in the file must exist in the code. Missing or unconfirmed things go in **Known Gaps**, never guessed.

Use the structure in `template.md` (next to this file):
- **YAML front matter**: `name`, `description` (2–3 sentences: the atmosphere and what makes it distinct), then token maps — `colors`, `typography` (one entry per text style: fontFamily, fontSize, fontWeight, lineHeight, letterSpacing), `spacing`, `rounded`, and `components` (each component's tokens, referring to other tokens as `"{colors.primary}"`).
- **Markdown sections**, in order: Overview · Colors · Typography · Layout · Elevation & Depth · Shapes · Components · Do's and Don'ts · Responsive Behavior · Iteration Guide · Known Gaps.

Style rules for the file:
- Name every colour by its role (canvas, ink, accent, on-accent…) and give the hex once; refer to it as `{colors.name}` everywhere else.
- Describe default and active states; skip hover unless it carries meaning.
- Keep prose short and specific: numbers, names, where each thing is used. No marketing adjectives.
- Do's and Don'ts are hard rules a reviewer can check ("No rounded corners on cards or buttons"), not taste.

## Checking work against DESIGN.md
When asked to review a page: list each place it breaks a token or a Do/Don't, with the file and line, and the fix. Nothing else.
