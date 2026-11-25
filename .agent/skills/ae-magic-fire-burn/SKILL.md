---
name: ae-magic-fire-burn
description: "Procedural fire, burn, ember, and smoke VFX using particle systems, fractal noise, displacement maps, and blend modes in After Effects. Use when creating realistic fire simulations, burning text, ember trails, smoke plumes, or heat distortion effects."
---

# ae-magic-fire-burn — Procedural Fire & Burn VFX Skill

## Overview
This skill covers building realistic fire, burn, ember, and smoke effects in Adobe After Effects using **native built-in effects only** (no third-party plugins required). All techniques use Fractal Noise, CC Particle World, Turbulent Displace, Glow, Blend Modes, and color correction.

---

## 1. Fire Color Science

### Core Fire Palette (Temperature → Color)
```
White-hot core:  #FFFFFF → #FFFDE0  (6000K)
Orange flame:    #FF6A00 → #FF9900  (3000K)
Red ember base:  #CC0000 → #FF3300  (2000K)
Smoke/ash:       #333333 → #888888  (ambient)
```

### Color Gradient Order (bottom → top of flame)
1. **Root** (hottest): White `#FFF5D0`
2. **Core flame**: Bright orange `#FF8C00`
3. **Mid flame**: Deep orange-red `#FF4500`
4. **Tips**: Dark red `#8B0000`
5. **Smoke**: Semi-transparent grey `#555555` at 30–60% opacity

---

## 2. Base Fire Layer Stack (Build Order)

```
[ Comp: FIRE_MASTER ]
  ├── SMOKE_layer        (CC Particle World → Screen)
  ├── EMBER_layer        (CC Particle World → Add)
  ├── HEAT_DISTORT       (Turbulent Displace → Luma Matte)
  ├── FIRE_CORE          (Fractal Noise → Add)
  ├── FIRE_COLOR         (Curves + Hue/Sat → Normal)
  └── BG_SOLID           (#000000 or transparent)
```

---

## 3. Fractal Noise — Core Fire Shape

### Settings for Realistic Fire
```javascript
// apply-effect: Fractal Noise on FIRE_CORE solid
{
  effect: "Fractal Noise",
  properties: {
    "Fractal Type": "Turbulent Smooth",
    "Noise Type": "Soft Linear",
    "Contrast": 400,
    "Brightness": -60,
    "Complexity": 6,
    "Evolution Options > Cycle Evolution": true,
    "Evolution Options > Cycle (in Revolutions)": 1
  }
}

// Animate Evolution: 0° at frame 0 → 360° at frame (fps × loopSeconds)
// Add expression to Evolution:
//   time * 80  // controls fire turbulence speed
```

### Reshape with Transform
```javascript
// Scale Y: 150–300% (tall flame shape)
// Offset Turbulence Y: animated downward (-100 to -400) → upward draft
```

### Colorize Fire via Curves
```javascript
// RGB channel: lift blacks (input 0 → output 0), blow out whites
// Red channel: boost (output +30 at highlights)
// Blue channel: cut (output -50 at midtones)
// Apply Hue/Saturation: Colorize ON, Hue: 20°, Saturation: 80, Lightness: -10
```

---

## 4. CC Particle World — Ember System

### Ember Particle Settings
```javascript
{
  effect: "CC Particle World",
  properties: {
    "Birth Rate": 2.5,
    "Longevity (sec)": 1.8,
    "Producer > Position X": 0,
    "Producer > Position Y": 0.1,     // just above center
    "Producer > Radius X": 0.15,
    "Producer > Radius Y": 0.02,
    "Physics > Animation": "Twirl",
    "Physics > Velocity": 1.2,
    "Physics > Gravity": -0.3,        // negative = float upward
    "Physics > Extra": 0.5,
    "Particle > Particle Type": "Faded Sphere",
    "Particle > Birth Size": 0.015,
    "Particle > Death Size": 0.004,
    "Particle > Max Opacity": 85,
    "Particle > Birth Color": "#FF8800",
    "Particle > Death Color": "#330000"
  }
}
// Blend mode: Add
```

### Smoke Particle Settings
```javascript
{
  effect: "CC Particle World",
  properties: {
    "Birth Rate": 0.8,
    "Longevity (sec)": 3.5,
    "Physics > Velocity": 0.4,
    "Physics > Gravity": -0.15,
    "Physics > Extra": 1.2,           // turbulent drift
    "Particle > Particle Type": "Faded Sphere",
    "Particle > Birth Size": 0.08,
    "Particle > Death Size": 0.35,    // expand as it rises
    "Particle > Max Opacity": 40,
    "Particle > Birth Color": "#666666",
    "Particle > Death Color": "#222222"
  }
}
// Blend mode: Screen or Normal at 50% opacity
```

---

## 5. Heat Distortion Layer

```javascript
// Add a solid → Apply "Turbulent Displace"
{
  effect: "Turbulent Displace",
  properties: {
    "Displacement": "Vertical",
    "Amount": 25,
    "Size": 40,
    "Complexity": 3,
    "Evolution": "time * 60"          // expression
  }
}
// Set as Luma Matte above the fire base
// Reduces opacity above flame → wavy heat shimmer
```

---

## 6. Glow Pass

