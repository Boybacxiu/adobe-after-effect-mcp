---
name: ae-3d-cinematic-camera
description: "Cinematic 3D camera setups, two-node rig with orbit null, camera physics, depth of field, rack focus, 2.5D parallax layering, and camera transitions in After Effects. Use when animating 3D cameras, adding depth of field, cinematic orbits, dolly zooms, or camera shake."
---

# ae-3d-cinematic-camera — Cinematic 3D Camera & Parallax Mastery

## 1. Step-by-Step Procedure

1. **Enable 3D Space**: Turn 3D switch on target layers using `set-3d-layer` or `modify-layer` (`threeD: true`).
2. **Create Camera Rig**:
   - Create Camera: Call `create-camera` (prefer `50mm` or `35mm` two-node camera).
   - Create Orbit Null: Call `add-null-layer` (named `CAM_TARGET` or `CAM_ORBIT`), enable 3D.
   - Link Camera to Null: Call `set-layer-parent` so Camera follows Null for clean rotation/positioning without gimbal lock.
3. **Establish 2.5D Z-Depth Hierarchy**:
   - **Foreground** (`Z: -300 to -800`): Dust particles, light streaks, framing elements.
   - **Midground / Focal Subject** (`Z: 0`): Main text, character, product, or logo.
   - **Background** (`Z: +800 to +3000`): Ambient gradients, mountains, grid planes, dark plates.
4. **Configure Camera Optics & Depth of Field (DoF)**:
   - Call `set-camera-options` to enable `depthOfField: true`.
   - Calculate Focus Distance to match distance between camera and subject: `length(position - target)`.
   - Set Aperture (`Aperture: 40–80px`) and Blur Level (`100–250%`) for cinematic bokeh.
5. **Apply Motion & Easing**:
   - Orbit / Pan: Animate `CAM_TARGET` rotation or position using Ease Out or Remotion Spring curves.
   - Camera Shake / Handheld feel: Apply subtle wiggle expressions to Position / Point of Interest.
6. **Visual Inspection**: Call `see-frame` at multiple timestamps to check parallax separation and focus accuracy.

---

## 2. Camera Rig Architecture

### Two-Node Camera Rig (Gold Standard)
Always rig the camera to a 3D Null controller to avoid gimbal lock and jittery Point of Interest calculations:
```
[ Comp: 3D_SCENE ]
  ├── CAM_TARGET (3D Null at [960, 540, 0])  <-- Animate Position & Rotation here
  │     └── MAIN_CAMERA (3D Camera at [960, 540, -1777]) <-- Parented to CAM_TARGET
  ├── FG_ELEMENTS (3D Layer, Z = -400)
  ├── SUBJECT_NODE (3D Layer, Z = 0)
  └── BG_PLATE (3D Layer, Z = +1500)
```

### Auto-Focus Expression (Rack Focus Automation)
To automatically keep the camera focused on the subject layer regardless of movement:
```javascript
// Apply to Camera's "Focus Distance" property:
targetLayer = thisComp.layer("SUBJECT_NODE");
targetPos = targetLayer.toWorld(targetLayer.anchorPoint);
camPos = thisLayer.toWorld([0, 0, 0]);
length(targetPos, camPos);
```

---

## 3. Cinematic Camera Moves

### A. The Orbit Sweep (Product / Title Reveal)
- Camera starts at Angle `Y: -45°`, `Z-distance: -1200`.
- Rotates smoothly to `Y: 0°` with strong deceleration ease (`Ease Out 85%`).
- Simultaneous push-in on Z-axis (`-1500` to `-900`).

### B. Dolly Zoom (Vertigo Effect)
- Camera pushes forward along Z (`Position Z` moves from `-2000` to `-600`).
- Zoom / Focal Length decreases inversely:
```javascript
// Expression on Camera "Zoom":
startDist = 2000;
startZoom = 2000;
dist = length(position, thisComp.layer("CAM_TARGET").position);
startZoom * (dist / startDist);
```

### C. Handheld Organic Camera Drift (Subtle Wiggle)
```javascript
// Apply to Camera Position or CAM_TARGET Position:
w = wiggle(0.8, 12);
[w[0], w[1], value[2]]; // Keep Z stable or subtle
```

---

## 4. MCP Tool Execution Patterns

### Step 1: Create Camera and 3D Controller
```json
{
  "tool": "create-camera",
  "arguments": {
    "compName": "Cinematic Scene",
    "name": "Cinematic_Cam_50mm",
    "focalLength": 50
  }
}
```
Followed by:
```json
{
  "tool": "add-null-layer",
  "arguments": {
    "compName": "Cinematic Scene",
    "name": "CAM_TARGET",
    "threeD": true,
    "position": [960, 540, 0]
  }
}
```
Link camera to null:
```json
{
  "tool": "set-layer-parent",
  "arguments": {
    "compName": "Cinematic Scene",
    "layerName": "Cinematic_Cam_50mm",
    "parentName": "CAM_TARGET"
  }
}
```

### Step 2: Configure Depth of Field
```json
{
  "tool": "set-camera-options",
  "arguments": {
    "compName": "Cinematic Scene",
    "cameraName": "Cinematic_Cam_50mm",
    "depthOfField": true,
    "focusDistance": 1777,
    "aperture": 50,
    "blurLevel": 150
  }
}
```

---

## 5. Quality Checklist

- [ ] Camera is parented to a 3D Null controller (`CAM_TARGET`).
- [ ] At least 3 distinct Z-depth planes exist (Foreground, Midground, Background) for visible parallax.
- [ ] Depth of field is enabled with realistic aperture (`30–60px`, not blown out to total blur).
- [ ] Motion blur is activated on the composition and all moving 3D layers.
- [ ] No sudden camera snapping or gimbal flipping at $90^\circ$ pitch angles.
- [ ] Verified visual depth with `see-frame` at start and middle of the camera move.
