---
name: ae-kinetic-caption-reels
description: "Vertical 9:16 kinetic typography, auto-responsive caption badges, karaoke word highlights, punch-in zooms, and social media safe zones for TikTok, Reels, and YouTube Shorts in After Effects."
---

# ae-kinetic-caption-reels — Social Media Kinetic Captions & Reels

## 1. Format & Safe Zone Specifications (9:16 Vertical Video)

- **Canvas Size**: `1080 x 1920` (9:16 aspect ratio), `30fps` or `60fps`.
- **Center Safe Zone**:
  - Top margin: `250px` (avoid account headers, search bars).
  - Bottom margin: `380px` (avoid caption text, sound info, like/comment buttons).
  - Left / Right margins: `120px` (avoid edge clipping).
  - **Optimal Caption Area**: Y = `1050` to `1350` (eye-level vertical center).

---

## 2. Core Caption Styles

### Style A: Word-by-Word Karaoke Pop (Hormozi / MrBeast Style)
- **Base Text**: White bold sans-serif (`Montserrat Black`, `The Bold Font`, `Impact`, `Komika Axis`).
- **Highlight Color**: Electric Yellow `#FFE600`, Vivid Green `#00FF66`, or Cyan `#00E5FF`.
- **Motion**: Scale pop `0% → 115% → 100%` in 4–6 frames on each spoken word.
- **Stroke & Shadow**:
  - Stroke: `12px` solid black `#000000`.
  - Drop Shadow: Distance `10px`, Softness `0px` (hard sticker shadow) or `20px` soft.

### Style B: Responsive Pill / Badge Background
Text inside an auto-resizing rounded rectangle that dynamically matches word width:
```javascript
// Apply to Shape Layer Rectangle Size:
padding = [50, 30];
txtLayer = thisComp.layer("CAPTION_TEXT");
r = txtLayer.sourceRectAtTime(time, false);
[r.width + padding[0], r.height + padding[1]];

// Apply to Shape Layer Position:
txtLayer = thisComp.layer("CAPTION_TEXT");
r = txtLayer.sourceRectAtTime(time, false);
[r.left + r.width / 2, r.top + r.height / 2];
```

---

## 3. Kinetic Animation Formulas

### 1. Snappy Pop-In (Scale Bounce)
```javascript
// Expression on Text Layer Scale:
freq = 3.5;
decay = 6.0;
n = 0;
if (numKeys > 0) {
  n = nearestKey(time).index;
  if (key(n).time > time) n--;
}
if (n > 0) {
  t = time - key(n).time;
  amp = 0.15;
  w = amp * Math.sin(freq * t * 2 * Math.PI) / Math.exp(decay * t);
  value + [w * 100, w * 100];
} else {
  value;
}
```

### 2. Punch-In Camera Zoom (Emphasis on Keywords)
- At dramatic keywords (e.g., *"NEVER"*, *"SECRET"*, *"MONEY"*), scale the entire scene precomp from `100%` to `115%` in 3 frames, hold for 15 frames, ease back to `100%`.

---

## 4. MCP Tool Execution Workflow

### Step 1: Create 9:16 Vertical Composition
```json
{
  "tool": "create-composition",
  "arguments": {
    "name": "Reels_Captions_Main",
    "width": 1080,
    "height": 1920,
    "fps": 30,
    "duration": 15
  }
}
```

### Step 2: Create Main Caption Text Layer
```json
{
  "tool": "create-text-layer",
  "arguments": {
    "compName": "Reels_Captions_Main",
    "text": "STOP WASTING TIME",
    "fontSize": 78,
    "font": "Montserrat-Black",
    "position": [540, 1200],
    "alignment": "center",
    "color": [1, 1, 1]
  }
}
```

### Step 3: Add Stroke & Drop Shadow for Readability
```json
{
  "tool": "apply-effect",
  "arguments": {
    "compName": "Reels_Captions_Main",
    "layerName": "STOP WASTING TIME",
    "effectName": "Drop Shadow"
  }
}
```
Set drop shadow properties:
```json
{
  "tool": "set-effect-property",
  "arguments": {
    "compName": "Reels_Captions_Main",
    "layerName": "STOP WASTING TIME",
    "effectName": "Drop Shadow",
    "property": "Opacity",
    "value": 255
  }
}
```

### Step 4: Kinetic Animator (Scale / Pop In)
```json
{
  "tool": "create-text-animator",
  "arguments": {
    "compName": "Reels_Captions_Main",
    "layerName": "STOP WASTING TIME",
    "animatorType": "scaleInChars",
    "duration": 0.4
  }
}
```

---

## 5. Quality Checklist

- [ ] Composition aspect ratio is strictly vertical `1080x1920` (9:16).
- [ ] Text is centered within the vertical safe zone (`Y: 1000–1350`), avoiding TikTok/Reels UI overlay buttons.
- [ ] Text has high contrast against video background (thick stroke `8–14px` or dark pill badge).
- [ ] Words display with snappy pop entry (`3–6 frames`), never sluggish linear crossfades.
- [ ] Readability tested via `see-frame` to ensure text is legible on mobile screen sizes.
