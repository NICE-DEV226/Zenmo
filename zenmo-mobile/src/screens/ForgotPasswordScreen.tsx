import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Keyboard, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { Input, FormCard, Button, Header } from '../components';
import { spacing, borderRadius, shadows } from '../theme/spacing';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { Ionicons } from '@expo/vector-icons';
import { AuthStackParamList } from '../navigation/types';
import api from '../services/api';

type ForgotPasswordScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'ForgotPassword'>;

export const ForgotPasswordScreen: React.FC = () => {
    const navigation = useNavigation<ForgotPasswordScreenNavigationProp>();
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [isSent, setIsSent] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSend = async () => {
        Keyboard.dismiss();
        if (!email) {
            setError('Email requis');
            return;
        }

        setError('');
        setIsLoading(true);

        try {
            await api.post('/auth/forgot-password', { email });
            setIsSent(true);
        } catch (err: any) {
            console.error('Forgot password error:', err);
            setError(err.response?.data?.message || 'Erreur lors de l\'envoi. Vérifie ton email.');
        } finally {
            setIsLoading(false);
        }
    };

    // La police est déjà chargée globalement via app.json
    // Pas besoin de charger localement ou d'attendre

    return (
        <LinearGradient colors={colors.gradients.background} style={styles.container}>
            <Header 
                title="Mot de passe oublié"
                onBackPress={() => navigation.goBack()}
            />
            
            <KeyboardAvoidingView 
                style={styles.keyboardAvoidingView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                <ScrollView 
                    contentContainerStyle={styles.scrollContent} 
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    bounces={false}
                >
                    <View style={styles.header}>
                        <Text style={styles.logo}>ZENMO</Text>
                        <View style={styles.iconContainer}>
                            <Ionicons 
                                name={isSent ? "checkmark-circle" : "key"} 
                                size={64} 
                                color={colors.secondary.goldSoft} 
                            />
                        </View>
                    </View>

                    <FormCard variant="premium" style={styles.formCard}>
                        {isSent ? (
                            <View style={styles.successContainer}>
                                <Text style={styles.successTitle}>Email envoyé !</Text>
                                <Text style={styles.successText}>
                                    Vérifie ta boîte mail pour réinitialiser ton mot de passe.
                                </Text>
                                <TouchableOpacity
                                    style={styles.backToLoginButton}
                                    onPress={() => navigation.navigate('Login')}
                                    activeOpacity={0.8}
                                >
                                    <Text style={styles.backToLoginButtonText}>Retour à la connexion</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <>
                                <Text style={styles.title}>Mot de passe oublié ?</Text>
                                <Text style={styles.subtitle}>
                                    Entre ton email pour recevoir un lien de réinitialisation.
                                </Text>

                                <View style={styles.inputContainer}>
                                    <Input
                                        label="Email"
                                        placeholder="ex: email@example.com"
                                        value={email}
                                        onChangeText={(text) => { setEmail(text); setError(''); }}
                                        keyboardType="email-address"
                                        iconLeft="mail-outline"
                                        error={error}
                                        autoCapitalize="none"
                                    />
                                </View>

                                <TouchableOpacity
                                    style={styles.sendButton}
                                    onPress={handleSend}
                                    disabled={isLoading}
                                    activeOpacity={0.8}
                                >
                                    {isLoading ? (
                                        <ActivityIndicator color="#0D0C1D" />
                                    ) : (
                                        <Text style={styles.sendButtonText}>Envoyer le lien</Text>
                                    )}
                                </TouchableOpacity>
                            </>
                        )}
                    </FormCard>
                    
                    {/* Spacer pour assurer le scroll */}
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
        minHeight: '100%', // Assure que le contenu prend au moins toute la hauteur
    },
    bottomSpacer: {
        height: 200, // Espace supplémentaire pour permettre le scroll au-dessus du clavier
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
    },
    formCard: {
        width: '100%',
    },
    title: {
        fontFamily: typography.fonts.primary,
        fontSize: typography.sizes.h2,
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
    inputContainer: {
        width: '100%',
        marginBottom: spacing.md,
    },
    sendButton: {
        backgroundColor: colors.secondary.goldSoft,
        height: 60,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: spacing.lg,
        borderWidth: 2,
        borderColor: colors.secondary.goldSoft,
        width: '100%',
    },
    sendButtonText: {
        fontFamily: typography.fonts.primary,
        fontSize: typography.sizes.h3,
        color: colors.primary.blueNight,
        fontWeight: typography.weights.bold,
    },
    backToLoginButton: {
        backgroundColor: colors.secondary.goldSoft,
        height: 60,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: spacing.lg,
        borderWidth: 2,
        borderColor: colors.secondary.goldSoft,
        width: '100%',
    },
    backToLoginButtonText: {
        fontFamily: typography.fonts.primary,
        fontSize: typography.sizes.h3,
        color: colors.primary.blueNight,
        fontWeight: typography.weights.bold,
    },
    successContainer: {
        alignItems: 'center',
        paddingVertical: spacing.lg,
        width: '100%',
    },
    successTitle: {
        fontFamily: typography.fonts.primary,
        fontSize: typography.sizes.h2,
        color: colors.secondary.creamWhite,
        marginBottom: spacing.md,
        textAlign: 'center',
    },
    successText: {
        fontFamily: typography.fonts.primary,
        fontSize: typography.sizes.body,
        color: colors.secondary.creamWhite,
        textAlign: 'center',
        marginBottom: spacing.xl,
        lineHeight: 24,
        opacity: 0.9,
    },
});

export default ForgotPasswordScreen;
