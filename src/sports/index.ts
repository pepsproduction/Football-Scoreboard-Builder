// Sport profiles: the first choice controls the visual language of the scoreboard.
import type {
  Dimensions,
  EditorColors,
  EditorModules,
  LayoutType,
  LogoPosition,
  ScorePosition,
  SportType,
  StyleMode,
  StyleParams,
  ColorConfig,
} from '../types/editor';
import type { TemplateId } from '../types/editor';

const solid = (color: string, alpha = 1): ColorConfig => ({
  type: 'solid',
  color,
  alpha,
});

const linear = (color: string, stopA: string, stopB: string, alpha = 1): ColorConfig => ({
  type: 'linear',
  color,
  alpha,
  stops: [
    { offset: 0, color: stopA },
    { offset: 1, color: stopB },
  ],
});

const footballColors: EditorColors = {
  teamABg: linear('#123d2b', '#1b6549', '#09261b'),
  teamBBg: linear('#18385c', '#2a5d8f', '#0c203b'),
  scoreABg: linear('#0d1b31', '#183b57', '#07101f'),
  scoreBBg: linear('#0d1b31', '#183b57', '#07101f'),
  framePrimary: linear('#102c27', '#1b5442', '#061713'),
  frameInner: solid('#071713'),
  highlight: solid('#b9f227'),
  glow: solid('#7bdc2c', 0.72),
  shadow: solid('#000000', 0.86),
  timeSlot: linear('#123627', '#1c6145', '#071b12'),
  halfSlot: linear('#123627', '#154632', '#071b12'),
  yellowCard: solid('#ffcd00'),
  redCard: solid('#e8000d'),
  logoPlateBg: solid('#081b17', 0.96),
};

const basketballColors: EditorColors = {
  teamABg: linear('#2a153d', '#5c2f76', '#160d25'),
  teamBBg: linear('#172c58', '#285da0', '#0a1531'),
  scoreABg: linear('#29182f', '#8a3f1d', '#140b1c'),
  scoreBBg: linear('#29182f', '#8a3f1d', '#140b1c'),
  framePrimary: linear('#24142f', '#6d2c4f', '#100a1b'),
  frameInner: solid('#100a1b'),
  highlight: solid('#ff9b2f'),
  glow: solid('#ff6b1a', 0.76),
  shadow: solid('#000000', 0.88),
  timeSlot: linear('#2f1739', '#9b3c27', '#180d25'),
  halfSlot: linear('#2f1739', '#71233c', '#180d25'),
  yellowCard: solid('#ffd166'),
  redCard: solid('#ef476f'),
  logoPlateBg: solid('#120d21', 0.97),
};

const footballStyle: StyleParams = {
  borderThickness: 3,
  cornerRadius: 8,
  bevelDepth: 9,
  shadowStrength: 0.72,
  glowStrength: 0.4,
  highlightStrength: 1,
  frameDepth: 4,
  skewX: 0.02,
  techBorders: false,
  patternStyle: 'stripes',
  moduleShape: 'rect',
};

const basketballStyle: StyleParams = {
  borderThickness: 4,
  cornerRadius: 14,
  bevelDepth: 7,
  shadowStrength: 0.78,
  glowStrength: 0.56,
  highlightStrength: 1,
  frameDepth: 6,
  skewX: 0.08,
  techBorders: true,
  patternStyle: 'dots',
  moduleShape: 'pill',
};

export interface SportProfile {
  id: SportType;
  name: string;
  nameEn: string;
  description: string;
  accent: string;
  defaultTemplate: TemplateId;
  styleMode: StyleMode;
  layoutType: LayoutType;
  scorePosition: ScorePosition;
  logoPosition: LogoPosition;
  colors: EditorColors;
  colorsLinked: boolean;
  style: StyleParams;
  dimensions: Dimensions;
  modulesEnabled: Record<keyof EditorModules, boolean>;
}

export const SPORT_PROFILES: Record<SportType, SportProfile> = {
  football: {
    id: 'football',
    name: 'ฟุตบอล',
    nameEn: 'Football',
    description: 'โทนสนามแข่ง เขียว/น้ำเงิน พร้อมใบเหลือง ใบแดง และช่วงครึ่งเวลา',
    accent: '#b9f227',
    defaultTemplate: 'arenaLive',
    styleMode: '3d',
    layoutType: 'left-right',
    scorePosition: 'inner',
    logoPosition: 'center',
    colors: footballColors,
    colorsLinked: false,
    style: footballStyle,
    dimensions: { width: 1200, height: 100, spacing: 6 },
    modulesEnabled: {
      time: true,
      half: true,
      yellowCardA: true,
      yellowCardB: true,
      redCardA: false,
      redCardB: false,
      foulA: false,
      foulB: false,
    },
  },
  basketball: {
    id: 'basketball',
    name: 'บาสเกตบอล',
    nameEn: 'Basketball',
    description: 'โทนสนามในร่ม ส้ม/ม่วง พร้อม Quarter และตัวนับฟาวล์ของแต่ละทีม',
    accent: '#ff9b2f',
    defaultTemplate: 'velocityCore',
    styleMode: '3d',
    layoutType: 'left-right',
    scorePosition: 'inner',
    logoPosition: 'center',
    colors: basketballColors,
    colorsLinked: false,
    style: basketballStyle,
    dimensions: { width: 1180, height: 112, spacing: 8 },
    modulesEnabled: {
      time: true,
      half: true,
      yellowCardA: false,
      yellowCardB: false,
      redCardA: false,
      redCardB: false,
      foulA: true,
      foulB: true,
    },
  },
};

export function getSportProfile(sport: SportType): SportProfile {
  return SPORT_PROFILES[sport];
}
