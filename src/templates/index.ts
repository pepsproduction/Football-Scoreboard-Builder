// src/templates/index.ts
// Central registry for all templates
import type { TemplateConfig } from '../types/templates';
import type { TemplateId } from '../types/editor';
import { minimal2D } from './minimal2D';
import { centerCrest } from './centerCrest';
import { leftLogoClassic } from './leftLogoClassic';
import { premiumMetallic } from './premiumMetallic';
import { competitiveSplit } from './competitiveSplit';
import { compactLive } from './compactLive';
import { championsLeague } from './championsLeague';
import { premierModern } from './premierModern';
import { worldCupClassic } from './worldCupClassic';
import { esportsNeon } from './esportsNeon';
import { mechSymmetry } from './mechSymmetry';
import { techSlantLeft } from './techSlantLeft';
import { speedAsym } from './speedAsym';
import { cyberNeon } from './cyberNeon';
import dynamicHex from './dynamicHex';
import cyberpunkEdge from './cyberpunkEdge';
import retroArcade from './retroArcade';
import holoInterface from './holoInterface';
import stealthBomber from './stealthBomber';
import velocityCore from './velocityCore';
import { goldCup } from './goldCup';
import { neonStrike } from './neonStrike';
import { splitArrow } from './splitArrow';
import { ultraWide } from './ultraWide';
import { glassmorphism } from './glassmorphism';
import { ruggedMetal } from './ruggedMetal';
import { flameSplit } from './flameSplit';
import { arenaLive } from './arenaLive';

export const TEMPLATES: Record<TemplateId, TemplateConfig> = {
  minimal2d: minimal2D,
  centerCrest,
  leftLogoClassic,
  premiumMetallic,
  competitiveSplit,
  compactLive,
  championsLeague,
  premierModern,
  worldCupClassic,
  esportsNeon,
  mechSymmetry,
  techSlantLeft,
  speedAsym,
  cyberNeon,
  dynamicHex,
  cyberpunkEdge,
  retroArcade,
  holoInterface,
  stealthBomber,
  velocityCore,
  goldCup,
  neonStrike,
  splitArrow,
  ultraWide,
  glassmorphism,
  ruggedMetal,
  flameSplit,
  arenaLive,
};

export const TEMPLATE_LIST: TemplateConfig[] = Object.values(TEMPLATES);
