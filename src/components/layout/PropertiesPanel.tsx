// src/components/layout/PropertiesPanel.tsx
// Right-side properties panel — shows controls based on active workflow step
import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import type Konva from 'konva';

// Controls
import LogoUploader from '../logo/LogoUploader';
import PaletteDisplay from '../logo/PaletteDisplay';
import ColorControls from '../controls/ColorControls';
import LayoutControls from '../controls/LayoutControls';
import ScorePositionControls from '../controls/ScorePositionControls';
import ModuleControls from '../controls/ModuleControls';
import StyleControls from '../controls/StyleControls';
import LogoControls from '../controls/LogoControls';
import ExportControls from '../controls/ExportControls';
import TemplateGallery from '../templates/TemplateGallery';

interface CollapsibleSectionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  id: string;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title, defaultOpen = true, children, id,
}) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="section-panel" style={{ marginBottom: 6 }}>
      <button
        className="section-header"
        onClick={() => setOpen(!open)}
        style={{ width: '100%' }}
        id={`section-${id}`}
      >
        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)', flex: 1, textAlign: 'left' }}>
          {title}
        </span>
        {open
          ? <ChevronUp size={13} style={{ color: 'var(--color-text-muted)' }} />
          : <ChevronDown size={13} style={{ color: 'var(--color-text-muted)' }} />}
      </button>
      {open && (
        <div className="section-content" style={{ animation: 'slideIn 0.15s ease' }}>
          {children}
        </div>
      )}
    </div>
  );
};

interface PropertiesPanelProps {
  stageRef: React.RefObject<Konva.Stage | null>;
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ stageRef }) => {
  const activeStep = useEditorStore((s) => s.activeStep);
  const logoPalette = useEditorStore((s) => s.logoPalette);

  // Render sections based on active step
  const renderStepContent = () => {
    switch (activeStep) {
      case 1:
        return (
          <>
            <CollapsibleSection title="อัปโหลด Logo รายการ" id="logo-upload">
              <LogoUploader />
            </CollapsibleSection>
            {logoPalette && (
              <CollapsibleSection title="สีที่วิเคราะห์จาก Logo" id="palette-display">
                <PaletteDisplay />
              </CollapsibleSection>
            )}
          </>
        );

      case 2:
        return (
          <>
            <CollapsibleSection title="Template Library" id="template-library">
              <TemplateGallery />
            </CollapsibleSection>
          </>
        );

      case 3:
        return (
          <>
            <CollapsibleSection title="โครงสร้าง Layout" id="layout-controls">
              <LayoutControls />
            </CollapsibleSection>
            <CollapsibleSection title="ตำแหน่ง Logo" id="logo-position-controls">
              <LogoControls />
            </CollapsibleSection>
          </>
        );

      case 4:
        return (
          <CollapsibleSection title="ตำแหน่งคะแนน" id="score-pos-controls">
            <ScorePositionControls />
          </CollapsibleSection>
        );

      case 5:
        return (
          <CollapsibleSection title="โมดูลเสริม" id="module-controls">
            <ModuleControls />
          </CollapsibleSection>
        );

      case 6:
        return (
          <>
            <CollapsibleSection title="Style 2D / 3D" id="style-controls">
              <StyleControls />
            </CollapsibleSection>
            <CollapsibleSection title="สี & Gradient" id="color-controls" defaultOpen={false}>
              <ColorControls />
            </CollapsibleSection>
          </>
        );

      case 7:
        return (
          <CollapsibleSection title="Export PNG โปร่งใส" id="export-controls">
            <ExportControls stageRef={stageRef} />
          </CollapsibleSection>
        );

      default:
        return null;
    }
  };

  // Always show quick-access sections at the bottom
  const renderQuickAccess = () => {
    if (activeStep >= 6) return null;
    return (
      <CollapsibleSection title="สี & Gradient" id="quick-colors" defaultOpen={false}>
        <ColorControls />
      </CollapsibleSection>
    );
  };

  return (
    <aside
      style={{
        width: 'var(--panel-width)',
        background: 'rgba(9,15,30,0.85)',
        borderLeft: '1px solid var(--color-border)',
        height: '100%',
        overflowY: 'auto',
        overflowX: 'hidden',
        overscrollBehavior: 'contain',
        padding: '10px 10px',
        flexShrink: 0,
        display: 'block',
      }}
    >
      {/* Step indicator */}
      <div
        style={{
          fontSize: 10, fontWeight: 600,
          color: 'var(--color-accent-blue)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginBottom: 8,
          paddingBottom: 8,
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        ขั้นตอน {activeStep}/7
      </div>

      {/* Step-specific content */}
      {renderStepContent()}

      {/* Quick access color (when not on color step) */}
      {renderQuickAccess()}
    </aside>
  );
};

export default PropertiesPanel;
