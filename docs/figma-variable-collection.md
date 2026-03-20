# Figma Variable collection.zip

Source: `Variable collection.zip` → `variable-collection-extracted/Light Mode.tokens.json`

## Values present in the export (used verbatim)

| Token (Figma path) | Hex |
|--------------------|-----|
| `color/neutrals/00` | `#FFFFFF` |
| `color/neutrals/100` | `#DBDDEB` |
| `color/neutrals/200` | `#585973` |

Mapped in `src/index.css` `@theme` as:

- `--color-figma-neutral-00`
- `--color-figma-neutral-100`
- `--color-figma-neutral-200`

Tailwind utilities: `bg-figma-neutral-00`, `border-figma-neutral-100`, `text-figma-neutral-200`, etc.

`Dark Mode.tokens.json` is kept in `variable-collection-extracted/` for reference; the mobile withdrawal UI does not switch modes yet.

## Values not in the export

The JSON files do **not** include:

- Font sizes, weights, line heights, letter spacing
- Spacing / padding scale
- Border radius scale
- Primary / success (green) colors
- Default closed-state field border color (still `qt-gray-dark` / `#78899F` in code)

**Do not guess** those from this zip—re-export variables from Figma (full collection + typography + radius + space) or share the intended mapping.

## Where Figma neutrals are applied (mobile withdrawal flow)

- Shell background → `figma-neutral-00`
- Progress bar inactive segments → `figma-neutral-100`
- Field labels, hints, secondary lines, chevrons (where updated) → `figma-neutral-200`
- Dividers / card borders / footer top border → `figma-neutral-100`
- Surfaces previously `bg-white` in that flow → `figma-neutral-00`

Green borders (`qt-green`) and selected-row tint (`#F3F1FA` / `qt-green-bg`) are **unchanged**—not defined in the variable export.

## `src/components` vs `src/mobile/components`

The transfer-style mobile flow is built with **`src/mobile/components/*`** (e.g. `MobileAccountDropdown`). Desktop flows use **`src/components/*`** (`AccountDropdown`, `Button`, …). They are not swapped automatically; aligning desktop `AccountDropdown` to the same Figma tokens would be a separate pass if you want parity.
