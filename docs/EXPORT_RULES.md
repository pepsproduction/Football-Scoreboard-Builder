## Export Rules

### What the exported PNG MUST contain:
- Scoreboard frame structure (rects, shapes, borders)
- Background colors / gradients
- Glow, shadow, highlight effects
- Uploaded tournament/event logo (if enabled)
- Module slot icons (card icon, clock icon — no numbers)
- Team slot areas (empty, no text)

### What the exported PNG MUST NOT contain:
- Team names
- Scores / numbers of any kind
- Time values
- "TEAM A" / "TEAM B" / "HOME" / "AWAY"
- "1ST", "2ND", "Half 1", "Half 2"
- "0-0", "00:00"
- Lorem ipsum / Sample / Placeholder text
- Any UI labels or captions from the editor
- Screenshots of the browser UI

### Export Sanitization Protocol
```
sanitizeExportStage(clonedStage):
  1. Walk all Konva nodes recursively
  2. Find any Konva.Text nodes
  3. Remove them from the clone
  4. Re-walk to verify zero Text nodes remain
  5. If any Text node found after step 4 → throw Error → abort export
```

### Export Method
- Must use Konva `stage.toDataURL()` — NOT html2canvas or dom-to-image screenshot
- Must set `pixelRatio` for scale (1×/2×/3×)
- Must NOT set a background fill on the export stage (transparent)
