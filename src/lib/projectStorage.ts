// src/lib/projectStorage.ts
// LocalStorage project save/load/import/export
import type { EditorState, ProjectData } from '../types/editor';

const PROJECT_VERSION = '1.0.0';
const STORAGE_KEY = 'fsb-project-v1';
const LOGO_SIZE_WARN_BYTES = 1_000_000; // 1MB

/**
 * Export current state as a downloadable JSON file.
 */
export function exportProjectJSON(state: EditorState): void {
  const data: ProjectData = {
    version: PROJECT_VERSION,
    savedAt: new Date().toISOString(),
    state: {
      logoDataUrl: state.logoDataUrl,
      logoPalette: state.logoPalette,
      colors: state.colors,
      colorsLinked: state.colorsLinked,
      layoutType: state.layoutType,
      scorePosition: state.scorePosition,
      logoPosition: state.logoPosition,
      dimensions: state.dimensions,
      logoScale: state.logoScale,
      logoRotation: state.logoRotation || 0,
      logoSkewX: state.logoSkewX || 0,
      logoOffsetX: state.logoOffsetX || 0,
      logoOffsetY: state.logoOffsetY || 0,
      logoPlateShape: state.logoPlateShape || 'rect',
      logoPlateWidth: state.logoPlateWidth || 80,
      logoPlateHeight: state.logoPlateHeight,
      logoPadding: state.logoPadding,
      showLogoPlate: state.showLogoPlate,
      modules: state.modules,
      styleMode: state.styleMode,
      style: state.style,
      activeTemplate: state.activeTemplate,
    },
  };

  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const timestamp = new Date().toISOString().slice(0, 10);
  const link = document.createElement('a');
  link.href = url;
  link.download = `fsb-project-${timestamp}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Import a project from a JSON file selected by the user.
 * Returns the parsed state or throws if invalid.
 */
export async function importProjectJSON(
  file: File
): Promise<Partial<EditorState>> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = e.target?.result as string;
        const data = JSON.parse(json) as ProjectData;

        if (!data.version || !data.state) {
          throw new Error('ไฟล์ JSON ไม่ถูกต้อง: ขาดข้อมูล version หรือ state');
        }

        resolve(data.state);
      } catch (err) {
        reject(
          err instanceof Error
            ? err
            : new Error('ไม่สามารถอ่านไฟล์ JSON ได้')
        );
      }
    };
    reader.onerror = () => reject(new Error('ไม่สามารถอ่านไฟล์ได้'));
    reader.readAsText(file);
  });
}

/**
 * Check if logo data URL is too large to store efficiently.
 */
export function checkLogoSize(dataUrl: string | null): {
  ok: boolean;
  sizeKB: number;
  warning?: string;
} {
  if (!dataUrl) return { ok: true, sizeKB: 0 };
  const sizeBytes = Math.round((dataUrl.length * 3) / 4);
  const sizeKB = Math.round(sizeBytes / 1024);

  if (sizeBytes > LOGO_SIZE_WARN_BYTES) {
    return {
      ok: false,
      sizeKB,
      warning: `ขนาด Logo (${sizeKB} KB) อาจทำให้ LocalStorage เต็ม แนะนำใช้ Logo ขนาดเล็กกว่า 500 KB`,
    };
  }
  return { ok: true, sizeKB };
}

/**
 * Clear project from LocalStorage (complement to Zustand persist).
 */
export function clearProjectStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore
  }
}
