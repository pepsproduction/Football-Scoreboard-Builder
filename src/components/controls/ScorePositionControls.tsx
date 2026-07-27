// src/components/controls/ScorePositionControls.tsx
import React from 'react';
import { useEditorStore } from '../../store/editorStore';
import type { ScorePosition } from '../../types/editor';

const ScorePositionControls: React.FC = () => {
  const layoutType = useEditorStore((s) => s.layoutType);
  const scorePosition = useEditorStore((s) => s.scorePosition);
  const setScorePosition = useEditorStore((s) => s.setScorePosition);

  const isLR = layoutType === 'left-right';

  const lrOptions: { value: ScorePosition; label: string; desc: string }[] = [
    { value: 'inner', label: 'Inner', desc: '[ทีม][คะแนน][กลาง][คะแนน][ทีม]' },
    { value: 'outer', label: 'Outer', desc: '[คะแนน][ทีม][กลาง][ทีม][คะแนน]' },
  ];

  const tbOptions: { value: ScorePosition; label: string; desc: string }[] = [
    { value: 'before', label: 'Before', desc: '[คะแนน][ชื่อทีม]' },
    { value: 'after', label: 'After', desc: '[ชื่อทีม][คะแนน]' },
  ];

  const options = isLR ? lrOptions : tbOptions;

  return (
    <div>
      <div className="control-label" style={{ marginBottom: 8 }}>ตำแหน่งคะแนน</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setScorePosition(opt.value)}
            id={`score-pos-${opt.value}`}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              padding: '9px 12px',
              borderRadius: 6,
              border: scorePosition === opt.value
                ? '1px solid rgba(59,130,246,0.5)'
                : '1px solid var(--color-border)',
              background: scorePosition === opt.value
                ? 'rgba(59,130,246,0.1)'
                : 'rgba(255,255,255,0.02)',
              cursor: 'pointer',
              transition: 'all 0.15s',
              textAlign: 'left',
            }}
          >
            <span style={{
              fontSize: 12, fontWeight: 600,
              color: scorePosition === opt.value ? '#60a5fa' : 'var(--color-text-secondary)',
            }}>
              {opt.label}
            </span>
            <span style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 2, fontFamily: 'monospace' }}>
              {opt.desc}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ScorePositionControls;
