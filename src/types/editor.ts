// src/types/editor.ts
// Core type definitions for the Football Scoreboard Builder

export type LayoutType = 'left-right' | 'top-bottom';
export type ScorePosition = 'outer' | 'inner' | 'before' | 'after';
export type LogoPosition = 'center' | 'left' | 'right' | 'above' | 'hidden';
export type StyleMode = '2d' | '3d';
export type GradientType = 'solid' | 'linear' | 'vertical' | 'horizontal';
export type TemplateId =
  | 'minimal2d'
  | 'centerCrest'
  | 'leftLogoClassic'
  | 'premiumMetallic'
  | 'competitiveSplit'
  | 'compactLive'
  | 'championsLeague'
  | 'premierModern'
  | 'worldCupClassic'
  | 'esportsNeon'
  | 'mechSymmetry'
  | 'techSlantLeft'
  | 'speedAsym'
  | 'cyberNeon'
  | 'dynamicHex'
  | 'cyberpunkEdge'
  | 'retroArcade'
  | 'holoInterface'
  | 'stealthBomber'
  | 'velocityCore'
  | 'goldCup'
  | 'neonStrike'
  | 'splitArrow'
  | 'ultraWide'
  | 'glassmorphism'
  | 'ruggedMetal'
  | 'flameSplit'
  | 'arenaLive';


export interface ColorStop {
  offset: number; // 0–1
  color: string;  // hex
}

export interface ColorConfig {
  type: GradientType;
  color: string;       // primary hex
  alpha: number;       // 0–1
  stops?: ColorStop[]; // for gradients
}

export interface ModuleState {
  enabled: boolean;
  color: ColorConfig;
  size: number;         // relative scale 0.5–2.0
  offsetX: number;
  offsetY: number;
}

export interface LogoPalette {
  colors: string[];     // 5 hex colors
  dominant: string;
  secondary: string;
  accent: string;
  isDark: boolean;
  isVibrant: boolean;
  isGold: boolean;
  aspectRatio: number;
}

export interface Dimensions {
  width: number;        // scoreboard width in px (canvas units)
  height: number;       // scoreboard height in px
  spacing: number;      // internal spacing between sections
}

export interface EditorColors {
  teamABg: ColorConfig;
  teamBBg: ColorConfig;
  scoreABg: ColorConfig;
  scoreBBg: ColorConfig;
  framePrimary: ColorConfig;
  frameInner: ColorConfig;
  highlight: ColorConfig;
  glow: ColorConfig;
  shadow: ColorConfig;
  timeSlot: ColorConfig;
  halfSlot: ColorConfig;
  yellowCard: ColorConfig;
  redCard: ColorConfig;
  logoPlateBg: ColorConfig;
}

export interface EditorModules {
  time: ModuleState;
  half: ModuleState;
  yellowCardA: ModuleState;
  yellowCardB: ModuleState;
  redCardA: ModuleState;
  redCardB: ModuleState;
}

export interface StyleParams {
  borderThickness: number;   // 1–20
  cornerRadius: number;       // 0–40
  bevelDepth: number;         // 0–20
  shadowStrength: number;     // 0–1
  glowStrength: number;       // 0–1
  highlightStrength: number;  // 0–1
  frameDepth: number;         // 0–20
  skewX: number;              // -0.5 to 0.5
  techBorders: boolean;
  patternStyle: 'none' | 'stripes' | 'dots' | 'grid';
  moduleShape: 'rect' | 'pill' | 'hexagon' | 'parallelogram';
}

export interface CanvasMargin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface CanvasViewState {
  zoom: number;               // 0.1–4
  showGrid: boolean;
  darkBackground: boolean;
  canvasMargin: CanvasMargin; // extra space around scoreboard for modules
  showModuleIcons: boolean;   // show clock/arc icons on time/period modules in preview
}

export interface EditorState {
  // Logo
  logoDataUrl: string | null;
  logoPalette: LogoPalette | null;

  // Colors
  colors: EditorColors;
  colorsLinked: boolean;

  // Layout
  layoutType: LayoutType;
  scorePosition: ScorePosition;
  logoPosition: LogoPosition;
  dimensions: Dimensions;

  // Logo Controls
  logoScale: number;
  logoRotation: number;
  logoSkewX: number;
  logoOffsetX: number;
  logoOffsetY: number;
  logoPlateShape: 'rect' | 'hexagon' | 'trapezoid' | 'circle';
  logoPlateWidth: number;
  logoPlateHeight: number;
  logoPadding: number;
  showLogoPlate: boolean;

  // Modules
  modules: EditorModules;

  // Style
  styleMode: StyleMode;
  style: StyleParams;

  // Template
  activeTemplate: TemplateId;

  // Canvas View
  canvasView: CanvasViewState;

  // Active step in workflow sidebar
  activeStep: number;
}

export type ExportMode = 'fit' | 'fullhd';
export type ExportScale = 1 | 2 | 3;

export interface ExportOptions {
  mode: ExportMode;
  scale: ExportScale;
  transparentBg: boolean;
  includeLogo: boolean;
  includeModuleIcons: boolean;
}

export interface ProjectData {
  version: string;
  savedAt: string;
  state: Omit<EditorState, 'canvasView' | 'activeStep'>;
}
