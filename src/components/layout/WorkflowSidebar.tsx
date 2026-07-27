// src/components/layout/WorkflowSidebar.tsx
import React from 'react';
import {
  Upload,
  Palette,
  LayoutPanelLeft,
  AlignHorizontalJustifyCenter,
  PlusSquare,
  Layers,
  FileDown,
} from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';

interface WorkflowStep {
  number: number;
  icon: React.ReactNode;
  label: string;
  sublabel: string;
  accentColor?: string;
}

const steps: WorkflowStep[] = [
  { number: 1, icon: <Upload size={16} />, label: 'Upload', sublabel: 'Logo', accentColor: '#60a5fa' },
  { number: 2, icon: <Palette size={16} />, label: 'Theme', sublabel: 'Template', accentColor: '#a78bfa' },
  { number: 3, icon: <LayoutPanelLeft size={16} />, label: 'Layout', sublabel: 'โครงสร้าง', accentColor: '#34d399' },
  { number: 4, icon: <AlignHorizontalJustifyCenter size={16} />, label: 'Score', sublabel: 'ตำแหน่ง', accentColor: '#fb923c' },
  { number: 5, icon: <PlusSquare size={16} />, label: 'Modules', sublabel: 'โมดูล', accentColor: '#f472b6' },
  { number: 6, icon: <Layers size={16} />, label: 'Style', sublabel: '2D / 3D', accentColor: '#818cf8' },
  { number: 7, icon: <FileDown size={16} />, label: 'Export', sublabel: 'PNG', accentColor: '#4ade80' },
];

const WorkflowSidebar: React.FC = () => {
  const activeStep = useEditorStore((s) => s.activeStep);
  const setActiveStep = useEditorStore((s) => s.setActiveStep);

  return (
    <aside
      style={{
        width: 'var(--sidebar-width)',
        background: 'rgba(9,15,30,0.9)',
        borderRight: '1px solid var(--color-border)',
        padding: '14px 10px',
        height: '100%',
        overflowY: 'auto',
        overflowX: 'hidden',
        overscrollBehavior: 'contain',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Title */}
      <div
        style={{
          fontSize: 9,
          color: 'var(--color-text-muted)',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          marginBottom: 12,
          fontWeight: 600,
          paddingLeft: 2,
        }}
      >
        ขั้นตอนการออกแบบ
      </div>

      {/* 2-column grid of step buttons */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 6,
        }}
      >
        {steps.map((step) => {
          const isActive = activeStep === step.number;
          const isCompleted = activeStep > step.number;
          const accent = step.accentColor || '#60a5fa';

          return (
            <button
              key={step.number}
              onClick={() => setActiveStep(step.number)}
              id={`workflow-step-${step.number}`}
              title={`Step ${step.number}: ${step.label}`}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 5,
                padding: '10px 6px',
                borderRadius: 10,
                border: isActive
                  ? `1.5px solid ${accent}60`
                  : isCompleted
                  ? '1.5px solid rgba(255,255,255,0.08)'
                  : '1.5px solid transparent',
                background: isActive
                  ? `${accent}14`
                  : isCompleted
                  ? 'rgba(255,255,255,0.03)'
                  : 'rgba(255,255,255,0.02)',
                cursor: 'pointer',
                transition: 'all 0.18s ease',
                position: 'relative',
                minHeight: 68,
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = `${accent}40`;
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.background = isCompleted ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.02)';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = isCompleted ? 'rgba(255,255,255,0.08)' : 'transparent';
                }
              }}
            >
              {/* Step number badge */}
              <div
                style={{
                  position: 'absolute',
                  top: 5,
                  left: 5,
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  background: isCompleted
                    ? `${accent}25`
                    : isActive
                    ? `${accent}35`
                    : 'rgba(255,255,255,0.06)',
                  border: `1px solid ${isActive || isCompleted ? `${accent}50` : 'rgba(255,255,255,0.1)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 7,
                  fontWeight: 700,
                  color: isActive || isCompleted ? accent : 'rgba(255,255,255,0.3)',
                }}
              >
                {isCompleted ? '✓' : step.number}
              </div>

              {/* Icon */}
              <div
                style={{
                  color: isActive ? accent : isCompleted ? `${accent}80` : 'rgba(255,255,255,0.25)',
                  transition: 'color 0.18s',
                  marginTop: 4,
                }}
              >
                {step.icon}
              </div>

              {/* Label */}
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? accent : isCompleted ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.3)',
                    transition: 'color 0.18s',
                    lineHeight: 1.2,
                  }}
                >
                  {step.label}
                </div>
                <div
                  style={{
                    fontSize: 9,
                    color: isActive ? `${accent}80` : 'rgba(255,255,255,0.2)',
                    marginTop: 2,
                    lineHeight: 1.2,
                  }}
                >
                  {step.sublabel}
                </div>
              </div>

              {/* Active glow dot */}
              {isActive && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: 5,
                    width: 4,
                    height: 4,
                    borderRadius: '50%',
                    background: accent,
                    boxShadow: `0 0 6px ${accent}`,
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* OBS Tips */}
      <div
        style={{
          background: 'rgba(59,130,246,0.06)',
          border: '1px solid rgba(59,130,246,0.12)',
          borderRadius: 8,
          padding: '10px 10px',
          fontSize: 10,
          color: 'var(--color-text-muted)',
          lineHeight: 1.6,
          marginTop: 12,
        }}
      >
        <div style={{ color: '#60a5fa', fontWeight: 600, marginBottom: 4, fontSize: 10 }}>💡 OBS Tips</div>
        Export PNG โปร่งใส → Image Source → ใส่ข้อมูลทับ
      </div>
    </aside>
  );
};

export default WorkflowSidebar;
