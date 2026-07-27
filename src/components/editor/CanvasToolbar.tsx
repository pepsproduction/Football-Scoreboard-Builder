// src/components/editor/CanvasToolbar.tsx
import React from 'react';
import { ZoomIn, ZoomOut, Maximize2, Grid3X3, Sun, Moon, RotateCcw } from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';

const ZOOM_STEP = 0.15;
const ZOOM_MIN = 0.2;
const ZOOM_MAX = 3.0;

interface CanvasToolbarProps {
  onFit: () => void;
}

const CanvasToolbar: React.FC<CanvasToolbarProps> = ({ onFit }) => {
  const zoom = useEditorStore((s) => s.canvasView.zoom);
  const showGrid = useEditorStore((s) => s.canvasView.showGrid);
  const darkBg = useEditorStore((s) => s.canvasView.darkBackground);
  const setZoom = useEditorStore((s) => s.setZoom);
  const setShowGrid = useEditorStore((s) => s.setShowGrid);
  const setDarkBackground = useEditorStore((s) => s.setDarkBackground);

  const handleZoomIn = () => setZoom(Math.min(ZOOM_MAX, zoom + ZOOM_STEP));
  const handleZoomOut = () => setZoom(Math.max(ZOOM_MIN, zoom - ZOOM_STEP));
  const handleReset = () => setZoom(1);

  return (
    <div className="canvas-toolbar">
      {/* Zoom controls */}
      <button
        className="btn btn-ghost btn-icon"
        onClick={handleZoomOut}
        disabled={zoom <= ZOOM_MIN}
        style={{ opacity: zoom <= ZOOM_MIN ? 0.4 : 1 }}
        title="Zoom Out"
        id="btn-zoom-out"
      >
        <ZoomOut size={14} />
      </button>

      <button
        onClick={handleReset}
        style={{
          fontSize: 11, fontWeight: 600,
          color: 'var(--color-accent-blue)',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: '4px 8px',
          minWidth: 44,
          textAlign: 'center',
          fontVariantNumeric: 'tabular-nums',
        }}
        title="Reset Zoom"
        id="zoom-level-display"
      >
        {Math.round(zoom * 100)}%
      </button>

      <button
        className="btn btn-ghost btn-icon"
        onClick={handleZoomIn}
        disabled={zoom >= ZOOM_MAX}
        style={{ opacity: zoom >= ZOOM_MAX ? 0.4 : 1 }}
        title="Zoom In"
        id="btn-zoom-in"
      >
        <ZoomIn size={14} />
      </button>

      {/* Divider */}
      <div style={{ width: 1, height: 16, background: 'var(--color-border)', margin: '0 2px' }} />

      {/* Fit to screen */}
      <button
        className="btn btn-ghost btn-icon"
        onClick={onFit}
        title="Fit to Screen"
        id="btn-fit-screen"
      >
        <Maximize2 size={14} />
      </button>

      {/* Reset */}
      <button
        className="btn btn-ghost btn-icon"
        onClick={handleReset}
        title="Reset View"
        id="btn-reset-view"
      >
        <RotateCcw size={13} />
      </button>

      {/* Divider */}
      <div style={{ width: 1, height: 16, background: 'var(--color-border)', margin: '0 2px' }} />

      {/* Grid toggle */}
      <button
        className={`btn btn-ghost btn-icon ${showGrid ? 'btn-active' : ''}`}
        onClick={() => setShowGrid(!showGrid)}
        title={showGrid ? 'ซ่อน Grid' : 'แสดง Grid'}
        id="btn-toggle-grid"
      >
        <Grid3X3 size={14} />
      </button>

      {/* Background toggle */}
      <button
        className="btn btn-ghost btn-icon"
        onClick={() => setDarkBackground(!darkBg)}
        title={darkBg ? 'พื้นหลังสว่าง' : 'พื้นหลังมืด'}
        id="btn-toggle-bg"
      >
        {darkBg ? <Sun size={14} /> : <Moon size={14} />}
      </button>
    </div>
  );
};

export default CanvasToolbar;
