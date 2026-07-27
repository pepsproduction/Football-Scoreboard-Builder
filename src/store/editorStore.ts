// src/store/editorStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  EditorState,
  EditorColors,
  EditorModules,
  StyleParams,
  LayoutType,
  ScorePosition,
  LogoPosition,
  StyleMode,
  ColorConfig,
  TemplateId,
  LogoPalette,
  CanvasViewState,
  Dimensions,
} from '../types/editor';
import { useHistoryStore } from './historyStore';

// ── Default values ────────────────────────────────────────────
const defaultColor = (color: string, alpha = 1): ColorConfig => ({
  type: 'solid',
  color,
  alpha,
});

export const defaultColors: EditorColors = {
  teamABg:     defaultColor('#0f1f3d'),
  teamBBg:     defaultColor('#0f1f3d'),
  scoreABg:    defaultColor('#1a2a55'),
  scoreBBg:    defaultColor('#1a2a55'),
  framePrimary: defaultColor('#162244'),
  frameInner:  defaultColor('#0d1526'),
  highlight:   defaultColor('#60a5fa'),
  glow:        defaultColor('#3b82f6', 0.6),
  shadow:      defaultColor('#000000', 0.8),
  timeSlot:    defaultColor('#0a1628'),
  halfSlot:    defaultColor('#0a1628'),
  yellowCard:  defaultColor('#ca8a04'),
  redCard:     defaultColor('#dc2626'),
  logoPlateBg: defaultColor('#0d1526', 0.9),
};

const defaultModule = (): import('../types/editor').ModuleState => ({
  enabled: false,
  color: defaultColor('#0a1628'),
  size: 1.0,
  offsetX: 0,
  offsetY: 0,
});

export const defaultModules: EditorModules = {
  time: defaultModule(),
  half: defaultModule(),
  yellowCardA: defaultModule(),
  yellowCardB: defaultModule(),
  redCardA: defaultModule(),
  redCardB: defaultModule(),
};

export const defaultStyle: StyleParams = {
  borderThickness: 3,
  cornerRadius: 6,
  bevelDepth: 8,
  shadowStrength: 0.7,
  glowStrength: 0.4,
  highlightStrength: 1,
  frameDepth: 0,
  skewX: 0,
  techBorders: false,
  patternStyle: 'none',
  moduleShape: 'rect',
};

export const defaultDimensions: Dimensions = {
  width: 900,
  height: 80,
  spacing: 4,
};

const defaultCanvasView: CanvasViewState = {
  zoom: 1,
  showGrid: true,
  darkBackground: true,
  canvasMargin: { top: 80, right: 120, bottom: 80, left: 120 },
  showModuleIcons: false,  // default OFF
};


export const defaultEditorState: EditorState = {
  logoDataUrl: null,
  logoPalette: null,
  colors: defaultColors,
  colorsLinked: true,
  layoutType: 'left-right',
  scorePosition: 'inner',
  logoPosition: 'center',
  dimensions: defaultDimensions,
  logoScale: 1,
  logoRotation: 0,
  logoSkewX: 0,
  logoOffsetX: 0,
  logoOffsetY: 0,
  logoPlateShape: 'rect',
  logoPlateWidth: 80,
  logoPlateHeight: 80,
  logoPadding: 8,
  showLogoPlate: true,
  modules: defaultModules,
  styleMode: '3d',
  style: defaultStyle,
  activeTemplate: 'centerCrest',
  canvasView: defaultCanvasView,
  activeStep: 1,
};

// ── Store type ─────────────────────────────────────────────────
interface EditorStore extends EditorState {
  // Logo
  setLogo: (dataUrl: string | null, palette?: LogoPalette | null) => void;

  // Colors
  setColor: (key: keyof EditorColors, config: Partial<ColorConfig>) => void;
  setColorsLinked: (linked: boolean) => void;
  applyPaletteTheme: (palette: LogoPalette) => void;
  resetColors: () => void;

  // Layout
  setLayoutType: (layout: LayoutType) => void;
  setScorePosition: (pos: ScorePosition) => void;
  setDimensions: (d: Partial<Dimensions>) => void;

  // Logo placement & size
  setLogoPosition: (pos: LogoPosition) => void;
  setLogoScale: (scale: number) => void;
  setLogoRotation: (rotation: number) => void;
  setLogoSkewX: (skew: number) => void;
  setLogoOffset: (x: number, y: number) => void;
  setLogoPlateShape: (shape: 'rect' | 'hexagon' | 'trapezoid' | 'circle') => void;

  setLogoPlateSize: (w: number, h: number) => void;
  setLogoPadding: (v: number) => void;
  setShowLogoPlate: (v: boolean) => void;

