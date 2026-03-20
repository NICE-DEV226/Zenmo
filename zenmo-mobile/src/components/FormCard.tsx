import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { colors } from '../theme/colors';
import { spacing, borderRadius, shadows } from '../theme/spacing';

interface FormCardProps {
    children: React.ReactNode;
    style?: ViewStyle;
    variant?: 'default' | 'premium' | 'glass';
}

export const FormCard: React.FC<FormCardProps> = ({ 
    children, 
    style, 
    variant = 'default' 
}) => {
    if (variant === 'glass') {
        return (
            <BlurView intensity={20} style={[styles.container, styles.glassContainer, style]}>
                <View style={styles.africanPattern} />
                <View style={styles.content}>
                    {children}
                </View>
            </BlurView>
        );
    }

    if (variant === 'premium') {
        return (
            <View style={[styles.container, styles.premiumContainer, style]}>
                <View style={styles.content}>
                    {children}
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, styles.defaultContainer, style]}>
            <View style={styles.content}>
                {children}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: borderRadius.xl,
        overflow: 'hidden',
        position: 'relative',
    },
    defaultContainer: {
        backgroundColor: colors.glass.white10,
        borderWidth: 1,
        borderColor: colors.glass.white20,
    },
    premiumContainer: {
        backgroundColor: colors.glass.white10,
        borderWidth: 1,
        borderColor: colors.glass.white20,
    },
    glassContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    content: {
        padding: spacing.xl,
        zIndex: 2,
    },

});

export default FormCard;