import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Keyboard, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { Input, FormCard, Button, PasswordStrengthBar, PhoneInput, Header, ProgressBar, AFRICAN_COUNTRIES, type Country } from '../components';
import { spacing, borderRadius, shadows } from '../theme/spacing';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { AuthStackParamList } from '../navigation/types';
import api from '../services/api';
import { Ionicons } from '@expo/vector-icons';

type SignupScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Signup'>;

export const SignupScreen: React.FC = () => {
    const navigation = useNavigation<SignupScreenNavigationProp>();
    const [username, setUsername] = useState('');
    const [selectedCountry, setSelectedCountry] = useState<Country>(AFRICAN_COUNTRIES.find(c => c.code === 'BF') || AFRICAN_COUNTRIES[0]);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [email, setEmail] = useState('');
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
                // Strip the code from the input so it looks like it "moved" to the selector.
                const numberWithoutCode = cleanText.replace(detectedCountry.dialCode, '').trim();
                setPhoneNumber(numberWithoutCode);
            }
        } else if (cleanText.length >= 3) {
            // Handle case like "226..." without "+"
            const potentialCode = '+' + cleanText;
            const detectedCountry = AFRICAN_COUNTRIES.find(country => potentialCode.startsWith(country.dialCode));
            if (detectedCountry && detectedCountry.code !== selectedCountry.code) {
                setSelectedCountry(detectedCountry);
                // Strip code
                const numberWithoutCode = cleanText.replace(detectedCountry.dialCode.replace('+', ''), '').trim();
                setPhoneNumber(numberWithoutCode);
            }
        }
    };

    const handleCountrySelect = (country: Country) => {
        setSelectedCountry(country);
    };

    const handleSignup = async () => {
        Keyboard.dismiss();
        if (!username || !phoneNumber || !email || !password) {
            setError('Veuillez remplir tous les champs');
            return;
        }

        // Validation du username
        const usernameRegex = /^[a-zA-Z0-9_.-]+$/;
        if (!usernameRegex.test(username)) {
            setError('Le pseudo ne peut contenir que des lettres, chiffres, tirets, points et underscores');
            return;
        }

        if (username.length < 3 || username.length > 20) {
            setError('Le pseudo doit contenir entre 3 et 20 caractères');
            return;
        }

        if (password.length < 6) {
            setError('Le mot de passe doit contenir au moins 6 caractères');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            // 1. Appel API Register
            // Clean phone number (remove spaces)
            const cleanLocalNumber = phoneNumber.replace(/\s/g, '');
            // Combine selected dial code with local number
            const fullPhoneNumber = `${selectedCountry.dialCode}${cleanLocalNumber}`;

            const response = await api.post('/auth/register', {
                username,
                phoneNumber: fullPhoneNumber,
                email,
                password,
                countryCode: selectedCountry.code
            });

            // 2. Envoyer code OTP par email
            await api.post('/auth/send-otp', {
                email,
                phoneNumber: fullPhoneNumber
            });

            // 3. Naviguer vers l'écran de vérification OTP
            navigation.navigate('OTPVerify', {
                email,
                phoneNumber: fullPhoneNumber,
                password,
                fullName: username
            });

        } catch (err: any) {
            console.error('Signup error:', err.response?.data || err.message);
            const message = err.response?.data?.message;
            if (Array.isArray(message)) {
                setError(message[0]);
            } else {
                setError(message || 'Une erreur est survenue. Vérifiez vos informations.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <LinearGradient colors={colors.gradients.background} style={styles.container}>
            <Header 
                title="Inscription"
                onBackPress={() => navigation.goBack()}
            />
            
            <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                <View style={styles.header}>
                    <Text style={styles.logo}>ZENMO</Text>
                    <Text style={styles.subtitle}>Rejoins la communauté</Text>
                    
                    <ProgressBar 
                        steps={[
                            { label: 'COMPTE', completed: false, current: true },
                            { label: 'PROFIL', completed: false, current: false },
                            { label: 'PERMISSIONS', completed: false, current: false }
                        ]}
                    />
                </View>

                <FormCard style={styles.formCard}>
                    <Text style={styles.title}>Inscription</Text>

                    <Input
                        label="Pseudo"
                        placeholder="ex: john_doe123"
                        value={username}
                        onChangeText={(text) => { 
                            // Nettoyer automatiquement les caractères non autorisés
                            const cleanText = text.replace(/[^a-zA-Z0-9_.-]/g, '');
                            setUsername(cleanText); 
                            setError(''); 
                        }}
                        iconLeft="person-outline"
                        autoCapitalize="none"
                    />

                    <PhoneInput
                        label="Numéro de téléphone"
                        placeholder="612345678"
                        value={phoneNumber}
                        onChangeText={handlePhoneChange}
                        selectedCountry={selectedCountry}
                        onCountrySelect={handleCountrySelect}
                    />

                    <Input
                        label="Email"
                        placeholder="ton@email.com"
                        value={email}
                        onChangeText={(text) => { setEmail(text); setError(''); }}
                        keyboardType="email-address"
                        iconLeft="mail-outline"
                        autoCapitalize="none"
                    />

                    <Input
                        label="Mot de passe"
                        placeholder="Créez un mot de passe"
                        value={password}
                        onChangeText={(text) => { setPassword(text); setError(''); }}
                        secureTextEntry={!showPassword}
                        iconLeft="lock-closed-outline"
                        iconRight={showPassword ? "eye-off-outline" : "eye-outline"}
                        onRightIconPress={() => setShowPassword(!showPassword)}
                    />

                    <PasswordStrengthBar password={password} />

                    {error ? (
                        <View style={styles.errorContainer}>
                            <Ionicons name="alert-circle" size={20} color={colors.semantic.error} />
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    ) : null}

                    <TouchableOpacity
                        style={styles.signupButton}
                        onPress={handleSignup}
                        disabled={isLoading}
                        activeOpacity={0.8}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#0D0C1D" />
                        ) : (
                            <Text style={styles.signupButtonText}>Continuer</Text>
                        )}
                    </TouchableOpacity>
                </FormCard>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Déjà un compte ? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                        <Text style={styles.loginLink}>Se connecter</Text>
                    </TouchableOpacity>
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
        paddingHorizontal: spacing.lg,
        paddingTop: 100, // Espace pour le header fixe
        paddingBottom: 40,
    },
    header: {
        alignItems: 'center',
        marginBottom: spacing.xl,
        gap: spacing.lg,
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
    signupButton: {
        backgroundColor: colors.secondary.goldSoft,
        height: 60,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: spacing.lg,
        borderWidth: 2,
        borderColor: colors.secondary.goldSoft,
    },
    signupButtonText: {
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
    loginLink: {
        color: colors.secondary.goldSoft,
        fontSize: typography.sizes.body,
        fontFamily: typography.fonts.primary,
        fontWeight: typography.weights.semibold,
        textDecorationLine: 'underline',
    },
});
