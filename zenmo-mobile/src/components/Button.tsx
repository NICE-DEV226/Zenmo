import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius, dimensions, shadows } from '../theme/spacing';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'premium';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  iconLeft?: keyof typeof Ionicons.glyphMap;
  iconRight?: keyof typeof Ionicons.glyphMap;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  iconLeft,
  iconRight,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.96,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
      Animated.timing(glowAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
      Animated.timing(glowAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const buttonStyle = [
    styles.base,
    styles[size],
    disabled && styles.disabled,
    style,
  ];

  const textStyleCombined = [
    styles.text,
    styles[`${size}Text`],
    styles[`${variant}Text`],
    disabled && styles.disabledText,
    textStyle,
  ];

  const renderContent = () => (
    <>
      {iconLeft && (
        <Ionicons 
          name={iconLeft} 
          size={size === 'small' ? 16 : size === 'large' ? 24 : 20} 
          color={variant === 'ghost' || variant === 'outline' ? colors.primary.violetRoyal : colors.secondary.creamWhite}
          style={styles.iconLeft}
        />
      )}
      {loading ? (
        <ActivityIndicator 
          color={variant === 'ghost' || variant === 'outline' ? colors.primary.violetRoyal : colors.secondary.creamWhite} 
        />
      ) : (
        <Text style={textStyleCombined}>{title}</Text>
      )}
      {iconRight && (
        <Ionicons 
          name={iconRight} 
          size={size === 'small' ? 16 : size === 'large' ? 24 : 20} 
          color={variant === 'ghost' || variant === 'outline' ? colors.primary.violetRoyal : colors.secondary.creamWhite}
          style={styles.iconRight}
        />
      )}
    </>
  );

  if (variant === 'primary' || variant === 'premium') {
    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled || loading}
          style={buttonStyle}
          activeOpacity={1}
        >
          <LinearGradient
            colors={variant === 'premium' ? colors.gradients.premium : colors.gradients.primary}
            style={[
              styles.gradient, 
              styles[size],
              {
                shadowOpacity: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.3, 0.6],
                }),
              }
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {renderContent()}
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={[buttonStyle, styles[variant]]}
        activeOpacity={1}
      >
        {renderContent()}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    minHeight: dimensions.button.minHeight,
  },
  
  // Tailles
  small: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 40,
  },
  medium: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 56,
  },
  large: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    minHeight: 64,
  },
  
  // Variants
  gradient: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    ...shadows.premium,
    shadowColor: colors.primary.violetRoyal,
  },
  secondary: {
    backgroundColor: colors.glass.white10,
    borderWidth: 1,
    borderColor: colors.secondary.goldSoft,
    ...shadows.small,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary.violetRoyal,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  premium: {
    backgroundColor: colors.secondary.goldSoft,
    ...shadows.large,
  },
  
  // États
  disabled: {
    opacity: 0.5,
  },
  
  // Icônes
  iconLeft: {
    marginRight: spacing.sm,
  },
  iconRight: {
    marginLeft: spacing.sm,
  },
  
  // Textes
  text: {
    fontFamily: typography.fonts.primary,
    fontWeight: typography.weights.semibold,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  smallText: {
    fontSize: typography.sizes.bodySmall,
  },
  mediumText: {
    fontSize: typography.sizes.body,
  },
  largeText: {
    fontSize: typography.sizes.h3,
  },
  
  // Couleurs de texte par variant
  primaryText: {
    color: colors.secondary.creamWhite,
  },
  premiumText: {
    color: colors.primary.blueNight,
    fontWeight: typography.weights.bold,
  },
  secondaryText: {
    color: colors.secondary.goldSoft,
  },
  outlineText: {
    color: colors.primary.violetRoyal,
  },
  ghostText: {
    color: colors.primary.violetRoyal,
  },
  disabledText: {
    opacity: 0.7,
  },
});

export default Button;