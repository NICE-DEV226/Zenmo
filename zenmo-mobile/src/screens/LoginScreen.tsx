import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Keyboard, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { Input, FormCard, Button, PhoneInput, Header, AFRICAN_COUNTRIES, type Country } from '../components';
import { spacing, borderRadius, shadows } from '../theme/spacing';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { AuthStackParamList } from '../navigation/types';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

type LoginScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Login'>;

export const LoginScreen: React.FC = () => {
    const navigation = useNavigation<LoginScreenNavigationProp>();
    const [selectedCountry, setSelectedCountry] = useState<Country>(AFRICAN_COUNTRIES.find(c => c.code === 'BF') || AFRICAN_COUNTRIES[0]);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handlePhoneChange = (text: string) => {
        setPhoneNumber(text);
        setError('');

        const cleanText = text.trim();

        // Check if text starts with '+' or a known dial code sequence
        if (cleanText.startsWith('+')) {
            const detectedCountry = AFRICAN_COUNTRIES.find(country => cleanText.startsWith(country.dialCode));
            if (detectedCountry && detectedCountry.code !== selectedCountry.code) {
                setSelectedCountry(detectedCountry);
                const numberWithoutCode = cleanText.replace(detectedCountry.dialCode, '').trim();
                setPhoneNumber(numberWithoutCode);
            }
        } else if (cleanText.length >= 3) {
            const potentialCode = '+' + cleanText;
            const detectedCountry = AFRICAN_COUNTRIES.find(country => potentialCode.startsWith(country.dialCode));
            if (detectedCountry && detectedCountry.code !== selectedCountry.code) {
                setSelectedCountry(detectedCountry);
                const numberWithoutCode = cleanText.replace(detectedCountry.dialCode.replace('+', ''), '').trim();
                setPhoneNumber(numberWithoutCode);
            }
        }
    };

    const handleCountrySelect = (country: Country) => {
        setSelectedCountry(country);
    };

    const handleLogin = async () => {
        Keyboard.dismiss();
        if (!phoneNumber || !password) {
            setError('Veuillez remplir tous les champs');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            // Clean phone number and combine with dial code
            const cleanLocalNumber = phoneNumber.replace(/\s/g, '');
            const fullPhoneNumber = `${selectedCountry.dialCode}${cleanLocalNumber}`;

            const response = await api.post('/auth/login', {
                phoneNumber: fullPhoneNumber,
                password
            });

            const { accessToken, refreshToken, user } = response.data;

            // Sauvegarder les tokens et l'utilisateur
            await AsyncStorage.setItem('accessToken', accessToken);
            if (refreshToken) {
                await AsyncStorage.setItem('refreshToken', refreshToken);
            }
            await AsyncStorage.setItem('user', JSON.stringify(user));

            // Naviguer vers l'écran principal
            navigation.reset({
                index: 0,
                routes: [{ name: 'Main' }],
            });

        } catch (err: any) {
            console.error('Login error:', err.response?.data || err.message);
            setError(err.response?.data?.message || 'Erreur de connexion. Vérifiez vos identifiants.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <LinearGradient colors={colors.gradients.background} style={styles.container}>
            <Header 
                title="Connexion"
                onBackPress={() => navigation.goBack()}
            />
            
            <KeyboardAvoidingView 
                style={styles.keyboardAvoidingView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView 
                    contentContainerStyle={styles.scrollContent} 
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                <View style={styles.header}>
                    <Text style={styles.logo}>ZENMO</Text>
                    <Text style={styles.subtitle}>Connecte-toi à ton univers</Text>
                </View>

                <FormCard style={styles.formCard}>
                    <Text style={styles.title}>Connexion</Text>

                    <PhoneInput
                        label="Numéro de téléphone"
                        placeholder="612345678"
                        value={phoneNumber}
                        onChangeText={handlePhoneChange}
                        selectedCountry={selectedCountry}
                        onCountrySelect={handleCountrySelect}
                    />

                    <Input
                        label="Mot de passe"
                        placeholder="Votre mot de passe"
                        value={password}
                        onChangeText={(text) => { setPassword(text); setError(''); }}
                        secureTextEntry={!showPassword}
                        iconLeft="lock-closed-outline"
                        iconRight={showPassword ? "eye-off-outline" : "eye-outline"}
                        onRightIconPress={() => setShowPassword(!showPassword)}
                    />

                    <TouchableOpacity
                        style={styles.forgotPassword}
                        onPress={() => navigation.navigate('ForgotPassword')}
                    >
                        <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
                    </TouchableOpacity>

                    {error ? (
                        <View style={styles.errorContainer}>
                            <Ionicons name="alert-circle" size={20} color={colors.semantic.error} />
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    ) : null}

                    <TouchableOpacity
                        style={styles.loginButton}
                        onPress={handleLogin}
                        disabled={isLoading}
                        activeOpacity={0.8}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#0D0C1D" />
                        ) : (
                            <Text style={styles.loginButtonText}>Se connecter</Text>
                        )}
                    </TouchableOpacity>
                </FormCard>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Pas de compte ? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                        <Text style={styles.signupLink}>Créer un compte</Text>
                    </TouchableOpacity>
                </View>
                
                <View style={styles.bottomSpacer} />
                </ScrollView>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: spacing.lg,
        paddingTop: 100, // Espace pour le header fixe
    },
    bottomSpacer: {
        height: 100,
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
        marginBottom: spacing.sm,
        textShadowColor: colors.primary.violetRoyal,
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 8,
    },
    subtitle: {
        fontFamily: typography.fonts.primary,
        fontSize: typography.sizes.body,
        color: colors.secondary.goldSoft,
        textAlign: 'center',
        opacity: 0.9,
    },
    formCard: {
        marginBottom: spacing.xl,
    },
    title: {
        fontFamily: typography.fonts.primary,
        fontSize: typography.sizes.h1,
        color: colors.secondary.creamWhite,
        marginBottom: spacing.xl,
        textAlign: 'center',
        letterSpacing: 1,
    },

    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: spacing.xl,
        padding: spacing.sm,
        borderRadius: borderRadius.sm,
    },
    forgotPasswordText: {
        color: colors.secondary.goldSoft,
        fontSize: typography.sizes.bodySmall,
        fontFamily: typography.fonts.primary,
        textDecorationLine: 'underline',
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.semantic.error + '20',
        padding: spacing.md,
        borderRadius: borderRadius.md,
        marginBottom: spacing.lg,
    },
    errorText: {
        color: colors.semantic.error,
        fontSize: typography.sizes.bodySmall,
        fontFamily: typography.fonts.primary,
        marginLeft: spacing.sm,
        flex: 1,
        textAlign: 'center',
    },
    loginButton: {
        backgroundColor: colors.secondary.goldSoft,
        height: 60,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: spacing.lg,
        borderWidth: 2,
        borderColor: colors.secondary.goldSoft,
    },
    loginButtonText: {
        fontFamily: typography.fonts.primary,
        fontSize: typography.sizes.h3,
        color: colors.primary.blueNight,
        fontWeight: typography.weights.bold,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.xl,
        padding: spacing.lg,
    },
    footerText: {
        color: colors.secondary.creamWhite,
        fontSize: typography.sizes.body,
        fontFamily: typography.fonts.primary,
        opacity: 0.8,
    },
    signupLink: {
        color: colors.secondary.goldSoft,
        fontSize: typography.sizes.body,
        fontFamily: typography.fonts.primary,
        fontWeight: typography.weights.semibold,
        textDecorationLine: 'underline',
    },
});
