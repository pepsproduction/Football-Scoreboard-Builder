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
  { key: 'teamABg', labelTH: 'พื้นหลังชื่อทีม', teamBKey: 'teamBBg' },
  { key: 'scoreABg', labelTH: 'พื้นหลังคะแนน', teamBKey: 'scoreBBg' },
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
  const [activeTab, setActiveTab] = useState<'A' | 'B'>('A');

  const [activeStopIndex, setActiveStopIndex] = useState<number>(0);

  const currentTab = colorsLinked ? 'A' : activeTab;
  const currentKey = (currentTab === 'B' && teamBKey) ? teamBKey : colorKey;
  
  const cfg = colors[colorKey];
  const linkedCfg = teamBKey ? colors[teamBKey] : null;
  const currentCfg = colors[currentKey];
  const showLinkedLabel = teamBKey !== undefined;

  const isGradient = currentCfg.type !== 'solid';
  const hasStops = currentCfg.stops && currentCfg.stops.length >= 2;
  const stops = hasStops ? currentCfg.stops! : [
    { offset: 0, color: currentCfg.color },
    { offset: 1, color: currentCfg.color }
  ];
  const activeColor = isGradient ? stops[activeStopIndex].color : currentCfg.color;

  const handleColorChange = (hex: string) => {
    if (isGradient) {
      const newStops = [...stops];
      newStops[activeStopIndex] = { ...newStops[activeStopIndex], color: hex };
      const extra = activeStopIndex === 0 ? { color: hex } : {};
      setColor(currentKey, { stops: newStops, ...extra });
      if (currentKey === colorKey && teamBKey && colorsLinked) {
        setColor(teamBKey, { stops: newStops, ...extra });
      }
    } else {
      setColor(currentKey, { color: hex });
      if (currentKey === colorKey && teamBKey && colorsLinked) {
        setColor(teamBKey, { color: hex });
      }
    }
  };

  const handleAlphaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const alpha = parseFloat(e.target.value);
    setColor(currentKey, { alpha });
    if (currentKey === colorKey && teamBKey && colorsLinked) {
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
    const def = defaultColors[currentKey];
    setColor(currentKey, def);
    if (currentKey === colorKey && teamBKey && colorsLinked) {
      setColor(teamBKey, defaultColors[teamBKey]);
    }
  };

  return (
    <div style={{ marginBottom: 6 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          width: '100%',
          background: 'transparent',
          border: 'none',
          padding: '5px 0',
        }}
        id={`color-toggle-container-${colorKey}`}
      >
        {/* Swatch A */}
        <div
          className="color-swatch"
          onClick={() => {
            setActiveTab('A');
            setOpen(!open || activeTab !== 'A');
          }}
          style={{
            background: cfg.color,
            opacity: cfg.alpha,
            boxShadow: open && currentTab === 'A' ? `0 0 0 2px ${cfg.color}40` : undefined,
            borderColor: open && currentTab === 'A' ? 'var(--color-text-primary)' : undefined,
          }}
          title="สีทีม A"
        />
        {teamBKey && !colorsLinked && linkedCfg && (
          <div
            className="color-swatch"
            onClick={() => {
              setActiveTab('B');
              setOpen(!open || activeTab !== 'B');
            }}
            style={{ 
              background: linkedCfg.color, 
              opacity: linkedCfg.alpha,
              boxShadow: open && currentTab === 'B' ? `0 0 0 2px ${linkedCfg.color}40` : undefined,
              borderColor: open && currentTab === 'B' ? 'var(--color-text-primary)' : undefined,
            }}
            title="สีทีม B"
          />
        )}
        <div 
          onClick={() => setOpen(!open)}
          style={{ 
            display: 'flex', 
            flex: 1, 
            alignItems: 'center', 
            gap: 8,
            cursor: 'pointer' 
          }}
        >
          <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', flex: 1, textAlign: 'left' }}>
            {label} {teamBKey ? ' A/B' : ''}
          </span>
          {showLinkedLabel && (
            <span style={{ fontSize: 9, color: 'var(--color-text-muted)' }}>
              {colorsLinked ? 'A=B' : 'แยก'}
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
        </div>
      </div>

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
            color={activeColor}
            onChange={handleColorChange}
            style={{ width: '100%', height: 140 }}
          />
          
          {isGradient && (
            <div style={{ marginTop: 10, display: 'flex', gap: 6 }}>
              {stops.map((stop, i) => (
                <div
                  key={i}
                  onClick={() => setActiveStopIndex(i)}
                  style={{
                    flex: 1,
                    height: 24,
                    background: stop.color,
                    border: `2px solid ${activeStopIndex === i ? 'var(--color-text-primary)' : 'transparent'}`,
                    borderRadius: 4,
                    cursor: 'pointer'
                  }}
                  title={`Stop ${i + 1}`}
                />
              ))}
            </div>
          )}

          <div style={{ marginTop: 10, display: 'flex', gap: 6, alignItems: 'center' }}>
            <input
              type="text"
              className="input-text"
              key={currentKey + activeColor + activeStopIndex}
              defaultValue={activeColor}
              onBlur={handleHexInput}
              placeholder="#000000"
              style={{ fontFamily: 'monospace', flex: 1 }}
              id={`hex-input-${currentKey}`}
            />
            <button
              className="btn btn-ghost btn-icon"
              onClick={handleReset}
              title="Reset สี"
              id={`reset-color-${currentKey}`}
            >
              <RotateCcw size={12} />
            </button>
          </div>

          {/* Alpha */}
          <div style={{ marginTop: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>Opacity</span>
              <span className="slider-value">{Math.round(currentCfg.alpha * 100)}%</span>
            </div>
            <input
              type="range"
              min="0" max="1" step="0.01"
              value={currentCfg.alpha}
              onChange={handleAlphaChange}
              id={`alpha-slider-${currentKey}`}
            />
          </div>

          {/* Gradient type selector (simple) */}
          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginBottom: 4 }}>ประเภท</div>
            <div className="segment-control">
              {(['solid', 'linear', 'vertical', 'horizontal'] as const).map((t) => (
                <button
                  key={t}
                  className={`segment-option ${currentCfg.type === t ? 'active' : ''}`}
                  onClick={() => {
                    const extra = t === 'linear' && currentCfg.angle === undefined ? { angle: 90 } : {};
                    setColor(currentKey, { type: t, ...extra });
                    if (currentKey === colorKey && teamBKey && colorsLinked) {
                      setColor(teamBKey, { type: t, ...extra });
                    }
                  }}
                  id={`gradient-type-${currentKey}-${t}`}
                >
                  {t === 'solid' ? 'Solid' : t === 'linear' ? 'Linear' : t === 'vertical' ? 'Vert.' : 'Horiz.'}
                </button>
              ))}
            </div>
          </div>
          
          {currentCfg.type === 'linear' && (
            <div style={{ marginTop: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>องศา (Angle)</span>
                <span className="slider-value">{currentCfg.angle ?? 90}°</span>
              </div>
              <input
                type="range"
                min="0" max="360" step="1"
                value={currentCfg.angle ?? 90}
                onChange={(e) => {
                  const angle = parseInt(e.target.value, 10);
                  setColor(currentKey, { angle });
                  if (currentKey === colorKey && teamBKey && colorsLinked) {
                    setColor(teamBKey, { angle });
                  }
                }}
                id={`angle-slider-${currentKey}`}
              />
            </div>
          )}
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
