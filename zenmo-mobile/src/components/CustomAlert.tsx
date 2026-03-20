import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius, shadows } from '../theme/spacing';

const { width } = Dimensions.get('window');

interface AlertButton {
    text: string;
    onPress?: () => void;
    style?: 'default' | 'cancel' | 'destructive';
}

interface CustomAlertProps {
    visible: boolean;
    title: string;
    message?: string;
    buttons: AlertButton[];
    onDismiss?: () => void;
    icon?: keyof typeof Ionicons.glyphMap;
    iconColor?: string;
}

export const CustomAlert: React.FC<CustomAlertProps> = ({
    visible,
    title,
    message,
    buttons,
    onDismiss,
    icon,
    iconColor = colors.secondary.goldSoft
}) => {
    const [fadeAnim] = useState(new Animated.Value(0));
    const [scaleAnim] = useState(new Animated.Value(0.8));

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    tension: 100,
                    friction: 8,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 150,
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 0.8,
                    duration: 150,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible]);

    const handleButtonPress = (button: AlertButton) => {
        if (button.onPress) {
            button.onPress();
        }
        if (onDismiss) {
            onDismiss();
        }
    };

    const getButtonStyle = (buttonStyle?: string) => {
        switch (buttonStyle) {
            case 'cancel':
                return styles.cancelButton;
            case 'destructive':
                return styles.destructiveButton;
            default:
                return styles.defaultButton;
        }
    };

    const getButtonTextStyle = (buttonStyle?: string) => {
        switch (buttonStyle) {
            case 'cancel':
                return styles.cancelButtonText;
            case 'destructive':
                return styles.destructiveButtonText;
            default:
                return styles.defaultButtonText;
        }
    };

    return (
        <Modal
            transparent
            visible={visible}
            animationType="none"
            onRequestClose={onDismiss}
        >
            <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
                <TouchableOpacity 
                    style={styles.overlayTouch} 
                    activeOpacity={1} 
                    onPress={onDismiss}
                />
                
                <Animated.View 
                    style={[
                        styles.alertContainer,
                        { 
                            transform: [{ scale: scaleAnim }],
                            opacity: fadeAnim 
                        }
                    ]}
                >
                    <LinearGradient
                        colors={[colors.glass.white10, colors.glass.white10]}
                        style={styles.alertGradient}
                    >
                        {/* Icône */}
                        {icon && (
                            <View style={styles.iconContainer}>
                                <Ionicons name={icon} size={32} color={iconColor} />
                            </View>
                        )}

                        {/* Titre */}
                        <Text style={styles.title}>{title}</Text>

                        {/* Message */}
                        {message && (
                            <Text style={styles.message}>{message}</Text>
                        )}

                        {/* Boutons */}
                        <View style={styles.buttonsContainer}>
                            {buttons.map((button, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.button,
                                        getButtonStyle(button.style),
                                        buttons.length === 1 && styles.singleButton
                                    ]}
                                    onPress={() => handleButtonPress(button)}
                                    activeOpacity={0.8}
                                >
                                    <Text style={getButtonTextStyle(button.style)}>
                                        {button.text}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </LinearGradient>
                </Animated.View>
            </Animated.View>
        </Modal>
    );
};

// Hook pour utiliser l'alerte facilement
export const useCustomAlert = () => {
    const [alertConfig, setAlertConfig] = useState<{
        visible: boolean;
        title: string;
        message?: string;
        buttons: AlertButton[];
        icon?: keyof typeof Ionicons.glyphMap;
        iconColor?: string;
    }>({
        visible: false,
        title: '',
        buttons: []
    });

    const showAlert = (
        title: string,
        message?: string,
        buttons: AlertButton[] = [{ text: 'OK' }],
        icon?: keyof typeof Ionicons.glyphMap,
        iconColor?: string
    ) => {
        setAlertConfig({
            visible: true,
            title,
            message,
            buttons,
            icon,
            iconColor
        });
    };

    const hideAlert = () => {
        setAlertConfig(prev => ({ ...prev, visible: false }));
    };

    const AlertComponent = () => (
        <CustomAlert
            {...alertConfig}
            onDismiss={hideAlert}
        />
    );

    return { showAlert, AlertComponent };
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    overlayTouch: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    alertContainer: {
        width: width * 0.9,
        maxWidth: 350,
        borderRadius: borderRadius.lg,
        overflow: 'hidden',
        ...shadows.large,
    },
    alertGradient: {
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing.lg,
        borderWidth: 1,
        borderColor: colors.glass.white20,
        alignItems: 'center',
        width: '100%',
    },
    iconContainer: {
        marginBottom: spacing.md,
        padding: spacing.sm,
        borderRadius: borderRadius.full,
        backgroundColor: colors.glass.white10,
    },
    title: {
        fontFamily: typography.fonts.primary,
        fontSize: typography.sizes.h3,
        color: colors.secondary.creamWhite,
        fontWeight: typography.weights.bold,
        textAlign: 'center',
        marginBottom: spacing.xs,
        paddingHorizontal: spacing.md,
        width: '100%',
    },
    message: {
        fontFamily: typography.fonts.primary,
        fontSize: typography.sizes.bodySmall,
        color: colors.secondary.creamWhite,
        textAlign: 'center',
        lineHeight: 18,
        opacity: 0.9,
        marginBottom: spacing.md,
        paddingHorizontal: spacing.md,
        width: '100%',
    },
    buttonsContainer: {
        flexDirection: 'row',
        gap: spacing.sm,
        width: '100%',
        paddingHorizontal: spacing.sm,
    },
    button: {
        flex: 1,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.xs,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 42,
    },
    singleButton: {
        flex: 0,
        minWidth: 100,
    },
    defaultButton: {
        backgroundColor: colors.secondary.goldSoft,
        borderWidth: 1,
        borderColor: colors.secondary.goldSoft,
    },
    cancelButton: {
        backgroundColor: colors.glass.white10,
        borderWidth: 1,
        borderColor: colors.glass.white20,
    },
    destructiveButton: {
        backgroundColor: colors.semantic.error + '20',
        borderWidth: 1,
        borderColor: colors.semantic.error,
    },
    defaultButtonText: {
        fontFamily: typography.fonts.primary,
        fontSize: typography.sizes.bodySmall,
        color: colors.primary.blueNight,
        fontWeight: typography.weights.semibold,
        textAlign: 'center',
    },
    cancelButtonText: {
        fontFamily: typography.fonts.primary,
        fontSize: typography.sizes.bodySmall,
        color: colors.secondary.creamWhite,
        fontWeight: typography.weights.medium,
        textAlign: 'center',
    },
    destructiveButtonText: {
        fontFamily: typography.fonts.primary,
        fontSize: typography.sizes.bodySmall,
        color: colors.semantic.error,
        fontWeight: typography.weights.semibold,
        textAlign: 'center',
    },
});