// 🎨 ZENMO - Design System Export

export { colors, getVibeColor } from './colors';
export { typography, textStyles } from './typography';
export { spacing, borderRadius, dimensions, shadows } from './spacing';

// Theme complet ZENMO
export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  dimensions,
  shadows,
} as const;

export type Theme = typeof theme;