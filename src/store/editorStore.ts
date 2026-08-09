// src/store/editorStore.ts
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
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
  SportType,
} from '../types/editor';
import { useHistoryStore } from './historyStore';
import { buildThemeFromPalette } from '../lib/themeEngine';
import { TEMPLATES } from '../templates';
import { getSportProfile } from '../sports';
import { createQuotaSafeStorage } from '../lib/projectStorage';
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
  foulA: defaultModule(),
  foulB: defaultModule(),
};

function cloneColorConfig(config: ColorConfig): ColorConfig {
  return {
    ...config,
    stops: config.stops?.map((stop) => ({ ...stop })),
  };
}

function cloneEditorColors(colors: EditorColors): EditorColors {
  return Object.fromEntries(
    Object.entries(colors).map(([key, config]) => [key, cloneColorConfig(config)])
  ) as unknown as EditorColors;
}

function modulesFromTemplate(
  template: (typeof TEMPLATES)[TemplateId],
  sport: SportType | null = 'football'
): EditorModules {
  const module = (enabled: boolean, color: ColorConfig) => ({
    enabled,
    color: cloneColorConfig(color),
    size: 1,
    offsetX: 0,
    offsetY: 0,
  });

  return {
    time: module(template.modulesEnabled.time, template.colors.timeSlot),
    half: module(template.modulesEnabled.half, template.colors.halfSlot),
    yellowCardA: module(sport !== 'basketball' && template.modulesEnabled.yellowCardA, template.colors.yellowCard),
    yellowCardB: module(sport !== 'basketball' && template.modulesEnabled.yellowCardB, template.colors.yellowCard),
    redCardA: module(sport !== 'basketball' && template.modulesEnabled.redCardA, template.colors.redCard),
    redCardB: module(sport !== 'basketball' && template.modulesEnabled.redCardB, template.colors.redCard),
    foulA: module(sport === 'basketball' && (template.modulesEnabled.foulA ?? true), template.colors.highlight),
    foulB: module(sport === 'basketball' && (template.modulesEnabled.foulB ?? true), template.colors.highlight),
  };
}

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
  snapToGrid: true,
  snapSize: 4,
};