```javascript
// Apply Glow on FIRE_COLOR layer (or Adjustment Layer above stack)
{
  effect: "Glow",
  properties: {
    "Glow Threshold": 40,
    "Glow Radius": 35,
    "Glow Intensity": 1.8,
    "Glow Colors": "A & B Colors",
    "Color A": "#FF6600",
    "Color B": "#FFFF00",
    "Glow Dimensions": "Horizontal and Vertical"
  }
}
// Stack 2 Glow passes: 1st wide soft (radius 60, intensity 0.6), 2nd tight bright (radius 15, intensity 2.5)
```

---

## 7. Burn Text Effect — Step-by-Step

### Method: Burn Reveal (Text Consumed by Fire)
```
[ Comp: BURN_TEXT ]
  ├── FIRE_MASTER     (precomp, Add blend)
  ├── CHAR_MATTE      (text layer, used as Alpha Matte)
  ├── BURNED_CHAR     (solid #111111, Multiply)
  └── ORIGINAL_TEXT   (white text, Normal)
```

### Burn Timing via Write-On Effect
```javascript
// On ORIGINAL_TEXT: apply Stroke effect as Write-On
// Or use a Shape Layer mask that reveals/hides text L→R over time
// Key the reveal: frame 0 = full text, frame 60 = fully "burned away"
// FIRE_MASTER's X position tracks the burn front edge
```

### Char-by-Char Burn Expression (TextLayer)
```javascript
// Apply to Opacity of each character via Text Animator
// Selector: Range, based on "Characters" mode
// Opacity drops from 100 → 0 as "fire front" sweeps left to right
```

---

## 8. MCP Tool Execution Pattern

### Step 1 — Create fire solid
```
add-solid-layer → { name: "FIRE_CORE", color: [0,0,0], width: 1920, height: 1080 }
```

### Step 2 — Apply Fractal Noise
```
apply-effect → { layerName: "FIRE_CORE", effectName: "Fractal Noise" }
set-effect-property → Contrast: 400, Brightness: -60, Complexity: 6
```

### Step 3 — Add Evolution keyframes (looping)
```
set-effect-keyframe → { property: "Evolution", time: 0, value: 0 }
set-effect-keyframe → { property: "Evolution", time: duration, value: 360 }
```
Then expression on Evolution: `time * 80`

### Step 4 — Color via Curves
```
apply-effect → { effectName: "Curves" }
// Boost red channel, cut blue, lift overall brightness
apply-effect → { effectName: "Hue/Saturation" }
set-effect-property → Colorize: true, Master Hue: 20, Master Saturation: 80
```

### Step 5 — Ember particles
```
add-solid-layer → { name: "EMBERS", color: [0,0,0] }
apply-effect → { effectName: "CC Particle World" }
// Set all particle properties per Section 4
modify-layer → { blendMode: "Add" }
```

### Step 6 — Glow pass
```
add-solid-layer → { name: "GLOW_ADJ", isAdjustment: true }
apply-effect → { effectName: "Glow" }
set-effect-property → { "Glow Radius": 35, "Glow Intensity": 1.8, ... }
```

### Step 7 — Precompose and verify
```
precompose-layers → { layers: ["FIRE_CORE","EMBERS","GLOW_ADJ"], name: "FIRE_MASTER" }
see-frame → { time: 1.0 }  // visual check
```

---

## 9. Blend Mode Reference

| Layer | Blend Mode | Why |
|-------|-----------|-----|
| FIRE_CORE | Add | Additive brightness — fire glows |
| EMBERS | Add | Particle sparks brighten background |
| SMOKE | Screen | Removes black, keeps grey smoke |
| HEAT_DISTORT | Luma Matte | Distort only where fire exists |
| GLOW_ADJ | Normal (Adj. Layer) | Affects all layers below |

---

## 10. Performance Tips

- **Pre-render** `FIRE_MASTER` precomp to disk when editing burn text — fractal noise + particles are CPU-heavy.
- Use **Half resolution** in preview while building; switch to Full for final render.
- **Cache Before Playback** (`RAM Preview`) to verify looping evolution expression.
- For **looping fire**: set Evolution expression to `(time % loopDuration) * 80` to create seamless loop.
- Limit CC Particle World **Birth Rate** ≤ 4 to avoid slowdowns with many particles on screen.

---

## 11. Expressions Quick Reference

```javascript
// Evolution loop (Fractal Noise)
time * 80

// Seamless loop evolution
var loopDur = 3; // seconds
((time % loopDur) / loopDur) * 360

// Ember drift (Position Y of emitter)
[0, Math.sin(time * 2) * 10]  // slight horizontal sway

// Fire flicker (Opacity of fire layer)
linear(time, 0, 0.1, 85, 100) + Math.sin(time * 30) * 8

// Heat shimmer evolution (Turbulent Displace)
time * 60
```

---

## 12. Quality Checklist

- [ ] Fire color transitions from white-hot → orange → red → transparent (not flat orange)
- [ ] Embers rise upward (Gravity < 0) with slight horizontal drift
- [ ] Smoke expands and fades as it rises (Death Size > Birth Size)
- [ ] Heat distortion visible above flame tip (not too strong — max 25–30px displacement)
- [ ] Glow bleeds naturally; no sharp edges around fire boundary
- [ ] Evolution loops cleanly (no jump at loop point)
- [ ] Run `see-frame` at 3 different timestamps to verify visual consistency
