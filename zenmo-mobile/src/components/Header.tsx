import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { spacing, borderRadius } from '../theme/spacing';
import { typography } from '../theme/typography';

interface HeaderProps {
    title?: string;
    onBackPress?: () => void;
    showBackButton?: boolean;
    transparent?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
    title,
    onBackPress,
    showBackButton = true,
    transparent = false,
}) => {
    if (transparent) {
        return (
            <View style={styles.transparentContainer}>
                <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
                {showBackButton && onBackPress && (
                    <TouchableOpacity style={styles.transparentBackButton} onPress={onBackPress}>
                        <Ionicons name="chevron-back" size={28} color={colors.secondary.creamWhite} />
                    </TouchableOpacity>
                )}
            </View>
        );
    }

    return (
        <>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            <BlurView intensity={20} style={styles.container}>
                <View style={styles.content}>
                    {showBackButton && onBackPress && (
                        <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
                            <Ionicons name="chevron-back" size={24} color={colors.secondary.creamWhite} />
                        </TouchableOpacity>
                    )}
                    
                    {title && (
                        <Text style={styles.title}>{title}</Text>
                    )}
                    
                    {/* Spacer pour centrer le titre si pas de bouton à droite */}
                    {showBackButton && <View style={styles.spacer} />}
                </View>
            </BlurView>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        backgroundColor: 'rgba(13, 12, 29, 0.3)',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + spacing.md : 50,
        paddingBottom: spacing.md,
        paddingHorizontal: spacing.lg,
        minHeight: 80,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    title: {
        flex: 1,
        textAlign: 'center',
        fontFamily: typography.fonts.primary,
        fontSize: typography.sizes.h3,
        color: colors.secondary.creamWhite,
        fontWeight: typography.weights.semibold,
        marginHorizontal: spacing.md,
    },
    spacer: {
        width: 40,
    },
    
    // Transparent header (pour les écrans qui veulent juste le bouton back)
    transparentContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + spacing.md : 50,
        paddingHorizontal: spacing.lg,
    },
    transparentBackButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.glass.white10,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.glass.white20,
    },
});

export default Header;