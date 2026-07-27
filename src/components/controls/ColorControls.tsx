// src/components/controls/ColorControls.tsx
import React, { useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { Link2, Unlink2, RotateCcw, ChevronDown } from 'lucide-react';
import { useEditorStore, defaultColors } from '../../store/editorStore';
import type { EditorColors } from '../../types/editor';



// ── Color section labels ──────────────────────────────────────
const COLOR_SECTIONS: {
  key: keyof EditorColors;
  labelTH: string;
  teamBKey?: keyof EditorColors;
}[] = [
  { key: 'teamABg', labelTH: 'พื้นหลังชื่อทีม A', teamBKey: 'teamBBg' },
  { key: 'scoreABg', labelTH: 'พื้นหลังคะแนน A', teamBKey: 'scoreBBg' },
  { key: 'framePrimary', labelTH: 'กรอบหลัก' },
  { key: 'frameInner', labelTH: 'กรอบชั้นใน' },
  { key: 'highlight', labelTH: 'Highlight' },
  { key: 'glow', labelTH: 'Glow' },
  { key: 'shadow', labelTH: 'Shadow' },
  { key: 'yellowCard', labelTH: 'ใบเหลือง' },
  { key: 'redCard', labelTH: 'ใบแดง' },
  { key: 'logoPlateBg', labelTH: 'พื้นหลัง Logo' },
];

interface ColorSwatchPickerProps {
  colorKey: keyof EditorColors;
  label: string;
  teamBKey?: keyof EditorColors;
}

export const ColorSwatchPicker: React.FC<ColorSwatchPickerProps> = ({ colorKey, label, teamBKey }) => {
  const colors = useEditorStore((s) => s.colors);
  const colorsLinked = useEditorStore((s) => s.colorsLinked);
  const setColor = useEditorStore((s) => s.setColor);
  const [open, setOpen] = useState(false);

  const cfg = colors[colorKey];
  const linkedCfg = teamBKey ? colors[teamBKey] : null;
  const showLinkedLabel = teamBKey !== undefined;

  const handleColorChange = (hex: string) => {
    setColor(colorKey, { color: hex });
    if (teamBKey && colorsLinked) {
      setColor(teamBKey, { color: hex });
    }
  };

  const handleAlphaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const alpha = parseFloat(e.target.value);
    setColor(colorKey, { alpha });
    if (teamBKey && colorsLinked) {
      setColor(teamBKey, { alpha });
    }
  };

  const handleHexInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (/^#[0-9a-fA-F]{6}$/.test(val)) {
      handleColorChange(val);
    }
  };

  const handleReset = () => {
    const def = defaultColors[colorKey];
    setColor(colorKey, def);
    if (teamBKey && colorsLinked) setColor(teamBKey, def);
  };

  return (
    <div style={{ marginBottom: 6 }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          width: '100%',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: '5px 0',
        }}
        id={`color-toggle-${colorKey}`}
      >
        {/* Swatch */}
        <div
          className="color-swatch"
          style={{
            background: cfg.color,
            opacity: cfg.alpha,
            boxShadow: open ? `0 0 0 2px ${cfg.color}40` : undefined,
          }}
        />
        {teamBKey && !colorsLinked && linkedCfg && (
          <div
            className="color-swatch"
            style={{ background: linkedCfg.color, opacity: linkedCfg.alpha }}
          />
        )}
        <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', flex: 1, textAlign: 'left' }}>
          {label}
        </span>
        {showLinkedLabel && (
          <span style={{ fontSize: 9, color: 'var(--color-text-muted)' }}>
            {colorsLinked ? 'A=B' : 'A/B'}
          </span>
        )}
        <ChevronDown
          size={12}
          style={{
            color: 'var(--color-text-muted)',
            transform: open ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.15s',
          }}
        />
      </button>

      {open && (
        <div
          style={{
            background: 'rgba(9,15,30,0.98)',
            border: '1px solid var(--color-border)',
            borderRadius: 8,
            padding: 12,
            marginTop: 4,
            animation: 'fadeIn 0.15s ease',
          }}
        >
          <HexColorPicker
            color={cfg.color}
            onChange={handleColorChange}
            style={{ width: '100%', height: 140 }}
          />

          <div style={{ marginTop: 10, display: 'flex', gap: 6, alignItems: 'center' }}>
            <input
              type="text"
              className="input-text"
              defaultValue={cfg.color}
              onBlur={handleHexInput}
              placeholder="#000000"
              style={{ fontFamily: 'monospace', flex: 1 }}
              id={`hex-input-${colorKey}`}
            />
            <button
              className="btn btn-ghost btn-icon"
              onClick={handleReset}
              title="Reset สี"
              id={`reset-color-${colorKey}`}
            >
              <RotateCcw size={12} />
            </button>
          </div>

          {/* Alpha */}
          <div style={{ marginTop: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>Opacity</span>
              <span className="slider-value">{Math.round(cfg.alpha * 100)}%</span>
            </div>
            <input
              type="range"
              min="0" max="1" step="0.01"
              value={cfg.alpha}
              onChange={handleAlphaChange}
              id={`alpha-slider-${colorKey}`}
            />
          </div>

          {/* Gradient type selector (simple) */}
          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginBottom: 4 }}>ประเภท</div>
            <div className="segment-control">
              {(['solid', 'linear', 'vertical', 'horizontal'] as const).map((t) => (
                <button
                  key={t}
                  className={`segment-option ${cfg.type === t ? 'active' : ''}`}
                  onClick={() => setColor(colorKey, { type: t })}
                  id={`gradient-type-${colorKey}-${t}`}
                >
                  {t === 'solid' ? 'Solid' : t === 'linear' ? 'Linear' : t === 'vertical' ? 'Vert.' : 'Horiz.'}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ColorControls: React.FC = () => {
  const colorsLinked = useEditorStore((s) => s.colorsLinked);
  const setColorsLinked = useEditorStore((s) => s.setColorsLinked);
  const resetColors = useEditorStore((s) => s.resetColors);

  return (
    <div>
      {/* Link toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <button
          className={`btn btn-secondary ${colorsLinked ? 'btn-active' : ''}`}
          onClick={() => setColorsLinked(!colorsLinked)}
          style={{ fontSize: 11, gap: 6 }}
          id="btn-link-colors"
        >
          {colorsLinked ? <Link2 size={12} /> : <Unlink2 size={12} />}
          {colorsLinked ? 'ทีม A=B' : 'แยกทีม A/B'}
        </button>
        <button
          className="btn btn-ghost"
          onClick={resetColors}
          style={{ fontSize: 11, marginLeft: 'auto' }}
          id="btn-reset-all-colors"
        >
          <RotateCcw size={11} /> รีเซ็ต
        </button>
      </div>

      {/* Color sections */}
      {COLOR_SECTIONS.map(({ key, labelTH, teamBKey }) => (
        <ColorSwatchPicker
          key={key}
          colorKey={key}
          label={labelTH}
          teamBKey={teamBKey}
        />
      ))}
    </div>
  );
};

export default ColorControls;
