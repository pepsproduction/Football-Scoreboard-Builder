// src/components/controls/LogoControls.tsx
import React from 'react';
import { Eye, EyeOff, RotateCcw } from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import type { LogoPosition } from '../../types/editor';
import { SliderRow } from './LayoutControls';

const LOGO_POSITIONS: { value: LogoPosition; label: string; emoji: string }[] = [
  { value: 'center', label: 'กลาง', emoji: '⊙' },
  { value: 'left', label: 'ซ้าย', emoji: '←' },
  { value: 'right', label: 'ขวา', emoji: '→' },
  { value: 'above', label: 'บน', emoji: '↑' },
  { value: 'hidden', label: 'ซ่อน', emoji: '✕' },
];

const LogoControls: React.FC = () => {
  const logoPosition = useEditorStore((s) => s.logoPosition);
  const setLogoPosition = useEditorStore((s) => s.setLogoPosition);
  const logoScale = useEditorStore((s) => s.logoScale);
  const setLogoScale = useEditorStore((s) => s.setLogoScale);
  const logoRotation = useEditorStore((s) => s.logoRotation);
  const setLogoRotation = useEditorStore((s) => s.setLogoRotation);
  const logoSkewX = useEditorStore((s) => s.logoSkewX);
  const setLogoSkewX = useEditorStore((s) => s.setLogoSkewX);
  const logoOffsetX = useEditorStore((s) => s.logoOffsetX);
  const logoOffsetY = useEditorStore((s) => s.logoOffsetY);
  const setLogoOffset = useEditorStore((s) => s.setLogoOffset);
  const logoPlateShape = useEditorStore((s) => s.logoPlateShape);
  const setLogoPlateShape = useEditorStore((s) => s.setLogoPlateShape);
  const logoPlateWidth = useEditorStore((s) => s.logoPlateWidth);
  const logoPlateHeight = useEditorStore((s) => s.logoPlateHeight);
  const setLogoPlateSize = useEditorStore((s) => s.setLogoPlateSize);
  const logoPadding = useEditorStore((s) => s.logoPadding);
  const setLogoPadding = useEditorStore((s) => s.setLogoPadding);
  const showLogoPlate = useEditorStore((s) => s.showLogoPlate);
  const setShowLogoPlate = useEditorStore((s) => s.setShowLogoPlate);

  const handleResetLogoControls = () => {
    setLogoScale(1);
    setLogoRotation(0);
    setLogoSkewX(0);
    setLogoOffset(0, 0);
    setLogoPlateSize(80, 80);
    setLogoPlateShape('rect');
    setLogoPadding(8);
    setShowLogoPlate(true);
  };

  return (
    <div>
      {/* Position selector */}
      <div style={{ marginBottom: 14 }}>
        <div className="control-label" style={{ marginBottom: 6 }}>ตำแหน่ง Logo</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 4 }}>
          {LOGO_POSITIONS.map((pos) => (
            <button
              key={pos.value}
              onClick={() => setLogoPosition(pos.value)}
              id={`logo-pos-${pos.value}`}
              style={{
                padding: '6px 4px',
                borderRadius: 5,
                border: logoPosition === pos.value
                  ? '1px solid rgba(59,130,246,0.5)'
                  : '1px solid var(--color-border)',
                background: logoPosition === pos.value
                  ? 'rgba(59,130,246,0.1)'
                  : 'rgba(255,255,255,0.02)',
                cursor: 'pointer',
                fontSize: 10,
                color: logoPosition === pos.value ? '#60a5fa' : 'var(--color-text-muted)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
              }}
            >
              <span style={{ fontSize: 14 }}>{pos.emoji}</span>
              <span>{pos.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Show logo plate toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={showLogoPlate}
            onChange={(e) => setShowLogoPlate(e.target.checked)}
            id="logo-plate-toggle"
          />
          <div className="toggle-track" />
          <div className="toggle-thumb" />
        </label>
        <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
          {showLogoPlate ? <><Eye size={12} style={{ display: 'inline', marginRight: 4 }} />แสดง Logo Plate</> : <><EyeOff size={12} style={{ display: 'inline', marginRight: 4 }} />ซ่อน Logo Plate</>}
        </span>
      </div>

      {/* Scale & offset */}
      <SliderRow
        label="ขนาด Logo"
        value={Math.round(logoScale * 100)}
        min={30} max={200} unit="%"
        id="logo-scale-slider"
        onChange={(v) => setLogoScale(v / 100)}
      />
      <SliderRow
        label="องศาการหมุน"
        value={logoRotation}
        min={-180} max={180} unit="°"
        id="logo-rotation-slider"
        onChange={(v) => setLogoRotation(v)}
      />
      <SliderRow
        label="ความเอียง Logo (Skew)"
        value={Math.round(logoSkewX * 100)}
        min={-50} max={50} unit="%"
        id="logo-skewx-slider"
        onChange={(v) => setLogoSkewX(v / 100)}
      />
      <SliderRow
        label="ขยับซ้าย/ขวา"

        value={logoOffsetX}
        min={-60} max={60} unit="px"
        id="logo-offset-x"
        onChange={(v) => setLogoOffset(v, logoOffsetY)}
      />
      <SliderRow
        label="ขยับบน/ล่าง"
        value={logoOffsetY}
        min={-40} max={40} unit="px"
        id="logo-offset-y"
        onChange={(v) => setLogoOffset(logoOffsetX, v)}
      />

      <div className="divider" />
      
      {/* Plate Shape */}
      <div style={{ marginBottom: 12 }}>
        <div className="control-label" style={{ marginBottom: 6 }}>รูปทรงกรอบ (Plate Shape)</div>
        <div style={{ display: 'flex', gap: 4 }}>
          {['rect', 'hexagon', 'trapezoid', 'circle'].map((shape) => (
            <button
              key={shape}
              onClick={() => setLogoPlateShape(shape as any)}
              id={`shape-${shape}`}
              style={{
                flex: 1, padding: '4px 0', fontSize: 10, borderRadius: 4, textTransform: 'capitalize',
                background: logoPlateShape === shape ? 'var(--color-accent-blue)' : 'rgba(255,255,255,0.05)',
                color: logoPlateShape === shape ? '#fff' : 'var(--color-text-secondary)',
                border: logoPlateShape === shape ? '1px solid var(--color-accent-blue)' : '1px solid var(--color-border)',
              }}
            >
              {shape === 'rect' ? 'สี่เหลี่ยม' : shape === 'hexagon' ? 'หกเหลี่ยม' : shape === 'trapezoid' ? 'คางหมู' : 'วงกลม'}
            </button>
          ))}
        </div>
      </div>

      <SliderRow
        label="ขนาด Plate กว้าง"
        value={logoPlateWidth}
        min={40} max={200} unit="px"
        id="logo-plate-width"
        onChange={(v) => setLogoPlateSize(v, logoPlateHeight)}
      />
      <SliderRow
        label="Padding"
        value={logoPadding}
        min={0} max={30} unit="px"
        id="logo-padding"
        onChange={(v) => setLogoPadding(v)}
      />

      {/* Reset */}
      <button
        className="btn btn-ghost"
        onClick={handleResetLogoControls}
        style={{ fontSize: 11, marginTop: 4 }}
        id="btn-reset-logo-controls"
      >
        <RotateCcw size={11} /> ค่าเริ่มต้น
      </button>
    </div>
  );
};

export default LogoControls;
