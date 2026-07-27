import React, { useState } from 'react';
import type Konva from 'konva';
import { CheckCircle, AlertCircle, Image } from 'lucide-react';
import { exportScoreboard } from '../../lib/exportPng';
import type { ExportMode, ExportScale } from '../../types/editor';
import { useEditorStore } from '../../store/editorStore';



interface ExportControlsProps {
  stageRef: React.RefObject<Konva.Stage | null>;
}

const ExportControls: React.FC<ExportControlsProps> = ({ stageRef }) => {
  const [mode, setMode] = useState<ExportMode>('fit');
  const [scale, setScale] = useState<ExportScale>(2);
  const [includeLogo, setIncludeLogo] = useState(true);
  const [includeModuleIcons, setIncludeModuleIcons] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [exportResult, setExportResult] = useState<{ success: boolean; message: string } | null>(null);
  const dimensions = useEditorStore((s) => s.dimensions);
  const canvasMargin = useEditorStore((s) => s.canvasView.canvasMargin);


  const handleExport = async () => {
    if (!stageRef.current) {
      setExportResult({ success: false, message: 'ไม่พบ Canvas กรุณาลองใหม่อีกครั้ง' });
      return;
    }

    setIsExporting(true);
    setExportResult(null);

    try {
      const result = await exportScoreboard(
        stageRef.current,
        {
          mode,
          scale,
          transparentBg: true,
          includeLogo,
          includeModuleIcons,
        },
        dimensions.width,
        dimensions.height,
        canvasMargin.left,
        canvasMargin.top
      );



      if (result.success) {
        setExportResult({
          success: true,
          message: `✓ Export สำเร็จ: ${result.filename}`,
        });
      } else {
        setExportResult({
          success: false,
          message: result.error || 'Export ล้มเหลว',
        });
      }
    } catch (err) {
      setExportResult({
        success: false,
        message: err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการ Export',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div>
      {/* Export rules reminder */}
      <div
        style={{
          fontSize: 10, color: 'var(--color-text-muted)',
          background: 'rgba(34,197,94,0.06)',
          border: '1px solid rgba(34,197,94,0.15)',
          padding: '7px 10px', borderRadius: 6, marginBottom: 12, lineHeight: 1.6,
        }}
      >
        <div style={{ color: '#4ade80', fontWeight: 600, marginBottom: 3 }}>✓ Export PNG โปร่งใส</div>
        ไม่มีชื่อทีม • ไม่มีคะแนน • ไม่มีตัวเลข • ไม่มีข้อความตัวอย่าง
      </div>

      {/* Export mode */}
      <div style={{ marginBottom: 12 }}>
        <div className="control-label" style={{ marginBottom: 6 }}>รูปแบบ Export</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {[
            { value: 'fit', label: 'Fit to Scoreboard', desc: 'ขนาดพอดีกับกรอบ ตัดพื้นที่ว่างออก' },
            { value: 'fullhd', label: 'Full HD Canvas', desc: '1920×1080 Scoreboard อยู่ตรงกลาง' },
          ].map((m) => (
            <button
              key={m.value}
              onClick={() => setMode(m.value as ExportMode)}
              id={`export-mode-${m.value}`}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                padding: '8px 11px', borderRadius: 6,
                border: mode === m.value
                  ? '1px solid rgba(59,130,246,0.5)'
                  : '1px solid var(--color-border)',
                background: mode === m.value
                  ? 'rgba(59,130,246,0.1)'
                  : 'rgba(255,255,255,0.02)',
                cursor: 'pointer', textAlign: 'left',
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 600, color: mode === m.value ? '#60a5fa' : 'var(--color-text-secondary)' }}>
                {m.label}
              </span>
              <span style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 2 }}>
                {m.desc}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Scale */}
      <div style={{ marginBottom: 12 }}>
        <div className="control-label" style={{ marginBottom: 6 }}>PNG Scale</div>
        <div className="segment-control">
          {([1, 2, 3] as ExportScale[]).map((s) => (
            <button
              key={s}
              className={`segment-option ${scale === s ? 'active' : ''}`}
              onClick={() => setScale(s)}
              id={`export-scale-${s}x`}
            >
              {s}×
            </button>
          ))}
        </div>
      </div>

      {/* Options */}
      <div style={{ marginBottom: 14 }}>
        <div className="control-label" style={{ marginBottom: 6 }}>ตัวเลือก</div>
        {[
          { id: 'include-logo', label: 'รวม Logo รายการ', checked: includeLogo, onChange: setIncludeLogo },
          { id: 'include-icons', label: 'รวม Module Icons', checked: includeModuleIcons, onChange: setIncludeModuleIcons },
        ].map((opt) => (
          <label
            key={opt.id}
            style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7, cursor: 'pointer' }}
          >
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={opt.checked}
                onChange={(e) => opt.onChange(e.target.checked)}
                id={opt.id}
              />
              <div className="toggle-track" />
              <div className="toggle-thumb" />
            </label>
            <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{opt.label}</span>
          </label>
        ))}
      </div>

      {/* Export button */}
      <button
        className="btn btn-primary"
        onClick={handleExport}
        disabled={isExporting}
        style={{ width: '100%', padding: '10px', fontSize: 13, fontWeight: 600 }}
        id="btn-export-png"
      >
        {isExporting ? (
          <>
            <div style={{
              width: 14, height: 14,
              border: '2px solid rgba(255,255,255,0.3)',
              borderTop: '2px solid white',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              flexShrink: 0,
            }} />
            กำลัง Export...
          </>
        ) : (
          <>
            <Image size={15} />
            Export PNG โปร่งใส
          </>
        )}
      </button>

      {/* Result message */}
      {exportResult && (
        <div
          className={exportResult.success ? 'export-success' : 'export-error'}
          style={{ marginTop: 10, display: 'flex', gap: 8, alignItems: 'flex-start' }}
        >
          {exportResult.success
            ? <CheckCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
            : <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} />}
          <span>{exportResult.message}</span>
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default ExportControls;
