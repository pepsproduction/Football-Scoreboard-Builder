// Local project JSON, named project snapshots, logo compression, and safe storage.
import type { EditorState, ProjectData, ModuleState } from '../types/editor';

const PROJECT_VERSION = '1.1.0';
const STORAGE_KEY = 'fsb-project-v1';
const PROJECT_LIBRARY_KEY = 'fsb-project-library-v1';
const LOGO_SIZE_WARN_BYTES = 1_000_000;

const REQUIRED_STATE_KEYS = [
  'logoDataUrl', 'logoPalette', 'colors', 'colorsLinked',
  'layoutType', 'scorePosition', 'logoPosition', 'dimensions',
  'logoScale', 'logoRotation', 'logoSkewX', 'logoOffsetX', 'logoOffsetY',
  'logoPlateShape', 'logoPlateWidth', 'logoPlateHeight', 'logoPadding',
  'showLogoPlate', 'modules', 'styleMode', 'style', 'activeTemplate',
] as const;

const COLOR_KEYS = [
  'teamABg', 'teamBBg', 'scoreABg', 'scoreBBg', 'framePrimary', 'frameInner',
  'highlight', 'glow', 'shadow', 'timeSlot', 'halfSlot', 'yellowCard',
  'redCard', 'logoPlateBg',
] as const;

const REQUIRED_MODULE_KEYS = [
  'time', 'half', 'yellowCardA', 'yellowCardB', 'redCardA', 'redCardB',
] as const;

const OPTIONAL_MODULE_KEYS = ['foulA', 'foulB'] as const;

export interface SavedProjectSummary {
  id: string;
  name: string;
  savedAt: string;
  sizeKB: number;
}

