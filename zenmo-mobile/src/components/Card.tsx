import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors } from '../theme/colors';
import { spacing, borderRadius, shadows } from '../theme/spacing';

interface CardProps {
  children: React.ReactNode;
  variant?: 'glass' | 'solid' | 'outline';
  blur?: boolean;
  pattern?: boolean;
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'glass',
  blur = true,
  pattern = false,
  style,
}) => {
  if (variant === 'glass' && blur) {
    return (
      <BlurView intensity={20} style={[styles.card, styles.glassCard, style]}>
        {pattern && <View style={styles.pattern} />}
        <View style={styles.content}>
          {children}
        </View>
      </BlurView>
    );
  }

  return (
    <View style={[styles.card, styles[variant], style]}>
      {pattern && <View style={styles.pattern} />}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  
  // Variants
  glassCard: {
    backgroundColor: colors.glass.white10,
    borderWidth: 1,
    borderColor: colors.glass.white20,
    ...shadows.medium,
  },
  solid: {
    backgroundColor: colors.primary.blueNight,
    borderWidth: 1,
    borderColor: colors.primary.violetRoyal + '30',
    ...shadows.large,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary.violetRoyal + '50',
  },
  
  // Contenu
  content: {
    padding: spacing.md,
    zIndex: 2,
  },
  
  // Motif africain (placeholder)
  pattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.05,
    backgroundColor: colors.primary.violetRoyal,
    zIndex: 1,
    // TODO: Ajouter les vrais motifs africains SVG
  },
});

export default Card;