  // Modules
  setModuleEnabled: (key: keyof EditorModules, enabled: boolean) => void;
  setModuleColor: (key: keyof EditorModules, config: Partial<ColorConfig>) => void;
  setModuleSize: (key: keyof EditorModules, size: number) => void;
  setModuleOffset: (key: keyof EditorModules, x: number, y: number) => void;

  // Style
  setStyleMode: (mode: StyleMode) => void;
  setStyleParam: (key: keyof StyleParams, value: number) => void;

  // Template
  setTemplate: (id: TemplateId) => void;

  // Canvas view (NOT persisted, NOT history)
  setZoom: (zoom: number) => void;
  setShowGrid: (v: boolean) => void;
  setDarkBackground: (v: boolean) => void;
  setCanvasMargin: (margin: Partial<import('../types/editor').CanvasMargin>) => void;
  setShowModuleIcons: (v: boolean) => void;


  // Workflow step
  setActiveStep: (step: number) => void;

  // Project management
  resetProject: () => void;
  loadState: (state: Partial<EditorState>) => void;
}

// Helper: push current state to history before mutating
function withHistory(
  get: () => EditorStore,
  set: (fn: (s: EditorStore) => Partial<EditorStore>) => void,
  mutate: (draft: EditorStore) => Partial<EditorStore>
) {
  const current = get();
  // Push snapshot (omit functions and canvas view)
  useHistoryStore.getState().push(snapshotState(current));
  // CRITICAL: must wrap mutate in a function - set(mutate) is wrong in Zustand
  set((s) => mutate(s));
}

function snapshotState(s: EditorStore): EditorState {
  const {
    logoDataUrl, logoPalette, colors, colorsLinked,
    layoutType, scorePosition, logoPosition, dimensions,
    logoScale, logoRotation, logoSkewX, logoOffsetX, logoOffsetY, 
    logoPlateShape, logoPlateWidth,
    logoPlateHeight, logoPadding, showLogoPlate,
    modules, styleMode, style, activeTemplate,
  } = s;
  return {
    logoDataUrl, logoPalette, colors, colorsLinked,
    layoutType, scorePosition, logoPosition, dimensions,
    logoScale, logoRotation, logoSkewX, logoOffsetX, logoOffsetY, 
    logoPlateShape, logoPlateWidth,
    logoPlateHeight, logoPadding, showLogoPlate,
    modules, styleMode, style, activeTemplate,
    canvasView: s.canvasView, // keep current, won't be restored on undo
    activeStep: s.activeStep,
  };
}

