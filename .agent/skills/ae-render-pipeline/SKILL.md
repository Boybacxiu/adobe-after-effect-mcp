---
name: ae-render-pipeline
description: "Background rendering, headless aerender execution, and Render Queue management in After Effects without freezing the UI. Use when exporting final video files, batch rendering, or monitoring render progress."
---

# After Effects Background Render Pipeline

## 1. Step-by-Step Procedure

1. **Pre-Flight Check**:
   - Call `inspect-comp` to verify composition duration, dimensions, and active frame rate.
2. **Select Export Method**:
   - **Background aerender (Recommended)**: Call `render-aerender` (completely non-blocking, zero UI freeze).
   - **Internal AE Render Queue**: Call `add-to-render-queue`, customize via `set-render-queue-item`, then trigger `start-render`.
   - **Adobe Media Encoder**: Call `queue-in-ame` for ProRes/H.264 web delivery.
3. **Monitor Progress**:
   - Call `render-status` to inspect logs, frame completion percentage, and completion timestamps.

## 2. Best Practices & Optimization

- **Path Normalization**: Always provide absolute output paths using forward slashes `/` or double backslashes `\\`.
- **Render Settings Template**: Default to `'Best Settings'` and output module `'Lossless'` or `'High Quality'`.
- **Frame Ranges**: Pass `startFrame` and `endFrame` to render short preview test clips before exporting full sequences.

## 3. Gold Standard Workflows

### Headless aerender Background Export
```json
{
  "tool": "render-aerender",
  "arguments": {
    "compName": "Final_Export",
    "outputPath": "D:/RenderOutput/final_video.mov",
    "renderSettings": "Best Settings",
    "outputModule": "Lossless"
  }
}
```

### Check Render Progress
```json
{
  "tool": "render-status",
  "arguments": {}
}
```
