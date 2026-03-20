import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions, ActivityIndicator, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import api from '../services/api';
import { spacing } from '../theme/spacing';
import { Avatar, useCustomAlert } from '../components';

const { width } = Dimensions.get('window');

const USER_STATS = [
    { label: 'Vibes', value: '42' },
    { label: 'Followers', value: '1.2k' },
    { label: 'Following', value: '350' },
];

const MY_VIBES = [
    { id: '1', color: ['#7B61FF', '#33D1C4'], mood: 'Chill' },
    { id: '2', color: ['#FF9966', '#FF5E62'], mood: 'Party' },
    { id: '3', color: ['#E4C66D', '#F6C762'], mood: 'Dreamy' },
    { id: '4', color: ['#0D0C1D', '#1A1A2E'], mood: 'Night' },
    { id: '5', color: ['#8E2DE2', '#4A00E0'], mood: 'Vibe' },
    { id: '6', color: ['#11998e', '#38ef7d'], mood: 'Fresh' },
];

export const ProfileScreen = () => {
    const navigation = useNavigation();
    const [user, setUser] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(true);
    const [updatingAvatar, setUpdatingAvatar] = React.useState(false);
    const scrollY = React.useRef(new Animated.Value(0)).current;
    const { showAlert, AlertComponent } = useCustomAlert();

    React.useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            // 1. Charger depuis AsyncStorage (Rapide)
            const storedProfile = await AsyncStorage.getItem('userProfile');
            if (storedProfile) {
                setUser(JSON.parse(storedProfile));
            }

            // 2. Charger depuis API (Frais)
            const response = await api.get('/users/me/profile');
            setUser(response.data);
            await AsyncStorage.setItem('userProfile', JSON.stringify(response.data));

        } catch (error) {
            console.error('Error loading profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const showImagePicker = () => {
        showAlert(
            'Changer la photo',
            'Choisissez une source',
            [
                { text: 'Galerie', onPress: pickImageFromGallery },
                { text: 'Caméra', onPress: pickImageFromCamera },
                { text: 'Annuler', style: 'cancel' }
            ],
            'camera',
            '#E4C66D'
        );
    };

    const pickImageFromGallery = async () => {
        try {
            // Demander la permission d'accès à la galerie
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (permissionResult.granted === false) {
                showAlert(
                    'Permission requise',
                    'Accès à la galerie nécessaire.',
                    [{ text: 'OK' }],
                    'alert-circle',
                    '#FF6B6B'
                );
                return;
            }

            // Ouvrir la galerie
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            await handleImageResult(result);
        } catch (error) {
            console.error('Error picking image from gallery:', error);
            showAlert(
                'Erreur',
                'Impossible de sélectionner l\'image. Réessayez.',
                [{ text: 'OK' }],
                'alert-circle',
                '#FF6B6B'
            );
        }
    };

    const pickImageFromCamera = async () => {
        try {
            // Demander la permission d'accès à la caméra
            const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

            if (permissionResult.granted === false) {
                showAlert(
                    'Permission requise',
                    'Accès à la caméra nécessaire.',
                    [{ text: 'OK' }],
                    'alert-circle',
                    '#FF6B6B'
                );
                return;
            }

            // Ouvrir la caméra
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            await handleImageResult(result);
        } catch (error) {
            console.error('Error taking photo:', error);
            showAlert(
                'Erreur',
                'Impossible de prendre la photo. Réessayez.',
                [{ text: 'OK' }],
                'alert-circle',
                '#FF6B6B'
            );
        }
    };

    const handleImageResult = async (result: ImagePicker.ImagePickerResult) => {
        try {

            if (!result.canceled && result.assets[0]) {
                setUpdatingAvatar(true);
                const imageUri = result.assets[0].uri;

                // Mettre à jour l'avatar localement immédiatement
                const updatedUser = { ...user, avatarUrl: imageUri };
                setUser(updatedUser);
                await AsyncStorage.setItem('userProfile', JSON.stringify(updatedUser));

                // Envoyer au backend
                try {
                    console.log('🔄 Updating avatar with URI:', imageUri);
                    const response = await api.patch('/users/me/profile', { avatarUrl: imageUri });
                    console.log('✅ Avatar updated successfully:', response.data);
                    
                    // Mettre à jour avec la réponse du serveur
                    const serverUser = response.data;
                    setUser(serverUser);
                    await AsyncStorage.setItem('userProfile', JSON.stringify(serverUser));
                } catch (error: any) {
                    console.error('❌ Error updating avatar:', error);
                    console.error('Error details:', error.response?.data);
                    
                    // En cas d'erreur, restaurer l'ancien avatar
                    setUser(user);
                    await AsyncStorage.setItem('userProfile', JSON.stringify(user));
                    
                    showAlert(
                        'Erreur',
                        'Impossible de mettre à jour la photo.',
                        [{ text: 'OK' }],
                        'alert-circle',
                        '#FF6B6B'
                    );
                }
            }
        } catch (error) {
            console.error('Error handling image result:', error);
            showAlert(
                'Erreur',
                'Impossible de traiter l\'image. Réessayez.',
                [{ text: 'OK' }],
                'alert-circle',
                '#FF6B6B'
            );
        } finally {
            setUpdatingAvatar(false);
        }
    };

    const headerOpacity = scrollY.interpolate({
        inputRange: [150, 200],
        outputRange: [0, 1],
        extrapolate: 'clamp',
    });

    const headerTranslateY = scrollY.interpolate({
        inputRange: [150, 200],
        outputRange: [-20, 0],
        extrapolate: 'clamp',
    });

    if (loading && !user) {
        return (
            <LinearGradient colors={['#0D0C1D', '#1A1A2E']} style={styles.container}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#E4C66D" />
                </View>
            </LinearGradient>
        );
    }

    return (
        <LinearGradient colors={['#0D0C1D', '#1A1A2E']} style={styles.container}>
            {/* Sticky Header */}
            <Animated.View style={[styles.stickyHeader, { opacity: headerOpacity, transform: [{ translateY: headerTranslateY }] }]}>
                <LinearGradient
                    colors={['#0D0C1D', 'rgba(13, 12, 29, 0.95)']}
                    style={styles.stickyHeaderGradient}
                >
                    <View style={styles.stickyHeaderContent}>
                        <Avatar
                            uri={user?.avatarUrl}
                            size={40}
                            borderWidth={1}
                            borderColor="rgba(255, 255, 255, 0.2)"
                        />
                        <Text style={styles.stickyName}>{user?.displayName || user?.username}</Text>
                    </View>
                </LinearGradient>
            </Animated.View>

            <Animated.ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: true }
                )}
                scrollEventThrottle={16}
            >

                {/* Header / Cover */}
                <View style={styles.headerContainer}>
                    <Image
                        source={require('../../assets/couvert.jpg')}
                        style={styles.coverImage}
                        resizeMode="cover"
                    />
                    <LinearGradient
                        colors={['transparent', '#0D0C1D']}
                        style={styles.coverGradient}
                    />

                    <View style={styles.headerContent}>
                        <TouchableOpacity
                            style={styles.settingsButton}
                            // @ts-ignore
                            onPress={() => navigation.navigate('Settings')}
                        >
                            <Ionicons name="settings-outline" size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                        <View style={styles.profileInfo}>
                            <View style={styles.avatarContainer}>
                                <Avatar
                                    uri={user?.avatarUrl}
                                    size={100}
                                    borderWidth={3}
                                    borderColor="#E4C66D"
                                />
                                <TouchableOpacity 
                                    style={styles.editAvatarButton}
                                    onPress={showImagePicker}
                                    disabled={updatingAvatar}
                                    activeOpacity={0.7}
                                >
                                    {updatingAvatar ? (
                                        <ActivityIndicator size="small" color="#0D0C1D" />
                                    ) : (
                                        <Ionicons name="camera" size={16} color="#0D0C1D" />
                                    )}
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.name}>
                                {user?.displayName || user?.username || 'Utilisateur'}
                                {user?.countryCode && <Text style={{ fontSize: 20 }}> {user.countryCode}</Text>}
                            </Text>
                            <Text style={styles.username}>@{user?.username || 'pseudo'}</Text>
                            <Text style={styles.bio}>
                                {user?.bio || 'Aucune bio pour le moment.'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Stats */}
                <View style={styles.statsContainer}>
                    {USER_STATS.map((stat, index) => (
                        <View key={index} style={styles.statItem}>
                            <Text style={styles.statValue}>{stat.value}</Text>
                            <Text style={styles.statLabel}>{stat.label}</Text>
                        </View>
                    ))}
                </View>

                {/* Combined Section: Interests + Vibes */}
                <View style={styles.combinedSection}>
                    {/* Interests */}
                    {user?.interests && user.interests.length > 0 && (
                        <View style={styles.subSection}>
                            <Text style={styles.subSectionTitle}>Intérêts</Text>
                            <View style={styles.interestsContainer}>
                                {user.interests.slice(0, 4).map((interest: string, index: number) => (
                                    <View key={index} style={styles.interestChip}>
                                        <Text style={styles.interestText}>{interest}</Text>
                                    </View>
                                ))}
                                {user.interests.length > 4 && (
                                    <View style={styles.moreChip}>
                                        <Text style={styles.moreText}>+{user.interests.length - 4}</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    )}

                    {/* My Vibes Gallery - Compact */}
                    <View style={styles.subSection}>
                        <View style={styles.subSectionHeader}>
                            <Text style={styles.subSectionTitle}>Mes Vibes</Text>
                            <TouchableOpacity>
                                <Text style={styles.seeAllText}>Voir tout</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.compactGalleryGrid}>
                            {MY_VIBES.slice(0, 4).map((vibe) => (
                                <TouchableOpacity key={vibe.id} style={styles.compactGalleryItem}>
                                    <LinearGradient
                                        colors={vibe.color as any}
                                        style={styles.compactGalleryGradient}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                    >
                                        <Text style={styles.compactGalleryMood}>{vibe.mood}</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>

                {/* Premium Banner */}
                <TouchableOpacity style={styles.premiumBanner}>
                    <LinearGradient
                        colors={['#E4C66D', '#F6C762']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.premiumGradient}
                    >
                        <View style={styles.premiumContent}>
                            <Ionicons name="star" size={24} color="#0D0C1D" />
                            <View style={styles.premiumTextContainer}>
                                <Text style={styles.premiumTitle}>Passer à Zenmo+</Text>
                                <Text style={styles.premiumSubtitle}>Débloque des fonctionnalités exclusives</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={24} color="#0D0C1D" />
                        </View>
                    </LinearGradient>
                </TouchableOpacity>

            </Animated.ScrollView>
            <AlertComponent />
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    stickyHeader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        height: 90,
    },
    stickyHeaderGradient: {
        flex: 1,
        justifyContent: 'flex-end',
        paddingBottom: 15,
        paddingHorizontal: spacing.xl,
    },
    stickyHeaderContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },

    stickyName: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 16,
        color: '#FFFFFF',
    },
    headerContainer: {
        marginBottom: 20,
        position: 'relative',
    },
    coverImage: {
        width: '100%',
        height: 200,
        position: 'absolute',
        top: 0,
        left: 0,
    },
    coverGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 200,
    },
    headerContent: {
        alignItems: 'center',
        paddingTop: 120,
        paddingHorizontal: spacing.xl,
    },
    settingsButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        padding: 10,
        zIndex: 10,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 20,
    },
    profileInfo: {
        alignItems: 'center',
        width: '100%',
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 15,
    },

    editAvatarButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#E4C66D',
        width: 30,
        height: 30,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#0D0C1D',
    },
    name: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 24,
        color: '#FFFFFF',
        marginBottom: 5,
    },
    username: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.6)',
        marginBottom: 15,
    },
    bio: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center',
        lineHeight: 20,
        paddingHorizontal: 20,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 20,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        marginBottom: 25,
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 20,
        color: '#FFFFFF',
        marginBottom: 5,
    },
    statLabel: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.5)',
    },
    section: {
        paddingHorizontal: spacing.xl,
        marginBottom: 25,
    },
    combinedSection: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        marginHorizontal: spacing.lg,
        borderRadius: 20,
        padding: spacing.lg,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    subSection: {
        marginBottom: spacing.md,
    },
    subSectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    subSectionTitle: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 16,
        color: '#FFFFFF',
        marginBottom: spacing.sm,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    sectionTitle: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 18,
        color: '#FFFFFF',
        marginBottom: 15,
    },
    seeAllText: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 12,
        color: '#E4C66D',
    },
    interestsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    interestChip: {
        backgroundColor: 'rgba(228, 198, 109, 0.2)',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: 'rgba(228, 198, 109, 0.3)',
    },
    interestText: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 11,
        color: '#E4C66D',
    },
    moreChip: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    moreText: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 11,
        color: 'rgba(255, 255, 255, 0.7)',
    },
    galleryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    galleryItem: {
        width: (width - 40 - 20) / 3,
        height: 100,
        borderRadius: 15,
        overflow: 'hidden',
    },
    galleryGradient: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    galleryMood: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 12,
        color: '#FFFFFF',
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    // Compact gallery styles
    compactGalleryGrid: {
        flexDirection: 'row',
        gap: 8,
    },
    compactGalleryItem: {
        flex: 1,
        height: 60,
        borderRadius: 12,
        overflow: 'hidden',
    },
    compactGalleryGradient: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    compactGalleryMood: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 10,
        color: '#FFFFFF',
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    premiumBanner: {
        marginHorizontal: spacing.xl,
        marginBottom: 30,
        borderRadius: 20,
        overflow: 'hidden',
    },
    premiumGradient: {
        padding: 20,
    },
    premiumContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    premiumTextContainer: {
        flex: 1,
        marginLeft: 15,
    },
    premiumTitle: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 16,
        color: '#0D0C1D',
        marginBottom: 2,
    },
    premiumSubtitle: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 10,
        color: 'rgba(13, 12, 29, 0.7)',
    },
});
