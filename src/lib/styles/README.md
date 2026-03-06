# Zarevo Design System

A dark-mode SaaS design system built with **Tailwind CSS v4** and **SvelteKit**.

## Overview

This design system provides a consistent, scalable foundation for building Zarevo's UI with:

- **Dark-first theme** using neutral palette
- **Primary accent color** (#F05322) for brand elements
- **Geist font family** for clean, modern typography
- **Reusable utility classes** for common patterns
- **Glass/blur surfaces** for elevated UI elements

---

## Color System

### Primary Accent

- **Color:** `#F05322`
- **Usage:** Primary buttons, links, highlights, active states, focus rings
- **Tailwind:** Use `text-primary` or `bg-primary` utilities
- **CSS Variable:** `var(--color-primary)`

### Neutral Palette

The app uses Tailwind's neutral colors for the dark theme:

- `neutral-900` - App background
- `neutral-800` - Card/surface backgrounds
- `neutral-700` - Borders
- `neutral-600` - Secondary UI surfaces
- `neutral-500` - Subtle text
- `neutral-400` - Muted text
- `white` - Primary text

---

## Typography

### Fonts

- **Primary (Sans):** Geist
- **Monospace:** Geist Mono

### Usage

```html
<!-- Default text uses Geist automatically -->
<p>This uses Geist font</p>

<!-- Explicitly use sans -->
<p class="font-sans">Geist font</p>

<!-- Monospace for code, numbers, technical labels -->
<code class="font-mono">const x = 42;</code>
<span class="font-mono">1,234 credits</span>
```

### Text Utilities

```html
<!-- Muted text (neutral-400) -->
<p class="text-muted">Secondary information</p>

<!-- Subtle text (neutral-500) -->
<p class="text-subtle">Tertiary information</p>

<!-- Primary accent text -->
<a class="text-primary">Learn more →</a>
```

---

## Border Radius

Consistent rounded corners throughout the app:

- `rounded-sm` - 6px
- `rounded-md` - 8px (default for most controls)
- `rounded-lg` - 12px (cards, larger surfaces)
- `rounded-xl` - 16px
- `rounded-2xl` - 20px

**Default recommendation:** Use `rounded-md` for buttons and inputs, `rounded-lg` for cards.

---

## Surface Utilities

### Card Surface

Standard solid card/panel background:

```html
<div class="surface-card p-6">
  <h2>Card Title</h2>
  <p>Card content...</p>
</div>
```

**Includes:**
- `bg-neutral-800`
- `border border-neutral-700`
- `rounded-lg`
- `shadow-lg`

### Blur Surface

Glass/frosted surface for floating elements:

```html
<div class="surface-blur p-4">
  <p>Floating content</p>
</div>
```

**Includes:**
- Semi-transparent dark background (`rgba(10, 10, 10, 0.7)`)
- 25px backdrop blur
- `border border-neutral-700`
- `rounded-lg`
- `shadow-xl`

**Use for:** Modals, popovers, floating cards, command palettes, sticky headers

---

## Button System

### Base Button Class

All buttons should include the `.btn` class:

```html
<button class="btn btn-md btn-primary">Click me</button>
```

### Sizes

- `.btn-sm` - Small (px-3 py-1.5 text-sm)
- `.btn-md` - Medium (px-4 py-2 text-sm) **[Default]**
- `.btn-lg` - Large (px-6 py-3 text-base)

### Variants

#### Primary
```html
<button class="btn btn-md btn-primary">Sign up</button>
```
- Background: `#F05322`
- Text: White
- Hover: Brighter primary color
- Focus ring: Primary color

#### Secondary
```html
<button class="btn btn-md btn-secondary">Cancel</button>
```
- Background: `neutral-800`
- Border: `neutral-700`
- Text: White
- Hover: `neutral-700`

#### Ghost
```html
<button class="btn btn-md btn-ghost">Sign in</button>
```
- Background: Transparent
- Text: White
- Hover: `neutral-800`
- Minimal appearance

### Complete Examples

```html
<!-- Small primary button -->
<button class="btn btn-sm btn-primary">Save</button>

<!-- Medium secondary button (most common) -->
<button class="btn btn-md btn-secondary">Cancel</button>

<!-- Large ghost button -->
<button class="btn btn-lg btn-ghost">Learn more</button>

<!-- Link styled as button -->
<a href="/pricing" class="btn btn-md btn-primary">Get started</a>
```

---

## Global Styles

The app automatically applies:

- `bg-neutral-900` background
- `text-white` default text color
- Geist font family
- Anti-aliased text rendering

These are set globally in `layout.css` and applied to the `<body>` element.

---

## File Structure

```
src/
├── lib/
│   └── styles/
│       ├── theme.css       # Theme tokens and utility classes
│       └── README.md       # This file
├── routes/
│   ├── layout.css          # Global styles and imports
│   └── +layout.svelte      # Root layout component
└── app.html                # Font imports
```

---

## Development Guidelines

### ✅ Do

- Use theme utilities (`surface-card`, `surface-blur`, `text-muted`, etc.)
- Use button classes (`btn`, `btn-primary`, etc.)
- Use Tailwind utilities for layout and spacing
- Use `text-primary` for accent colors
- Use `font-mono` for numbers, code, and technical labels
- Use `rounded-md` or `rounded-lg` for consistent corners

### ❌ Avoid

- Hardcoding colors (use theme tokens)
- Inline styles
- Arbitrary color values
- Creating duplicate utility classes
- Sharp corners (no `rounded-none` unless necessary)

### Example: Building a Card

```html
<div class="surface-card p-6 space-y-4">
  <h2 class="text-xl font-semibold">Feature Title</h2>
  <p class="text-muted">Feature description goes here...</p>
  <div class="flex gap-3">
    <button class="btn btn-md btn-primary">Get started</button>
    <button class="btn btn-md btn-ghost">Learn more</button>
  </div>
</div>
```

### Example: Building a Modal

```html
<div class="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
  <div class="surface-blur p-6 max-w-md w-full space-y-4">
    <h2 class="text-xl font-semibold">Modal Title</h2>
    <p class="text-muted">Modal content...</p>
    <div class="flex justify-end gap-3">
      <button class="btn btn-md btn-ghost">Cancel</button>
      <button class="btn btn-md btn-primary">Confirm</button>
    </div>
  </div>
</div>
```

---

## Extending the System

### Adding New Colors

Edit `src/lib/styles/theme.css`:

```css
@layer theme {
  :root {
    --color-success: #10b981;
    --color-error: #ef4444;
  }
}
```

### Adding New Utilities

Edit `src/lib/styles/theme.css`:

```css
@layer utilities {
  .text-success {
    color: var(--color-success);
  }
}
```

---

## Browser Support

- Modern browsers with CSS custom properties support
- Backdrop filter support (Safari, Chrome, Firefox, Edge)
- Fallbacks provided for older browsers where needed

---

## Questions?

This design system is built to be intuitive and scalable. When in doubt:

1. Check existing components for patterns
2. Use theme utilities over custom styles
3. Maintain consistency with the dark theme
4. Keep it simple and readable
