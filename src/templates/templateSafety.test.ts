import { describe, expect, it } from 'vitest';
import { TEMPLATE_LIST } from './index';
import { MAX_SAFE_SKEW, safeSkew } from '../lib/visualSafety';

describe('scoreboard template visual guardrails', () => {
  it('keeps every template skew subtle and finite', () => {
    for (const template of TEMPLATE_LIST) {
      expect(Number.isFinite(template.style.skewX), template.id).toBe(true);
      expect(Math.abs(template.style.skewX), template.id).toBeLessThanOrEqual(MAX_SAFE_SKEW);
      expect(Math.abs(safeSkew(template.style.skewX)), template.id).toBeLessThanOrEqual(MAX_SAFE_SKEW * 0.5);
    }
  });

  it('keeps score panels addressable in every layout', () => {
    for (const template of TEMPLATE_LIST) {
      if (template.layoutType === 'left-right') {
        expect(['inner', 'outer'], template.id).toContain(template.scorePosition);
      } else {
        expect(['before', 'after'], template.id).toContain(template.scorePosition);
      }
    }
  });

  it('gives every template enough depth tokens for the dimensional renderer', () => {
    for (const template of TEMPLATE_LIST) {
      const { style } = template;
      const depthSignal = style.bevelDepth + style.frameDepth + style.highlightStrength + style.shadowStrength;
      expect(depthSignal, template.id).toBeGreaterThan(0.5);
      expect(style.borderThickness, template.id).toBeGreaterThanOrEqual(1);
    }
  });
});
