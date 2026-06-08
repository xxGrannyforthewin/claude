export const COLORS = {
  // Backgrounds
  bg: '#F5F5F7',
  bgCard: '#FFFFFF',
  bgCardSoft: '#FAFAFA',

  // Primary purple
  purple: '#7C5CFC',
  purpleLight: '#EEE9FF',
  purpleMid: '#A991FD',
  purpleDark: '#5B3FD4',

  // Accent palette
  roseGold: '#E8A598',
  roseGoldLight: '#FDF0EE',
  lavender: '#C4B5FD',
  lavenderLight: '#F3F0FF',
  pink: '#F9A8D4',
  pinkLight: '#FDF2F8',

  // Metric colors
  orange: '#FB923C',
  orangeLight: '#FFF7ED',
  blue: '#60A5FA',
  blueLight: '#EFF6FF',
  green: '#34D399',
  greenLight: '#ECFDF5',
  coral: '#F87171',
  coralLight: '#FEF2F2',
  gold: '#FBBF24',
  goldLight: '#FFFBEB',

  // Text
  textPrimary: '#0D0D0D',
  textSecondary: '#8E8E93',
  textTertiary: '#C7C7CC',
  textWhite: '#FFFFFF',

  // Borders
  border: '#F0F0F0',
  borderMid: '#E5E5EA',

  // Gradients
  gradientPurple: ['#7C5CFC', '#A991FD'] as string[],
  gradientRose: ['#E8A598', '#F9A8D4'] as string[],
  gradientBlue: ['#60A5FA', '#93C5FD'] as string[],
  gradientOrange: ['#FB923C', '#FCD34D'] as string[],
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const RADIUS = {
  sm: 10,
  md: 16,
  lg: 22,
  xl: 30,
  pill: 999,
};

export const SHADOW = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.055,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: '#7C5CFC',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 5,
  },
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
};
