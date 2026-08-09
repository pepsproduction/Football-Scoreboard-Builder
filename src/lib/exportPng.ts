// src/lib/exportPng.ts
// PNG export system using Konva stage.toDataURL()
import Konva from 'konva';
import { sanitizeExportStage } from './exportSanitizer';
import type { ExportOptions } from '../types/editor';

export interface ExportResult {
  success: boolean;
  filename: string;
  error?: string;
}

/**
 * Export the scoreboard as a transparent PNG.
 * Uses Konva's native toDataURL — NOT a browser screenshot.
 * For 'fit' mode: crops to exact scoreboard bounds (not the full container).
 *
 * @param stage - The preview Konva.Stage reference
 * @param options - Export configuration
 * @param scoreboardWidth - Actual scoreboard width in px
 * @param scoreboardHeight - Actual scoreboard height in px
 */
export async function exportScoreboard(
  stage: Konva.Stage,
  options: ExportOptions,
  scoreboardWidth?: number,
  scoreboardHeight?: number,
  marginLeft = 0,
  marginTop = 0
): Promise<ExportResult> {
  const { mode, scale, includeLogo, includeModuleIcons } = options;

  // Find the scoreboard root group for its actual offset
  const rootGroup = stage.findOne('#scoreboard-root') as Konva.Group | undefined;
  // Use provided margin or fallback to rootGroup position
  const rootX = rootGroup ? rootGroup.x() : marginLeft;
  const rootY = rootGroup ? rootGroup.y() : marginTop;
  const sbW = scoreboardWidth  ?? (rootGroup ? (rootGroup.width()  || stage.width())  : stage.width());
  const sbH = scoreboardHeight ?? (rootGroup ? (rootGroup.height() || stage.height()) : stage.height());

  // ── Step 1: Create off-screen stage ──────────────────────
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '-9999px';
  container.style.left = '-9999px';
  container.style.visibility = 'hidden';
  document.body.appendChild(container);

  let exportStage: Konva.Stage | null = null;

  try {
    const presetWidth = mode === 'fullhd' ? 1920 : mode === 'hd720' ? 1280 : undefined;
    const presetHeight = mode === 'fullhd' ? 1080 : mode === 'hd720' ? 720 : undefined;
    let exportWidth = presetWidth ?? stage.width();
    let exportHeight = presetHeight ?? stage.height();
    let layerOffsetX = 0;
    let layerOffsetY = 0;

    if (presetWidth && presetHeight) {
      exportWidth = presetWidth;
      exportHeight = presetHeight;
      // Center scoreboard in 1920×1080
      layerOffsetX = (exportWidth - sbW) / 2 - rootX;
      layerOffsetY = (exportHeight - sbH) / 2 - rootY;
    }

    exportStage = new Konva.Stage({
      container,
      width: exportWidth,
      height: exportHeight,
    });

    // Clone all layers and shift them so scoreboard starts at (0,0)
    stage.getLayers().forEach((layer) => {
      const clonedLayer = layer.clone() as Konva.Layer;
      clonedLayer.x(layerOffsetX);
      clonedLayer.y(layerOffsetY);

      // Remove logo if not included
      if (!includeLogo) {
        clonedLayer.find('#logo-image').forEach((n) => n.destroy());
      }

      // Remove module icons if not included
      if (!includeModuleIcons) {
        clonedLayer.find('.module-icon').forEach((n) => n.destroy());
      }

      exportStage!.add(clonedLayer);
    });

    // ── Step 2: Sanitize — remove ALL text nodes ──────────
    sanitizeExportStage(exportStage);

    if (mode === 'fit') {
      const clonedRoot = exportStage.findOne('#scoreboard-root');
      const bounds = clonedRoot?.getClientRect({ skipShadow: false }) ?? {
        x: rootX,
        y: rootY,
        width: sbW,
        height: sbH,
      };
      const left = Math.floor(bounds.x);
      const top = Math.floor(bounds.y);
      const right = Math.ceil(bounds.x + bounds.width);
      const bottom = Math.ceil(bounds.y + bounds.height);

      exportWidth = Math.max(1, right - left);
      exportHeight = Math.max(1, bottom - top);
      exportStage.width(exportWidth);
      exportStage.height(exportHeight);
      exportStage.getLayers().forEach((layer) => {
        layer.x(layer.x() - left);
        layer.y(layer.y() - top);
      });
    }

    // ── Step 3: Export to data URL ────────────────────────
    exportStage.draw();

    const dataUrl = exportStage.toDataURL({
      pixelRatio: scale,
      mimeType: 'image/png',
      // No fill = transparent background
    });

    // ── Step 4: Download ──────────────────────────────────
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const modeSuffix = `${exportWidth}x${exportHeight}`;
    const filename = `scoreboard-${modeSuffix}-${scale}x-${timestamp}.png`;

    triggerDownload(dataUrl, filename);

    return { success: true, filename };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการ Export';
    return { success: false, filename: '', error: message };
  } finally {
    if (exportStage) {
      exportStage.destroy();
    }
    if (container.parentNode) {
      document.body.removeChild(container);
    }
  }
}

function triggerDownload(dataUrl: string, filename: string): void {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
