// src/components/controls/StyleControls.tsx
import React from 'react';
import { Layers, Square, RotateCcw } from 'lucide-react';
import { useEditorStore, defaultStyle } from '../../store/editorStore';
import { SliderRow } from './LayoutControls';
import type { StyleParams } from '../../types/editor';

const StyleControls: React.FC = () => {
  const styleMode = useEditorStore((s) => s.styleMode);
  const style = useEditorStore((s) => s.style);
  const setStyleMode = useEditorStore((s) => s.setStyleMode);
  const setStyleParam = useEditorStore((s) => s.setStyleParam);

  const is3D = styleMode === '3d';

  const sliders: { key: Exclude<keyof StyleParams, 'techBorders' | 'patternStyle' | 'moduleShape'>; label: string; min: number; max: number; unit?: string; only3D?: boolean }[] = [
    { key: 'borderThickness', label: 'ความหนาขอบ', min: 1, max: 20, unit: 'px' },
    { key: 'cornerRadius', label: 'มุมโค้ง', min: 0, max: 40, unit: 'px' },
    { key: 'bevelDepth', label: 'ความลึก Bevel', min: 0, max: 20, unit: 'px', only3D: true },
    { key: 'shadowStrength', label: 'ความเข้ม Shadow', min: 0, max: 1, unit: '', only3D: false },
    { key: 'glowStrength', label: 'ความเข้ม Glow', min: 0, max: 1, unit: '', only3D: true },
    { key: 'highlightStrength', label: 'ความเข้ม Highlight', min: 0, max: 1, unit: '', only3D: false },
    { key: 'frameDepth', label: 'ความลึกกรอบ', min: 0, max: 20, unit: 'px', only3D: true },
    { key: 'skewX', label: 'ความเอียง (Skew)', min: -50, max: 50, unit: '%' },
  ];

  return (
    <div>
      {/* Style mode toggle */}
      <div style={{ marginBottom: 14 }}>
        <div className="control-label" style={{ marginBottom: 6 }}>Style Mode</div>
        <div className="segment-control">
          <button
            className={`segment-option ${styleMode === '2d' ? 'active' : ''}`}
            onClick={() => setStyleMode('2d')}
            id="style-mode-2d"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}
          >
            <Square size={11} /> 2D Flat
          </button>
          <button
            className={`segment-option ${styleMode === '3d' ? 'active' : ''}`}
            onClick={() => setStyleMode('3d')}
            id="style-mode-3d"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}
          >
            <Layers size={11} /> 3D Metallic
          </button>
        </div>
      </div>

      {/* Description */}
      <div
        style={{
          fontSize: 10, color: 'var(--color-text-muted)',
          background: 'rgba(255,255,255,0.02)',
          padding: '6px 9px', borderRadius: 5, marginBottom: 12, lineHeight: 1.6,
        }}
      >
        {is3D
          ? '🎨 3D Mode: Bevel, Glow, Metallic Gradient, Highlight Edge'
          : '📐 2D Mode: Flat, Clean, เส้นขอบชัดเจน, ไม่มี Glow'}
      </div>

      {/* Sliders */}
      {sliders
        .filter((s) => !s.only3D || is3D)
        .map((s) => (
          <SliderRow
            key={s.key}
            label={s.label}
            value={s.unit === ''
              ? Math.round((style[s.key] as number) * 100)
              : (style[s.key] as number)}
            min={s.unit === '' ? 0 : s.min}
            max={s.unit === '' ? 100 : s.max}
            unit={s.unit === '' ? '%' : s.unit}
            id={`style-slider-${s.key}`}
            onChange={(v) => setStyleParam(s.key, s.unit === '' ? v / 100 : v)}
          />
        ))}

      {/* Tech Borders Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={style.techBorders || false}
            onChange={(e) => setStyleParam('techBorders', e.target.checked as any)}
            id="tech-borders-toggle"
          />
          <div className="toggle-track" />
          <div className="toggle-thumb" />
        </label>
        <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
          Tech Borders (ไซเบอร์)
        </span>
      </div>

      <div className="divider" />

      {/* Pattern Style */}
      <div style={{ marginBottom: 12 }}>
        <div className="control-label" style={{ marginBottom: 6 }}>ลวดลายพื้นหลัง (Pattern)</div>
        <div style={{ display: 'flex', gap: 4 }}>
          {['none', 'stripes', 'dots', 'grid'].map((patt) => (
            <button
              key={patt}
              onClick={() => setStyleParam('patternStyle', patt as any)}
              id={`pattern-${patt}`}
              style={{
                flex: 1, padding: '4px 0', fontSize: 10, borderRadius: 4, textTransform: 'capitalize',
                background: style.patternStyle === patt ? 'var(--color-accent-blue)' : 'rgba(255,255,255,0.05)',
                color: style.patternStyle === patt ? '#fff' : 'var(--color-text-secondary)',
                border: style.patternStyle === patt ? '1px solid var(--color-accent-blue)' : '1px solid var(--color-border)',
              }}
            >
              {patt === 'none' ? 'ไม่มี' : patt === 'stripes' ? 'เส้นทแยง' : patt === 'dots' ? 'จุด' : 'ตาราง'}
            </button>
          ))}
        </div>
      </div>

      {/* Module Shape */}
      <div style={{ marginBottom: 16 }}>
        <div className="control-label" style={{ marginBottom: 6 }}>รูปทรงกล่องเวลา/ใบ (Module Shape)</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
          {['rect', 'pill', 'hexagon', 'parallelogram'].map((shape) => (
            <button
              key={shape}
              onClick={() => setStyleParam('moduleShape', shape as any)}
              id={`mod-shape-${shape}`}
              style={{
                padding: '4px 0', fontSize: 10, borderRadius: 4, textTransform: 'capitalize',
                background: style.moduleShape === shape ? 'var(--color-accent-blue)' : 'rgba(255,255,255,0.05)',
                color: style.moduleShape === shape ? '#fff' : 'var(--color-text-secondary)',
                border: style.moduleShape === shape ? '1px solid var(--color-accent-blue)' : '1px solid var(--color-border)',
              }}
            >
              {shape === 'rect' ? 'สี่เหลี่ยม' : shape === 'pill' ? 'แคปซูล' : shape === 'hexagon' ? 'หกเหลี่ยม' : 'สี่เหลี่ยมเอียง'}
            </button>
          ))}
        </div>
      </div>

      {/* Reset */}
      <button
        className="btn btn-ghost"
        onClick={() => {
          Object.entries(defaultStyle).forEach(([k, v]) =>
            setStyleParam(k as keyof StyleParams, v)
          );
        }}
        style={{ fontSize: 11, marginTop: 4 }}
        id="btn-reset-style"
      >
        <RotateCcw size={11} /> ค่าเริ่มต้น
      </button>
    </div>
  );
};

export default StyleControls;
