import React from 'react';
import { Circle, Clock, Grid3X3, RotateCcw, Square, Timer } from 'lucide-react';
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
  const mod = useEditorStore((state) => state.modules[moduleKey]);
  const setEnabled = useEditorStore((state) => state.setModuleEnabled);
  const setSize = useEditorStore((state) => state.setModuleSize);
  const [expanded, setExpanded] = React.useState(false);

  return (
    <div style={{ border: '1px solid var(--color-border)', borderRadius: 6, overflow: 'hidden', marginBottom: 5, borderColor: mod.enabled ? 'rgba(59,130,246,0.3)' : undefined }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: mod.enabled ? 'rgba(59,130,246,0.06)' : 'rgba(255,255,255,0.02)', cursor: 'pointer' }} onClick={() => setExpanded(!expanded)}>
        <span style={{ color: mod.enabled ? '#60a5fa' : 'var(--color-text-muted)' }}>{icon}</span>
        <span style={{ fontSize: 12, flex: 1, color: 'var(--color-text-secondary)' }}>{label}</span>
        <label className="toggle-switch" onClick={(event) => event.stopPropagation()}>
          <input type="checkbox" checked={mod.enabled} onChange={(event) => setEnabled(moduleKey, event.target.checked)} id={`module-toggle-${moduleKey}`} />
          <div className="toggle-track" />
          <div className="toggle-thumb" />
        </label>
      </div>

      {mod.enabled && expanded && (
        <div style={{ padding: '8px 10px', borderTop: '1px solid var(--color-border)' }}>
          <SliderRow label="ขนาด" value={Math.round(mod.size * 100)} min={50} max={200} unit="%" id={`module-size-${moduleKey}`} onChange={(value) => setSize(moduleKey, value / 100)} />
          {(moduleKey === 'time' || moduleKey === 'half') && (
            <div style={{ marginTop: 12 }}>
              <ColorSwatchPicker colorKey={moduleKey === 'time' ? 'timeSlot' : 'halfSlot'} label="สีพื้นหลัง" />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const ModuleControls: React.FC = () => {
  const sport = useEditorStore((state) => state.sport);
  const showModuleIcons = useEditorStore((state) => state.canvasView.showModuleIcons);
  const snapToGrid = useEditorStore((state) => state.canvasView.snapToGrid);
  const setShowModuleIcons = useEditorStore((state) => state.setShowModuleIcons);
  const setSnapToGrid = useEditorStore((state) => state.setSnapToGrid);
  const resetModulePositions = useEditorStore((state) => state.resetModulePositions);

  const isBasketball = sport === 'basketball';
  const modules: { key: keyof EditorModules; label: string; icon: React.ReactNode }[] = [
    { key: 'time', label: 'เวลาแข่งขัน (Time)', icon: <Clock size={13} /> },
    { key: 'half', label: isBasketball ? 'ควอเตอร์ (Quarter)' : 'ครึ่งเวลา (Half)', icon: <Timer size={13} /> },
    ...(isBasketball
      ? [
          { key: 'foulA' as const, label: 'ฟาวล์ทีม A', icon: <Circle size={13} style={{ color: '#ff9b2f' }} /> },
          { key: 'foulB' as const, label: 'ฟาวล์ทีม B', icon: <Circle size={13} style={{ color: '#ff9b2f' }} /> },
        ]
      : [
          { key: 'yellowCardA' as const, label: 'ใบเหลือง ทีม A', icon: <Square size={13} style={{ color: '#ffcd00', fill: '#ffcd00' }} /> },
          { key: 'yellowCardB' as const, label: 'ใบเหลือง ทีม B', icon: <Square size={13} style={{ color: '#ffcd00', fill: '#ffcd00' }} /> },
          { key: 'redCardA' as const, label: 'ใบแดง ทีม A', icon: <Square size={13} style={{ color: '#e8000d', fill: '#e8000d' }} /> },
          { key: 'redCardB' as const, label: 'ใบแดง ทีม B', icon: <Square size={13} style={{ color: '#e8000d', fill: '#e8000d' }} /> },
        ]),
  ];

  return (
    <div>
      <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 10, lineHeight: 1.5, background: 'rgba(255,255,255,0.03)', padding: '7px 8px', borderRadius: 5 }}>
        ระบบซ่อน Module ที่ไม่เหมาะกับชนิดกีฬาที่เลือกให้แล้ว
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 11 }}>
        <button type="button" className={`btn btn-secondary ${showModuleIcons ? 'btn-active' : ''}`} onClick={() => setShowModuleIcons(!showModuleIcons)} id="toggle-show-module-icons" style={{ fontSize: 10, padding: '7px 5px' }}>
          <Circle size={11} /> ไอคอน Preview
        </button>
        <button type="button" className={`btn btn-secondary ${snapToGrid ? 'btn-active' : ''}`} onClick={() => setSnapToGrid(!snapToGrid)} id="toggle-snap-grid" style={{ fontSize: 10, padding: '7px 5px' }}>
          <Grid3X3 size={11} /> Snap {snapToGrid ? '4px' : 'ปิด'}
        </button>
      </div>

      <button type="button" className="btn btn-ghost" onClick={resetModulePositions} id="btn-reset-module-positions" style={{ width: '100%', justifyContent: 'flex-start', fontSize: 11, marginBottom: 9 }}>
        <RotateCcw size={11} /> จัด Module กลับตำแหน่งแนะนำ
      </button>

      {modules.map((module) => <ModuleToggle key={module.key} moduleKey={module.key} label={module.label} icon={module.icon} />)}
    </div>
  );
};

export default ModuleControls;
