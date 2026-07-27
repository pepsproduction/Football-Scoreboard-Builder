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

// ── Module icon shapes ────────────────────────────────────────

interface ModuleIconProps {
  cx: number; cy: number;
  w: number; h: number;
  type: 'time' | 'half' | 'yellow-card' | 'red-card';
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
      <Group name="preview-only">
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
      <Group name="preview-only">
        <Arc x={cx} y={cy} innerRadius={r * 0.55} outerRadius={r} angle={180} rotation={-90} fill={color} opacity={0.9} />
        <Arc x={cx} y={cy} innerRadius={r * 0.55} outerRadius={r} angle={180} rotation={90} fill={color} opacity={0.4} />
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
  modType: 'time' | 'half' | 'yellow-card' | 'red-card';
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
            <Rect x={0} y={0} width={mw} height={mh} cornerRadius={mh / 2} fill={fillColor} stroke={hexToRgba(highlightColor, 0.35)} strokeWidth={1.5} />
          ) : shape === 'hexagon' ? (
            <RegularPolygon x={mw / 2} y={mh / 2} sides={6} radius={mh / 2} fill={fillColor} stroke={hexToRgba(highlightColor, 0.35)} strokeWidth={1.5} />
          ) : shape === 'parallelogram' ? (
            <Rect x={0} y={0} width={mw} height={mh} cornerRadius={2} skewX={-0.3} fill={fillColor} stroke={hexToRgba(highlightColor, 0.35)} strokeWidth={1.5} />
          ) : (
            <Rect x={0} y={0} width={mw} height={mh} cornerRadius={4} fill={fillColor} stroke={hexToRgba(highlightColor, 0.35)} strokeWidth={1.5} />
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
              return { x: x + HSIZE / 2, y: pos.y }; // only vertical
            }
            return { x: pos.x, y: y + HSIZE / 2 }; // only horizontal
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
    layoutType, scorePosition, logoPosition,
    dimensions, styleMode, style, colors, modules,
    logoScale, logoRotation, logoSkewX, logoOffsetX, logoOffsetY,
    logoPlateWidth, logoPadding, showLogoPlate,
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
  const sideWidth = isLR ? Math.floor((sbW - centerW - spacing * 2) / 2) : sbW;
  const scorePanelW = isLR ? Math.min(70, sideWidth * 0.35) : 48;

  // ── Gradient fill ─────────────────────────────────────────
  function gradientFill(cfg: ColorConfig, w: number, h: number, dir: 'h' | 'v' = 'v') {
    if (cfg.type === 'solid') return { fill: hexToRgba(cfg.color, cfg.alpha) };
    const stops = (cfg.stops && cfg.stops.length >= 2)
      ? cfg.stops
      : [{ offset: 0, color: cfg.color }, { offset: 1, color: cfg.color }];
    const cs: (string | number)[] = [];
    stops.forEach((s) => cs.push(s.offset, hexToRgba(s.color, cfg.alpha)));
    const isH = cfg.type === 'horizontal' || dir === 'h';
    return {
      fillLinearGradientStartPoint: isH ? { x: 0, y: h / 2 } : { x: w / 2, y: 0 },
      fillLinearGradientEndPoint:   isH ? { x: w, y: h / 2 } : { x: w / 2, y: h },
      fillLinearGradientColorStops: cs,
    };
  }

  // ── Frame ─────────────────────────────────────────────────
  const renderFrame = () => (
    <>
      {glow > 0 && (
        <Rect x={-bevel * 0.5} y={-bevel * 0.5}
          width={sbW + bevel} height={sbH + bevel}
          cornerRadius={cornerR + 2} fill="transparent"
          {...glowProps(colors.glow.color, colors.glow.alpha, glow)} />
      )}
      <Rect x={0} y={0} width={sbW} height={sbH}
        cornerRadius={cornerR}
        {...gradientFill(colors.framePrimary, sbW, sbH, 'v')}
        {...dropShadow(shadowStr)} />
      {is3D && (
        <Rect x={borderT} y={borderT}
          width={sbW - borderT * 2} height={sbH - borderT * 2}
          cornerRadius={Math.max(0, cornerR - 2)}
          fill="transparent"
          stroke={hexToRgba(colors.frameInner.color, colors.frameInner.alpha)}
          strokeWidth={1} />
      )}
      {bevel > 0 && (
        <Rect x={0} y={0} width={sbW} height={bevel * 0.5}
          cornerRadius={[cornerR, cornerR, 0, 0]}
          fillLinearGradientStartPoint={{ x: sbW / 2, y: 0 }}
          fillLinearGradientEndPoint={{ x: sbW / 2, y: bevel * 0.5 }}
          fillLinearGradientColorStops={[0, hexToRgba(colors.highlight.color, highlight * 0.7), 1, 'rgba(0,0,0,0)']}
          listening={false} />
      )}
      <Rect x={0} y={0} width={sbW} height={sbH}
        cornerRadius={cornerR} fill="transparent"
        stroke={hexToRgba(colors.highlight.color, is3D ? highlight * 0.6 : 0.3)}
        strokeWidth={borderT} listening={false} />
      
      {style.techBorders && (
        <Rect x={borderT + 4} y={borderT + 4} width={sbW - borderT * 2 - 8} height={sbH - borderT * 2 - 8}
          cornerRadius={Math.max(0, cornerR - 4)} fill="transparent"
          stroke={hexToRgba(colors.highlight.color, 0.6)} strokeWidth={1}
          dash={[8, 8]} listening={false} />
      )}
    </>
  );

  const renderScorePanel = (x: number, y: number, w: number, h: number, cfg: ColorConfig) => (
    <Rect x={x} y={y} width={w} height={h} cornerRadius={2}
      {...gradientFill(cfg, w, h, 'v')}
      shadowColor="rgba(0,0,0,0.5)" shadowBlur={4} shadowOffset={{ x: 0, y: 1 }} />
  );

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

    const renderPlateShape = () => {
      const fillProps = gradientFill(colors.logoPlateBg, w, h, 'v');
      const strokeProps = { stroke: hexToRgba(colors.highlight.color, highlight * 0.3), strokeWidth: 1 };
      
      switch (logoPlateShape) {
        case 'circle':
          return <Circle x={cx} y={cy} radius={Math.min(w, h) / 2} {...fillProps} {...strokeProps} />;
        case 'hexagon': {
          const pts = [
            x + w * 0.25, y,
            x + w * 0.75, y,
            x + w, y + h / 2,
            x + w * 0.75, y + h,
            x + w * 0.25, y + h,
            x, y + h / 2
          ];
          return <Line points={pts} closed {...fillProps} {...strokeProps} />;
        }
        case 'trapezoid': {
          const pts = [
            x, y,
            x + w, y,
            x + w * 0.8, y + h,
            x + w * 0.2, y + h
          ];
          return <Line points={pts} closed {...fillProps} {...strokeProps} />;
        }
        case 'rect':
        default:
          return <Rect x={x} y={y} width={w} height={h} cornerRadius={cr} {...fillProps} {...strokeProps} />;
      }
    };

    return (
      <>
        {showLogoPlate && renderPlateShape()}
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
            skewX={(logoSkewX || 0) - (style.skewX || 0)}
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
    type: 'time' | 'half' | 'yellow-card' | 'red-card',
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
        <Group key={key} name="preview-only">
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
    const leftStart = spacing;
    const centerStart = Math.floor((sbW - totalCenter) / 2);
    const rightEnd = sbW - spacing;
    const rightStart = centerStart + totalCenter;

    let leftTeamX = leftStart, leftTeamW = sideWidth;
    let rightTeamX = rightStart + spacing, rightTeamW = sideWidth;
    let leftScoreX = 0, leftScoreW = 0;
    let rightScoreX = 0, rightScoreW = 0;

    if (scorePosition === 'inner') {
      leftScoreW = scorePanelW; rightScoreW = scorePanelW;
      leftScoreX = centerStart - leftScoreW - spacing;
      rightScoreX = rightStart + spacing;
      leftTeamW = leftScoreX - leftStart - spacing;
      rightTeamX = rightScoreX + rightScoreW + spacing;
      rightTeamW = rightEnd - rightTeamX;
    } else if (scorePosition === 'outer') {
      leftScoreW = scorePanelW; rightScoreW = scorePanelW;
      leftScoreX = leftStart;
      leftTeamX = leftScoreX + leftScoreW + spacing;
      leftTeamW = centerStart - leftTeamX - spacing;
      rightTeamX = rightStart + spacing;
      rightTeamW = rightEnd - rightTeamX - rightScoreW - spacing;
      rightScoreX = rightTeamX + rightTeamW + spacing;
    }

    const teamH = sbH - spacing * 2;
    const teamY = spacing;
    const timeW = 64, timeH = 30;
    const halfW = 48, halfH = 30;
    const cardW = 32, cardH = 40;

    return (
      <>
        <Rect x={leftTeamX} y={teamY} width={Math.max(0, leftTeamW)} height={teamH}
          cornerRadius={[cornerR, 0, 0, cornerR]}
          {...gradientFill(colors.teamABg, leftTeamW, teamH, 'h')} />
        {patternImg && <Rect x={leftTeamX} y={teamY} width={Math.max(0, leftTeamW)} height={teamH} cornerRadius={[cornerR, 0, 0, cornerR]} fillPatternImage={patternImg as any} listening={false} />}
        
        {(scorePosition === 'inner' || scorePosition === 'outer') && leftScoreW > 0 &&
          renderScorePanel(leftScoreX, teamY, leftScoreW, teamH, colors.scoreABg)}
        
        <Rect x={rightTeamX} y={teamY} width={Math.max(0, rightTeamW)} height={teamH}
          cornerRadius={[0, cornerR, cornerR, 0]}
          {...gradientFill(colors.teamBBg, rightTeamW, teamH, 'h')} />
        {patternImg && <Rect x={rightTeamX} y={teamY} width={Math.max(0, rightTeamW)} height={teamH} cornerRadius={[0, cornerR, cornerR, 0]} fillPatternImage={patternImg as any} listening={false} />}
        
        {(scorePosition === 'inner' || scorePosition === 'outer') && rightScoreW > 0 &&
          renderScorePanel(rightScoreX, teamY, rightScoreW, teamH, colors.scoreBBg)}

        {logoPosition === 'center' && totalCenter > 0 && renderLogoPlate(centerStart, 0, totalCenter, sbH)}
        {logoPosition === 'left' && renderLogoPlate(0, 0, logoPlateWidth + logoPadding * 2, sbH)}
        {logoPosition === 'right' && renderLogoPlate(sbW - logoPlateWidth - logoPadding * 2, 0, logoPlateWidth + logoPadding * 2, sbH)}

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
      </>
    );
  };

  // ── TB Layout ─────────────────────────────────────────────
  const renderTBLayout = () => {
    const rowH = Math.floor((sbH - spacing) / 2);
    const logoW = logoPlateWidth + logoPadding * 2;
    const contentX = logoPosition === 'left' ? logoW + spacing : spacing;
    const contentW = sbW - contentX - spacing;
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
    return (
      <>
        <Rect x={teamAX} y={teamAY} width={Math.max(0, teamAW)} height={rowH}
          cornerRadius={logoPosition === 'left' ? [0, cornerR, 0, 0] : [cornerR, cornerR, 0, 0]}
          {...gradientFill(colors.teamABg, teamAW, rowH, 'h')} />
        {patternImg && <Rect x={teamAX} y={teamAY} width={Math.max(0, teamAW)} height={rowH} cornerRadius={logoPosition === 'left' ? [0, cornerR, 0, 0] : [cornerR, cornerR, 0, 0]} fillPatternImage={patternImg as any} listening={false} />}
        
        <Rect x={teamAX} y={teamBY} width={Math.max(0, teamAW)} height={rowH}
          cornerRadius={logoPosition === 'left' ? [0, 0, cornerR, 0] : [0, 0, cornerR, cornerR]}
          {...gradientFill(colors.teamBBg, teamAW, rowH, 'h')} />
        {patternImg && <Rect x={teamAX} y={teamBY} width={Math.max(0, teamAW)} height={rowH} cornerRadius={logoPosition === 'left' ? [0, 0, cornerR, 0] : [0, 0, cornerR, cornerR]} fillPatternImage={patternImg as any} listening={false} />}
        {(scorePosition === 'before' || scorePosition === 'after') &&
          renderScorePanel(scorePosAX, teamAY, scorePW, rowH, colors.scoreABg)}
        {(scorePosition === 'before' || scorePosition === 'after') &&
          renderScorePanel(scorePosBX, teamBY, scorePW, rowH, colors.scoreBBg)}
        {logoPosition === 'left' && renderLogoPlate(0, 0, logoW, sbH)}
        <Line points={[contentX, rowH + spacing / 2, sbW - spacing, rowH + spacing / 2]}
          stroke={hexToRgba(colors.highlight.color, 0.12)} strokeWidth={1} listening={false} />

        {renderModule('time', 'time', -72, -4, 64, 28)}
        {renderModule('half', 'half', -72, rowH + spacing - 4, 56, 26)}
        {renderModule('yellowCardA', 'yellow-card', sbW + 4, teamAY + rowH / 2 - cardH / 2, cardW, cardH)}
        {renderModule('yellowCardB', 'yellow-card', sbW + 4, teamBY + rowH / 2 - cardH / 2, cardW, cardH)}
        {renderModule('redCardA', 'red-card', sbW + cardW + 8, teamAY + rowH / 2 - cardH / 2, cardW, cardH)}
        {renderModule('redCardB', 'red-card', sbW + cardW + 8, teamBY + rowH / 2 - cardH / 2, cardW, cardH)}
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
          <Group skewX={style.skewX || 0}>
            {renderFrame()}
            {isLR ? renderLRLayout() : renderTBLayout()}
          </Group>

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
