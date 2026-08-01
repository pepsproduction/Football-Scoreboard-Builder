// src/components/logo/LogoUploader.tsx
import React, { useRef, useState, useCallback } from 'react';
import { Upload, X, AlertCircle } from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import { extractPalette, loadImageFromDataUrl } from '../../lib/paletteExtractor';
import { buildThemeFromPalette } from '../../lib/themeEngine';
import { checkLogoSize } from '../../lib/projectStorage';

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const LogoUploader: React.FC = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sizeWarning, setSizeWarning] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const setLogo = useEditorStore((s) => s.setLogo);
  const applyPaletteTheme = useEditorStore((s) => s.applyPaletteTheme);
  const setTemplate = useEditorStore((s) => s.setTemplate);
  const setActiveStep = useEditorStore((s) => s.setActiveStep);
  const logoDataUrl = useEditorStore((s) => s.logoDataUrl);

  const processFile = useCallback(async (file: File) => {
    setError(null);
    setSizeWarning(null);

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('รองรับเฉพาะ PNG, JPG, JPEG, WebP เท่านั้น');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError(`ไฟล์ใหญ่เกินไป (${Math.round(file.size / 1024)}KB) กรุณาใช้ไฟล์ขนาดไม่เกิน 5MB`);
      return;
    }

    setIsProcessing(true);
    try {
      const dataUrl = await readFileAsDataUrl(file);
      const sizeCheck = checkLogoSize(dataUrl);
      if (!sizeCheck.ok && sizeCheck.warning) setSizeWarning(sizeCheck.warning);

      const imgEl = await loadImageFromDataUrl(dataUrl);
      const palette = await extractPalette(imgEl);
      const theme = buildThemeFromPalette(palette);

      setLogo(dataUrl, palette);
      applyPaletteTheme(palette);
      setTemplate(theme.suggestedTemplate);
      setActiveStep(2);
    } catch {
      setError('ไม่สามารถประมวลผลภาพได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsProcessing(false);
    }
  }, [setLogo, applyPaletteTheme, setTemplate, setActiveStep]);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) await processFile(file);
  }, [processFile]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await processFile(file);
    e.target.value = '';
  };

  const handleRemoveLogo = () => {
    setLogo(null, null);
    setError(null);
    setSizeWarning(null);
  };

  return (
    <div className="space-y-3">
      {!logoDataUrl ? (
        <div
          className={`upload-zone ${isDragging ? 'drag-over' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          id="logo-upload-zone"
        >
          {isProcessing ? (
            <div className="flex flex-col items-center gap-2">
              <div
                style={{
                  width: 28, height: 28,
                  border: '2px solid rgba(59,130,246,0.3)',
                  borderTop: '2px solid #3b82f6',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }}
              />
              <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>กำลังวิเคราะห์สี...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div
                style={{
                  width: 44, height: 44,
                  borderRadius: '50%',
                  background: 'rgba(59,130,246,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '1px solid rgba(59,130,246,0.2)',
                  marginBottom: 4,
                }}
              >
                <Upload size={20} style={{ color: 'var(--color-accent-blue)' }} />
              </div>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-secondary)' }}>
                วางโลโก้รายการที่นี่
              </div>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                PNG, JPG, WebP • ไม่เกิน 5MB
              </div>
              <div
                style={{
                  fontSize: 11, color: 'var(--color-accent-blue)',
                  background: 'rgba(59,130,246,0.08)',
                  padding: '3px 10px', borderRadius: 4,
                  marginTop: 2,
                }}
              >
                หรือคลิกเพื่อเลือกไฟล์
              </div>
            </div>
          )}
        </div>
      ) : (
        <div
          style={{
            position: 'relative',
            border: '1px solid var(--color-border)',
            borderRadius: 8,
            padding: 12,
            background: 'rgba(255,255,255,0.02)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <img
            src={logoDataUrl}
            alt="Tournament logo"
            style={{
              width: 56, height: 56,
              objectFit: 'contain',
              borderRadius: 4,
              background: 'rgba(255,255,255,0.05)',
            }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)' }}>
              โลโก้อัปโหลดแล้ว
            </div>
            <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 2 }}>
              คลิก "เปลี่ยน" เพื่ออัปโหลดใหม่
            </div>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            <button
              className="btn btn-secondary"
              onClick={() => fileRef.current?.click()}
              style={{ fontSize: 11 }}
              id="btn-change-logo"
            >
              เปลี่ยน
            </button>
            <button
              className="btn btn-ghost btn-icon"
              onClick={handleRemoveLogo}
              title="ลบโลโก้"
              id="btn-remove-logo"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        className="hidden"
        onChange={handleFileChange}
        aria-label="อัปโหลดโลโก้รายการ"
        id="logo-file-input"
      />

      {error && (
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', color: '#fca5a5', fontSize: 11 }}>
          <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
          {error}
        </div>
      )}
      {sizeWarning && (
        <div style={{ fontSize: 10, color: '#fbbf24', lineHeight: 1.5 }}>
          ⚠️ {sizeWarning}
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default LogoUploader;
