// src/components/layout/AppHeader.tsx
import React, { useEffect } from 'react';
import {
  Undo2, Redo2, FilePlus2, Save, RotateCcw,
  Download, Upload, Layers,
} from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import { useHistoryStore } from '../../store/historyStore';
import { exportProjectJSON, importProjectJSON } from '../../lib/projectStorage';
import { SPORT_PROFILES } from '../../sports';
import SportPicker from '../sports/SportPicker';
import ProjectLibraryModal from '../projects/ProjectLibraryModal';

interface AppHeaderProps {
  onImportJSON?: (state: Partial<import('../../types/editor').EditorState>) => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({ onImportJSON }) => {
  const store = useEditorStore();
  const history = useHistoryStore();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [sportPickerOpen, setSportPickerOpen] = React.useState(false);
  const [projectLibraryOpen, setProjectLibraryOpen] = React.useState(false);

  const handleUndo = () => {
    // snapshot the current state as EditorState (exclude functions)
    const currentSnap = {
      sport: store.sport,
      logoDataUrl: store.logoDataUrl,
      logoPalette: store.logoPalette,
      colors: store.colors,
      colorsLinked: store.colorsLinked,
      layoutType: store.layoutType,
      scorePosition: store.scorePosition,
      logoPosition: store.logoPosition,
      dimensions: store.dimensions,
      logoScale: store.logoScale,
      logoRotation: store.logoRotation,
      logoSkewX: store.logoSkewX,
      logoOffsetX: store.logoOffsetX,
      logoOffsetY: store.logoOffsetY,
      logoPlateShape: store.logoPlateShape,
      logoPlateWidth: store.logoPlateWidth,
      logoPlateHeight: store.logoPlateHeight,
      logoPadding: store.logoPadding,
      showLogoPlate: store.showLogoPlate,
      modules: store.modules,
      styleMode: store.styleMode,
      style: store.style,
      activeTemplate: store.activeTemplate,
      canvasView: store.canvasView,
      activeStep: store.activeStep,
    };
    const prev = history.undo(currentSnap);
    if (prev) {
      // Only restore design state, keep current canvasView and activeStep
      store.restoreState({ ...prev, canvasView: store.canvasView, activeStep: store.activeStep });
    }
  };

  const handleRedo = () => {
    const currentSnap = {
      sport: store.sport,
      logoDataUrl: store.logoDataUrl,
      logoPalette: store.logoPalette,
      colors: store.colors,
      colorsLinked: store.colorsLinked,
      layoutType: store.layoutType,
      scorePosition: store.scorePosition,
      logoPosition: store.logoPosition,
      dimensions: store.dimensions,
      logoScale: store.logoScale,
      logoRotation: store.logoRotation,
      logoSkewX: store.logoSkewX,
      logoOffsetX: store.logoOffsetX,
      logoOffsetY: store.logoOffsetY,
      logoPlateShape: store.logoPlateShape,
      logoPlateWidth: store.logoPlateWidth,
      logoPlateHeight: store.logoPlateHeight,
      logoPadding: store.logoPadding,
      showLogoPlate: store.showLogoPlate,
      modules: store.modules,
      styleMode: store.styleMode,
      style: store.style,
      activeTemplate: store.activeTemplate,
      canvasView: store.canvasView,
      activeStep: store.activeStep,
    };
    const next = history.redo(currentSnap);
    if (next) {
      store.restoreState({ ...next, canvasView: store.canvasView, activeStep: store.activeStep });
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history.canUndo, history.canRedo]);

  const handleNewProject = () => {
    if (window.confirm('สร้างโปรเจกต์ใหม่? การเปลี่ยนแปลงที่ยังไม่ได้บันทึกจะหายไป')) {
      store.resetProject();
    }
  };

  const handleSave = () => {
    setProjectLibraryOpen(true);
  };

  const handleExportJSON = () => {
    exportProjectJSON(store as import('../../types/editor').EditorState);
  };

  const handleImportJSONClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const state = await importProjectJSON(file);
      onImportJSON?.(state);
      store.loadState(state);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'ไม่สามารถนำเข้าไฟล์ได้');
    }
    e.target.value = '';
  };

  return (
    <>
    <header
      style={{
        height: 'var(--header-height)',
        background: 'rgba(9,15,30,0.95)',
        borderBottom: '1px solid var(--color-border)',
        backdropFilter: 'blur(20px)',
      }}
      className="flex items-center px-4 gap-3 z-50 relative"
    >
      {/* App brand */}
      <div className="flex items-center gap-2 mr-3">
        <div
          className="flex items-center justify-center rounded-lg"
          style={{
            width: 32, height: 32,
            background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
            boxShadow: '0 0 12px rgba(99,102,241,0.4)',
          }}
        >
          <Layers size={16} className="text-white" />
        </div>
        <div>
          <div className="text-white font-bold text-sm leading-tight">
            Sports Scoreboard
          </div>
          <div style={{ fontSize: 9, color: 'var(--color-text-muted)', letterSpacing: '0.1em' }}>
            BUILDER
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ width: 1, height: 28, background: 'var(--color-border)' }} />

      {/* Project buttons */}
      <div className="flex items-center gap-1">
        <button
          className="btn btn-ghost btn-icon tooltip-wrapper"
          onClick={handleNewProject}
          title="โปรเจกต์ใหม่"
          id="btn-new-project"
        >
          <FilePlus2 size={15} />
          <span className="tooltip">โปรเจกต์ใหม่</span>
        </button>

        <button
          className="btn btn-ghost btn-icon tooltip-wrapper"
          onClick={handleSave}
          title="บันทึก"
          id="btn-save"
        >
          <Save size={15} />
          <span className="tooltip">บันทึก (Auto)</span>
        </button>

        <button
          className="btn btn-ghost btn-icon tooltip-wrapper"
          onClick={handleExportJSON}
          title="Export JSON"
          id="btn-export-json"
        >
          <Download size={15} />
          <span className="tooltip">Export JSON</span>
        </button>

        <button
          className="btn btn-ghost btn-icon tooltip-wrapper"
          onClick={handleImportJSONClick}
          title="Import JSON"
          id="btn-import-json"
        >
          <Upload size={15} />
          <span className="tooltip">Import JSON</span>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleFileChange}
          aria-label="Import project JSON file"
        />
      </div>

      {/* Divider */}
      <div style={{ width: 1, height: 28, background: 'var(--color-border)' }} />

      {/* Undo / Redo */}
      <div className="flex items-center gap-1">
        <button
          className="btn btn-ghost btn-icon tooltip-wrapper"
          onClick={handleUndo}
          disabled={!history.canUndo}
          style={{ opacity: history.canUndo ? 1 : 0.35 }}
          id="btn-undo"
          title="Undo"
        >
          <Undo2 size={15} />
          <span className="tooltip">Undo (Ctrl+Z)</span>
        </button>

        <button
          className="btn btn-ghost btn-icon tooltip-wrapper"
          onClick={handleRedo}
          disabled={!history.canRedo}
          style={{ opacity: history.canRedo ? 1 : 0.35 }}
          id="btn-redo"
          title="Redo"
        >
          <Redo2 size={15} />
          <span className="tooltip">Redo (Ctrl+Y)</span>
        </button>
      </div>

      {/* Sport profile */}
      {store.sport && (
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => setSportPickerOpen(true)}
          id="btn-change-sport"
          title="เปลี่ยนชนิดกีฬา"
          style={{ gap: 6, borderColor: `${SPORT_PROFILES[store.sport].accent}50`, color: SPORT_PROFILES[store.sport].accent }}
        >
          {store.sport === 'basketball' ? '🏀' : '⚽'} {SPORT_PROFILES[store.sport].name}
        </button>
      )}

      {/* Reset project */}
      <button
        className="btn btn-ghost btn-icon tooltip-wrapper"
        onClick={() => {
          if (window.confirm('รีเซ็ตโปรเจกต์ทั้งหมด?')) store.resetProject();
        }}
        style={{ color: 'var(--color-text-muted)' }}
        id="btn-reset-project"
        title="รีเซ็ตทั้งหมด"
      >
        <RotateCcw size={14} />
        <span className="tooltip">รีเซ็ตทั้งหมด</span>
      </button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Save indicator */}
      <div
        id="save-indicator"
        className="text-xs opacity-0 transition-opacity duration-300"
        style={{ color: '#4ade80' }}
      >
        ✓ บันทึกแล้ว
      </div>

      {/* Version badge */}
      <div
        className="text-xs px-2 py-1 rounded"
        style={{
          background: 'rgba(59,130,246,0.1)',
          border: '1px solid rgba(59,130,246,0.2)',
          color: 'rgba(96,165,250,0.8)',
          fontSize: 10,
        }}
      >
        v1.0 Local
      </div>
    </header>
    <ProjectLibraryModal open={projectLibraryOpen} onClose={() => setProjectLibraryOpen(false)} />
    <SportPicker open={sportPickerOpen} onClose={() => setSportPickerOpen(false)} />
    </>
  );
};

export default AppHeader;
