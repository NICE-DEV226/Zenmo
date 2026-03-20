import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { OTPInput, FormCard, Button, Header } from '../components';
import { spacing, borderRadius, shadows } from '../theme/spacing';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { AuthStackParamList } from '../navigation/types';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

type OTPVerifyScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'OTPVerify'>;
type OTPVerifyScreenRouteProp = RouteProp<AuthStackParamList, 'OTPVerify'>;

export const OTPVerifyScreen: React.FC = () => {
    const navigation = useNavigation<OTPVerifyScreenNavigationProp>();
    const route = useRoute<OTPVerifyScreenRouteProp>();
    const { phoneNumber, email } = route.params;

    const [timer, setTimer] = useState(30);
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [error, setError] = useState('');
    const [lastVerifiedCode, setLastVerifiedCode] = useState('');

    useEffect(() => {
        const interval = setInterval(() => {
            setTimer((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleVerify = useCallback(async (code: string) => {
        if (isLoading || code === lastVerifiedCode) return; // Prevent multiple calls and duplicate verification

        console.log('Verifying OTP:', code);
        setLastVerifiedCode(code);
        setIsLoading(true);
        setError('');

        try {
            // Vérifier le code OTP via l'API
            const response = await api.post('/auth/verify-otp', {
                email,
                code
            });

            const { accessToken, refreshToken, user } = response.data;

            // Sauvegarder les tokens
            await AsyncStorage.setItem('accessToken', accessToken);
            if (refreshToken) {
                await AsyncStorage.setItem('refreshToken', refreshToken);
            }
            await AsyncStorage.setItem('user', JSON.stringify(user));

            // Naviguer vers ProfileSetup
            navigation.replace('ProfileSetup');

        } catch (error: any) {
            console.error('Verification error:', error);
            const errorMessage = error.response?.data?.message || 'Code invalide';
            setError(errorMessage);
            // Reset lastVerifiedCode on error so user can retry the same code
            setLastVerifiedCode('');
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, email, navigation, lastVerifiedCode]);

    const handleResend = async () => {
        if (isResending) return;

        setIsResending(true);
        try {
            await api.post('/auth/send-otp', {
                email,
                phoneNumber
            });
            setTimer(30);
            Alert.alert('Succès', 'Un nouveau code a été envoyé par email');
        } catch (error) {
            console.error('Resend error:', error);
            Alert.alert('Erreur', 'Impossible de renvoyer le code');
        } finally {
            setIsResending(false);
        }
    };

    return (
        <LinearGradient colors={colors.gradients.background} style={styles.container}>
            <Header 
                title="Vérification"
                onBackPress={() => navigation.goBack()}
            />
            
            <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                <View style={styles.header}>
                    <Text style={styles.logo}>ZENMO</Text>
                    <View style={styles.iconContainer}>
                        <Ionicons name="shield-checkmark" size={64} color={colors.secondary.goldSoft} />
                    </View>
                </View>

                <FormCard style={styles.formCard}>
                    <Text style={styles.title}>Vérification</Text>
                    <Text style={styles.subtitle}>
                        Entre le code envoyé à{'\n'}
                        <Text style={styles.emailText}>{email}</Text>
                    </Text>

                    <View style={styles.otpContainer}>
                        <OTPInput
                            length={6}
                            onComplete={handleVerify}
                            onChange={() => setError('')}
                        />
                        {isLoading && (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="small" color={colors.secondary.goldSoft} />
                                <Text style={styles.loadingText}>Vérification...</Text>
                            </View>
                        )}
                        {error ? (
                            <View style={styles.errorContainer}>
                                <Ionicons name="alert-circle" size={20} color={colors.semantic.error} />
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        ) : null}
                    </View>

                </FormCard>

                <View style={styles.resendSection}>
                    <Text style={styles.resendText}>Tu n'as rien reçu ?</Text>
                    {timer > 0 ? (
                        <View style={styles.timerContainer}>
                            <Ionicons name="time-outline" size={16} color={colors.secondary.goldSoft} />
                            <Text style={styles.timerText}>Renvoyer dans {timer}s</Text>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={styles.resendButton}
                            onPress={handleResend}
                            disabled={isResending}
                            activeOpacity={0.8}
                        >
                            {isResending ? (
                                <ActivityIndicator size="small" color={colors.primary.blueNight} />
                            ) : (
                                <>
                                    <Ionicons name="refresh-outline" size={20} color={colors.primary.blueNight} />
                                    <Text style={styles.resendButtonText}>Renvoyer le code</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    )}
                </View>
            </ScrollView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: spacing.lg,
        paddingTop: 100, // Espace pour le header fixe
    },
    header: {
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    logo: {
        fontFamily: typography.fonts.primary,
        fontSize: 36,
        color: colors.secondary.creamWhite,
        textAlign: 'center',
        letterSpacing: 4,
        marginBottom: spacing.lg,
        textShadowColor: colors.primary.violetRoyal,
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 8,
    },
    iconContainer: {
        backgroundColor: colors.glass.white10,
        padding: spacing.lg,
        borderRadius: borderRadius.full,
        ...shadows.medium,
    },
    formCard: {
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    title: {
        fontFamily: typography.fonts.primary,
        fontSize: typography.sizes.h1,
        color: colors.secondary.creamWhite,
        marginBottom: spacing.md,
        textAlign: 'center',
        letterSpacing: 1,
    },
    subtitle: {
        fontFamily: typography.fonts.primary,
        fontSize: typography.sizes.body,
        color: colors.secondary.creamWhite,
        textAlign: 'center',
        marginBottom: spacing.xl,
        lineHeight: 24,
        opacity: 0.9,
    },
    emailText: {
        color: colors.secondary.goldSoft,
        fontWeight: typography.weights.semibold,
    },
    otpContainer: {
        width: '100%',
        marginBottom: spacing.lg,
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: spacing.lg,
        backgroundColor: colors.glass.white10,
        padding: spacing.md,
        borderRadius: borderRadius.md,
    },
    loadingText: {
        color: colors.secondary.goldSoft,
        fontSize: typography.sizes.bodySmall,
        fontFamily: typography.fonts.primary,
        marginLeft: spacing.sm,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.semantic.error + '20',
        padding: spacing.md,
        borderRadius: borderRadius.md,
        marginTop: spacing.lg,
    },
    errorText: {
        color: colors.semantic.error,
        fontSize: typography.sizes.bodySmall,
        fontFamily: typography.fonts.primary,
        marginLeft: spacing.sm,
        textAlign: 'center',
    },
    resendSection: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.lg,
    },
    resendText: {
        fontFamily: typography.fonts.primary,
        fontSize: typography.sizes.body,
        color: colors.secondary.creamWhite,
        textAlign: 'center',
        marginBottom: spacing.md,
        opacity: 0.8,
    },
    timerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.glass.white10,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderRadius: borderRadius.lg,
    },
    timerText: {
        fontFamily: typography.fonts.primary,
        fontSize: typography.sizes.bodySmall,
        color: colors.secondary.goldSoft,
        marginLeft: spacing.xs,
    },
    resendButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderRadius: borderRadius.lg,
        backgroundColor: colors.secondary.goldSoft,
        borderWidth: 2,
        borderColor: colors.secondary.goldSoft,
    },
    resendButtonText: {
        fontFamily: typography.fonts.primary,
        fontSize: typography.sizes.body,
        color: colors.primary.blueNight,
        marginLeft: spacing.xs,
        fontWeight: typography.weights.bold,
    },
});

export default OTPVerifyScreen;
