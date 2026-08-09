import React, { useState } from 'react';
import { CheckCircle2, Info, RotateCcw, Sparkles } from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import { buildThemeFromPalette } from '../../lib/themeEngine';

const THEME_VARIANTS = [
  { label: 'แนะนำ', desc: 'เข้ม อ่านง่าย และรักษาสีแบรนด์' },
  { label: 'สดขึ้น', desc: 'Accent เด่น เหมาะกับงาน Live' },
  { label: 'โมโนเข้ม', desc: 'เรียบ หรู เน้นโลโก้' },
  { label: 'สีรอง', desc: 'ดึงสีรองมาเป็นบรรยากาศหลัก' },
];

const colorValue = (config: { color: string }) => config.color;

const PaletteDisplay: React.FC = () => {
  const palette = useEditorStore((s) => s.logoPalette);
  const sport = useEditorStore((s) => s.sport);
  const applyPaletteTheme = useEditorStore((s) => s.applyPaletteTheme);
  const resetColors = useEditorStore((s) => s.resetColors);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!palette) return null;

  const recommendedVariant = palette.isDark ? 0 : 2;
  const recommendedTheme = buildThemeFromPalette(palette, recommendedVariant, sport ?? 'football');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Sparkles size={13} style={{ color: '#fbbf24' }} />
        <span style={{ fontSize: 11, color: 'var(--color-text-secondary)', fontWeight: 600 }}>
          วิเคราะห์สีจาก Logo
        </span>
        <span style={{ marginLeft: 'auto', fontSize: 9, color: 'var(--color-text-muted)' }}>
          {sport === 'basketball' ? 'Basketball tone' : 'Football tone'}
        </span>
      </div>

      <div style={{ display: 'flex', gap: 4, height: 30 }} aria-label="สีที่พบในโลโก้">
        {palette.colors.map((color, index) => (
          <button
            key={`${color}-${index}`}
            type="button"
            className={`palette-swatch ${hoveredIdx === index ? 'selected' : ''}`}
            style={{ background: color, borderColor: hoveredIdx === index ? '#fff' : 'transparent' }}
            onMouseEnter={() => setHoveredIdx(index)}
            onMouseLeave={() => setHoveredIdx(null)}
            aria-label={`สี ${color}`}
            aria-pressed={hoveredIdx === index}
            title={color}
          />
        ))}
      </div>

      <div style={{ fontSize: 10, color: 'var(--color-text-muted)', minHeight: 16 }}>
        {hoveredIdx !== null ? palette.colors[hoveredIdx] : `${palette.dominant} · สีหลักของโลโก้`}
      </div>

      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
        <span className="palette-badge">หลัก {palette.dominant}</span>
        <span className="palette-badge">รอง {palette.secondary}</span>
        <span className="palette-badge">Accent {palette.accent}</span>
      </div>

      <div
        style={{
          padding: 9,
          border: '1px solid rgba(96,165,250,0.18)',
          borderRadius: 8,
          background: 'rgba(59,130,246,0.06)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 7 }}>
          <Info size={12} style={{ color: '#93c5fd' }} />
          <span style={{ fontSize: 10, color: '#bfdbfe' }}>ตัวอย่างบทบาทสีหลังปรับ Contrast</span>
          <span style={{ marginLeft: 'auto', fontSize: 10, color: '#86efac', fontWeight: 700 }}>
            {Math.round(recommendedTheme.contrastScore * 100)}%
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 5 }}>
          {[
            ['Team', colorValue(recommendedTheme.colors.teamABg)],
            ['Score', colorValue(recommendedTheme.colors.scoreABg)],
            ['Plate', colorValue(recommendedTheme.colors.logoPlateBg)],
          ].map(([label, color]) => (
            <div key={label} style={{ borderRadius: 5, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ height: 18, background: color }} />
              <div style={{ padding: '2px 4px', background: 'rgba(0,0,0,0.25)', fontSize: 9, color: 'var(--color-text-muted)' }}>
                {label}
              </div>
            </div>
          ))}
        </div>
        {recommendedTheme.contrastWarnings.length > 0 ? (
          <div style={{ marginTop: 7, fontSize: 9, color: '#fbbf24', lineHeight: 1.45 }}>
            ปรับพื้นผิวอัตโนมัติเพื่อให้อ่านง่าย: {recommendedTheme.contrastWarnings.join(' · ')}
          </div>
        ) : (
          <div style={{ marginTop: 7, fontSize: 9, color: '#86efac' }}>
            <CheckCircle2 size={11} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 4 }} />
            คู่สีหลักผ่านเกณฑ์ Contrast
          </div>
        )}
      </div>

      <div style={{ paddingTop: 8, borderTop: '1px solid var(--color-border)' }}>
        <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginBottom: 7, fontWeight: 600 }}>
          เลือกสไตล์จากสี Logo
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          {THEME_VARIANTS.map((variant, index) => {
            const theme = buildThemeFromPalette(palette, index, sport ?? 'football');
            const isRecommended = index === recommendedVariant;
            return (
              <button
                key={variant.label}
                type="button"
                className="btn btn-secondary palette-theme-button"
                onClick={() => applyPaletteTheme(palette, index)}
                id={`btn-apply-theme-${index}`}
                aria-label={`ใช้ธีม ${variant.label}`}
                style={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '7px 4px',
                  height: 'auto',
                  gap: 3,
                  borderColor: isRecommended ? `${theme.colors.highlight.color}80` : undefined,
                }}
              >
                {isRecommended && <span style={{ position: 'absolute', top: 3, right: 4, fontSize: 8, color: '#86efac' }}>แนะนำ</span>}
                <span style={{ fontSize: 10, fontWeight: 600 }}>{variant.label}</span>
                <span style={{ fontSize: 9, color: 'var(--color-text-muted)', fontWeight: 400 }}>{variant.desc}</span>
              </button>
            );
          })}
        </div>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={resetColors}
          style={{ fontSize: 11, width: '100%', marginTop: 8 }}
          id="btn-reset-colors-palette"
        >
          <RotateCcw size={11} /> รีเซ็ตสีกลับค่าเริ่มต้น
        </button>
      </div>
    </div>
  );
};

export default PaletteDisplay;