export const defaultEditorState: EditorState = {
  sport: null,
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
  // Sport profile
  setSport: (sport: SportType) => void;

  // Logo
  setLogo: (dataUrl: string | null, palette?: LogoPalette | null) => void;

  // Colors
  setColor: (key: keyof EditorColors, config: Partial<ColorConfig>) => void;
  setColorsLinked: (linked: boolean) => void;
  applyPaletteTheme: (palette: LogoPalette, variant?: number) => void;
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
  resetModulePositions: () => void;

  // Style
  setStyleMode: (mode: StyleMode) => void;
  setStyleParam: (key: keyof StyleParams, value: number) => void;

  // Template
  setTemplate: (id: TemplateId) => void;

  // Restore design state without clearing the undo/redo stacks.
  restoreState: (state: Partial<EditorState>) => void;

  // Canvas view (NOT persisted, NOT history)
  setZoom: (zoom: number) => void;
  setShowGrid: (v: boolean) => void;
  setDarkBackground: (v: boolean) => void;
  setCanvasMargin: (margin: Partial<import('../types/editor').CanvasMargin>) => void;
  setShowModuleIcons: (v: boolean) => void;
  setSnapToGrid: (v: boolean) => void;


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
    sport: s.sport,
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

      setSport: (sport) => {
        const profile = getSportProfile(sport);
        withHistory(get, set, () => ({
          sport,
          activeTemplate: profile.defaultTemplate,
          styleMode: profile.styleMode,
          layoutType: profile.layoutType,
          scorePosition: profile.scorePosition,
          logoPosition: profile.logoPosition,
          colors: cloneEditorColors(profile.colors),
          colorsLinked: profile.colorsLinked,
          style: { ...profile.style },
          dimensions: { ...profile.dimensions },
          modules: Object.fromEntries(
            Object.entries(profile.modulesEnabled).map(([key, enabled]) => [
              key,
              {
                enabled,
                color: cloneColorConfig(
                  key === 'time' ? profile.colors.timeSlot
                    : key === 'half' ? profile.colors.halfSlot
                    : key === 'foulA' || key === 'foulB' ? profile.colors.highlight
                    : key === 'yellowCardA' || key === 'yellowCardB' ? profile.colors.yellowCard
                    : key === 'redCardA' || key === 'redCardB' ? profile.colors.redCard
                    : profile.colors.timeSlot
                ),
                size: 1,
                offsetX: 0,
                offsetY: 0,
              },
            ])
          ) as unknown as EditorModules,
          activeStep: 1,
        }));
      },

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

      setColorsLinked: (linked) => {
        withHistory(get, set, (s) => ({
          colorsLinked: linked,
          // Linking means the visible A/B values are actually synchronized;
          // otherwise the UI can claim A=B while the two teams still differ.
          colors: linked
            ? {
                ...s.colors,
                teamBBg: cloneColorConfig(s.colors.teamABg),
                scoreBBg: cloneColorConfig(s.colors.scoreABg),
              }
            : s.colors,
        }));
      },

      applyPaletteTheme: (palette, variant = 0) => {
        withHistory(get, set, (s) => {
          const theme = buildThemeFromPalette(palette, variant, s.sport ?? 'football');
          const template = TEMPLATES[theme.suggestedTemplate];
          return {
            activeTemplate: theme.suggestedTemplate,
            styleMode: template.styleMode,
            layoutType: template.layoutType,
            scorePosition: template.scorePosition,
            logoPosition: template.logoPosition,
            colors: buildColorsFromPalette(palette, s.colors, variant),
            logoPalette: {
              ...palette,
              contrastWarnings: theme.contrastWarnings,
              contrastScore: theme.contrastScore,
            },
            style: { ...template.style },
            dimensions: { ...template.dimensions },
            modules: modulesFromTemplate(template, s.sport),
          };
        });
      },

      resetColors: () => {
        withHistory(get, set, () => ({ colors: defaultColors }));
      },

      // ── Layout ────────────────────────────────────────────
      setLayoutType: (layoutType) => {
        withHistory(get, set, (s) => ({
          layoutType,
          // Convert the score position to the equivalent option in the new
          // layout so the score panels never disappear during a switch.
          scorePosition: layoutType === 'left-right'
            ? (s.scorePosition === 'outer' || s.scorePosition === 'after' ? 'outer' : 'inner')
            : (s.scorePosition === 'outer' || s.scorePosition === 'after' ? 'after' : 'before'),
        }));
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
        withHistory(get, set, (s) => {
          const snap = s.canvasView.snapToGrid ? s.canvasView.snapSize : 1;
          const snapValue = (value: number) => Math.round(value / snap) * snap;
          const nextX = snapValue(offsetX);
          const nextY = snapValue(offsetY);
          return {
          modules: {
            ...s.modules,
            [key]: { ...s.modules[key], offsetX: nextX, offsetY: nextY },
          },
          };
        });
      },

      resetModulePositions: () => {
        withHistory(get, set, (s) => ({
          modules: Object.fromEntries(
            Object.entries(s.modules).map(([key, module]) => [key, { ...module, offsetX: 0, offsetY: 0 }])
          ) as EditorModules,
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
        const template = TEMPLATES[activeTemplate];
        withHistory(get, set, (s) => ({
          activeTemplate,
          styleMode: template.styleMode,
          layoutType: template.layoutType,
          scorePosition: template.scorePosition,
          logoPosition: template.logoPosition,
          colors: cloneEditorColors(template.colors),
          style: { ...template.style },
          dimensions: { ...template.dimensions },
          modules: modulesFromTemplate(template, s.sport),
        }));
      },

      restoreState: (state) => set(() => ({ ...state })),

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
      setSnapToGrid: (snapToGrid) => set(() => ({
        canvasView: { ...get().canvasView, snapToGrid },
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
      storage: createJSONStorage(() => createQuotaSafeStorage()),
      // Do not persist canvas view state or active step
      partialize: (state) => {
        const { canvasView: _cv, activeStep: _as, ...rest } = state;
        return rest;
      },
      merge: (persisted, current) => {
        const stored = (persisted ?? {}) as Partial<EditorState>;
        return {
          ...current,
          ...stored,
          // Projects saved before sport selection are treated as football;
          // brand-new projects keep null and show the first-run picker.
          sport: persisted
            ? (Object.prototype.hasOwnProperty.call(stored, 'sport') ? (stored.sport ?? null) : 'football')
            : current.sport,
          modules: { ...current.modules, ...(stored.modules ?? {}) },
        };
      },
    }
  )
);

// ── Theme builder from palette ────────────────────────────────
function buildColorsFromPalette(
  palette: LogoPalette,
  current: EditorColors,
  variant: number = 0
): EditorColors {
  const newThemeColors = buildThemeFromPalette(palette, variant).colors;
  
  return {
    ...current,
    ...newThemeColors,
    // Preserve yellow and red cards as requested by user
    yellowCard: current.yellowCard,
    redCard: current.redCard,
  };
}
