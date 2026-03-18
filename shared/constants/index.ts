import { VibeType } from '../types';

// ==================== CONSTANTS ====================
export const VIBE_COLORS: Record<VibeType, string> = {
    calme: '#33D1C4',      // Turquoise
    love: '#FF6B9D',       // Rose
    energy: '#FFD93D',     // Jaune énergique
    creative: '#7B61FF',   // Violet
    funny: '#FF8C42',      // Orange
    ambitious: '#E4C66D',  // Or
    chill: '#A8E6CF',      // Vert pastel
    party: '#FF4757',      // Rouge festif
};

export const CITIES = [
    'Ouagadougou',
    'Bobo-Dioulasso',
    'Koudougou',
    'Banfora',
    'Ouahigouya',
    'Pouytenga',
    'Kaya',
    'Tenkodogo',
    'Fada N\'Gourma',
    'Dori'
] as const;

export type City = typeof CITIES[number];
