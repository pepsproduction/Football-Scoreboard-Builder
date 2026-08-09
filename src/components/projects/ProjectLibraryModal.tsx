import React, { useEffect, useState } from 'react';
import { FolderOpen, Save, Trash2, X } from 'lucide-react';
import {
  deleteSavedProject,
  listSavedProjects,
  loadSavedProject,
  saveNamedProject,
  type SavedProjectSummary,
} from '../../lib/projectStorage';
import { useEditorStore } from '../../store/editorStore';

interface ProjectLibraryModalProps {
  open: boolean;
  onClose: () => void;
}

const ProjectLibraryModal: React.FC<ProjectLibraryModalProps> = ({ open, onClose }) => {
  const store = useEditorStore();
  const [name, setName] = useState('');
  const [projects, setProjects] = useState<SavedProjectSummary[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  const refresh = () => setProjects(listSavedProjects());

  useEffect(() => {
    if (open) {
      refresh();
      setMessage(null);
      setName('');
    }
  }, [open]);

  if (!open) return null;

  const handleSave = () => {
    const saved = saveNamedProject(name, store);
    setName('');
    setMessage(`บันทึก “${saved.name}” แล้ว`);
    refresh();
  };

  const handleLoad = (id: string) => {
    const state = loadSavedProject(id);
    if (!state) return;
    store.loadState(state);
    store.setActiveStep(1);
    onClose();
  };

  const handleDelete = (project: SavedProjectSummary) => {
    if (!window.confirm(`ลบโปรเจกต์ “${project.name}” หรือไม่?`)) return;
    deleteSavedProject(project.id);
    refresh();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-library-title"
      style={{
        position: 'fixed', inset: 0, zIndex: 90,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        background: 'rgba(2,8,23,0.74)', backdropFilter: 'blur(10px)',
      }}
    >
      <div style={{ width: 'min(620px,100%)', maxHeight: 'min(720px,90vh)', overflowY: 'auto', borderRadius: 14, border: '1px solid rgba(255,255,255,0.14)', background: 'rgba(9,15,30,0.98)', boxShadow: '0 24px 70px rgba(0,0,0,0.55)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 16px', borderBottom: '1px solid var(--color-border)' }}>
          <FolderOpen size={16} style={{ color: '#60a5fa' }} />
          <div id="project-library-title" style={{ fontSize: 13, fontWeight: 700, flex: 1 }}>โปรเจกต์ที่บันทึกไว้</div>
          <button type="button" className="btn btn-ghost btn-icon" onClick={onClose} aria-label="ปิดโปรเจกต์">
            <X size={15} />
          </button>
        </div>

        <div style={{ padding: 16 }}>
          <div style={{ display: 'flex', gap: 7 }}>
            <input
              className="input-text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              onKeyDown={(event) => { if (event.key === 'Enter') handleSave(); }}
              placeholder="ชื่อโปรเจกต์ เช่น รอบชิงลีก 2026"
              aria-label="ชื่อโปรเจกต์"
              id="project-name-input"
            />
            <button type="button" className="btn btn-primary" onClick={handleSave} id="btn-save-named-project">
              <Save size={13} /> บันทึก
            </button>
          </div>
          {message && <div style={{ marginTop: 7, color: '#86efac', fontSize: 10 }}>{message}</div>}

          <div style={{ marginTop: 16, marginBottom: 8, fontSize: 10, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Autosave เปิดอยู่ · {projects.length}/20 โปรเจกต์
          </div>

          {projects.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', border: '1px dashed var(--color-border)', borderRadius: 10, color: 'var(--color-text-muted)', fontSize: 11 }}>
              ยังไม่มีโปรเจกต์ที่ตั้งชื่อ กดบันทึกด้านบนเพื่อสร้าง Snapshot
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {projects.map((project) => (
                <div key={project.id} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '9px 10px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'rgba(255,255,255,0.025)' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{project.name}</div>
                    <div style={{ marginTop: 3, fontSize: 9, color: 'var(--color-text-muted)' }}>{new Date(project.savedAt).toLocaleString('th-TH')} · {project.sizeKB} KB</div>
                  </div>
                  <button type="button" className="btn btn-secondary" onClick={() => handleLoad(project.id)} id={`btn-load-project-${project.id}`}>
                    <FolderOpen size={12} /> เปิด
                  </button>
                  <button type="button" className="btn btn-ghost btn-icon" onClick={() => handleDelete(project)} aria-label={`ลบ ${project.name}`} id={`btn-delete-project-${project.id}`}>
                    <Trash2 size={13} style={{ color: '#f87171' }} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectLibraryModal;
