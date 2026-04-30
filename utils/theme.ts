// pixlyt Color Theme — pastel pink, light blue, and warm beige
export const colors = {
  // Backgrounds
  bgPrimary: '#fdf6f9',      // warm white-pink
  bgCard: '#ffffff',
  bgSecondary: '#f5e8ef',    // soft pink
  bgBlue: '#eaf2fb',         // light blue
  bgBeige: '#faf4ec',        // warm beige

  // Borders
  borderPink: '#edd8e5',
  borderBlue: '#c8ddf0',
  borderBeige: '#e8d8c0',

  // Text
  textPrimary: '#4a3040',
  textSecondary: '#8b6070',
  textMuted: '#b094a6',

  // Accents
  accentPurple: '#9070b0',
  accentBlue: '#5a90c0',
  accentGreen: '#60a070',
  accentRed: '#c06060',

  // Tags
  tagPurple: { bg: '#ecdaf2', text: '#7050a0', border: '#d4b8e0' },
  tagBlue:   { bg: '#daeaf5', text: '#4070a0', border: '#b8d0e8' },
  tagBeige:  { bg: '#f5ece0', text: '#806040', border: '#e0d0b8' },
  tagGreen:  { bg: '#e0f0e8', text: '#406050', border: '#b8d8c8' },
  tagPink:   { bg: '#f5e0ec', text: '#904060', border: '#e0c0d4' },
};

export const TAG_COLORS = [
  colors.tagPurple,
  colors.tagBlue,
  colors.tagBeige,
  colors.tagGreen,
  colors.tagPink,
];

export const typography = {
  heading: { fontSize: 20, fontWeight: '600' as const, color: colors.textPrimary },
  subheading: { fontSize: 15, fontWeight: '600' as const, color: colors.textSecondary },
  body: { fontSize: 14, fontWeight: '400' as const, color: colors.textPrimary },
  caption: { fontSize: 12, color: colors.textMuted },
  tiny: { fontSize: 10, color: colors.textMuted },
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};