// ── Create store ──────────────────────────────────────────────
export const useEditorStore = create<EditorStore>()(
  persist(
    (set, get) => ({
      ...defaultEditorState,

      // ── Logo ──────────────────────────────────────────────
      setLogo: (dataUrl, palette) => {
        withHistory(get, set, () => ({
          logoDataUrl: dataUrl,
          logoPalette: palette ?? null,
        }));
      },

      // ── Colors ────────────────────────────────────────────
      setColor: (key, config) => {
        withHistory(get, set, (s) => ({
          colors: {
            ...s.colors,
            [key]: { ...s.colors[key], ...config },
          },
        }));
      },

      setColorsLinked: (linked) => set(() => ({ colorsLinked: linked })),

      applyPaletteTheme: (palette) => {
        withHistory(get, set, (s) => ({
          colors: buildColorsFromPalette(palette, s.colors),
        }));
      },

      resetColors: () => {
        withHistory(get, set, () => ({ colors: defaultColors }));
      },

      // ── Layout ────────────────────────────────────────────
      setLayoutType: (layoutType) => {
        withHistory(get, set, () => ({ layoutType }));
      },

      setScorePosition: (scorePosition) => {
        withHistory(get, set, () => ({ scorePosition }));
      },

      // ── Logo placement ──────────────────────────────────────
      setLogoPosition: (pos) => withHistory(get, set, () => ({ logoPosition: pos })),
      setLogoScale: (scale) => withHistory(get, set, () => ({ logoScale: scale })),
      setLogoRotation: (rotation) => withHistory(get, set, () => ({ logoRotation: rotation })),
      setLogoSkewX: (skew) => withHistory(get, set, () => ({ logoSkewX: skew })),
      setLogoOffset: (x, y) => withHistory(get, set, () => ({ logoOffsetX: x, logoOffsetY: y })),
      setLogoPlateShape: (shape) => withHistory(get, set, () => ({ logoPlateShape: shape })),

      setDimensions: (d) => {
        withHistory(get, set, (s) => ({
          dimensions: { ...s.dimensions, ...d },
        }));
      },

      setLogoPlateSize: (logoPlateWidth, logoPlateHeight) => {
        withHistory(get, set, () => ({ logoPlateWidth, logoPlateHeight }));
      },

      setLogoPadding: (logoPadding) => {
        withHistory(get, set, () => ({ logoPadding }));
      },

      setShowLogoPlate: (showLogoPlate) => {
        withHistory(get, set, () => ({ showLogoPlate }));
      },

      // ── Modules ───────────────────────────────────────────
      setModuleEnabled: (key, enabled) => {
        withHistory(get, set, (s) => ({
          modules: {
            ...s.modules,
            [key]: { ...s.modules[key], enabled },
          },
        }));
      },

      setModuleColor: (key, config) => {
        withHistory(get, set, (s) => ({
          modules: {
            ...s.modules,
            [key]: {
              ...s.modules[key],
              color: { ...s.modules[key].color, ...config },
            },
          },
        }));
      },

      setModuleSize: (key, size) => {
        withHistory(get, set, (s) => ({
          modules: {
            ...s.modules,
            [key]: { ...s.modules[key], size },
          },
        }));
      },

      setModuleOffset: (key, offsetX, offsetY) => {
        withHistory(get, set, (s) => ({
          modules: {
            ...s.modules,
            [key]: { ...s.modules[key], offsetX, offsetY },
          },
        }));
      },

      // ── Style ─────────────────────────────────────────────
      setStyleMode: (styleMode) => {
        withHistory(get, set, () => ({ styleMode }));
      },

      setStyleParam: (key, value) => {
        withHistory(get, set, (s) => ({
          style: { ...s.style, [key]: value },
        }));
      },

      // ── Template ──────────────────────────────────────────
      setTemplate: (activeTemplate) => {
        withHistory(get, set, () => ({ activeTemplate }));
      },

      // ── Canvas view (NOT in history, NOT in export) ───────
      setZoom: (zoom) => set(() => ({ canvasView: { ...get().canvasView, zoom } })),
      setShowGrid: (v) => set(() => ({ canvasView: { ...get().canvasView, showGrid: v } })),
      setDarkBackground: (v) => set(() => ({ canvasView: { ...get().canvasView, darkBackground: v } })),
      setCanvasMargin: (margin) => set(() => ({
        canvasView: { ...get().canvasView, canvasMargin: { ...get().canvasView.canvasMargin, ...margin } },
      })),

      setShowModuleIcons: (showModuleIcons) => set(() => ({
        canvasView: { ...get().canvasView, showModuleIcons },
      })),

      // ── Workflow step ─────────────────────────────────────
      setActiveStep: (activeStep) => set(() => ({ activeStep })),

      // ── Project management ────────────────────────────────
      resetProject: () => {
        useHistoryStore.getState().clear();
        set(() => ({ ...defaultEditorState }));
      },

      loadState: (state) => {
        useHistoryStore.getState().clear();
        set(() => ({ ...state }));
      },
    }),
    {
      name: 'fsb-project-v1',
      // Do not persist canvas view state or active step
      partialize: (state) => {
        const { canvasView: _cv, activeStep: _as, ...rest } = state;
        return rest;
      },
    }
  )
);

// ── Theme builder from palette ────────────────────────────────
function buildColorsFromPalette(
  palette: LogoPalette,
  current: EditorColors
): EditorColors {
  const { dominant, secondary, accent, isDark, isGold } = palette;

  const frame = isDark ? darken(dominant, 0.3) : darken(dominant, 0.5);
  const highlight = isGold ? '#f59e0b' : lighten(accent, 0.3);
  const glow = accent;

  return {
    ...current,
    framePrimary: { type: 'linear', color: frame, alpha: 1, stops: [
      { offset: 0, color: lighten(frame, 0.1) },
      { offset: 1, color: darken(frame, 0.2) },
    ]},
    frameInner: defaultColor(darken(frame, 0.15)),
    teamABg: defaultColor(darken(dominant, 0.4)),
    teamBBg: defaultColor(darken(dominant, 0.4)),
    scoreABg: defaultColor(darken(secondary, 0.3)),
    scoreBBg: defaultColor(darken(secondary, 0.3)),
    highlight: defaultColor(highlight),
    glow: { ...current.glow, color: glow },
    logoPlateBg: { ...current.logoPlateBg, color: darken(dominant, 0.5) },
  };
}

// Simple color helpers
function darken(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, (num >> 16) - Math.round(255 * amount));
  const g = Math.max(0, ((num >> 8) & 0xff) - Math.round(255 * amount));
  const b = Math.max(0, (num & 0xff) - Math.round(255 * amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

function lighten(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, (num >> 16) + Math.round(255 * amount));
  const g = Math.min(255, ((num >> 8) & 0xff) + Math.round(255 * amount));
  const b = Math.min(255, (num & 0xff) + Math.round(255 * amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}
