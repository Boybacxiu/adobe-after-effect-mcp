---
name: ae-logo-reveal-pro
description: "Professional logo animation workflows, vector path write-on, Saber energy outlines, liquid morph reveals, metallic light sweep, and particle burst dissipation in After Effects."
---

# ae-logo-reveal-pro — Professional Logo Animation & Reveal

## 1. Step-by-Step Procedure

1. **Asset Ingestion & Vector Conversion**:
   - Import logo via `import-footage` (AI, SVG, PNG transparent).
   - If vector SVG/AI, convert to Shape Layer using `create-path` or ExtendScript `Create Shapes from Vector Layer`.
2. **Choose Animation Archetype**:
   - **Archetype 1: Outline Trace & Saber Energy** (Tech, Gaming, Modern, Cyberpunk).
   - **Archetype 2: Stroke Write-On & Trim Paths** (Minimal, Corporate, Elegant, Signature).
   - **Archetype 3: Liquid & Fluid Morph** (Creative, Friendly, Organic, Dynamic).
   - **Archetype 4: Metallic Light Sweep & 3D Extrusion** (Luxury, Cinema, Automotive).
3. **Execute Core Reveal Mechanics**:
   - Apply `Trim Paths` via `add-shape-operator` (`trim_start`, `trim_end`).
   - Or apply **VideoCopilot Saber** (`plugins/Saber/Saber.aex`) on mask path for glowing laser/energy trace.
4. **Secondary Motion & Accent Layer**:
   - Radial particle burst behind logo at reveal apex (`CC Particle World` or Shape Repeater).
   - Light Sweep pass (`CC Light Sweep`) across logo face.
   - Scale-down settle: `Scale 110% → 100%` with spring physics ease.
5. **Tagline / Subtext Reveal**:
   - Staggered by `8–12 frames` after logo mark locks in place.
   - Subtle tracking expansion (`Tracking: 0 → 120`) and opacity fade.
6. **Visual Review**: Call `see-frame` at reveal burst point (approx. 1.5s) and final lockup (approx. 3.0s).

---

## 2. Reveal Archetypes Detailed

### Archetype 1: Saber Energy Outline Reveal
Using native Saber integration (`plugins/Saber/Saber.aex`):
1. Duplicate Logo Mask onto a black solid `SABER_CORE`.
2. Apply Effect `Saber`:
   - `Customize Core > Core Type`: `Layer Masks`.
   - `Preset`: `Neon`, `Solar`, `Energy`, or `Ghost`.
   - `Glow Intensity`: `60–100`.
   - Animate `Start Offset` from `100%` to `0%` over 1.2s.
3. Blend Mode: `Add` or `Screen` over the fill logo.

### Archetype 2: Trim Paths Stroke Write-On
1. Vector paths separated into strokes (no fill initially).
2. Add Trim Paths operator:
   ```json
   {
     "tool": "add-shape-operator",
     "arguments": {
       "compName": "Logo Reveal",
       "layerName": "LOGO_STROKES",
       "operatorType": "trim_paths",
       "properties": {
         "start": 0,
         "end": 0
       }
     }
   }
   ```
3. Keyframe `end`: `0% at 0.0s → 100% at 1.2s` with strong Ease In-Out (`Incoming: 80%`, `Outgoing: 75%`).
4. Once stroke finishes, reveal solid logo fill via Scale Pop / Opacity fade in 6 frames.

### Archetype 3: Metallic CC Light Sweep
Adds high-end commercial polish to the logo face once revealed:
```json
{
  "tool": "apply-effect",
  "arguments": {
    "compName": "Logo Reveal",
    "layerName": "LOGO_FILL",
    "effectName": "CC Light Sweep"
  }
}
```
Properties:
- `Center`: Keyframed from `[-200, 540]` to `[2120, 540]` over 0.8s.
- `Edge Intensity`: `80`.
- `Light Intensity`: `120`.
- `Shape`: `Sharp` or `Smooth`.

---

## 4. Radial Accent Burst (Behind Logo)

A 12-ray shape repeater burst at the moment of logo lockup:
- Create Shape Layer with single vertical line `[0, -40] to [0, -120]`.
- Add **Repeater** (`Copies: 12`, `Rotation: 30°`).
- Animate Trim Paths:
  - `Start`: `0% at 1.0s → 100% at 1.5s`.
  - `End`: `0% at 0.9s → 100% at 1.4s`.
- Creates a quick popping radial starburst that expands and disappears.

---

## 5. Timeline Rhythm (Standard 4-Second Logo Reveal)

```
0.0s ─────── 1.2s ─────── 1.8s ─────── 3.2s ─────── 4.0s
[ Energy / Outline ]      [ Logo Fill ]  [ Settle & Hold ]
[ Trace in / Write-on]   [ Pop + Burst]  [ Tagline Read  ] [ Outro ]
```

- **0.0s – 1.2s**: Build anticipation (energy path, stroke trace, dark ambient background).
- **1.2s – 1.6s**: Climax / Lockup (radial burst, sound beat sync, full logo pops in).
- **1.6s – 2.0s**: Light sweep glints across surface, tagline fades in below.
- **2.0s – 3.5s**: Solid hold for brand recognition (minimum 1.5s static read).
- **3.5s – 4.0s**: Optional smooth fade out or camera push-through.

---

## 6. Quality Checklist

- [ ] Logo vector paths are clean with correct anchor points at geometric center.
- [ ] Reveal timing follows the 4-second rhythm (anticipation $\to$ climax $\to$ hold).
- [ ] Sound sync markers placed at reveal apex using `add-marker`.
- [ ] Light Sweep or Saber glow is balanced, not overexposing logo colors.
- [ ] Tagline is legible and hierarchy is clear (logo = 100% prominence, tagline = 60%).
- [ ] Verified visual quality via `see-frame` at peak reveal and final hold.
