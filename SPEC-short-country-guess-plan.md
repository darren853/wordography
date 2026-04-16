# Wordography Short-Country-Guess — Implementation Plan

## Overview

The feature allows guessing any country name (from the COUNTRIES list), regardless of its length, to narrow down the target country. The target remains the same daily country. Guess tiles show letter evaluation (green/yellow/grey) against the target's letters. A directional arrow shows geography direction + distance to target.

---

## Key Constants

| Name | Value | Purpose |
|------|-------|---------|
| `TARGET_LEN` | `TARGET.name.length` (defined at line ~240) | Used for: number of tiles in input/empty row, `--tl` CSS var for tile sizing |
| Max guess length | Longest country name in COUNTRIES list (~20 for "UNITED STATES") | Keyboard input should allow up to this |

---

## Changes by Function

---

### 1. `submitGuess()` — Line ~301

**What to remove:**
```javascript
if(g.length!==TARGET.name.length){
  toast('This country has '+TARGET.name.length+' letters');
  return
}
```

**What to change:**
The existing exact-match country lookup is already correct — it checks `guessNorm === COUNTRIES[i].normalizedName.replace(/ /g,'')` which means only full country names are accepted.

**New guard logic (replace the length check):**
Keep everything else exactly the same. The function already:
- Looks up the guess in COUNTRIES via exact normalized match → `c`
- Shows "Not in country list" if `c` is null → correct behavior
- Win detection via exact match `guessNorm === TARGET.normalizedName.replace(/ /g,'')` → correct

**Summary:** Remove the length-check `if` block entirely. No replacement needed — the country lookup + null check already handles invalid guesses.

---

### 2. `revealRow(row)` — Line ~302

**Current (approx line ~302):**
```javascript
setTimeout(function(){
  geoEl.classList.add('revealed');
  ...
}, TARGET_LEN*300+80)
```

**Change to:**
```javascript
setTimeout(function(){
  geoEl.classList.add('revealed');
  ...
}, (TARGET.name.length < g.name.length ? g.name.length : TARGET.name.length)*300+80)
```

**Or more cleanly** — store `maxLen = Math.max(TARGET.name.length, g.name.length)` at the top of the function and use `maxLen*300+80`.

**Edge cases:** If guess is longer than target (e.g., target="JAPAN" → guess="UNITED STATES" (12 chars)), the reveal runs slightly longer — correct behavior. If guess is shorter, it's quicker — fine.

---

### 3. `renderGrid()` — Line ~323

**Two changes needed:**

#### Change A: Guess rows render only `guess.name.length` tiles

**Current:**
```javascript
for(var i=0;i<TARGET_LEN;i++){
  var t=document.createElement('div');
  t.className='tile';
  if(row<state.guesses.length){
    t.classList.add(state.guesses[row].eval[i]);
    t.innerHTML='<div class="tile-inner">...'+state.guesses[row].name[i]+'...</div>'
  }
}
```

**New:**
```javascript
var guessLen = row < state.guesses.length ? state.guesses[row].name.length : 0;
for(var i=0;i<guessLen;i++){
  var t=document.createElement('div');
  t.className='tile';
  if(row<state.guesses.length){
    t.classList.add(state.guesses[row].eval[i]);
    t.innerHTML='<div class="tile-inner"><span class="tile-front">'+state.guesses[row].name[i]+'</span><div class="tile-back">'+state.guesses[row].name[i]+'</div></div>'
  }
}
```

**Note:** The input row (row === state.guesses.length) still renders `TARGET_LEN` tiles for the user to type into — those remain unchanged.

#### Change B: Cursor position check

**Current:**
```javascript
if(row===state.guesses.length&&state.current.length<TARGET_LEN){
```

**No change needed here** — `state.current.length < TARGET_LEN` is still the right check for showing the cursor on the input row.

---

### 4. `renderKB()` — Lines ~324

**Change:** Keyboard input limit must change from `TARGET_LEN` to the maximum possible country name length (e.g., 20).

The max country name in the list is ~20 characters ("United States"). Use a const like `MAX_GUESS_LEN = 20` at the top of the script, or just use a hardcoded number.

**Three places to change in `renderKB()`:**
```javascript
// place 1: key click handler
if(state.current.length<TARGET_LEN){  // → change to MAX_GUESS_LEN or 20
  state.current+=ch;renderGrid()
}

// place 2: space key handler
if(state.current.length<TARGET_LEN){  // → change to MAX_GUESS_LEN or 20
  state.current+=' ';renderGrid()
}
```

**Also in `keydown` handler (line ~330):**
```javascript
else if((k.length===1&&k>='A'&&k<='Z'||k===' ')&&state.current.length<TARGET_LEN){
  state.current+=k;renderGrid()
}
// → change to MAX_GUESS_LEN or 20
```

---

### 5. `resizeTiles()` — Line ~342

**Current:**
```javascript
document.documentElement.style.setProperty('--tl',TARGET_LEN);
```

**No change needed** — `--tl` CSS variable is used for tile sizing in the input row (empty row where user types). The input row still has `TARGET_LEN` tiles. The CSS already handles variable-width rows via `justify-content:center` in `.grid-row`.

---

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Guess "SPAIN" when target is "SIERRA LEONE" | Valid. Tile evaluation compares "SPAIN" (5 letters) against "SIERRA LEONE" (11). Green/yellow based on letter match against target. Direction arrow shows SPAIN → SIERRA LEONE. |
| Guess "UNITED STATES" (12) when target is "JAPAN" (5) | Valid. 12 tiles, letter evaluation against 5-letter "JAPAN". Arrows show distance. |
| Type more letters than any country name | Keyboard limits to 20 chars. If user somehow bypasses keyboard, submitGuess rejects via exact-match lookup. |
| Guess abbreviation "UK" | "Not in country list" — UK is not a full country name in the list (UK is stored as "United Kingdom" with normalizedName "UNITEDKINGDOM"). Correct. |
| Win detection | Still requires exact match: `guessNorm === TARGET.normalizedName.replace(/ /g,'')`. |
| All 5 guesses are short countries | Fine — each guess consumes one turn regardless of length. |

---

## Summary of All Changes

| File | Location | Change |
|------|----------|--------|
| `submitGuess()` | Line ~301 | **Remove** the `if(g.length!==TARGET.name.length){...return}` block entirely |
| `revealRow()` | Line ~302 | Replace `TARGET_LEN*300+80` with `Math.max(TARGET.name.length, g.name.length)*300+80` |
| `renderGrid()` | Line ~323 | Inner loop: `for(i=0;i<TARGET_LEN;i++)` → `for(i=0;i<(row<state.guesses.length?state.guesses[row].name.length:0);i++)` |
| `renderKB()` | Line ~324 | Replace 3x `state.current.length<TARGET_LEN` → `state.current.length<20` (or a MAX_GUESS_LEN const) |
| `keydown` handler | Line ~330 | Same as renderKB — `state.current.length<TARGET_LEN` → `state.current.length<20` |

---

## Files to Modify

- `/Users/bob/workspace/wordography/index.html`

No new files. No new dependencies.