import React from 'react';
import { ArrowRight, CircleDot, X } from 'lucide-react';
import { SPORT_PROFILES } from '../../sports';
import { useEditorStore } from '../../store/editorStore';
import type { SportType } from '../../types/editor';

interface SportPickerProps {
  open: boolean;
  blocking?: boolean;
  onClose?: () => void;
}

const icons: Record<SportType, React.ReactNode> = {
  football: <CircleDot size={25} />,
  basketball: <CircleDot size={25} />,
};

const SportPicker: React.FC<SportPickerProps> = ({ open, blocking = false, onClose }) => {
  const sport = useEditorStore((state) => state.sport);
  const setSport = useEditorStore((state) => state.setSport);

  if (!open) return null;

  const handleSelect = (nextSport: SportType) => {
    setSport(nextSport);
    onClose?.();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="sport-picker-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background: 'rgba(2,8,23,0.82)',
        backdropFilter: 'blur(14px)',
      }}
    >
      <div
        style={{
          width: 'min(720px, 100%)',
          border: '1px solid rgba(255,255,255,0.14)',
          borderRadius: 18,
          padding: 26,
          background: 'linear-gradient(145deg, rgba(16,29,53,0.98), rgba(8,15,30,0.98))',
          boxShadow: '0 24px 80px rgba(0,0,0,0.55)',
        }}
      >
        {!blocking && (
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-icon"
            aria-label="ปิดหน้าต่างเลือกกีฬา"
            style={{ position: 'absolute', marginTop: -16, marginRight: -16, right: 24, color: 'var(--color-text-muted)' }}
          >
            <X size={16} />
          </button>
        )}
        <div style={{ textAlign: 'center', marginBottom: 22 }}>
          <div style={{ fontSize: 10, color: '#60a5fa', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
            Sports Scoreboard Builder
          </div>
          <h1 id="sport-picker-title" style={{ marginTop: 7, fontSize: 25, lineHeight: 1.2, color: '#fff' }}>
            เลือกชนิดกีฬาก่อนเริ่มออกแบบ
          </h1>
          <p style={{ marginTop: 8, color: 'var(--color-text-secondary)', fontSize: 13 }}>
            ระบบจะเตรียมโทนสี Layout และ Module ให้เหมาะกับกีฬาที่เลือก
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 14 }}>
          {(Object.keys(SPORT_PROFILES) as SportType[]).map((sportId) => {
            const profile = SPORT_PROFILES[sportId];
            const selected = sport === sportId;
            return (
              <button
                key={sportId}
                type="button"
                onClick={() => handleSelect(sportId)}
                id={`sport-option-${sportId}`}
                aria-pressed={selected}
                style={{
                  textAlign: 'left',
                  padding: 18,
                  borderRadius: 14,
                  border: selected ? `1px solid ${profile.accent}` : '1px solid rgba(255,255,255,0.1)',
                  background: selected ? `${profile.accent}12` : 'rgba(255,255,255,0.035)',
                  color: '#fff',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                  boxShadow: selected ? `0 0 24px ${profile.accent}20` : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: profile.accent }}>
                  {icons[sportId]}
                  <span style={{ fontSize: 17, fontWeight: 700 }}>{profile.name}</span>
                  <ArrowRight size={15} style={{ marginLeft: 'auto', opacity: 0.7 }} />
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 10, lineHeight: 1.65 }}>
                  {profile.description}
                </div>
                <div style={{ display: 'flex', gap: 5, marginTop: 13, flexWrap: 'wrap' }}>
                  <span className="sport-chip">{profile.defaultTemplate}</span>
                  <span className="sport-chip">{profile.layoutType === 'left-right' ? 'ซ้าย / ขวา' : 'บน / ล่าง'}</span>
                  <span className="sport-chip">{profile.dimensions.width}×{profile.dimensions.height}</span>
                </div>
              </button>
            );
          })}
        </div>

        {blocking && (
          <div style={{ textAlign: 'center', marginTop: 16, color: 'var(--color-text-muted)', fontSize: 10 }}>
            เลือกกีฬาแล้วสามารถเปลี่ยนภายหลังได้จากแถบด้านบน
          </div>
        )}
      </div>
    </div>
  );
};

export default SportPicker;
