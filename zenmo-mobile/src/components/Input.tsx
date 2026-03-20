import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import { spacing, borderRadius, shadows } from '../theme/spacing';
import { typography } from '../theme/typography';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    iconLeft?: keyof typeof Ionicons.glyphMap;
    iconRight?: keyof typeof Ionicons.glyphMap;
    onRightIconPress?: () => void;
    variant?: 'default' | 'premium';
}

const Input: React.FC<InputProps> = ({
    label,
    error,
    iconLeft,
    iconRight,
    onRightIconPress,
    style,
    variant = 'default',
    ...props
}) => {
    const [isFocused, setIsFocused] = useState(false);

    const handleFocus = () => {
        setIsFocused(true);
    };

    const handleBlur = () => {
        setIsFocused(false);
    };

    return (
        <View style={[styles.container, style]}>
            {label && (
                <Text style={[
                    styles.label,
                    isFocused && styles.labelFocused,
                ]}>
                    {label}
                </Text>
            )}

            <View
                style={[
                    styles.inputContainer,
                    isFocused && styles.inputContainerFocused,
                    !!error && styles.inputContainerError,
                ]}
            >
                {iconLeft && (
                    <Ionicons
                        name={iconLeft}
                        size={22}
                        color={isFocused ? colors.secondary.goldSoft : "rgba(255, 255, 255, 0.7)"}
                        style={styles.iconLeft}
                    />
                )}

                <TextInput
                    style={styles.input}
                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    {...props}
                />

                {iconRight && (
                    <TouchableOpacity 
                        onPress={onRightIconPress} 
                        disabled={!onRightIconPress}
                        style={styles.iconRightContainer}
                    >
                        <Ionicons
                            name={iconRight}
                            size={22}
                            color={isFocused ? colors.secondary.goldSoft : "rgba(255, 255, 255, 0.7)"}
                            style={styles.iconRight}
                        />
                    </TouchableOpacity>
                )}
            </View>

            {error && (
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={16} color={colors.semantic.error} />
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.lg,
        width: '100%',
    },
    label: {
        color: colors.secondary.creamWhite,
        fontFamily: typography.fonts.primary,
        fontSize: typography.sizes.bodySmall,
        marginBottom: spacing.sm,
        marginLeft: spacing.xs,
        letterSpacing: 0.5,
    },
    labelFocused: {
        color: colors.secondary.goldSoft,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.glass.white10,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        borderColor: colors.glass.white20,
        paddingHorizontal: spacing.lg,
        height: 50,
    },
    inputContainerFocused: {
        borderColor: colors.secondary.goldSoft,
        borderWidth: 2,
        backgroundColor: colors.glass.white10,
    },
    inputContainerError: {
        borderColor: colors.semantic.error,
        borderWidth: 2,
        backgroundColor: 'rgba(255, 107, 107, 0.1)',
    },
    input: {
        flex: 1,
        color: colors.secondary.creamWhite,
        fontFamily: typography.fonts.primary,
        fontSize: typography.sizes.body,
        height: '100%',
        paddingVertical: 0, // Remove default padding
    },

    iconLeft: {
        marginRight: spacing.md,
    },
    iconRightContainer: {
        padding: spacing.xs,
        borderRadius: borderRadius.sm,
    },
    iconRight: {
        marginLeft: spacing.xs,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: spacing.sm,
        marginLeft: spacing.xs,
    },
    errorText: {
        color: colors.semantic.error,
        fontSize: typography.sizes.caption,
        marginLeft: spacing.xs,
        fontFamily: typography.fonts.primary,
        flex: 1,
    },
});

export default Input;
