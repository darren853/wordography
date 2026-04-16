# Country Silhouette Source Research Report — Wordography

**Task:** Find better quality country silhouette sources than the current 80-point blocky data.
**Date:** 2026-04-13
**Countries needed:** 196 (Wordography's country list)

---

## Executive Summary

**The current "80 points per country" data looks blocky because it's likely simplified from a low-quality source (possibly 110m Natural Earth at heavy simplification).**

**Recommendation: Use Natural Earth 50m data simplified to ~100-120 points per country.** This will produce noticeably smoother, more geographic-looking silhouettes without excessive data.

---

## Data Sources Analyzed

### 1. TopoJSON world-atlas (Natural Earth) — ✅ BEST CHOICE

**Source:** https://github.com/topojson/world-atlas (via jsDelivr CDN)

| File | Scale | Source Resolution | File Size |
|------|-------|-------------------|-----------|
| `countries-110m.json` | 1:110m | LOW (very simplified) | ~100KB |
| `countries-50m.json` | 1:50m | MEDIUM (good) | ~750KB |
| `countries-10m.json` | 1:10m | HIGH (very detailed) | ~3.6MB |

**Sample point counts (from downloaded data):**

| Country | 50m original pts | 10m original pts |
|---------|-----------------|-----------------|
| Italy | 383 pts | 1,935 pts |
| Japan | 385 pts | 2,477 pts |
| Belgium | 163 pts | 644 pts |
| Russia | 4,894 pts | 22,849 pts |

**Key findings:**
- **50m data at 80 simplified points** looks substantially better than current 80pt data — the coastline curves are preserved
- **50m at 100-120 pts** is the sweet spot for 320x180 canvas
- **10m data is overkill** for 320x180 — Italy with 1935 pts can't be meaningfully displayed at this resolution
- All data is **public domain** (Natural Earth)
- Covers all 196 countries in Wordography's list
- Data is TopoJSON format, easily converted to SVG paths

**Licensing:** Public Domain (Natural Earth) — no attribution required

---

### 2. Simplemaps.com SVG

**URL:** https://simplemaps.com/resources/svg-world

**Assessment:**
- Free SVG world map, commercially usable
- Uses Robinson projection (NOT equirectangular — requires reprojection)
- Quality unknown without downloading
- Data is a single world SVG, not per-country — would require parsing/extraction
- License: Commercial use allowed (free tier available)

**Why not #1:** Requires reprojection from Robinson to equirectangular. Natural Earth 50m is already equirectangular and equally well-sourced.

---

### 3. Wikipedia SVG Maps

**URL:** https://commons.wikimedia.org/wiki/Category:SVG_maps_of_the_world

**Assessment:**
- High quality individual country SVGs available
- Example: `BlankMap-World-Equirectangular.svg` (940×477, 1.31MB) — CC0 public domain
- However: single large SVG file — requires parsing to extract per-country paths
- Individual country SVGs exist but would require 196 separate downloads

**Why not #1:** Practical issues with extraction from a monolithic SVG. Also CC BY-SA for many individual country files (requires attribution).

---

### 4. datasets/geo-countries (GitHub)

**URL:** https://github.com/datasets/geo-countries

**Assessment:**
- GeoJSON version of Natural Earth data
- Same quality as world-atlas (derived from same source)
- Processed with ogr2ogr: 6 decimal precision, validated geometries
- Licensed under ODC Public Domain Dedication

**Verdict:** This is Natural Earth data repackaged — same quality as world-atlas 50m/10m. Not a better source, just a different format.

---

### 5. country.io / Other SVG Libraries

**Assessment:**
- Generally lower quality, simplified SVG maps
- Not suitable for geographic game use
- License varies

---

### 6. OpenStreetMap Data

**URL:** https://www.openstreetmap.org

**Assessment:**
- Extremely high resolution (overkill for 320x180)
- Would require heavy simplification
- Complex to extract per-country boundaries
- License: ODbL (requires attribution)

**Why not #1:** OSM is designed for detailed mapping, not game silhouettes. Heavy processing required.

---

### 7. geojson-maps.kyd.au

**URL:** https://geojson-maps.kyd.au/

**Assessment:**
- Customizable GeoJSON download
- Source: Natural Earth (same quality)
- Just a web interface for Natural Earth data

---

### 8. Visionscarto world-atlas

**URL:** https://github.com/visionscarto/world-atlas

**Assessment:**
- Modified version of topojson/world-atlas
- Changes: Ukraine borders, Western Sahara status (UN-aligned)
- Same resolution options (110m, 50m)
- **Not a quality improvement** — just political boundary adjustments
- If Wordography uses standard Natural Earth, this adds no value

---

## "Glowing Orange Outline" Aesthetic

**Question:** Is there a source specifically with "glowing orange outline" aesthetic?

**Answer:** No specialized source exists. The "glowing orange outline" is a rendering/styling choice, not a data source characteristic. Any SVG path data can be rendered with:
- Orange stroke color (`#FF6B35` or similar)
- Glow effect via CSS filter: `filter: drop-shadow(0 0 6px #FF6B35)`
- Or canvas shadow rendering

**Converting Wikipedia SVG to game format:** Wikipedia SVGs use paths in a different coordinate system. To convert:
1. Download the world SVG
2. Parse individual country `<path>` elements
3. Transform coordinates to 320x180 equirectangular
4. Simplify to target point count
5. Export as game-compatible SVG paths

This is possible but requires significant processing. **Natural Earth 50m is already in the right format** (equirectangular lat/lon coordinates that trivially convert to 320x180).

---

## Why Current Silhouettes Look Blocky

The current 80-point silhouettes likely suffer from:

1. **Low source resolution** — if originally derived from 110m Natural Earth (which has very few points per country), 80 points doesn't add detail
2. **Poor simplification algorithm** — if the original source had more points but was aggressively simplified, the resulting 80 points may be poorly distributed
3. **Source quality** — some simplified world datasets have visibly blocky coastlines

**Key insight:** Using 50m Natural Earth data and simplifying to 80-120 points gives substantially better results because the source data has more natural curve detail to preserve.

---

## Quality Comparison Images

Generated comparison images (saved to `/Users/bob/workspace/wordography/`):
- `compare-naturalearth-italy.png` — Italy: Current vs 50m@80 vs 10m@80 vs 50m@120 vs 10m@120 vs 10m@160
- `compare-naturalearth-japan.png` — Japan: same grid
- `compare-naturalearth-belgium.png` — Belgium: same grid  
- `compare-naturalearth-russia.png` — Russia: same grid

Each comparison shows a 960×360px grid (3 columns × 2 rows of 320×180 cells).

---

## Recommendations

### Primary Recommendation: **Natural Earth 50m**

**Why:**
- Best quality-to-size ratio for 320×180 canvas
- Public domain, no licensing concerns
- Equirectangular projection (same as Wordography canvas)
- Covers all 196 countries
- Easy to process: lat/lon → x/y via simple formula

**Target point counts:**
| Country Size | Recommended Pts | Notes |
|------------|----------------|-------|
| Small (Belgium, etc.) | Full source (~163 pts) | Don't simplify |
| Medium (Italy, Japan) | 80-100 pts | Keep more coastal curves |
| Large (Russia, Brazil) | 80-120 pts | Simplification visible at 320×180 |

**Minimum recommended:** 80 pts with 50m source is noticeably better than current 80 pts from unknown source.

**Ideal target:** 100-120 pts per country from 50m data — smooth but not excessive.

### Secondary: 10m Natural Earth (for very large countries only)

If Russia still looks blocky at 120 pts from 50m, consider using 10m data only for countries with >2000 original points. But 50m at 120 pts should be sufficient for most use cases.

### What to AVOID:
- 110m Natural Earth — too simplified
- 10m Natural Earth for all countries — overkill, huge files
- Wikipedia SVGs — processing overhead not worth it
- Simplemaps — requires reprojection

---

## Technical Notes for Implementation

### Converting 50m GeoJSON to SVG paths at 320×180:

```javascript
// Equirectangular projection
function latLonToCanvas(lon, lat) {
  const x = (lon + 180) * (320 / 360);
  const y = (90 - lat) * (180 / 180);
  return [x, y];
}

// Simplify using Visvalingam / Douglas-Peucker
// Target: 80-120 points per country
```

### Key files:
- `countries-50m.json`: https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json
- `countries-10m.json`: https://cdn.jsdelivr.net/npm/world-atlas@2/countries-10m.json

### License:
Natural Earth data is public domain. No attribution required (though crediting Natural Earth is appreciated).

---

## Summary Table

| Source | Quality | Coverage | License | Format | Notes |
|--------|---------|----------|---------|-------|-------|
| **Natural Earth 50m** | ⭐⭐⭐⭐⭐ | 196+ | Public Domain | TopoJSON/GeoJSON | **BEST CHOICE** |
| Natural Earth 10m | ⭐⭐⭐⭐⭐ | 196+ | Public Domain | TopoJSON/GeoJSON | Overkill for 320×180 |
| Natural Earth 110m | ⭐⭐ | 196+ | Public Domain | TopoJSON/GeoJSON | Too simplified |
| Simplemaps SVG | ⭐⭐⭐ | Unknown | Commercial free | SVG | Needs reprojection |
| Wikipedia SVGs | ⭐⭐⭐⭐ | Individual | CC BY-SA / CC0 | SVG | 196 files to process |
| OSM | ⭐⭐⭐⭐⭐ | Full | ODbL | Various | Overkill, complex |
| datasets/geo-countries | ⭐⭐⭐⭐ | 196+ | ODC-PDDL | GeoJSON | Same as NE 50m |

---

## Final Verdict

**Source:** Natural Earth 50m (`countries-50m.json`)
**Point target:** 80-120 pts per country (100 pts ideal)
**Expected improvement:** Current blocky/geometric → smooth, recognizable country shapes

The comparison images demonstrate that Natural Earth 50m at 80 pts produces substantially better silhouettes than whatever the current 80pt source is. The improvement is most visible in:
- Coastal inlets and peninsulas (Italy's boot, Japan's islands)
- Small countries (Belgium shows more shape detail)
- Large countries with complex coastlines (Russia's northern coast)
