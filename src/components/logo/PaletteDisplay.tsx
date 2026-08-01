// src/components/logo/PaletteDisplay.tsx
import React, { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import { buildThemeFromPalette } from '../../lib/themeEngine';

const PaletteDisplay: React.FC = () => {
  const palette = useEditorStore((s) => s.logoPalette);
  const applyPaletteTheme = useEditorStore((s) => s.applyPaletteTheme);
  const resetColors = useEditorStore((s) => s.resetColors);
  const setTemplate = useEditorStore((s) => s.setTemplate);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!palette) return null;

  const handleReapplyTheme = () => {
    if (!palette) return;
    applyPaletteTheme(palette);
    const theme = buildThemeFromPalette(palette);
    setTemplate(theme.suggestedTemplate);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* Palette swatches */}
      <div style={{ display: 'flex', gap: 4, height: 28 }}>
        {palette.colors.map((color, i) => (
          <div
            key={i}
            className={`palette-swatch ${hoveredIdx === i ? 'selected' : ''}`}
            style={{ background: color }}
            onMouseEnter={() => setHoveredIdx(i)}
            onMouseLeave={() => setHoveredIdx(null)}
            title={color}
          />
        ))}
      </div>

      {/* Hovered color hex */}
      <div style={{ fontSize: 10, color: 'var(--color-text-muted)', height: 16 }}>
        {hoveredIdx !== null ? palette.colors[hoveredIdx] : palette.dominant + ' (dominant)'}
      </div>

      {/* Palette metadata badges */}
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {palette.isDark && (
          <span style={{
            fontSize: 9, padding: '2px 7px', borderRadius: 10,
            background: 'rgba(100,100,100,0.2)', border: '1px solid rgba(100,100,100,0.3)',
            color: 'rgba(200,200,200,0.7)',
          }}>Dark</span>
        )}
        {palette.isVibrant && (
          <span style={{
            fontSize: 9, padding: '2px 7px', borderRadius: 10,
            background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.3)',
            color: '#a5b4fc',
          }}>Vibrant</span>
        )}
        {palette.isGold && (
          <span style={{
            fontSize: 9, padding: '2px 7px', borderRadius: 10,
            background: 'rgba(245,158,11,0.2)', border: '1px solid rgba(245,158,11,0.3)',
            color: '#fbbf24',
          }}>Gold</span>
        )}
      </div>

      {/* Theme Variants */}
      <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--color-border)' }}>
        <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginBottom: 8, fontWeight: 500 }}>
          สีที่วิเคราะห์จาก LOGO
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          {[
            { label: 'Premium Dark', desc: 'สุขุม พรีเมียม' },
            { label: 'Vibrant Neon', desc: 'สีสด เด่นชัด' },
            { label: 'Deep Mono', desc: 'เข้ม มินิมอล' },
            { label: 'Alternative', desc: 'เน้นสีรอง' }
          ].map((v, i) => (
            <button
              key={i}
              className="btn btn-secondary"
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '6px 4px', height: 'auto', gap: 2 }}
              onClick={() => {
                if (!palette) return;
                applyPaletteTheme(palette, i);
                const theme = buildThemeFromPalette(palette, i);
                setTemplate(theme.suggestedTemplate);
              }}
              id={`btn-apply-theme-${i}`}
            >
              <span style={{ fontSize: 10, fontWeight: 600 }}>{v.label}</span>
              <span style={{ fontSize: 9, color: 'var(--color-text-muted)', fontWeight: 400 }}>{v.desc}</span>
            </button>
          ))}
        </div>
        <button
          className="btn btn-ghost"
          onClick={resetColors}
          style={{ fontSize: 11, width: '100%', marginTop: 8 }}
          id="btn-reset-colors-palette"
          title="รีเซ็ตสีทั้งหมด"
        >
          รีเซ็ตกลับเป็นสีเริ่มต้น
        </button>
      </div>
    </div>
  );
};

export default PaletteDisplay;
