// src/components/editor/ScoreboardRenderer.tsx
// Konva-based scoreboard renderer — ZERO text nodes.
// Stage = scoreboard + canvasMargin (extra workspace for modules).
// Modules are draggable with zero-lag (state updated only on dragEnd).
import React, { useEffect, useCallback, useRef } from 'react';
import {
  Stage, Layer, Rect, Group, Image as KImage,
  Line, Arc, Circle, RegularPolygon,
} from 'react-konva';
import type Konva from 'konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import { useEditorStore } from '../../store/editorStore';
import type { ColorConfig, EditorModules, CanvasMargin } from '../../types/editor';
import { safeSkew } from '../../lib/visualSafety';

// ── Color helpers ─────────────────────────────────────────────

const createPatternImage = (type: 'stripes' | 'dots' | 'grid'): HTMLCanvasElement | null => {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  if (type === 'stripes') {
    canvas.width = 12; canvas.height = 12;
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, 12); ctx.lineTo(12, 0); ctx.stroke();
  } else if (type === 'dots') {
    canvas.width = 8; canvas.height = 8;
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.beginPath(); ctx.arc(4, 4, 1.5, 0, Math.PI * 2); ctx.fill();
  } else if (type === 'grid') {
    canvas.width = 16; canvas.height = 16;
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, 16); ctx.lineTo(16, 16); ctx.moveTo(16, 0); ctx.lineTo(16, 16); ctx.stroke();
  }
  return canvas;
};
const patternImages = {
  stripes: createPatternImage('stripes'),
  dots: createPatternImage('dots'),
  grid: createPatternImage('grid'),
};

