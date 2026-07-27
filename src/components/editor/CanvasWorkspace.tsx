// src/components/editor/CanvasWorkspace.tsx
// The canvas area wraps the Konva stage which is (sbW + margins) × (sbH + margins).
// Scrollable, zoomable. Panels on left/right handle scrolling internally.
import React, { useRef, useCallback, useEffect } from 'react';
import type Konva from 'konva';
import ScoreboardRenderer from './ScoreboardRenderer';
import CanvasToolbar from './CanvasToolbar';
import { useEditorStore } from '../../store/editorStore';

interface CanvasWorkspaceProps {
  stageRef: React.RefObject<Konva.Stage | null>;
}

const CanvasWorkspace: React.FC<CanvasWorkspaceProps> = ({ stageRef }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = React.useState({ w: 800, h: 500 });

  const zoom       = useEditorStore((s) => s.canvasView.zoom);
  const showGrid   = useEditorStore((s) => s.canvasView.showGrid);
  const darkBg     = useEditorStore((s) => s.canvasView.darkBackground);
  const margin     = useEditorStore((s) => s.canvasView.canvasMargin);
  const setZoom    = useEditorStore((s) => s.setZoom);
  const dimensions = useEditorStore((s) => s.dimensions);

  // Full stage size includes scoreboard + workspace margins
  const stageW = dimensions.width  + margin.left + margin.right;
  const stageH = dimensions.height + margin.top  + margin.bottom;

  // Track container size for fit-to-screen
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerSize({ w: entry.contentRect.width, h: entry.contentRect.height });
      }
    });
    observer.observe(containerRef.current);
    setContainerSize({ w: containerRef.current.clientWidth, h: containerRef.current.clientHeight });
    return () => observer.disconnect();
  }, []);

  const handleFit = useCallback(() => {
    const pad = 40;
    const scaleX = (containerSize.w - pad * 2) / stageW;
    const scaleY = (containerSize.h - pad * 2) / stageH;
    setZoom(Math.max(0.1, Math.min(scaleX, scaleY, 2)));
  }, [containerSize, stageW, stageH, setZoom]);

  // Wheel to zoom (no scroll interference with panels)
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const step = e.ctrlKey ? 0.15 : 0.08;
    const delta = e.deltaY > 0 ? -step : step;
    setZoom(Math.min(4, Math.max(0.08, zoom + delta)));
  }, [zoom, setZoom]);

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Canvas scroll + zoom area */}
      <div
        ref={containerRef}
        className={showGrid ? (darkBg ? 'transparent-grid' : 'transparent-grid-light') : ''}
        style={{
          flex: 1,
          overflow: 'auto',
          position: 'relative',
          background: !showGrid ? (darkBg ? '#0a0f1e' : '#d0d0dc') : undefined,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onWheel={handleWheel}
      >
        {/* Scaled wrapper — CSS scale only, no state updates during zoom animation */}
        <div
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'center center',
            flexShrink: 0,
            // Use will-change to hint GPU compositing for smooth zoom
            willChange: 'transform',
          }}
        >
          {/* Scoreboard boundary markers (decorative only — Konva stage fills this div) */}
          <div
            style={{
              position: 'relative',
              width: stageW,
              height: stageH,
              // Subtle shadow to show canvas area extent
              boxShadow: `inset 0 0 0 1px rgba(255,255,255,0.05)`,
            }}
          >
            <ScoreboardRenderer stageRef={stageRef} />

            {/* Scoreboard corner brackets (outside konva — decorative) */}
            {(['tl', 'tr', 'bl', 'br'] as const).map((pos) => {
              const isT = pos[0] === 't';
              const isL = pos[1] === 'l';
              return (
                <div
                  key={pos}
                  style={{
                    position: 'absolute',
                    top:    isT ? margin.top - 1  : undefined,
                    bottom: !isT ? margin.bottom - 1 : undefined,
                    left:   isL ? margin.left - 1  : undefined,
                    right:  !isL ? margin.right - 1 : undefined,
                    width: 16, height: 16,
                    borderTop:    isT  ? '2px solid rgba(59,130,246,0.7)' : undefined,
                    borderBottom: !isT ? '2px solid rgba(59,130,246,0.7)' : undefined,
                    borderLeft:   isL  ? '2px solid rgba(59,130,246,0.7)' : undefined,
                    borderRight:  !isL ? '2px solid rgba(59,130,246,0.7)' : undefined,
                    pointerEvents: 'none',
                    zIndex: 10,
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Status bar */}
        <div
          style={{
            position: 'absolute',
            bottom: 52,
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: 10,
            color: 'rgba(255,255,255,0.4)',
            background: 'rgba(0,0,0,0.5)',
            padding: '3px 10px',
            borderRadius: 6,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            display: 'flex',
            gap: 10,
          }}
        >
          <span>กรอบ: {dimensions.width} × {dimensions.height} px</span>
          <span style={{ opacity: 0.5 }}>|</span>
          <span>Canvas: {stageW} × {stageH} px</span>
          <span style={{ opacity: 0.5 }}>|</span>
          <span>{Math.round(zoom * 100)}%</span>
        </div>

        {/* Usage hint */}
        <div
          style={{
            position: 'absolute',
            top: 8,
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: 10,
            color: 'rgba(255,255,255,0.2)',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          ลากขอบสีม่วงเพื่อขยายพื้นที่รอบกรอบ · ลากโมดูลเพื่อวางตำแหน่ง · Scroll เพื่อซูม
        </div>
      </div>

      {/* Toolbar */}
      <div
        style={{
          position: 'absolute',
          bottom: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 20,
        }}
      >
        <CanvasToolbar onFit={handleFit} />
      </div>
    </div>
  );
};

export default CanvasWorkspace;
