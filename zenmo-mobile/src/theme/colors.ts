// 🎨 ZENMO - Palette de Couleurs Afro-Premium

export const colors = {
  // Couleurs principales (Premium)
  primary: {
    blueNight: '#0D0C1D',      // Fond principal
    violetRoyal: '#7B61FF',    // Accent principal
    turquoiseEnergy: '#33D1C4', // Accent secondaire
  },
  
  // Couleurs secondaires
  secondary: {
    goldSoft: '#E4C66D',       // Éléments premium
    creamWhite: '#FAF9F6',     // Texte principal
    neutralGray: '#C5C5C5',    // Texte secondaire
    deepBlueBlack: '#050C1A',  // Mode sombre
  },
  
  // Gradients ZENMO
  gradients: {
    primary: ['#7B61FF', '#33D1C4'],           // Violet → Turquoise
    background: ['#0D0C1D', '#7B61FF'],        // Bleu nuit → Violet
    premium: ['#E4C66D', '#7B61FF'],           // Or → Violet
    glass: ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)'],
  },
  
  // Couleurs par Vibe (émotions)
  vibes: {
    calme: '#33D1C4',      // Turquoise
    love: '#FF6B9D',       // Rose
    energy: '#FFD93D',     // Jaune énergique
    creative: '#7B61FF',   // Violet
    funny: '#FF8C42',      // Orange
    ambitious: '#E4C66D',  // Or
    chill: '#A8E6CF',      // Vert pastel
    party: '#FF4757',      // Rouge festif
  },
  
  // Couleurs sémantiques
  semantic: {
    success: '#33D1C4',
    warning: '#E4C66D',
    error: '#FF6B6B',
    info: '#7B61FF',
  },
  
  // Glassmorphism
  glass: {
    white10: 'rgba(255, 255, 255, 0.1)',
    white20: 'rgba(255, 255, 255, 0.2)',
    black10: 'rgba(0, 0, 0, 0.1)',
    black20: 'rgba(0, 0, 0, 0.2)',
  },
} as const;

// Helper pour obtenir la couleur d'une vibe
export const getVibeColor = (vibe: keyof typeof colors.vibes): string => {
  return colors.vibes[vibe] || colors.primary.violetRoyal;
};