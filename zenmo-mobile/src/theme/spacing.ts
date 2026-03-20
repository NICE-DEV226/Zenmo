// 📐 ZENMO - Système d'Espacement

export const spacing = {
  // Espacements de base
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

// Rayons de bordure (glassmorphism)
export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 20,
  xl: 28,
  xxl: 32,
  full: 9999,
} as const;

// Dimensions communes
export const dimensions = {
  // Boutons (minimum 44x44 pour accessibilité)
  button: {
    minHeight: 44,
    minWidth: 44,
  },
  
  // Avatars
  avatar: {
    small: 32,
    medium: 48,
    large: 64,
    xlarge: 80,
  },
  
  // Cards
  card: {
    minHeight: 120,
    maxWidth: 400,
  },
  
  // Input fields
  input: {
    height: 48,
  },
  
  // Navigation
  tabBar: {
    height: 60,
  },
  header: {
    height: 56,
  },
} as const;

// Ombres (glassmorphism premium)
export const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  premium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
} as const;