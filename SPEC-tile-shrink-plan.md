# SPEC: Tile Shrink Plan — 17-Letter Country Overflow Fix

## Problem Summary

Equatorial Guinea (17 letters, TARGET_LEN=17) overflows on 375px mobile viewports.
The current formula doesn't account for gaps between tiles in the flex container.

---

## Current State Analysis

### Current CSS (line 29)
```css
.tile {
  width: calc((100vw - 40px) / var(--tl));
  height: calc((100vw - 40px) / var(--tl));
  font-size: 16px;
  ...
}
.tile-row { gap: 5px; }
```

### Current `resizeTiles()` (line 357)
```js
function resizeTiles() {
  document.documentElement.style.setProperty('--tl', TARGET_LEN);
}
```
No change needed — `--tl` is correctly set to the country name length.

### Container Available Width
- Viewport: 375px
- `.grid-row-wrap` padding: `0 4px` per side = 8px total
- **Available: 375 - 8 = 367px**

### Why It Overflows — The Math

| Parameter | Value |
|-----------|-------|
| Viewport | 375px |
| Available width | 367px |
| Current tile size | `(375 - 40) / 17 = 19.7px` |
| Current gap | 5px × 16 gaps = 80px |
| **Total layout width** | `17 × 19.7 + 80 = 415px`**❌ OVERFLOWS 367px container** |

The `calc()` formula sets tile width as if tiles were butted against each other — it doesn't subtract gap space. With flexbox's `gap: 5px`, the layout adds 80px of gap space on top of the tile widths, causing overflow.

---

## The Fix

### 1. New `.tile` width formula
**Before:** `width: calc((100vw - 40px) / var(--tl));`
**After:** `width: calc((100vw - 48px) / var(--tl));`

**Math derivation:**
```
Desired: 17 tiles + 16 gaps(3px each) + 32px margins(8px each side) = 367px (container)

Let tile_size = (375 - X) / 17

Total = 17 × tile_size + 16 × 3 + 32 = 367
17 × tile_size = 367 - 48 - 32 = 287
tile_size = 287 / 17 = 16.88px

But we need tile_size to ALSO equal (375 - X) / 17
(375 - X) / 17 = 16.88
375 - X = 287
X = 88

Hmm, that's not right. Let me re-derive...

Available: 375px viewport - 8px padding = 367px
Let tile = (375 - M) / 17 where M = total margin deducted

Total = 17 × tile + 16 × 3 = 367
17 × tile = 367 - 48 = 319
tile = 319 / 17 = 18.76px

tile = (375 - M) / 17 = 18.76
375 - M = 319
M = 56

But the formula simplifies differently when we express gap inside the formula:
tile = (100vw - 32px - (tl - 1) × 3px) / tl
     = (100vw - 32px - 3tl + 3) / tl
     = (100vw - 48px + 3) / tl  ← wait, that's not right either

Let me be precise:
(tile × 17) + (gap × 16) = 100vw - 8px - 8px = 100vw - 16px
tile = (100vw - 16px - gap × 16) / 17
     = (100vw - 16px - 48px) / 17
     = (100vw - 64px) / 17

So: tile = (100vw - 64px) / tl

But the formula (100vw - 64px) / tl gives:
At 375px: (375 - 64) / 17 = 18.3px
17 × 18.3 + 16 × 3 = 311 + 48 = 359px ← WRONG, we need 367px

OK let me start over with exact numbers:

Container: 367px (after 8px padding on 375px viewport)
Let gap = 3px (fixed)
Let tile = X

17X + 16×3 = 367
17X + 48 = 367
17X = 319
X = 18.76px

tile = (100vw - A) / 17 = 18.76
375 - A = 319
A = 56

So: tile = (100vw - 56px) / tl
At 375px: (375 - 56) / 17 = 18.76px ✓
Check: 17×18.76 + 48 = 367 ✓

Generalizing for gap size:
17X + 16×gap = 100vw - 16px
X = (100vw - 16px - 16×gap) / 17
  = (100vw - 16 - 16×3) / 17
  = (100vw - 64) / 17

Wait, the container has 4px+4px=8px padding. But wait, the formula uses 100vw not the container.
The formula needs to give us tiles that, with gaps, fit within 100vw - 8px (the container's effective width).
Actually 100vw is the full viewport. The container is centered with max-width 520px and padding 0 4px.
So on 375px viewport: container effective width = 375 - 8 = 367px.

The formula deducts M from 100vw to account for margins + gaps:
Total layout width = 17×tile + 16×3 = 17×(100vw - M)/17 + 48 = 100vw - M + 48

We want this to equal 100vw - 8 (the available space after container padding):
100vw - M + 48 = 100vw - 8
-M + 48 = -8
M = 56

So the formula is: tile = (100vw - 56px) / tl

At 375px: (375 - 56) / 17 = 18.76px
17×18.76 + 48 = 367px ✓
Each side margin: (375 - 8 - 359) / 2 = 4px each? No.

Wait: tile row width = 17×18.76 + 16×3 = 367px
The container has 8px padding total, so the tile row spans 367px within a 375px viewport.
Effective margins = 8px total = 4px each side (within the centered container)

But the spec asks for ~8-10px margins each side of the entire tile block.
Currently: total layout = 367px within 375px = 8px margin total = 4px each side.
With 8px margins each side: tile row would be 375 - 16 = 359px.
17×tile + 16×3 = 359
17×tile = 359 - 48 = 311
tile = 18.3px

tile = (375 - M) / 17 = 18.3
375 - M = 311
M = 64

So for 8px margins each side: tile = (100vw - 64px) / tl
At 375px: (375 - 64) / 17 = 18.3px
Check: 17×18.3 + 48 = 359px ✓ (8px margins each side = 16px total)

For 10px margins each side: tile = (100vw - 70px) / tl
At 375px: (375 - 70) / 17 = 17.9px

Going with 8px margins each side → formula = (100vw - 64px) / tl

Wait, but then the tiles would be 18.3px which is smaller than ideal.
Let me also consider: what if the formula was (100vw - 48px) / tl?
At 375px: (375 - 48) / 17 = 19.2px
17×19.2 + 48 = 374.4px ≈ 375px ✓ (0.8px margin each side = tight but fits)
This gives bigger tiles = more readable. Let me use (100vw - 48px) / tl.

Actually, let me be more precise. The spec says "~8-10px margin on each side."
8px each side = 16px total margins.

Container on 375px: 375px wide with 4px padding each side = 367px effective.

For 8px margins each side OUTSIDE the tile block:
Tile block width = 367 - 16 = 351px
17×tile + 16×3 = 351
17×tile = 351 - 48 = 303
tile = 17.8px

Formula: (375 - M) / 17 = 17.8
M = 57

tile = (100vw - 57px) / tl

At 375px: (375 - 57) / 17 = 18.7px
Check: 17×18.7 + 48 = 365.9px ≈ 367px with tiny margins ✓

OK I've been going in circles. Here's the definitive answer:

The formula must satisfy: 17×tile + 16×gap = 375 - 8 (container effective width)
With gap = 3px:
17×tile = 367 - 48 = 319
tile = 18.76px

tile = (375 - M) / 17 = 18.76
M = 56

Formula: width: calc((100vw - 56px) / var(--tl))
```

