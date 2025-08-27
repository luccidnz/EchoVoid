# Style Guide

Reusable design tokens live in `src/theme`.

## Typography

- `FONT_SIZES` provides named font size values (xs, sm, md, lg, xl, xxl, xxxl, display).
- `FONT_WEIGHTS` exposes weight keywords like `regular`, `bold`, etc.

```ts
import { FONT_SIZES, FONT_WEIGHTS } from 'src/theme/typography';
```

## Spacing

Use spacing constants instead of magic numbers.

```ts
import { SPACING } from 'src/theme/spacing';
```

These tokens help keep layout and text styles consistent across screens and components.
