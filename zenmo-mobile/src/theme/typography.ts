// 📝 ZENMO - Système Typographique
// Police unique : PottaOne-Regular

export const typography = {
  // Polices
  fonts: {
    primary: 'PottaOne-Regular',
  },

  // Tailles
  sizes: {
    h1: 32,        // Titres principaux
    h2: 24,        // Sous-titres
    h3: 18,        // Titres de section
    body: 16,      // Texte principal
    bodySmall: 14, // Texte secondaire
    caption: 12,   // Légendes
    tiny: 10,      // Badges, timestamps
  },

  // Poids
  weights: {
    light: '300' as const,
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },

  // Hauteurs de ligne
  lineHeights: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },

  // Espacement des lettres
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 1,
    wider: 2,
  },
} as const;

// Styles de texte prédéfinis
export const textStyles = {
  // Titres
  h1: {
    fontSize: typography.sizes.h1,
    fontWeight: typography.weights.bold,
    lineHeight: typography.lineHeights.tight,
  },
  h2: {
    fontSize: typography.sizes.h2,
    fontWeight: typography.weights.semibold,
    lineHeight: typography.lineHeights.tight,
  },
  h3: {
    fontSize: typography.sizes.h3,
    fontWeight: typography.weights.medium,
    lineHeight: typography.lineHeights.normal,
  },

  // Corps de texte
  body: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.regular,
    lineHeight: typography.lineHeights.normal,
  },
  bodySmall: {
    fontSize: typography.sizes.bodySmall,
    fontWeight: typography.weights.regular,
    lineHeight: typography.lineHeights.normal,
  },

  // Spéciaux
  caption: {
    fontSize: typography.sizes.caption,
    fontWeight: typography.weights.regular,
    lineHeight: typography.lineHeights.normal,
  },
  button: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.semibold,
    letterSpacing: typography.letterSpacing.wide,
  },
} as const;