interface SavedProject extends SavedProjectSummary {
  state: ProjectData['state'];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function createFallbackModule(color = '#ff9b2f'): ModuleState {
  return {
    enabled: false,
    color: { type: 'solid', color, alpha: 1 },
    size: 1,
    offsetX: 0,
    offsetY: 0,
  };
}

function validateProjectState(value: unknown): asserts value is ProjectData['state'] {
  if (!isRecord(value)) throw new Error('invalid project JSON: state must be an object');

  const missing = REQUIRED_STATE_KEYS.filter((key) => !(key in value));
  if (missing.length > 0) throw new Error(`invalid project JSON: missing ${missing.join(', ')}`);

  if (!isRecord(value.colors)) throw new Error('invalid project JSON: colors');
  for (const key of COLOR_KEYS) {
    const color = value.colors[key];
    if (!isRecord(color) || typeof color.type !== 'string' || typeof color.color !== 'string' || !isFiniteNumber(color.alpha)) {
      throw new Error(`invalid project JSON: colors.${key}`);
    }
  }

  if (!isRecord(value.modules)) throw new Error('invalid project JSON: modules');
  for (const key of REQUIRED_MODULE_KEYS) {
    const module = value.modules[key];
    if (!isRecord(module) || typeof module.enabled !== 'boolean' || !isFiniteNumber(module.size) ||
        !isFiniteNumber(module.offsetX) || !isFiniteNumber(module.offsetY) || !isRecord(module.color)) {
      throw new Error(`invalid project JSON: modules.${key}`);
    }
  }
  for (const key of OPTIONAL_MODULE_KEYS) {
    if (key in value.modules) {
      const module = value.modules[key];
      if (!isRecord(module) || typeof module.enabled !== 'boolean' || !isFiniteNumber(module.size) ||
          !isFiniteNumber(module.offsetX) || !isFiniteNumber(module.offsetY) || !isRecord(module.color)) {
        throw new Error(`invalid project JSON: modules.${key}`);
      }
    }
  }

  if (!isRecord(value.style) ||
      !isFiniteNumber(value.style.borderThickness) ||
      !isFiniteNumber(value.style.cornerRadius) ||
      !isFiniteNumber(value.style.bevelDepth) ||
      !isFiniteNumber(value.style.shadowStrength) ||
      !isFiniteNumber(value.style.glowStrength) ||
      !isFiniteNumber(value.style.highlightStrength) ||
      !isFiniteNumber(value.style.frameDepth) ||
      !isFiniteNumber(value.style.skewX) ||
      typeof value.style.techBorders !== 'boolean' ||
      typeof value.style.patternStyle !== 'string' ||
      typeof value.style.moduleShape !== 'string') {
    throw new Error('invalid project JSON: style');
  }

  if (!isRecord(value.dimensions) ||
      !isFiniteNumber(value.dimensions.width) ||
      !isFiniteNumber(value.dimensions.height) ||
      !isFiniteNumber(value.dimensions.spacing)) {
    throw new Error('invalid project JSON: dimensions');
  }

  if (!['left-right', 'top-bottom'].includes(String(value.layoutType)) ||
      !['inner', 'outer', 'before', 'after'].includes(String(value.scorePosition)) ||
      !['center', 'left', 'right', 'above', 'hidden'].includes(String(value.logoPosition)) ||
      !['2d', '3d'].includes(String(value.styleMode)) ||
      typeof value.activeTemplate !== 'string') {
    throw new Error('invalid project JSON: layout/style values');
  }
  if ('sport' in value && value.sport !== null && value.sport !== 'football' && value.sport !== 'basketball') {
    throw new Error('invalid project JSON: sport');
  }
}

/** Add fields introduced after v1.0 without breaking older project files. */
export function normalizeProjectState(state: ProjectData['state']): ProjectData['state'] {
  const modules = state.modules as ProjectData['state']['modules'] & Partial<Record<'foulA' | 'foulB', ModuleState>>;
  const sportState = state as ProjectData['state'] & { sport?: 'football' | 'basketball' | null };
  return {
    ...state,
    sport: Object.prototype.hasOwnProperty.call(state, 'sport') ? (sportState.sport ?? null) : 'football',
    modules: {
      ...modules,
      foulA: modules.foulA ?? createFallbackModule(),
      foulB: modules.foulB ?? createFallbackModule(),
    },
  };
}

export function createProjectData(state: EditorState): ProjectData {
  return {
    version: PROJECT_VERSION,
    savedAt: new Date().toISOString(),
    state: normalizeProjectState({
      sport: state.sport,
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
      logoPlateHeight: state.logoPlateHeight || 80,
      logoPadding: state.logoPadding || 0,
      showLogoPlate: state.showLogoPlate,
      modules: state.modules,
      styleMode: state.styleMode,
      style: state.style,
      activeTemplate: state.activeTemplate,
    }),
  };
}

/** Export current state as a downloadable JSON file. */
export function exportProjectJSON(state: EditorState): void {
  const data = createProjectData(state);
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
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

export function parseProjectJSON(json: string): ProjectData['state'] {
  const data = JSON.parse(json) as unknown;
  if (!isRecord(data) || typeof data.version !== 'string' || !isRecord(data.state)) {
    throw new Error('invalid project JSON: missing version or state');
  }
  if (!data.version.startsWith('1.')) throw new Error(`unsupported project version ${data.version}`);
  validateProjectState(data.state);
  return normalizeProjectState(data.state);
}

/** Import a project from a JSON file selected by the user. */
export async function importProjectJSON(file: File): Promise<Partial<EditorState>> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        resolve(parseProjectJSON(String(event.target?.result || '')));
      } catch (error) {
        reject(error instanceof Error ? error : new Error('cannot read project JSON'));
      }
    };
    reader.onerror = () => reject(new Error('cannot read project file'));
    reader.readAsText(file);
  });
}

export function checkLogoSize(dataUrl: string | null): { ok: boolean; sizeKB: number; warning?: string } {
  if (!dataUrl) return { ok: true, sizeKB: 0 };
  const sizeBytes = Math.round((dataUrl.length * 3) / 4);
  const sizeKB = Math.round(sizeBytes / 1024);
  return sizeBytes > LOGO_SIZE_WARN_BYTES
    ? { ok: false, sizeKB, warning: `Logo มีขนาด ${sizeKB} KB อาจทำให้ LocalStorage เต็ม` }
    : { ok: true, sizeKB };
}

