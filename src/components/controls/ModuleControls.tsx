// src/components/controls/ModuleControls.tsx
import React from 'react';
import { Clock, Timer, Square } from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import type { EditorModules } from '../../types/editor';
import { SliderRow } from './LayoutControls';
import { ColorSwatchPicker } from './ColorControls';

interface ModuleToggleProps {
  moduleKey: keyof EditorModules;
  label: string;
  icon: React.ReactNode;
}

const ModuleToggle: React.FC<ModuleToggleProps> = ({ moduleKey, label, icon }) => {
  const mod = useEditorStore((s) => s.modules[moduleKey]);
  const setEnabled = useEditorStore((s) => s.setModuleEnabled);
  const setSize = useEditorStore((s) => s.setModuleSize);
  const [expanded, setExpanded] = React.useState(false);

  return (
    <div
      style={{
        border: '1px solid var(--color-border)',
        borderRadius: 6,
        overflow: 'hidden',
        marginBottom: 5,
        transition: 'border-color 0.15s',
        borderColor: mod.enabled ? 'rgba(59,130,246,0.3)' : undefined,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 10px',
          background: mod.enabled ? 'rgba(59,130,246,0.06)' : 'rgba(255,255,255,0.02)',
          cursor: 'pointer',
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <span style={{ color: mod.enabled ? '#60a5fa' : 'var(--color-text-muted)' }}>{icon}</span>
        <span style={{ fontSize: 12, flex: 1, color: 'var(--color-text-secondary)' }}>{label}</span>

        {/* Toggle */}
        <label className="toggle-switch" onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={mod.enabled}
            onChange={(e) => setEnabled(moduleKey, e.target.checked)}
            id={`module-toggle-${moduleKey}`}
          />
          <div className="toggle-track" />
          <div className="toggle-thumb" />
        </label>
      </div>

      {mod.enabled && expanded && (
        <div style={{ padding: '8px 10px', borderTop: '1px solid var(--color-border)' }}>
          <SliderRow
            label="ขนาด"
            value={Math.round(mod.size * 100)}
            min={50} max={200} unit="%"
            id={`module-size-${moduleKey}`}
            onChange={(v) => setSize(moduleKey, v / 100)}
          />
          {(moduleKey === 'time' || moduleKey === 'half') && (
            <div style={{ marginTop: 12 }}>
              <ColorSwatchPicker
                colorKey={moduleKey === 'time' ? 'timeSlot' : 'halfSlot'}
                label="สีพื้นหลัง"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const ModuleControls: React.FC = () => {
  const modules: { key: keyof EditorModules; label: string; icon: React.ReactNode }[] = [
    { key: 'time', label: 'เวลา (Time)', icon: <Clock size={13} /> },
    { key: 'half', label: 'ครึ่ง/Period', icon: <Timer size={13} /> },
    { key: 'yellowCardA', label: 'ใบเหลือง ทีม A', icon: <Square size={13} style={{ color: '#ca8a04', fill: '#ca8a04' }} /> },
    { key: 'yellowCardB', label: 'ใบเหลือง ทีม B', icon: <Square size={13} style={{ color: '#ca8a04', fill: '#ca8a04' }} /> },
    { key: 'redCardA', label: 'ใบแดง ทีม A', icon: <Square size={13} style={{ color: '#dc2626', fill: '#dc2626' }} /> },
    { key: 'redCardB', label: 'ใบแดง ทีม B', icon: <Square size={13} style={{ color: '#dc2626', fill: '#dc2626' }} /> },
  ];

  return (
    <div>
      <div
        style={{
          fontSize: 11, color: 'var(--color-text-muted)',
          marginBottom: 10, lineHeight: 1.5,
          background: 'rgba(255,255,255,0.03)',
          padding: '6px 8px', borderRadius: 5,
        }}
      >
        ⚙️ ตั้งค่าพื้นฐานโมดูลเสริม
      </div>

      {/* Global toggle for module icons */}
      <label
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          marginBottom: 12, padding: '8px 10px',
          background: 'rgba(59,130,246,0.08)',
          borderRadius: 6, cursor: 'pointer',
          border: '1px solid rgba(59,130,246,0.15)',
        }}
      >
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={useEditorStore((s) => s.canvasView.showModuleIcons)}
            onChange={(e) => useEditorStore.getState().setShowModuleIcons(e.target.checked)}
            id="toggle-show-module-icons"
          />
          <div className="toggle-track" />
          <div className="toggle-thumb" />
        </label>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', fontWeight: 500 }}>
            แสดงไอคอนตัวอย่างในหน้าพรีวิว
          </span>
          <span style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 2 }}>
            (นาฬิกา, วงกลม, จุดจับลาก)
          </span>
        </div>
      </label>
      {modules.map((m) => (
        <ModuleToggle key={m.key} moduleKey={m.key} label={m.label} icon={m.icon} />
      ))}
    </div>
  );
};

export default ModuleControls;