function hexToRgba(hex: string, alpha: number): string {
  const clean = (hex || '#000000').replace('#', '');
  if (clean.length < 6) return `rgba(0,0,0,${alpha})`;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function glowProps(color: string, alpha: number, strength: number) {
  if (strength === 0) return {};
  return {
    shadowColor: hexToRgba(color, alpha),
    shadowBlur: 15 + strength * 25,
    shadowOpacity: alpha * strength,
    shadowOffset: { x: 0, y: 0 },
  };
}

function dropShadow(strength: number) {
  if (strength === 0) return {};
  return {
    shadowColor: 'rgba(0,0,0,0.9)',
    shadowBlur: 8 + strength * 12,
    shadowOpacity: strength,
    shadowOffset: { x: 2, y: 3 },
  };
}

// Konva's skew values are shear coefficients, not degrees. Keep the editor's
// percentage-like values deliberately subtle so a template can never tilt the
// whole scoreboard off its baseline.
// ── Module icon shapes ────────────────────────────────────────

interface ModuleIconProps {
  cx: number; cy: number;
  w: number; h: number;
  type: 'time' | 'half' | 'yellow-card' | 'red-card' | 'foul';
  color: string;
}

// Real football card colors
const YELLOW_CARD_COLOR = '#FFCD00'; // FIFA regulation yellow
const RED_CARD_COLOR    = '#E8000D'; // Real deep football red

const ModuleIconShape: React.FC<ModuleIconProps> = ({ cx, cy, w, h, type, color }) => {
  const r = Math.min(w, h) * 0.38;

  if (type === 'time') {
    // Tagged "preview-only" so sanitizer strips it during export → empty box remains
    return (
      <Group name="module-art">
        <Circle x={cx} y={cy} radius={r} stroke={color} strokeWidth={1.5} fill="transparent" />
        {[0, 90, 180, 270].map((deg, i) => {
          const a = (deg * Math.PI) / 180;
          return (
            <Line key={i}
              points={[cx + (r - 2) * Math.cos(a), cy + (r - 2) * Math.sin(a), cx + r * Math.cos(a), cy + r * Math.sin(a)]}
              stroke={color} strokeWidth={1.5}
            />
          );
        })}
        <Line points={[cx, cy, cx, cy - r * 0.55]} stroke={color} strokeWidth={1.5} lineCap="round" />
        <Line points={[cx, cy, cx + r * 0.4, cy - r * 0.2]} stroke={color} strokeWidth={1.2} lineCap="round" />
      </Group>
    );
  }
  if (type === 'half') {
    // Tagged "preview-only" so sanitizer strips it during export → empty box remains
    return (
      <Group name="module-art">
        <Arc x={cx} y={cy} innerRadius={r * 0.55} outerRadius={r} angle={180} rotation={-90} fill={color} opacity={0.9} />
        <Arc x={cx} y={cy} innerRadius={r * 0.55} outerRadius={r} angle={180} rotation={90} fill={color} opacity={0.4} />
      </Group>
    );
  }
  if (type === 'foul') {
    return (
      <Group name="module-art">
        {[0, 1, 2].map((index) => (
          <Circle key={index} x={cx - r * 0.7 + index * r * 0.7} y={cy} radius={Math.max(2, r * 0.28)} fill={color} />
        ))}
      </Group>
    );
  }
  // Cards: NO inner icon — the outer DraggableModule Rect IS the card itself
  // Color is forced to real football yellow/red in renderModule()
  return null;
};

// ── Draggable Module — zero-lag (state only on dragEnd) ───────

interface DraggableModuleProps {
  moduleKey: keyof EditorModules;
  baseX: number;  // default position relative to scoreboard-group origin
  baseY: number;
  w: number; h: number;
  modType: 'time' | 'half' | 'yellow-card' | 'red-card' | 'foul';
  fillColor: string;
  highlightColor: string;
  size: number;
  offsetX: number;  // stored offset from baseX
  offsetY: number;  // stored offset from baseY
  shape?: 'rect' | 'pill' | 'hexagon' | 'parallelogram';
  showIcons?: boolean;
  onOffsetChange: (key: keyof EditorModules, x: number, y: number) => void;
}

const DraggableModule: React.FC<DraggableModuleProps> = ({
  moduleKey, baseX, baseY, w, h, modType,
  fillColor, highlightColor, size,
  offsetX, offsetY, shape = 'rect', showIcons = true, onOffsetChange,
}) => {
  const mw = w * size;
  const mh = h * size;

  // Cards: use forced real football colors regardless of stored mod.color
  const isCard = modType === 'yellow-card' || modType === 'red-card';
  const isYellow = modType === 'yellow-card';
  const cardFill = isCard ? (isYellow ? YELLOW_CARD_COLOR : RED_CARD_COLOR) : fillColor;

  // Cards are portrait-oriented like real football cards
  const cardW = isCard ? mh * 0.55 : mw;  // card is portrait: narrow
  const cardH = isCard ? mh : mh;
  const cardX = isCard ? (mw - cardW) / 2 : 0;
  const cardY = 0;

  const handleDragEnd = useCallback((e: KonvaEventObject<DragEvent>) => {
    const newOX = e.target.x() - baseX;
    const newOY = e.target.y() - baseY;
    onOffsetChange(moduleKey, newOX, newOY);
  }, [baseX, baseY, moduleKey, onOffsetChange]);

  return (
    <Group
      name="module-icon"
      className="module-icon"
      x={baseX + offsetX}
      y={baseY + offsetY}
      draggable
      onDragEnd={handleDragEnd}
      onMouseEnter={(e) => {
        const stage = e.target.getStage();
        if (stage) stage.container().style.cursor = 'move';
      }}
      onMouseLeave={(e) => {
        const stage = e.target.getStage();
        if (stage) stage.container().style.cursor = 'default';
      }}
    >
      {isCard ? (
        // Real football card shape — portrait rectangle, solid color
        <Rect
          x={cardX} y={cardY}
          width={cardW} height={cardH}
          cornerRadius={3}
          fill={cardFill}
          shadowColor="rgba(0,0,0,0.6)"
          shadowBlur={8}
          shadowOffset={{ x: 2, y: 3 }}
          shadowOpacity={0.7}
        />
      ) : (
        // Time/Half: background box
        <>
          {shape === 'pill' ? (
            <Rect x={0} y={0} width={mw} height={mh} cornerRadius={mh / 2} fill={fillColor} stroke={hexToRgba(highlightColor, 0.45)} strokeWidth={1.5}
              shadowColor="rgba(0,0,0,0.65)" shadowBlur={5} shadowOffset={{ x: 1, y: 2 }} shadowOpacity={0.7} />
          ) : shape === 'hexagon' ? (
            <RegularPolygon x={mw / 2} y={mh / 2} sides={6} radius={mh / 2} fill={fillColor} stroke={hexToRgba(highlightColor, 0.45)} strokeWidth={1.5}
              shadowColor="rgba(0,0,0,0.65)" shadowBlur={5} shadowOffset={{ x: 1, y: 2 }} shadowOpacity={0.7} />
          ) : shape === 'parallelogram' ? (
            <Rect
              x={0} y={0} width={mw} height={mh} cornerRadius={2}
              skewX={-0.06}
              fill={fillColor}
              stroke={hexToRgba(highlightColor, 0.45)}
              strokeWidth={1.5}
              shadowColor="rgba(0,0,0,0.65)"
              shadowBlur={5}
              shadowOffset={{ x: 1, y: 2 }}
              shadowOpacity={0.7}
            />
          ) : (
            <Rect
              x={0} y={0} width={mw} height={mh} cornerRadius={4}
              fill={fillColor}
              stroke={hexToRgba(highlightColor, 0.45)}
              strokeWidth={1.5}
              shadowColor="rgba(0,0,0,0.65)"
              shadowBlur={5}
              shadowOffset={{ x: 1, y: 2 }}
              shadowOpacity={0.7}
            />
          )}
          {/* Icon (preview only — stripped on export) */}
          {showIcons && (
            <ModuleIconShape
              cx={mw / 2} cy={mh / 2}
              w={mw} h={mh}
              type={modType}
              color={hexToRgba(highlightColor, 0.85)}
            />
          )}
        </>
      )}
      {/* Drag handle dots — preview only, stripped on export */}
      {showIcons && (
        <Group name="preview-only">
          {[0, 3, 6].map((dy, i) => (
            <Circle
              key={i}
              x={isCard ? cardX + cardW - 5 : mw - 5}
              y={(isCard ? cardH : mh) / 2 - 3 + dy}
              radius={1.2}
              fill={isCard ? 'rgba(0,0,0,0.35)' : hexToRgba(highlightColor, 0.4)}
            />
          ))}
        </Group>
      )}
    </Group>
  );
};

// ── Canvas Margin Resize Handles ──────────────────────────────
// These handles live OUTSIDE the scoreboard, attached to the canvas boundary.
// Dragging them expands/shrinks the workspace margin (NOT the scoreboard itself).

interface MarginHandlesProps {
  sbW: number;
  sbH: number;
  margin: CanvasMargin;
  onMarginChange: (delta: Partial<CanvasMargin>) => void;
}

const MarginHandles: React.FC<MarginHandlesProps> = ({ sbW, sbH, margin, onMarginChange }) => {
  // Stage total size = sbW + left + right, sbH + top + bottom
  // Scoreboard starts at (margin.left, margin.top) within stage
  // Handles are placed at the outer edges of the full canvas area
  const totalW = sbW + margin.left + margin.right;
  const totalH = sbH + margin.top + margin.bottom;

  // We're inside the scoreboard-root Group which is offset by (margin.left, margin.top)
  // So to place handles at the canvas edge, we subtract those offsets
  const outerLeft = -margin.left;
  const outerTop = -margin.top;

  const HSIZE = 12;
  const HCOLOR = 'rgba(99,102,241,0.85)';
  const HSTROKE = 'rgba(255,255,255,0.7)';
  const GUIDE = 'rgba(99,102,241,0.25)';

  // Boundary rect (canvas outline)
  const boundaryRect = (
    <Rect
      x={outerLeft} y={outerTop}
      width={totalW} height={totalH}
      fill="transparent"
      stroke={GUIDE}
      strokeWidth={1}
      dash={[8, 5]}
      listening={false}
    />
  );

  // Label for canvas area
  const dragStartRef = useRef<{ x: number; y: number; side: string } | null>(null);

  interface EdgeHandle {
    side: 'top' | 'bottom' | 'left' | 'right';
    x: number;
    y: number;
    cursor: string;
  }

  const edgeHandles: EdgeHandle[] = [
    // Top edge handle: dragging up/down adjusts margin.top
    { side: 'top',    x: sbW / 2 - HSIZE / 2,  y: outerTop - HSIZE / 2,           cursor: 'ns-resize' },
    // Bottom edge handle: dragging up/down adjusts margin.bottom
    { side: 'bottom', x: sbW / 2 - HSIZE / 2,  y: outerTop + totalH - HSIZE / 2,  cursor: 'ns-resize' },
    // Left edge handle: dragging left/right adjusts margin.left
    { side: 'left',   x: outerLeft - HSIZE / 2, y: sbH / 2 - HSIZE / 2,           cursor: 'ew-resize' },
    // Right edge handle: dragging left/right adjusts margin.right
    { side: 'right',  x: outerLeft + totalW - HSIZE / 2, y: sbH / 2 - HSIZE / 2,  cursor: 'ew-resize' },
  ];

  return (
    <>
      {boundaryRect}

      {/* Corner label at top-left of canvas area */}
      <Rect
        x={outerLeft} y={outerTop}
        width={8} height={8}
        fill={GUIDE}
        listening={false}
      />

      {edgeHandles.map(({ side, x, y, cursor }) => (
        <Rect
          key={side}
          x={x} y={y}
          width={HSIZE} height={HSIZE}
          fill={HCOLOR}
          stroke={HSTROKE}
          strokeWidth={1.5}
          cornerRadius={3}
          draggable
          dragBoundFunc={(pos) => {
            // Constrain axis based on side
            if (side === 'top' || side === 'bottom') {
              return { x, y: pos.y }; // only vertical
            }
            return { x: pos.x, y }; // only horizontal
          }}
          onMouseEnter={(e) => {
            const stage = e.target.getStage();
            if (stage) stage.container().style.cursor = cursor;
          }}
          onMouseLeave={(e) => {
            const stage = e.target.getStage();
            if (stage) stage.container().style.cursor = 'default';
          }}
          onDragStart={(e) => {
            dragStartRef.current = { x: e.target.x(), y: e.target.y(), side };
          }}
          onDragEnd={(e) => {
            if (!dragStartRef.current) return;
            const dx = e.target.x() - dragStartRef.current.x;
            const dy = e.target.y() - dragStartRef.current.y;
            dragStartRef.current = null;

            // Snap handle back (margin in store will drive position)
            e.target.x(x);
            e.target.y(y);

            const MIN_MARGIN = 40;
            if (side === 'top') {
              onMarginChange({ top: Math.max(MIN_MARGIN, margin.top - dy) });
            } else if (side === 'bottom') {
              onMarginChange({ bottom: Math.max(MIN_MARGIN, margin.bottom + dy) });
            } else if (side === 'left') {
              onMarginChange({ left: Math.max(MIN_MARGIN, margin.left - dx) });
            } else if (side === 'right') {
              onMarginChange({ right: Math.max(MIN_MARGIN, margin.right + dx) });
            }
          }}
        />
      ))}
    </>
  );
};

// ── Main ScoreboardRenderer ───────────────────────────────────

interface ScoreboardRendererProps {
  stageRef: React.RefObject<Konva.Stage | null>;
}

const ScoreboardRenderer: React.FC<ScoreboardRendererProps> = ({
  stageRef,
}) => {
  const s = useEditorStore();
  const [logoImg, setLogoImg] = React.useState<HTMLImageElement | null>(null);
  const logoPlateShape = useEditorStore((s) => s.logoPlateShape);
  const setModuleOffset = useEditorStore((st) => st.setModuleOffset);
  const setCanvasMargin = useEditorStore((st) => st.setCanvasMargin);

  useEffect(() => {
    if (!s.logoDataUrl) { setLogoImg(null); return; }
    const img = new window.Image();
    img.onload = () => setLogoImg(img);
    img.src = s.logoDataUrl;
  }, [s.logoDataUrl]);

  const {
    sport,
    layoutType, scorePosition, logoPosition,
    dimensions, styleMode, style, colors, modules,
    logoScale, logoRotation, logoSkewX, logoOffsetX, logoOffsetY,
    logoPlateWidth, logoPlateHeight, logoPadding, showLogoPlate,
  } = s;


  const margin = s.canvasView.canvasMargin;
  const showModuleIcons = s.canvasView.showModuleIcons;

  const is3D = styleMode === '3d';
  const bevel = is3D ? style.bevelDepth : 0;
  const glow = is3D ? style.glowStrength : 0;
  const highlight = is3D ? style.highlightStrength : 0;
  const shadowStr = style.shadowStrength;
  const cornerR = style.cornerRadius;
  const borderT = style.borderThickness;
  const frameDepth = is3D ? Math.max(0, style.frameDepth || 0) : 0;
  const styleSkew = safeSkew(style.skewX);
  const logoSkew = safeSkew(logoSkewX);

  // 2D templates still receive a restrained broadcast-style edge treatment.
  // They remain clean, but no longer fall back to a single flat rectangle.
  const surfaceHighlight = Math.max(0.28, is3D ? highlight : (style.highlightStrength || 0.35));
  const surfaceShadow = Math.min(0.9, Math.max(0.3, shadowStr));
  const surfaceDepth = Math.min(
    10,
    Math.max(1.5, is3D
      ? bevel * 0.45 + frameDepth * 0.35
      : borderT * 0.6 + 1.5)
  );

  const sbW = dimensions.width;
  const sbH = dimensions.height;
  const spacing = dimensions.spacing;

  const patternImg = style.patternStyle && style.patternStyle !== 'none' 
    ? patternImages[style.patternStyle] 
    : null;

  // Stage total size = scoreboard + all margins
  const stageW = sbW + margin.left + margin.right;
  const stageH = sbH + margin.top + margin.bottom;
  // Scoreboard group placed at (margin.left, margin.top) within stage
  // The stage itself is zoomed externally via CSS transform in CanvasWorkspace

  // ── Layout ────────────────────────────────────────────────
  const isLR = layoutType === 'left-right';
  const plateSizeW = showLogoPlate ? logoPlateWidth + logoPadding * 2 : logoPlateWidth;
  let centerW = logoPosition === 'center' ? plateSizeW : 0;
  const lrContentStart = logoPosition === 'left' ? plateSizeW + spacing : spacing;
  const lrContentEnd = logoPosition === 'right' ? sbW - plateSizeW - spacing : sbW - spacing;
  const lrContentWidth = Math.max(0, lrContentEnd - lrContentStart);
  const sideWidth = isLR ? Math.floor((lrContentWidth - centerW - spacing * 2) / 2) : sbW;
  const scorePanelW = isLR ? Math.max(0, Math.min(70, Math.max(0, sideWidth) * 0.35)) : 48;

  // ── Gradient fill ─────────────────────────────────────────
  function gradientFill(cfg: ColorConfig, w: number, h: number, dir: 'h' | 'v' = 'v') {
    if (cfg.type === 'solid') return { fill: hexToRgba(cfg.color, cfg.alpha) };
    const stops = (cfg.stops && cfg.stops.length >= 2)
      ? cfg.stops
      : [{ offset: 0, color: cfg.color }, { offset: 1, color: cfg.color }];
    const cs: (string | number)[] = [];
    stops.forEach((s) => cs.push(s.offset, hexToRgba(s.color, cfg.alpha)));

    let start = { x: 0, y: h / 2 };
    let end = { x: w, y: h / 2 };
    
    if (cfg.type === 'linear' && typeof cfg.angle === 'number') {
      const rad = (cfg.angle * Math.PI) / 180;
      const cx = w / 2;
      const cy = h / 2;
      const halfLen = Math.abs((w / 2) * Math.cos(rad)) + Math.abs((h / 2) * Math.sin(rad));
      start = { x: cx - Math.cos(rad) * halfLen, y: cy - Math.sin(rad) * halfLen };
      end = { x: cx + Math.cos(rad) * halfLen, y: cy + Math.sin(rad) * halfLen };
    } else {
      const isH = cfg.type === 'horizontal' || dir === 'h';
      start = isH ? { x: 0, y: h / 2 } : { x: w / 2, y: 0 };
      end = isH ? { x: w, y: h / 2 } : { x: w / 2, y: h };
    }

    return {
      fillLinearGradientStartPoint: start,
      fillLinearGradientEndPoint: end,
      fillLinearGradientColorStops: cs,
    };
  }

  // ── Frame ─────────────────────────────────────────────────
  const renderFrame = () => {
    const bevelBand = Math.min(10, Math.max(2, surfaceDepth * 0.7));
    const frameInset = Math.min(12, Math.max(2, surfaceDepth * 0.85));
    const innerW = Math.max(1, sbW - frameInset * 2);
    const innerH = Math.max(1, sbH - frameInset * 2);
    const shadowColor = hexToRgba(colors.shadow.color, Math.min(0.84, colors.shadow.alpha * 0.75));
    const innerColor = hexToRgba(colors.frameInner.color, Math.min(0.86, colors.frameInner.alpha * 0.85));
    const highlightColor = hexToRgba(colors.highlight.color, Math.min(0.72, surfaceHighlight * 0.58));
    const accentAlpha = Math.min(0.48, Math.max(0.16, surfaceHighlight * 0.32));
    const accentW = Math.min(44, Math.max(18, sbW * 0.045));
    const accentH = Math.min(9, Math.max(4, sbH * 0.12));
    const accentY = Math.max(2, frameInset * 0.65);

    return (
      <>
        {glow > 0 && (
          <Rect x={-bevel * 0.5} y={-bevel * 0.5}
            width={sbW + bevel} height={sbH + bevel}
            cornerRadius={cornerR + 2} fill="transparent"
            {...glowProps(colors.glow.color, colors.glow.alpha, glow)} />
        )}

        {/* Offset base creates the dark metal/plastic thickness visible at the bottom edge. */}
        <Rect x={surfaceDepth * 0.45} y={surfaceDepth * 0.65}
          width={sbW} height={sbH} cornerRadius={cornerR}
          fill={shadowColor} listening={false} />
        <Rect x={0} y={0} width={sbW} height={sbH}
          cornerRadius={cornerR}
          {...gradientFill(colors.framePrimary, sbW, sbH, 'v')}
          {...dropShadow(surfaceShadow)} />

        {/* Inner rim, top light and bottom shade keep even 2D presets from looking flat. */}
        <Rect x={frameInset} y={frameInset}
          width={innerW} height={innerH}
          cornerRadius={Math.max(0, cornerR - frameInset * 0.45)}
          fill="transparent"
          stroke={innerColor}
          strokeWidth={Math.max(1, Math.min(3, surfaceDepth * 0.28))}
          listening={false} />
        <Line
          points={[Math.max(cornerR, frameInset + 2), frameInset + 1, Math.max(frameInset + 3, sbW - Math.max(cornerR, frameInset + 2)), frameInset + 1]}
          stroke={highlightColor}
          strokeWidth={Math.max(1, Math.min(2.5, surfaceDepth * 0.22))}
          lineCap="round"
          listening={false}
        />
        <Line
          points={[Math.max(cornerR, frameInset + 2), sbH - frameInset - 1, Math.max(frameInset + 3, sbW - Math.max(cornerR, frameInset + 2)), sbH - frameInset - 1]}
          stroke={shadowColor}
          strokeWidth={Math.max(1, Math.min(3, surfaceDepth * 0.3))}
          lineCap="round"
          listening={false}
        />

        {bevelBand > 0 && (
          <>
            <Rect x={0} y={0} width={sbW} height={bevelBand}
              cornerRadius={[cornerR, cornerR, 0, 0]}
              fillLinearGradientStartPoint={{ x: sbW / 2, y: 0 }}
              fillLinearGradientEndPoint={{ x: sbW / 2, y: bevelBand }}
              fillLinearGradientColorStops={[0, hexToRgba(colors.highlight.color, surfaceHighlight * 0.68), 0.42, hexToRgba(colors.highlight.color, surfaceHighlight * 0.2), 1, 'rgba(0,0,0,0)']}
              listening={false} />
            <Rect x={0} y={sbH - bevelBand} width={sbW} height={bevelBand}
              cornerRadius={[0, 0, cornerR, cornerR]}
              fillLinearGradientStartPoint={{ x: sbW / 2, y: sbH - bevelBand }}
              fillLinearGradientEndPoint={{ x: sbW / 2, y: sbH }}
              fillLinearGradientColorStops={[0, 'rgba(0,0,0,0)', 1, shadowColor]}
              listening={false} />
          </>
        )}

        <Rect x={0} y={0} width={sbW} height={sbH}
          cornerRadius={cornerR} fill="transparent"
          stroke={hexToRgba(colors.highlight.color, Math.min(0.7, surfaceHighlight * 0.62))}
          strokeWidth={Math.max(1, borderT)} listening={false} />

        {/* Small symmetric chevrons borrow the broadcast-graphic language without tilting the scoreboard. */}
        <Group
          x={sbW / 2}
          y={sbH / 2}
          offsetX={sbW / 2}
          offsetY={sbH / 2}
          skewX={styleSkew}
          listening={false}
        >
          <Line
            points={[borderT + 6, accentY, borderT + accentW, accentY, borderT + accentW - accentH, accentY + accentH, borderT + 12, accentY + accentH]}
            closed
            fill={hexToRgba(colors.highlight.color, accentAlpha)}
            stroke={hexToRgba(colors.highlight.color, accentAlpha * 0.8)}
            strokeWidth={0.6}
          />
          <Line
            points={[sbW - borderT - 6, accentY, sbW - borderT - accentW, accentY, sbW - borderT - accentW + accentH, accentY + accentH, sbW - borderT - 12, accentY + accentH]}
            closed
            fill={hexToRgba(colors.highlight.color, accentAlpha)}
            stroke={hexToRgba(colors.highlight.color, accentAlpha * 0.8)}
            strokeWidth={0.6}
          />
        </Group>

        {style.techBorders && (
          <Rect x={borderT + 4} y={borderT + 4} width={Math.max(1, sbW - borderT * 2 - 8)} height={Math.max(1, sbH - borderT * 2 - 8)}
            cornerRadius={Math.max(0, cornerR - 4)} fill="transparent"
            stroke={hexToRgba(colors.highlight.color, 0.6)} strokeWidth={1}
            dash={[8, 8]} listening={false} />
        )}
      </>
    );
  };

  const renderTeamPanel = (
    x: number,
    y: number,
    w: number,
    h: number,
    cfg: ColorConfig,
    radius: number | [number, number, number, number],
  ) => {
    const safeW = Math.max(1, w);
    const safeH = Math.max(1, h);
    const inset = Math.min(surfaceDepth * 0.55, Math.max(1, Math.min(safeW, safeH) * 0.18));
    const innerW = Math.max(1, safeW - inset * 2);
    const innerH = Math.max(1, safeH - inset * 2);
    const lineStart = Math.min(safeW * 0.4, Math.max(2, cornerR + inset));
    const lineEnd = Math.max(lineStart + 1, safeW - lineStart);
    const shadowColor = hexToRgba(colors.shadow.color, Math.min(0.76, colors.shadow.alpha * 0.62));
    const edgeColor = hexToRgba(colors.frameInner.color, Math.min(0.76, colors.frameInner.alpha * 0.72));

    return (
      <>
        <Rect x={x + surfaceDepth * 0.35} y={y + surfaceDepth * 0.5}
          width={safeW} height={safeH} cornerRadius={radius}
          fill={shadowColor} listening={false} />
        <Rect x={x} y={y} width={safeW} height={safeH}
          cornerRadius={radius}
          {...gradientFill(cfg, safeW, safeH, 'h')}
          {...dropShadow(surfaceShadow * 0.62)} />
        {patternImg && <Rect x={x} y={y} width={safeW} height={safeH}
          cornerRadius={radius} fillPatternImage={patternImg as any} listening={false} />}
        <Rect x={x + inset} y={y + inset} width={innerW} height={innerH}
          cornerRadius={Math.max(0, cornerR - inset)} fill="transparent"
          stroke={edgeColor} strokeWidth={Math.max(1, Math.min(2, surfaceDepth * 0.22))}
          listening={false} />
        <Line points={[x + lineStart, y + inset + 1, x + lineEnd, y + inset + 1]}
          stroke={hexToRgba(colors.highlight.color, Math.min(0.58, surfaceHighlight * 0.48))}
          strokeWidth={Math.max(1, Math.min(2, surfaceDepth * 0.18))}
          lineCap="round" listening={false} />
        <Line points={[x + lineStart, y + safeH - inset - 1, x + lineEnd, y + safeH - inset - 1]}
          stroke={shadowColor}
          strokeWidth={Math.max(1, Math.min(2.5, surfaceDepth * 0.24))}
          lineCap="round" listening={false} />
        {safeW > 160 && (
          <Line points={[x + safeW * 0.72, y + inset + 1, x + safeW * 0.82, y + inset + 1, x + safeW * 0.74, y + safeH - inset - 1]}
            stroke={hexToRgba(colors.highlight.color, Math.min(0.22, surfaceHighlight * 0.18))}
            strokeWidth={1.2} listening={false} />
        )}
      </>
    );
  };

  const renderScorePanel = (x: number, y: number, w: number, h: number, cfg: ColorConfig) => {
    const safeW = Math.max(1, w);
    const safeH = Math.max(1, h);
    const radius = Math.min(6, Math.max(2, cornerR * 0.35 + 1));
    const inset = Math.min(4, Math.max(1, surfaceDepth * 0.42));
    const panelShadow = hexToRgba(colors.shadow.color, Math.min(0.82, colors.shadow.alpha * 0.7));
    return (
      <>
        <Rect x={x + surfaceDepth * 0.3} y={y + surfaceDepth * 0.55}
          width={safeW} height={safeH} cornerRadius={radius}
          fill={panelShadow} listening={false} />
        <Rect x={x} y={y} width={safeW} height={safeH} cornerRadius={radius}
          {...gradientFill(cfg, safeW, safeH, 'v')}
          {...dropShadow(surfaceShadow * 0.7)} />
        <Rect x={x + inset} y={y + inset}
          width={Math.max(1, safeW - inset * 2)} height={Math.max(1, safeH - inset * 2)}
          cornerRadius={Math.max(1, radius - inset * 0.4)} fill="transparent"
          stroke={hexToRgba(colors.highlight.color, Math.min(0.62, surfaceHighlight * 0.5))}
          strokeWidth={Math.max(1, Math.min(2, surfaceDepth * 0.2))}
          listening={false} />
        <Line points={[x + inset + 2, y + safeH - inset - 1, x + safeW - inset - 2, y + safeH - inset - 1]}
          stroke={panelShadow} strokeWidth={Math.max(1, Math.min(2, surfaceDepth * 0.24))}
          lineCap="round" listening={false} />
      </>
    );
  };

  const renderLogoPlate = (x: number, y: number, w: number, h: number) => {
    const cr = logoPosition === 'left'
      ? [0, cornerR, cornerR, 0] as [number, number, number, number]
      : logoPosition === 'right'
      ? [cornerR, 0, 0, cornerR] as [number, number, number, number]
      : cornerR;
    
    // Detach logo image scale from plate dimensions
    const BASE_LOGO_SIZE = 120;
    let drawW = BASE_LOGO_SIZE;
    let drawH = BASE_LOGO_SIZE;

    if (logoImg) {
      const imgRatio = logoImg.width / logoImg.height;
      if (imgRatio > 1) {
        drawH = BASE_LOGO_SIZE / imgRatio;
      } else {
        drawW = BASE_LOGO_SIZE * imgRatio;
      }
    }

    const lw = drawW * logoScale;
    const lh = drawH * logoScale;

    const cx = x + w / 2;
    const cy = y + h / 2;

    const plateDepth = Math.min(8, Math.max(2, surfaceDepth * 0.85));
    const renderPlateShape = (px: number, py: number, depthLayer = false) => {
      const fillProps = depthLayer
        ? { fill: hexToRgba(colors.shadow.color, Math.min(0.82, colors.shadow.alpha * 0.86)) }
        : gradientFill(colors.logoPlateBg, w, h, 'v');
      const strokeProps = depthLayer
        ? { stroke: hexToRgba(colors.shadow.color, Math.min(0.9, colors.shadow.alpha)), strokeWidth: Math.max(1, borderT * 0.7) }
        : { stroke: hexToRgba(colors.highlight.color, Math.min(0.7, surfaceHighlight * 0.58)), strokeWidth: Math.max(1, borderT * 0.55) };
      
      switch (logoPlateShape) {
        case 'circle':
          return <Circle x={px + w / 2} y={py + h / 2} radius={Math.min(w, h) / 2} {...fillProps} {...strokeProps} />;
        case 'hexagon': {
          const pts = [
            px + w * 0.25, py,
            px + w * 0.75, py,
            px + w, py + h / 2,
            px + w * 0.75, py + h,
            px + w * 0.25, py + h,
            px, py + h / 2
          ];
          return <Line points={pts} closed {...fillProps} {...strokeProps} />;
        }
        case 'trapezoid': {
          const pts = [
            px, py,
            px + w, py,
            px + w * 0.8, py + h,
            px + w * 0.2, py + h
          ];
          return <Line points={pts} closed {...fillProps} {...strokeProps} />;
        }
        case 'rect':
        default:
          return <Rect x={px} y={py} width={w} height={h} cornerRadius={cr} {...fillProps} {...strokeProps} />;
      }
    };

    return (
      <>
        {showLogoPlate && renderPlateShape(x + plateDepth * 0.55, y + plateDepth, true)}
        {showLogoPlate && renderPlateShape(x, y)}
        {logoImg && (
          <KImage 
            id="logo-image" 
            image={logoImg}
            x={cx + logoOffsetX}
            y={cy + logoOffsetY}
            offsetX={lw / 2}
            offsetY={lh / 2}
            width={lw} 
            height={lh} 
            rotation={logoRotation}
            skewX={logoSkew}
          />
        )}
        {!logoImg && (
          <Group name="preview-only">
            <Circle x={cx + logoOffsetX} y={cy + logoOffsetY}
              radius={Math.min(w, h) * 0.28}
              stroke={hexToRgba(colors.highlight.color, 0.2)}
              strokeWidth={1.5} dash={[4, 4]} fill="transparent" />
            <RegularPolygon x={cx + logoOffsetX} y={cy + logoOffsetY}
              sides={6} radius={Math.min(w, h) * 0.14}
              fill={hexToRgba(colors.highlight.color, 0.12)}
              stroke={hexToRgba(colors.highlight.color, 0.18)} strokeWidth={1} />
          </Group>
        )}
      </>
    );
  };

  const renderAboveLogo = () => {
    if (logoPosition !== 'above') return null;
    const plateW = Math.min(plateSizeW, Math.max(1, sbW - spacing * 2));
    const plateH = Math.max(1, Math.min(Math.max(40, logoPlateHeight), Math.max(1, margin.top)));
    const plateY = Math.max(-margin.top, -plateH - spacing);
    return renderLogoPlate((sbW - plateW) / 2, plateY, plateW, plateH);
  };

  const handleModuleOffset = useCallback(
    (key: keyof EditorModules, x: number, y: number) => setModuleOffset(key, x, y),
    [setModuleOffset]
  );

  const handleMarginChange = useCallback(
    (delta: Partial<CanvasMargin>) => setCanvasMargin(delta),
    [setCanvasMargin]
  );

  const renderModule = (
    key: keyof EditorModules,
    type: 'time' | 'half' | 'yellow-card' | 'red-card' | 'foul',
    baseX: number, baseY: number,
    w: number, h: number
  ) => {
    const mod = modules[key];
    if (!mod.enabled) return null;

    let modColor = mod.color;
    if (key === 'time') modColor = colors.timeSlot;
    else if (key === 'half') modColor = colors.halfSlot;

    const fill = modColor.type === 'solid'
      ? hexToRgba(modColor.color, modColor.alpha)
      : hexToRgba(modColor.color, modColor.alpha);
    const isCard = type === 'yellow-card' || type === 'red-card';
    // Cards are preview-only — stripped on export
    if (isCard) {
      return (
        <Group key={key}>
          <DraggableModule
            moduleKey={key}
            baseX={baseX} baseY={baseY}
            w={w} h={h}
            modType={type}
            fillColor={fill}
            highlightColor={colors.highlight.color}
            size={mod.size}
            shape={style.moduleShape}
            showIcons={showModuleIcons}
            offsetX={mod.offsetX}
            offsetY={mod.offsetY}
            onOffsetChange={handleModuleOffset}
          />
        </Group>
      );
    }
    return (
      <DraggableModule
        key={key}
        moduleKey={key}
        baseX={baseX} baseY={baseY}
        w={w} h={h}
        modType={type}
        fillColor={fill}
        highlightColor={colors.highlight.color}
        size={mod.size}
        shape={style.moduleShape}
        showIcons={showModuleIcons}
        offsetX={mod.offsetX}
        offsetY={mod.offsetY}
        onOffsetChange={handleModuleOffset}
      />
    );
  };

  // ── LR Layout ─────────────────────────────────────────────
  const renderLRLayout = () => {
    const totalCenter = centerW;
    const leftStart = lrContentStart;
    const centerStart = Math.floor(leftStart + (lrContentWidth - totalCenter) / 2);
    const rightEnd = lrContentEnd;
    const rightStart = centerStart + totalCenter;

    // `before`/`after` are vertical-layout terms. Treat them as the outer
    // horizontal arrangement so imported/legacy templates never lose scores.
    const horizontalScorePosition = scorePosition === 'inner' ? 'inner' : 'outer';
    let leftTeamX = leftStart, leftTeamW = Math.max(0, sideWidth);
    let rightTeamX = rightStart + spacing, rightTeamW = Math.max(0, sideWidth);
    let leftScoreX = 0, leftScoreW = 0;
    let rightScoreX = 0, rightScoreW = 0;

    if (horizontalScorePosition === 'inner') {
      leftScoreW = Math.max(0, scorePanelW); rightScoreW = Math.max(0, scorePanelW);
      leftScoreX = centerStart - leftScoreW - spacing;
      rightScoreX = rightStart + spacing;
      leftTeamW = Math.max(0, leftScoreX - leftStart - spacing);
      rightTeamX = rightScoreX + rightScoreW + spacing;
      rightTeamW = Math.max(0, rightEnd - rightTeamX);
    } else {
      leftScoreW = Math.max(0, scorePanelW); rightScoreW = Math.max(0, scorePanelW);
      leftScoreX = leftStart;
      leftTeamX = leftScoreX + leftScoreW + spacing;
      leftTeamW = Math.max(0, centerStart - leftTeamX - spacing);
      rightTeamX = rightStart + spacing;
      rightTeamW = Math.max(0, rightEnd - rightTeamX - rightScoreW - spacing);
      rightScoreX = rightTeamX + rightTeamW + spacing;
    }

    const teamH = sbH - spacing * 2;
    const teamY = spacing;
    const timeW = 64, timeH = 30;
    const halfW = 48, halfH = 30;
    const cardW = 32, cardH = 40;
    const foulW = 54, foulH = 28;

    return (
      <>
        {renderTeamPanel(leftTeamX, teamY, leftTeamW, teamH, colors.teamABg, [cornerR, 0, 0, cornerR])}
        
        {leftScoreW > 0 &&
          renderScorePanel(leftScoreX, teamY, leftScoreW, teamH, colors.scoreABg)}
        
        {renderTeamPanel(rightTeamX, teamY, rightTeamW, teamH, colors.teamBBg, [0, cornerR, cornerR, 0])}
        
        {rightScoreW > 0 &&
          renderScorePanel(rightScoreX, teamY, rightScoreW, teamH, colors.scoreBBg)}

        {logoPosition === 'center' && totalCenter > 0 && renderLogoPlate(centerStart, 0, totalCenter, sbH)}
        {logoPosition === 'left' && renderLogoPlate(0, 0, logoPlateWidth + logoPadding * 2, sbH)}
        {logoPosition === 'right' && renderLogoPlate(sbW - logoPlateWidth - logoPadding * 2, 0, logoPlateWidth + logoPadding * 2, sbH)}
        {renderAboveLogo()}

        {/* Dividers */}
        {[leftScoreX, leftScoreX + leftScoreW, rightScoreX, rightScoreX + rightScoreW]
          .filter((x) => x > 0 && x < sbW)
          .map((x, i) => (
            <Line key={i} points={[x, teamY, x, teamY + teamH]}
              stroke={hexToRgba(colors.highlight.color, 0.15)} strokeWidth={1} listening={false} />
          ))}

        {/* Modules — default position outside scoreboard (in margin area) */}
        {renderModule('time', 'time', centerStart - timeW / 2, -(timeH + 8), timeW, timeH)}
        {renderModule('half', 'half', centerStart - halfW / 2, sbH + 8, halfW, halfH)}
        {renderModule('yellowCardA', 'yellow-card', leftTeamX + 4, teamY + teamH / 2 - cardH / 2, cardW, cardH)}
        {renderModule('yellowCardB', 'yellow-card', rightEnd - cardW - 4, teamY + teamH / 2 - cardH / 2, cardW, cardH)}
        {renderModule('redCardA', 'red-card', leftTeamX + cardW + 10, teamY + teamH / 2 - cardH / 2, cardW, cardH)}
        {renderModule('redCardB', 'red-card', rightEnd - cardW * 2 - 12, teamY + teamH / 2 - cardH / 2, cardW, cardH)}
        {sport === 'basketball' && renderModule('foulA', 'foul', leftTeamX + leftTeamW / 2 - foulW / 2, sbH + 8, foulW, foulH)}
        {sport === 'basketball' && renderModule('foulB', 'foul', rightTeamX + rightTeamW / 2 - foulW / 2, sbH + 8, foulW, foulH)}
      </>
    );
  };

  // ── TB Layout ─────────────────────────────────────────────
  const renderTBLayout = () => {
    const rowH = Math.floor((sbH - spacing) / 2);
    const logoW = logoPlateWidth + logoPadding * 2;
    const contentX = logoPosition === 'left' ? logoW + spacing : spacing;
    const rightLogoSpace = logoPosition === 'right' ? logoW + spacing : 0;
    const contentW = sbW - contentX - spacing - rightLogoSpace;
    const scorePW = Math.min(52, contentW * 0.22);
    const teamAY = 0, teamBY = rowH + spacing;
    let teamAX = contentX, teamAW = contentW;
    let scorePosAX = 0, scorePosBX = 0;

    if (scorePosition === 'before') {
      scorePosAX = contentX; scorePosBX = contentX;
      teamAX = contentX + scorePW + spacing;
      teamAW = contentW - scorePW - spacing;
    } else if (scorePosition === 'after') {
      scorePosAX = contentX + contentW - scorePW;
      scorePosBX = contentX + contentW - scorePW;
      teamAX = contentX;
      teamAW = contentW - scorePW - spacing;
    }

    const cardW = 24, cardH = 30;
    const foulW = 54, foulH = 26;
    return (
      <>
        {renderTeamPanel(
          teamAX,
          teamAY,
          teamAW,
          rowH,
          colors.teamABg,
          logoPosition === 'left' ? [0, cornerR, 0, 0] : [cornerR, cornerR, 0, 0],
        )}
        
        {renderTeamPanel(
          teamAX,
          teamBY,
          teamAW,
          rowH,
          colors.teamBBg,
          logoPosition === 'left' ? [0, 0, cornerR, 0] : [0, 0, cornerR, cornerR],
        )}
        {(scorePosition === 'before' || scorePosition === 'after') &&
          renderScorePanel(scorePosAX, teamAY, scorePW, rowH, colors.scoreABg)}
        {(scorePosition === 'before' || scorePosition === 'after') &&
          renderScorePanel(scorePosBX, teamBY, scorePW, rowH, colors.scoreBBg)}
        {logoPosition === 'left' && renderLogoPlate(0, 0, logoW, sbH)}
        {logoPosition === 'right' && renderLogoPlate(sbW - logoW, 0, logoW, sbH)}
        {renderAboveLogo()}
        <Line points={[contentX, rowH + spacing / 2, sbW - spacing, rowH + spacing / 2]}
          stroke={hexToRgba(colors.highlight.color, 0.12)} strokeWidth={1} listening={false} />

        {renderModule('time', 'time', -72, -4, 64, 28)}
        {renderModule('half', 'half', -72, rowH + spacing - 4, 56, 26)}
        {renderModule('yellowCardA', 'yellow-card', sbW + 4, teamAY + rowH / 2 - cardH / 2, cardW, cardH)}
        {renderModule('yellowCardB', 'yellow-card', sbW + 4, teamBY + rowH / 2 - cardH / 2, cardW, cardH)}
        {renderModule('redCardA', 'red-card', sbW + cardW + 8, teamAY + rowH / 2 - cardH / 2, cardW, cardH)}
        {renderModule('redCardB', 'red-card', sbW + cardW + 8, teamBY + rowH / 2 - cardH / 2, cardW, cardH)}
        {sport === 'basketball' && renderModule('foulA', 'foul', sbW + 4, teamAY + rowH / 2 - foulH / 2, foulW, foulH)}
        {sport === 'basketball' && renderModule('foulB', 'foul', sbW + 4, teamBY + rowH / 2 - foulH / 2, foulW, foulH)}
      </>
    );
  };

  return (
    <Stage
      ref={stageRef}
      width={stageW}
      height={stageH}
      style={{ display: 'block' }}
    >
      <Layer>
        {/* Main scoreboard group — offset by margin so it's centered in canvas area */}
        <Group x={margin.left} y={margin.top} id="scoreboard-root">
          {renderFrame()}
          {isLR ? renderLRLayout() : renderTBLayout()}

          {/* Canvas margin resize handles — preview only, wrapped so sanitizer removes them */}
          <Group id="resize-handles" name="preview-only">
            <MarginHandles
              sbW={sbW} sbH={sbH}
              margin={margin}
              onMarginChange={handleMarginChange}
            />
          </Group>
        </Group>
      </Layer>
    </Stage>
  );
};

export default ScoreboardRenderer;
