import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../navigation/types';
import { spacing, borderRadius, shadows } from '../theme/spacing';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { Button, PatternBackground } from '../components';
import { Ionicons } from '@expo/vector-icons';

type AuthWelcomeScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'AuthWelcome'>;

export const AuthWelcomeScreen: React.FC = () => {
    const navigation = useNavigation<AuthWelcomeScreenNavigationProp>();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;

    useEffect(() => {
        // Animation d'entrée
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 50,
                friction: 8,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    return (
        <LinearGradient colors={colors.gradients.background} style={styles.container}>
            {/* Motif africain en arrière-plan */}
            <PatternBackground pattern="geometric" opacity={0.05} />
            
            <Animated.View 
                style={[
                    styles.content,
                    {
                        opacity: fadeAnim,
                        transform: [
                            { translateY: slideAnim },
                            { scale: scaleAnim }
                        ]
                    }
                ]}
            >
                <View style={styles.header}>
                    <View style={styles.logoContainer}>
                        <Text style={styles.logo}>ZENMO</Text>
                        <View style={styles.logoAccent} />
                    </View>
                    
                    <View style={styles.titleContainer}>
                        <Text style={styles.title}>Bienvenue !</Text>
                        <Text style={styles.subtitle}>Feel. Share. Flow.</Text>
                        <Text style={styles.description}>
                            Connecte-toi avec ta communauté et partage tes vibes
                        </Text>
                    </View>
                </View>

                <View style={styles.buttonsContainer}>
                    <TouchableOpacity 
                        style={styles.loginButton}
                        onPress={() => navigation.navigate('Login')}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={[colors.secondary.goldSoft, '#F6C762']}
                            style={styles.loginGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <Text style={styles.loginButtonText}>Se connecter</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.signupButton}
                        onPress={() => navigation.navigate('Signup')}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.signupButtonText}>Créer un compte</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'space-between',
        padding: spacing.xl,
        paddingTop: 100,
        paddingBottom: 80,
    },
    header: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: spacing.xxxl,
        position: 'relative',
    },
    logo: {
        fontFamily: typography.fonts.primary,
        fontSize: 52,
        color: colors.secondary.creamWhite,
        letterSpacing: 8,
        textShadowColor: colors.primary.violetRoyal,
        textShadowOffset: { width: 0, height: 4 },
        textShadowRadius: 12,
    },
    logoAccent: {
        position: 'absolute',
        bottom: -12,
        left: '15%',
        right: '15%',
        height: 4,
        backgroundColor: colors.secondary.goldSoft,
        borderRadius: borderRadius.full,
        ...shadows.medium,
    },
    titleContainer: {
        alignItems: 'center',
    },
    title: {
        fontFamily: typography.fonts.primary,
        fontSize: 48,
        color: colors.secondary.creamWhite,
        marginBottom: spacing.md,
        textAlign: 'center',
        letterSpacing: 3,
    },
    subtitle: {
        fontFamily: typography.fonts.primary,
        fontSize: typography.sizes.h2,
        color: colors.secondary.goldSoft,
        textAlign: 'center',
        marginBottom: spacing.lg,
        letterSpacing: 2,
    },
    description: {
        fontFamily: typography.fonts.primary,
        fontSize: typography.sizes.body,
        color: colors.secondary.creamWhite,
        textAlign: 'center',
        opacity: 0.8,
        lineHeight: 24,
        paddingHorizontal: spacing.lg,
    },
    buttonsContainer: {
        width: '100%',
        gap: spacing.xl,
    },
    loginButton: {
        borderRadius: borderRadius.xl,
        overflow: 'hidden',
        ...shadows.premium,
    },
    loginGradient: {
        height: 72,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing.xl,
    },
    loginButtonText: {
        fontFamily: typography.fonts.primary,
        fontSize: typography.sizes.h3,
        color: colors.primary.blueNight,
        fontWeight: typography.weights.bold,
        letterSpacing: 1,
    },
    signupButton: {
        height: 72,
        backgroundColor: colors.glass.white10,
        borderRadius: borderRadius.xl,
        borderWidth: 2,
        borderColor: colors.glass.white20,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing.xl,
        ...shadows.medium,
    },
    signupButtonText: {
        fontFamily: typography.fonts.primary,
        fontSize: typography.sizes.h3,
        color: colors.secondary.creamWhite,
        fontWeight: typography.weights.semibold,
        letterSpacing: 1,
    },
});
