import React, { useRef, useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, NativeSyntheticEvent, TextInputKeyPressEventData, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import { spacing, borderRadius, shadows } from '../theme/spacing';
import { typography } from '../theme/typography';

interface OTPInputProps {
    length?: number;
    onComplete: (code: string) => void;
    onChange?: (code: string) => void;
    variant?: 'default' | 'premium';
}

const OTPInput: React.FC<OTPInputProps> = ({ length = 6, onComplete, onChange, variant = 'default' }) => {
    const [code, setCode] = useState<string[]>(Array(length).fill(''));
    const [focusedIndex, setFocusedIndex] = useState<number>(-1);
    const inputs = useRef<Array<TextInput | null>>([]);
    const scaleAnims = useRef<Array<Animated.Value>>(
        Array(length).fill(0).map(() => new Animated.Value(1))
    ).current;

    useEffect(() => {
        const fullCode = code.join('');
        if (fullCode.length === length) {
            // Animation de succès
            Animated.stagger(50, 
                scaleAnims.map(anim => 
                    Animated.sequence([
                        Animated.timing(anim, { toValue: 1.1, duration: 100, useNativeDriver: true }),
                        Animated.timing(anim, { toValue: 1, duration: 100, useNativeDriver: true }),
                    ])
                )
            ).start(() => {
                onComplete(fullCode);
            });
        }
    }, [code, length, onComplete]);

    const handleChangeText = (text: string, index: number) => {
        const newCode = [...code];

        // Animation d'entrée
        Animated.spring(scaleAnims[index], {
            toValue: 1.05,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
        }).start(() => {
            Animated.spring(scaleAnims[index], {
                toValue: 1,
                useNativeDriver: true,
                tension: 100,
                friction: 8,
            }).start();
        });

        // Handle paste
        if (text.length > 1) {
            const pastedCode = text.slice(0, length).split('');
            for (let i = 0; i < length; i++) {
                newCode[i] = pastedCode[i] || '';
            }
            setCode(newCode);
            inputs.current[length - 1]?.focus();
            return;
        }

        newCode[index] = text;
        setCode(newCode);

        // Call onChange callback
        if (onChange) {
            onChange(newCode.join(''));
        }

        // Auto focus next
        if (text.length === 1 && index < length - 1) {
            inputs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => {
        if (e.nativeEvent.key === 'Backspace') {
            if (code[index] === '' && index > 0) {
                inputs.current[index - 1]?.focus();
                const newCode = [...code];
                newCode[index - 1] = '';
                setCode(newCode);
            }
        }
    };

    const handleFocus = (index: number) => {
        setFocusedIndex(index);
        Animated.spring(scaleAnims[index], {
            toValue: 1.05,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
        }).start();
    };

    const handleBlur = (index: number) => {
        setFocusedIndex(-1);
        Animated.spring(scaleAnims[index], {
            toValue: 1,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
        }).start();
    };

    const renderInput = (index: number) => {
        const isFilled = !!code[index];
        const isFocused = focusedIndex === index;

        if (variant === 'premium') {
            return (
                <Animated.View 
                    key={index}
                    style={[
                        styles.inputWrapper,
                        { transform: [{ scale: scaleAnims[index] }] }
                    ]}
                >
                    <LinearGradient
                        colors={isFilled || isFocused ? 
                            [colors.secondary.goldSoft + '40', colors.primary.violetRoyal + '40'] : 
                            ['rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.05)']
                        }
                        style={[
                            styles.inputGradient,
                            isFilled && styles.inputGradientFilled,
                            isFocused && styles.inputGradientFocused,
                        ]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <TextInput
                            ref={(ref) => { inputs.current[index] = ref; }}
                            style={[styles.input, styles.inputPremium]}
                            value={code[index]}
                            onChangeText={(text) => handleChangeText(text, index)}
                            onKeyPress={(e) => handleKeyPress(e, index)}
                            onFocus={() => handleFocus(index)}
                            onBlur={() => handleBlur(index)}
                            keyboardType="number-pad"
                            maxLength={length}
                            selectTextOnFocus
                            textAlign="center"
                        />
                    </LinearGradient>
                </Animated.View>
            );
        }

        return (
            <Animated.View 
                key={index}
                style={[
                    styles.inputWrapper,
                    { transform: [{ scale: scaleAnims[index] }] }
                ]}
            >
                <TextInput
                    ref={(ref) => { inputs.current[index] = ref; }}
                    style={[
                        styles.input,
                        isFilled && styles.inputFilled,
                        isFocused && styles.inputFocused,
                    ]}
                    value={code[index]}
                    onChangeText={(text) => handleChangeText(text, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    onFocus={() => handleFocus(index)}
                    onBlur={() => handleBlur(index)}
                    keyboardType="number-pad"
                    maxLength={length}
                    selectTextOnFocus
                    textAlign="center"
                />
            </Animated.View>
        );
    };

    return (
        <View style={styles.container}>
            {Array(length).fill(0).map((_, index) => renderInput(index))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: 300, // 6 inputs * 40px + 5 gaps * 12px = 240 + 60 = 300
        alignSelf: 'center',
        gap: spacing.sm,
    },
    inputWrapper: {
        width: 40,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
    },
    input: {
        width: '100%',
        height: '100%',
        borderRadius: borderRadius.lg,
        backgroundColor: colors.glass.white10,
        borderWidth: 2,
        borderColor: colors.glass.white20,
        color: colors.secondary.creamWhite,
        fontSize: 20,
        fontFamily: typography.fonts.primary,
        fontWeight: typography.weights.bold,
        ...shadows.medium,
    },
    inputPremium: {
        backgroundColor: 'transparent',
        borderWidth: 0,
        fontSize: 32,
    },
    inputGradient: {
        width: '100%',
        height: '100%',
        borderRadius: borderRadius.lg,
        justifyContent: 'center',
        alignItems: 'center',
        ...shadows.large,
    },
    inputGradientFilled: {
        ...shadows.premium,
        shadowColor: colors.secondary.goldSoft,
    },
    inputGradientFocused: {
        ...shadows.premium,
        shadowColor: colors.primary.violetRoyal,
    },
    inputFilled: {
        borderColor: colors.secondary.goldSoft,
        backgroundColor: colors.secondary.goldSoft + '20',
        ...shadows.premium,
        shadowColor: colors.secondary.goldSoft,
    },
    inputFocused: {
        borderColor: colors.primary.violetRoyal,
        backgroundColor: colors.primary.violetRoyal + '20',
        ...shadows.premium,
        shadowColor: colors.primary.violetRoyal,
    },
});

export default OTPInput;
