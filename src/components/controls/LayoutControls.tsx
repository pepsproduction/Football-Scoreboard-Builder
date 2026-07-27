// src/components/controls/LayoutControls.tsx
import React from 'react';
import { LayoutPanelLeft, Rows, RotateCcw } from 'lucide-react';
import { useEditorStore, defaultDimensions } from '../../store/editorStore';

interface SliderRowProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  id: string;
  onChange: (v: number) => void;
}

export const SliderRow: React.FC<SliderRowProps> = ({
  label, value, min, max, step = 1, unit = '', id, onChange,
}) => (
  <div style={{ marginBottom: 10 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, alignItems: 'center' }}>
      <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>{label}</span>
      <span className="slider-value">{value}{unit}</span>
    </div>
    <input
      type="range"
      min={min} max={max} step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      id={id}
    />
  </div>
);

const LayoutControls: React.FC = () => {
  const layoutType = useEditorStore((s) => s.layoutType);
  const setLayoutType = useEditorStore((s) => s.setLayoutType);
  const dimensions = useEditorStore((s) => s.dimensions);
  const setDimensions = useEditorStore((s) => s.setDimensions);

  return (
    <div>
      {/* Layout type */}
      <div style={{ marginBottom: 14 }}>
        <div className="control-label" style={{ marginBottom: 6 }}>โครงสร้างหลัก</div>
        <div className="segment-control">
          <button
            className={`segment-option ${layoutType === 'left-right' ? 'active' : ''}`}
            onClick={() => setLayoutType('left-right')}
            id="layout-left-right"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}
          >
            <LayoutPanelLeft size={12} />
            ซ้าย/ขวา
          </button>
          <button
            className={`segment-option ${layoutType === 'top-bottom' ? 'active' : ''}`}
            onClick={() => setLayoutType('top-bottom')}
            id="layout-top-bottom"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}
          >
            <Rows size={12} />
            บน/ล่าง
          </button>
        </div>
      </div>

      {/* Size controls */}
      <SliderRow
        label="ความกว้าง Scoreboard"
        value={dimensions.width}
        min={300} max={1600} step={10} unit="px"
        id="slider-width"
        onChange={(v) => setDimensions({ width: v })}
      />
      <SliderRow
        label="ความสูง Scoreboard"
        value={dimensions.height}
        min={40} max={200} step={2} unit="px"
        id="slider-height"
        onChange={(v) => setDimensions({ height: v })}
      />
      <SliderRow
        label="ระยะห่างภายใน"
        value={dimensions.spacing}
        min={0} max={20} unit="px"
        id="slider-spacing"
        onChange={(v) => setDimensions({ spacing: v })}
      />

      {/* Reset */}
      <button
        className="btn btn-ghost"
        onClick={() => setDimensions(defaultDimensions)}
        style={{ fontSize: 11, marginTop: 4 }}
        id="btn-reset-dimensions"
      >
        <RotateCcw size={11} /> ค่าเริ่มต้น
      </button>
    </div>
  );
};

export default LayoutControls;
