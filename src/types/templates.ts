// src/types/templates.ts
import type { TemplateId, LayoutType, ScorePosition, LogoPosition, StyleMode, EditorColors, StyleParams, Dimensions, SportType } from './editor';

export interface TemplateConfig {
  id: TemplateId;
  name: string;
  nameEn: string;
  description: string;
  styleMode: StyleMode;
  layoutType: LayoutType;
  scorePosition: ScorePosition;
  logoPosition: LogoPosition;
  colors: EditorColors;
  style: StyleParams;
  dimensions: Dimensions;
  sport?: SportType | 'shared';
  modulesEnabled: {
    time: boolean;
    half: boolean;
    yellowCardA: boolean;
    yellowCardB: boolean;
    redCardA: boolean;
    redCardB: boolean;
    foulA?: boolean;
    foulB?: boolean;
  };
}
