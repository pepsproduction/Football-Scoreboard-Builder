// src/pages/EditorPage.tsx
import React, { useRef } from 'react';
import type Konva from 'konva';
import AppHeader from '../components/layout/AppHeader';
import WorkflowSidebar from '../components/layout/WorkflowSidebar';
import CanvasWorkspace from '../components/editor/CanvasWorkspace';
import PropertiesPanel from '../components/layout/PropertiesPanel';
import SportPicker from '../components/sports/SportPicker';
import { useEditorStore } from '../store/editorStore';

const EditorPage: React.FC = () => {
  const stageRef = useRef<Konva.Stage>(null);
  const sport = useEditorStore((state) => state.sport);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        background: 'var(--color-navy-950)',
      }}
    >
      {/* Header */}
      <AppHeader />

      {/* Main content area */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>

        {/* Left: Workflow sidebar */}
        <WorkflowSidebar />

        {/* Center: Canvas */}
        <CanvasWorkspace stageRef={stageRef} />

        {/* Right: Properties panel */}
        <PropertiesPanel stageRef={stageRef} />
      </div>
      <SportPicker open={sport === null} blocking />
    </div>
  );
};

export default EditorPage;
