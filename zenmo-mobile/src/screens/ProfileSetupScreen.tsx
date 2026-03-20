import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Font from 'expo-font';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Input, FormCard, Header, ProgressBar, useCustomAlert } from '../components';
import { spacing, borderRadius, shadows } from '../theme/spacing';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { AuthStackParamList } from '../navigation/types';
import api from '../services/api';

type ProfileSetupScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'ProfileSetup'>;

export const ProfileSetupScreen: React.FC = () => {
    const navigation = useNavigation<ProfileSetupScreenNavigationProp>();
    const [username, setUsername] = useState('');
    const [bio, setBio] = useState('');
    const [image, setImage] = useState<string | null>(null);
    const [fontLoaded, setFontLoaded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<{ username?: string }>({});

    const [gender, setGender] = useState<'male' | 'female' | null>(null);
    const [interests, setInterests] = useState<string[]>([]);
    const { showAlert, AlertComponent } = useCustomAlert();

    const AVAILABLE_INTERESTS = [
        'Danse', 'Mode', 'Tech', 'Sport', 'Musique Afro',
        'Voyage', 'Cuisine', 'Art', 'Cinéma', 'Gaming'
    ];

    useEffect(() => {
        async function loadFont() {
            await Font.loadAsync({
                'PottaOne-Regular': require('../../assets/fonts/PottaOne-Regular.ttf'),
            });
            setFontLoaded(true);
        }
        loadFont();
    }, []);

    const pickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (permissionResult.granted === false) {
            showAlert(
                'Permission requise',
                'L\'accès à la galerie est nécessaire pour choisir une photo.',
                [{ text: 'OK' }],
                'alert-circle',
                '#FF6B6B'
            );
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const toggleInterest = (interest: string) => {
        if (interests.includes(interest)) {
            setInterests(interests.filter(i => i !== interest));
        } else {
            if (interests.length < 5) {
                setInterests([...interests, interest]);
            } else {
                showAlert(
                    'Limite atteinte',
                    'Tu peux choisir maximum 5 centres d\'intérêt.',
                    [{ text: 'OK' }],
                    'information-circle',
                    '#E4C66D'
                );
            }
        }
    };

    const handleContinue = async () => {
        console.log('🔵 Continue button pressed!');

        if (!username) {
            setErrors({ username: 'Choisis un pseudo !' });
            return;
        }

        // Validation du username
        const usernameRegex = /^[a-zA-Z0-9_.-]+$/;
        if (!usernameRegex.test(username)) {
            setErrors({ username: 'Le pseudo ne peut contenir que des lettres, chiffres, tirets, points et underscores' });
            return;
        }

        if (username.length < 3 || username.length > 20) {
            setErrors({ username: 'Le pseudo doit contenir entre 3 et 20 caractères' });
            return;
        }

        setIsLoading(true);

        try {
            // Préparer les données du profil
            const profileData = {
                username,
                bio,
                gender,
                interests,
                avatarUrl: image || undefined
            };

            console.log('✅ Saving profile:', profileData);

            // Sauvegarder dans le backend
            await api.patch('/users/me/profile', profileData);

            // Sauvegarder dans AsyncStorage
            await AsyncStorage.setItem('userProfile', JSON.stringify(profileData));

            console.log('✅ Profile saved successfully');

            // Naviguer vers Permissions
            navigation.navigate('Permissions');

        } catch (error: any) {
            console.error('❌ Profile save error:', error);
            setErrors({ username: 'Erreur lors de la sauvegarde du profil' });
        } finally {
            setIsLoading(false);
        }
    };

    if (!fontLoaded) {
        return (
            <LinearGradient colors={['#7C5EF6', '#7C5EF6']} style={styles.container} />
        );
    }

    return (
        <LinearGradient colors={colors.gradients.background} style={styles.container}>
            <Header 
                title="Profil"
                onBackPress={() => navigation.goBack()}
            />
            
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Text style={styles.logo}>ZENMO</Text>
                    <Text style={styles.subtitle}>Crée ton profil unique</Text>
                    
                    <ProgressBar 
                        steps={[
                            { label: 'COMPTE', completed: true, current: false },
                            { label: 'PROFIL', completed: false, current: true },
                            { label: 'PERMISSIONS', completed: false, current: false }
                        ]}
                    />
                </View>

                <FormCard style={styles.formCard}>
                    <Text style={styles.title}>Crée ton profil</Text>
                    <Text style={styles.formSubtitle}>Montre-nous qui tu es !</Text>

                    {/* Photo de profil */}
                    <TouchableOpacity style={styles.photoSection} onPress={pickImage}>
                        <View style={styles.photoContainer}>
                            {image ? (
                                <Image source={{ uri: image }} style={styles.profileImage} />
                            ) : (
                                <View style={styles.placeholderImage}>
                                    <Ionicons name="person" size={40} color={colors.secondary.goldSoft} />
                                </View>
                            )}
                            <View style={styles.cameraButton}>
                                <Ionicons name="camera" size={20} color={colors.primary.blueNight} />
                            </View>
                        </View>
                        <Text style={styles.photoText}>
                            {image ? 'Changer la photo' : 'Ajouter une photo'}
                        </Text>
                    </TouchableOpacity>

                    {/* Champs de saisie */}
                    <View style={styles.inputSection}>
                        <Input
                            label="Ton pseudo"
                            placeholder="ex: john_doe123"
                            value={username}
                            onChangeText={(text) => { 
                                const cleanText = text.replace(/[^a-zA-Z0-9_.-]/g, '');
                                setUsername(cleanText); 
                                setErrors({}); 
                            }}
                            iconLeft="at-outline"
                            error={errors.username}
                            autoCapitalize="none"
                            style={styles.input}
                        />

                        <Input
                            label="Ta bio (optionnel)"
                            placeholder="Raconte-nous qui tu es..."
                            value={bio}
                            onChangeText={setBio}
                            iconLeft="text-outline"
                            multiline
                            numberOfLines={4}
                            style={styles.bioInput}
                        />
                    </View>

                    {/* Genre */}
                    <View style={styles.genderSection}>
                        <Text style={styles.sectionTitle}>Ton genre (optionnel)</Text>
                        <View style={styles.genderContainer}>
                            <TouchableOpacity
                                style={[
                                    styles.genderButton,
                                    gender === 'male' && styles.genderButtonSelected
                                ]}
                                onPress={() => setGender('male')}
                            >
                                <Ionicons
                                    name="male"
                                    size={24}
                                    color={gender === 'male' ? colors.primary.blueNight : colors.secondary.creamWhite}
                                />
                                <Text style={[
                                    styles.genderLabel,
                                    gender === 'male' && styles.genderLabelSelected
                                ]}>Homme</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.genderButton,
                                    gender === 'female' && styles.genderButtonSelected
                                ]}
                                onPress={() => setGender('female')}
                            >
                                <Ionicons
                                    name="female"
                                    size={24}
                                    color={gender === 'female' ? colors.primary.blueNight : colors.secondary.creamWhite}
                                />
                                <Text style={[
                                    styles.genderLabel,
                                    gender === 'female' && styles.genderLabelSelected
                                ]}>Femme</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Intérêts */}
                    <View style={styles.interestsSection}>
                        <Text style={styles.sectionTitle}>Tes vibes ({interests.length}/5)</Text>
                        <Text style={styles.sectionSubtitle}>Choisis jusqu'à 5 centres d'intérêt</Text>
                        <View style={styles.interestsContainer}>
                            {AVAILABLE_INTERESTS.map((interest) => (
                                <TouchableOpacity
                                    key={interest}
                                    style={[
                                        styles.interestChip,
                                        interests.includes(interest) && styles.interestChipSelected
                                    ]}
                                    onPress={() => toggleInterest(interest)}
                                >
                                    <Text style={[
                                        styles.interestText,
                                        interests.includes(interest) && styles.interestTextSelected
                                    ]}>
                                        {interest}
                                    </Text>
                                    {interests.includes(interest) && (
                                        <Ionicons 
                                            name="checkmark-circle" 
                                            size={18} 
                                            color={colors.primary.blueNight} 
                                            style={styles.checkIcon}
                                        />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Erreur */}
                    {errors.username ? (
                        <View style={styles.errorContainer}>
                            <Ionicons name="alert-circle" size={20} color={colors.semantic.error} />
                            <Text style={styles.errorText}>{errors.username}</Text>
                        </View>
                    ) : null}

                    {/* Bouton Continuer */}
                    <TouchableOpacity
                        style={styles.continueButton}
                        onPress={handleContinue}
                        disabled={isLoading}
                        activeOpacity={0.8}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#0D0C1D" />
                        ) : (
                            <>
                                <Text style={styles.continueButtonText}>Continuer</Text>
                                <Ionicons name="arrow-forward" size={20} color={colors.primary.blueNight} />
                            </>
                        )}
                    </TouchableOpacity>
                </FormCard>
            </ScrollView>
            <AlertComponent />
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: spacing.lg,
        paddingTop: 100,
        paddingBottom: 30,
    },
    header: {
        alignItems: 'center',
        marginBottom: spacing.lg,
        gap: spacing.lg,
    },
    subtitle: {
        fontFamily: typography.fonts.primary,
        fontSize: typography.sizes.body,
        color: colors.secondary.goldSoft,
        textAlign: 'center',
        opacity: 0.9,
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

    formCard: {
        width: '100%',
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing.lg,
    },
    title: {
        fontFamily: typography.fonts.primary,
        fontSize: typography.sizes.h1,
        color: colors.secondary.creamWhite,
        marginBottom: spacing.sm,
        textAlign: 'center',
        letterSpacing: 1,
    },
    formSubtitle: {
        fontFamily: typography.fonts.primary,
        fontSize: typography.sizes.body,
        color: colors.secondary.goldSoft,
        textAlign: 'center',
        marginBottom: spacing.lg,
        opacity: 0.9,
    },

    // Photo section
    photoSection: {
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    photoContainer: {
        position: 'relative',
        marginBottom: spacing.md,
    },
    profileImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 3,
        borderColor: colors.secondary.goldSoft,
    },
    placeholderImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.glass.white10,
        borderWidth: 2,
        borderColor: colors.secondary.goldSoft,
    },
    cameraButton: {
        position: 'absolute',
        bottom: -5,
        right: -5,
        backgroundColor: colors.secondary.goldSoft,
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: colors.secondary.creamWhite,
        ...shadows.medium,
    },
    photoText: {
        fontFamily: typography.fonts.primary,
        fontSize: typography.sizes.bodySmall,
        color: colors.secondary.goldSoft,
        textAlign: 'center',
    },

    // Input section
    inputSection: {
        width: '100%',
        marginBottom: spacing.lg,
    },
    input: {
        marginBottom: spacing.lg,
    },
    bioInput: {
        marginBottom: 0,
    },

    // Gender section
    genderSection: {
        width: '100%',
        marginBottom: spacing.lg,
    },
    sectionTitle: {
        fontFamily: typography.fonts.primary,
        fontSize: typography.sizes.body,
        color: colors.secondary.creamWhite,
        marginBottom: spacing.md,
        fontWeight: typography.weights.medium,
        textAlign: 'center',
    },
    genderContainer: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    genderButton: {
        flex: 1,
        height: 60,
        borderRadius: borderRadius.lg,
        backgroundColor: colors.glass.white10,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: colors.glass.white20,
        gap: spacing.xs,
    },
    genderButtonSelected: {
        backgroundColor: colors.secondary.goldSoft,
        borderColor: colors.secondary.goldSoft,
        ...shadows.medium,
    },
    genderLabel: {
        fontFamily: typography.fonts.primary,
        fontSize: typography.sizes.bodySmall,
        color: colors.secondary.creamWhite,
        fontWeight: typography.weights.medium,
    },
    genderLabelSelected: {
        color: colors.primary.blueNight,
        fontWeight: typography.weights.bold,
    },

    // Interests section
    interestsSection: {
        width: '100%',
        marginBottom: spacing.lg,
    },
    sectionSubtitle: {
        fontFamily: typography.fonts.primary,
        fontSize: typography.sizes.caption,
        color: colors.secondary.creamWhite,
        marginBottom: spacing.md,
        opacity: 0.7,
        textAlign: 'center',
    },
    interestsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
        justifyContent: 'center',
    },
    interestChip: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.full,
        backgroundColor: colors.glass.white10,
        borderWidth: 1,
        borderColor: colors.glass.white20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    interestChipSelected: {
        backgroundColor: colors.secondary.goldSoft,
        borderColor: colors.secondary.goldSoft,
        ...shadows.medium,
    },
    interestText: {
        fontFamily: typography.fonts.primary,
        fontSize: typography.sizes.caption,
        color: colors.secondary.creamWhite,
        fontWeight: typography.weights.medium,
    },
    interestTextSelected: {
        color: colors.primary.blueNight,
        fontWeight: typography.weights.bold,
    },
    checkIcon: {
        marginLeft: spacing.xs,
    },

    // Button and error
    continueButton: {
        flexDirection: 'row',
        backgroundColor: colors.secondary.goldSoft,
        height: 55,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: spacing.md,
        borderWidth: 2,
        borderColor: colors.secondary.goldSoft,
        width: '100%',
        gap: spacing.sm,
        ...shadows.medium,
    },
    continueButtonText: {
        fontFamily: typography.fonts.primary,
        fontSize: typography.sizes.h3,
        color: colors.primary.blueNight,
        fontWeight: typography.weights.bold,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.semantic.error + '20',
        padding: spacing.md,
        borderRadius: borderRadius.md,
        marginBottom: spacing.lg,
        width: '100%',
    },
    errorText: {
        color: colors.semantic.error,
        fontSize: typography.sizes.bodySmall,
        fontFamily: typography.fonts.primary,
        marginLeft: spacing.sm,
        flex: 1,
        textAlign: 'center',
    },
});

export default ProfileSetupScreen;