/** Re-encode large logos while preserving transparency where possible. */
export async function compressLogoDataUrl(dataUrl: string, maxDimension = 720): Promise<string> {
  if (!dataUrl || typeof document === 'undefined') return dataUrl;
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });
  const width = image.naturalWidth || image.width;
  const height = image.naturalHeight || image.height;
  if (!width || !height || (width <= maxDimension && dataUrl.length < 900_000)) return dataUrl;

  const scale = Math.min(1, maxDimension / Math.max(width, height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));
  const context = canvas.getContext('2d');
  if (!context) return dataUrl;
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  const webp = canvas.toDataURL('image/webp', 0.92);
  const png = canvas.toDataURL('image/png');
  return [webp, png, dataUrl].sort((a, b) => a.length - b.length)[0];
}

function readProjectLibrary(): SavedProject[] {
  try {
    const value = localStorage.getItem(PROJECT_LIBRARY_KEY);
    if (!value) return [];
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? parsed.filter((item): item is SavedProject => isRecord(item) && typeof item.id === 'string' && typeof item.name === 'string' && isRecord(item.state)) : [];
  } catch {
    return [];
  }
}

export function listSavedProjects(): SavedProjectSummary[] {
  return readProjectLibrary()
    .sort((a, b) => b.savedAt.localeCompare(a.savedAt))
    .map(({ id, name, savedAt, sizeKB }) => ({ id, name, savedAt, sizeKB }));
}

export function loadSavedProject(id: string): ProjectData['state'] | null {
  return readProjectLibrary().find((project) => project.id === id)?.state ?? null;
}

export function saveNamedProject(name: string, state: EditorState): SavedProjectSummary {
  const trimmedName = name.trim() || `โปรเจกต์ ${new Date().toLocaleDateString('th-TH')}`;
  const data = createProjectData(state);
  const id = `project-${Date.now().toString(36)}`;
  const saved: SavedProject = {
    id,
    name: trimmedName,
    savedAt: new Date().toISOString(),
    sizeKB: Math.round(JSON.stringify(data).length / 1024),
    state: data.state,
  };
  const next = [saved, ...readProjectLibrary()].slice(0, 20);
  try {
    localStorage.setItem(PROJECT_LIBRARY_KEY, JSON.stringify(next));
  } catch {
    // Quota-safe fallback: preserve the design and drop only the large logo.
    const fallback = { ...saved, state: { ...saved.state, logoDataUrl: null, logoPalette: null } };
    localStorage.setItem(PROJECT_LIBRARY_KEY, JSON.stringify([fallback, ...readProjectLibrary()].slice(0, 20)));
  }
  return { id: saved.id, name: saved.name, savedAt: saved.savedAt, sizeKB: saved.sizeKB };
}

export function deleteSavedProject(id: string): void {
  try {
    localStorage.setItem(PROJECT_LIBRARY_KEY, JSON.stringify(readProjectLibrary().filter((project) => project.id !== id)));
  } catch {
    // Ignore storage cleanup errors.
  }
}

/** Storage adapter used by Zustand so a large logo cannot crash autosave. */
export function createQuotaSafeStorage() {
  return {
    getItem: (name: string) => localStorage.getItem(name),
    removeItem: (name: string) => localStorage.removeItem(name),
    setItem: (name: string, value: string) => {
      try {
        localStorage.setItem(name, value);
      } catch {
        try {
          const parsed = JSON.parse(value) as { state?: { logoDataUrl?: string | null; logoPalette?: unknown } };
          if (parsed.state) {
            parsed.state.logoDataUrl = null;
            parsed.state.logoPalette = null;
          }
          localStorage.setItem(name, JSON.stringify(parsed));
        } catch {
          // Autosave remains best-effort; the explicit JSON export is still available.
        }
      }
    },
  };
}

export function clearProjectStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore.
  }
}

export function clearSavedProjects(): void {
  try {
    localStorage.removeItem(PROJECT_LIBRARY_KEY);
  } catch {
    // Ignore.
  }
}
