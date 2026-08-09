// src/components/templates/TemplateGallery.tsx
import React, { useState } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { TEMPLATE_LIST } from '../../templates/index';
import type { TemplateId } from '../../types/editor';

const TemplateGallery: React.FC = () => {
  const activeTemplate = useEditorStore((s) => s.activeTemplate);
  const sport = useEditorStore((s) => s.sport);
  const setTemplate = useEditorStore((s) => s.setTemplate);
  const [hoveredId, setHoveredId] = useState<TemplateId | null>(null);

  const sportRecommended = sport === 'basketball'
    ? new Set<TemplateId>(['velocityCore', 'neonStrike', 'ruggedMetal', 'cyberpunkEdge', 'dynamicHex', 'holoInterface'])
    : new Set<TemplateId>(['arenaLive', 'championsLeague', 'premierModern', 'worldCupClassic', 'competitiveSplit', 'leftLogoClassic']);
  const orderedTemplates = [...TEMPLATE_LIST].sort((a, b) => Number(sportRecommended.has(b.id)) - Number(sportRecommended.has(a.id)));

  const handleSelectTemplate = (id: TemplateId) => {
    setTemplate(id);
  };

  // Tags helper
  const getTags = (tpl: typeof TEMPLATE_LIST[0]) => {
    const tags: { label: string; color: string; bg: string }[] = [];
    if (tpl.styleMode === '3d') tags.push({ label: '3D', color: '#a5b4fc', bg: 'rgba(99,102,241,0.2)' });
    else tags.push({ label: '2D', color: '#9ca3af', bg: 'rgba(100,100,100,0.15)' });
    if (tpl.style.glowStrength > 0.5) tags.push({ label: 'Glow', color: '#86efac', bg: 'rgba(34,197,94,0.15)' });
    if (Math.abs(tpl.style.skewX) > 0.1) tags.push({ label: 'Skew', color: '#fb923c', bg: 'rgba(249,115,22,0.15)' });
    if (tpl.style.patternStyle !== 'none') tags.push({ label: tpl.style.patternStyle, color: '#f9a8d4', bg: 'rgba(236,72,153,0.15)' });
    if (tpl.layoutType === 'top-bottom') tags.push({ label: 'T/B', color: '#67e8f9', bg: 'rgba(6,182,212,0.15)' });
    return tags.slice(0, 3);
  };

  // New template IDs (those not in original 14)
  const originalIds = new Set([
    'minimal2d', 'centerCrest', 'leftLogoClassic', 'premiumMetallic',
    'competitiveSplit', 'compactLive', 'championsLeague', 'premierModern',
    'worldCupClassic', 'esportsNeon', 'mechSymmetry', 'techSlantLeft',
    'speedAsym', 'cyberNeon',
  ]);

  return (
    <div>
      {/* Info bar */}
      <div style={{
        fontSize: 10,
        color: 'var(--color-text-muted)',
        marginBottom: 10,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
      }}>
        <span style={{ color: '#60a5fa', fontWeight: 600 }}>{TEMPLATE_LIST.length}</span> templates
        <span style={{ color: 'var(--color-text-muted)' }}>· {sport === 'basketball' ? 'Basketball' : 'Football'} preset first</span>
        <span style={{ marginLeft: 'auto', color: '#86efac', fontSize: 9 }}>
          {TEMPLATE_LIST.filter(t => !originalIds.has(t.id)).length} ใหม่
        </span>
      </div>

      {/* 2-column grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 6,
        }}
      >
        {orderedTemplates.map((tpl) => {
          const isActive = activeTemplate === tpl.id;
          const isHovered = hoveredId === tpl.id;
          const isNew = !originalIds.has(tpl.id);
          const highlightColor = tpl.colors.highlight.color;
          const teamColor = tpl.colors.teamABg.color;
          const teamColorB = tpl.colors.teamBBg.color;
          const tags = getTags(tpl);
          if (sportRecommended.has(tpl.id)) tags.unshift({ label: 'MATCH', color: '#86efac', bg: 'rgba(34,197,94,0.15)' });
          const skew = tpl.style.skewX !== 0 ? `skewX(${tpl.style.skewX * 30}deg)` : 'none';

          return (
            <button
              key={tpl.id}
              onClick={() => handleSelectTemplate(tpl.id as TemplateId)}
              onMouseEnter={() => setHoveredId(tpl.id as TemplateId)}
              onMouseLeave={() => setHoveredId(null)}
              id={`template-${tpl.id}`}
              title={tpl.name}
              style={{
                textAlign: 'left',
                cursor: 'pointer',
                width: '100%',
                borderRadius: 10,
                overflow: 'hidden',
                border: isActive
                  ? `1.5px solid ${highlightColor}60`
                  : isHovered
                  ? `1.5px solid rgba(255,255,255,0.12)`
                  : '1.5px solid rgba(255,255,255,0.05)',
                background: isActive
                  ? `${highlightColor}0a`
                  : 'rgba(255,255,255,0.02)',
                transition: 'all 0.15s ease',
                transform: isHovered && !isActive ? 'translateY(-1px)' : 'none',
                boxShadow: isActive ? `0 0 16px ${highlightColor}20` : isHovered ? '0 4px 16px rgba(0,0,0,0.3)' : 'none',
              }}
            >
              {/* Thumbnail preview */}
              <div
                style={{
                  height: 52,
                  background: tpl.colors.framePrimary.color || '#0a1628',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Background glow effect */}
                {tpl.style.glowStrength > 0.4 && (
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: `radial-gradient(ellipse at center, ${highlightColor}18 0%, transparent 70%)`,
                  }} />
                )}

                {/* Pattern overlay */}
                {tpl.style.patternStyle === 'stripes' && (
                  <div style={{
                    position: 'absolute', inset: 0,
                    backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255,255,255,0.04) 4px, rgba(255,255,255,0.04) 5px)`,
                  }} />
                )}
                {tpl.style.patternStyle === 'dots' && (
                  <div style={{
                    position: 'absolute', inset: 0,
                    backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)`,
                    backgroundSize: '6px 6px',
                  }} />
                )}
                {tpl.style.patternStyle === 'grid' && (
                  <div style={{
                    position: 'absolute', inset: 0,
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)`,
                    backgroundSize: '8px 8px',
                  }} />
                )}

                {/* Scoreboard mini preview */}
                <div style={{
                  position: 'absolute', inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  padding: '5px 7px',
                  gap: 3,
                }}>
                  {/* Team A */}
                  <div style={{
                    flex: 1,
                    height: '68%',
                    background: teamColor,
                    borderRadius: Math.min(tpl.style.cornerRadius * 0.3, 4),
                    transform: skew,
                    opacity: 0.9,
                  }} />

                  {/* Score A */}
                  <div style={{
                    width: 12,
                    height: '68%',
                    background: tpl.colors.scoreABg.color,
                    borderRadius: 2,
                  }} />

                  {/* Center logo plate */}
                  {tpl.logoPosition === 'center' && (
                    <div style={{
                      width: 22,
                      height: '88%',
                      background: tpl.colors.logoPlateBg.color,
                      borderRadius: 3,
                      border: `1px solid ${highlightColor}40`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <div style={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        background: `${highlightColor}25`,
                        border: `1px solid ${highlightColor}50`,
                      }} />
                    </div>
                  )}

                  {/* Score B */}
                  <div style={{
                    width: 12,
                    height: '68%',
                    background: tpl.colors.scoreBBg.color,
                    borderRadius: 2,
                  }} />

                  {/* Team B */}
                  <div style={{
                    flex: 1,
                    height: '68%',
                    background: teamColorB,
                    borderRadius: Math.min(tpl.style.cornerRadius * 0.3, 4),
                    transform: skew,
                    opacity: 0.9,
                  }} />
                </div>

                {/* 3D highlight strip */}
                {tpl.styleMode === '3d' && (
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                    background: `linear-gradient(to right, transparent, ${highlightColor}60, transparent)`,
                  }} />
                )}

                {/* NEW badge */}
                {isNew && (
                  <div style={{
                    position: 'absolute', top: 4, right: 4,
                    fontSize: 7, fontWeight: 700,
                    color: '#86efac',
                    background: 'rgba(34,197,94,0.2)',
                    border: '1px solid rgba(34,197,94,0.35)',
                    borderRadius: 4,
                    padding: '1px 4px',
                    letterSpacing: '0.05em',
                  }}>
                    NEW
                  </div>
                )}

                {/* Active dot */}
                {isActive && (
                  <div style={{
                    position: 'absolute', top: 4, left: 4,
                    width: 6, height: 6, borderRadius: '50%',
                    background: highlightColor,
                    boxShadow: `0 0 6px ${highlightColor}`,
                  }} />
                )}
              </div>

              {/* Info panel */}
              <div style={{ padding: '7px 8px' }}>
                <div style={{
                  fontSize: 11, fontWeight: 600, lineHeight: 1.2,
                  color: isActive ? highlightColor : 'var(--color-text-secondary)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {tpl.name}
                </div>

                {/* Tags */}
                <div style={{ display: 'flex', gap: 3, marginTop: 5, flexWrap: 'wrap' }}>
                  {tags.map((tag) => (
                    <span
                      key={tag.label}
                      style={{
                        fontSize: 8,
                        padding: '1px 5px',
                        borderRadius: 6,
                        background: tag.bg,
                        color: tag.color,
                        border: `1px solid ${tag.color}30`,
                        fontWeight: 600,
                        letterSpacing: '0.04em',
                      }}
                    >
                      {tag.label}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TemplateGallery;