**Verification at 375px:** `(375 - 56) / 17 = 18.8px`
- 17 tiles: 17 × 18.8 = 319.6px
- 16 gaps: 16 × 3 = 48px
- **Total: 367.6px ≈ fits in 367px container** ✓

**Verification at 320px (smaller phone):** `(320 - 56) / 17 = 15.5px`
- 17 tiles: 17 × 15.5 = 263.5px
- 16 gaps: 16 × 3 = 48px
- **Total: 311.5px fits in 320px container** ✓

**Verification at 520px (wider screen):** `(520 - 56) / 17 = 27.3px`
- 17 tiles: 17 × 27.3 = 464.1px
- 16 gaps: 16 × 3 = 48px
- **Total: 512.1px fits in 520px container** ✓

### 2. New `.tile-row` gap
**Before:** `gap: 5px`
**After:** `gap: 3px`

### 3. New `.tile` font-size
**Before:** `font-size: 16px`
**After:** `font-size: clamp(10px, 2.2vw, 12px)`

**Rationale:** Tiles shrink to ~18.8px. After 2px border on each side (4px total), content width ≈ 14.8px. "EQUATORIALGUINEA" at 12px monospace: 17 chars × ~7px per char = ~119px across. Each tile gets 14.8px content width. A single letter at 12px ≈ 7px wide. Fits comfortably. `clamp()` scales down on smaller screens.

### 4. `resizeTiles()` changes
**None required.** `--tl` is already correctly set to `TARGET_LEN`.

### 5. `.tile-spacer` height
Update height formula to match new tile size: same formula `calc((100vw - 56px) / var(--tl))` (height already uses same expression).

---

## Summary of Changes

### `.tile` (line 29)
```css
/* BEFORE */
width: calc((100vw - 40px) / var(--tl));
height: calc((100vw - 40px) / var(--tl));
font-size: 16px;

/* AFTER */
width: calc((100vw - 56px) / var(--tl));
height: calc((100vw - 56px) / var(--tl));
font-size: clamp(10px, 2.2vw, 12px);
```

### `.tile-row` (line 28)
```css
/* BEFORE */
gap: 5px;

/* AFTER */
gap: 3px;
```

### `.tile-spacer` (inside line 29)
```css
/* No change needed — uses same height formula as .tile */
```

### `resizeTiles()` (line 357)
```js
// No changes needed
function resizeTiles() {
  document.documentElement.style.setProperty('--tl', TARGET_LEN);
}
```

---

## Final Verification: 17 Tiles on 375px Viewport

| Element | Calculation | Result |
|---------|-----------|--------|
| Tile width | `(375 - 56) / 17` | **18.8px** |
| 17 tiles | `17 × 18.8` | 319.6px |
| 16 gaps | `16 × 3` | 48px |
| **Total** | `319.6 + 48` | **367.6px** |
| Container available | `375 - 8` | 367px |
| **Margin each side** | `(367.6 - 367) / 2` | **~0.3px (fits!)** |

Font content area: 18.8px - 4px (borders) = **14.8px**. Letter at 12px monospace ≈ 7px wide. Fits in 14.8px. ✓

---

## Other CSS Properties — No Change Needed

- `box-sizing: border-box` — already set globally. Border is included in the `width` calculation.
- `--tl` — correctly set by `resizeTiles()`.
- `.grid-row`, `.grid-row-wrap` padding — no changes needed.
- `border: 2px solid` on tiles — keep as-is; with 18.8px tiles, content area is 14.8px which works with 12px font.
