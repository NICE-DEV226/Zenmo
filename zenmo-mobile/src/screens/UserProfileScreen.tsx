import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, Alert, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { spacing, borderRadius, shadows } from '../theme/spacing';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { Avatar } from '../components';
import api from '../services/api';

interface UserProfile {
    _id: string;
    username: string;
    bio?: string;
    avatarUrl?: string;
    gender?: string;
    interests?: string[];
    countryCode?: string;
    followersCount?: number;
    followingCount?: number;
    isFollowing?: boolean;
}

export const UserProfileScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    // @ts-ignore
    const { userId } = route.params;

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [followLoading, setFollowLoading] = useState(false);
    
    // Animation pour le header
    const scrollY = useRef(new Animated.Value(0)).current;
    const headerOpacity = scrollY.interpolate({
        inputRange: [0, 100],
        outputRange: [0, 1],
        extrapolate: 'clamp',
    });
    const avatarScale = scrollY.interpolate({
        inputRange: [0, 150],
        outputRange: [1, 0.7],
        extrapolate: 'clamp',
    });
    const avatarTranslateY = scrollY.interpolate({
        inputRange: [0, 150],
        outputRange: [0, -20],
        extrapolate: 'clamp',
    });

    useEffect(() => {
        loadProfile();
    }, [userId]);

    const loadProfile = async () => {
        try {
            const response = await api.get(`/users/${userId}`);
            setProfile(response.data);
        } catch (error) {
            console.error('Error loading profile:', error);
            Alert.alert('Erreur', 'Impossible de charger le profil');
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    const handleFollow = async () => {
        if (!profile) return;
        setFollowLoading(true);
        try {
            if (profile.isFollowing) {
                await api.post(`/users/${userId}/unfollow`);
                setProfile(prev => prev ? ({ ...prev, isFollowing: false, followersCount: (prev.followersCount || 0) - 1 }) : null);
            } else {
                await api.post(`/users/${userId}/follow`);
                setProfile(prev => prev ? ({ ...prev, isFollowing: true, followersCount: (prev.followersCount || 0) + 1 }) : null);
            }
        } catch (error) {
            console.error('Error toggling follow:', error);
            Alert.alert('Erreur', 'Action impossible pour le moment');
        } finally {
            setFollowLoading(false);
        }
    };

    const handleMessage = async () => {
        try {
            // Créer ou récupérer la conversation
            const response = await api.post('/conversations', { participantId: userId });
            // @ts-ignore
            navigation.navigate('Chat', { conversationId: response.data._id });
        } catch (error) {
            console.error('Error starting chat:', error);
            Alert.alert('Erreur', 'Impossible de démarrer la conversation');
        }
    };

    if (loading) {
        return (
            <LinearGradient colors={colors.gradients.background} style={styles.container}>
                <ActivityIndicator size="large" color={colors.secondary.goldSoft} style={styles.loader} />
            </LinearGradient>
        );
    }

    if (!profile) return null;

    return (
        <LinearGradient colors={colors.gradients.background} style={styles.container}>
            {/* Header fixe avec animation */}
            <Animated.View style={[styles.fixedHeader, { opacity: headerOpacity }]}>
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBackButton}>
                        <Ionicons name="arrow-back" size={24} color={colors.secondary.creamWhite} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>@{profile.username}</Text>
                    <View style={styles.headerSpacer} />
                </View>
            </Animated.View>

            <Animated.ScrollView
                contentContainerStyle={styles.scrollContent}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: false }
                )}
                scrollEventThrottle={16}
                showsVerticalScrollIndicator={false}
            >
                {/* Profile Header */}
                <View style={styles.profileSection}>
                    <Animated.View 
                        style={[
                            styles.avatarContainer,
                            {
                                transform: [
                                    { scale: avatarScale },
                                    { translateY: avatarTranslateY }
                                ]
                            }
                        ]}
                    >
                        <Avatar
                            uri={profile.avatarUrl}
                            size={120}
                            borderWidth={4}
                            borderColor={colors.secondary.goldSoft}
                        />
                        <View style={styles.avatarBorder} />
                    </Animated.View>

                    <View style={styles.profileInfo}>
                        <Text style={styles.username}>@{profile.username}</Text>
                        {profile.countryCode && (
                            <View style={styles.locationContainer}>
                                <Ionicons name="location-outline" size={16} color={colors.secondary.goldSoft} />
                                <Text style={styles.location}>{profile.countryCode}</Text>
                            </View>
                        )}
                        {profile.bio && (
                            <Text style={styles.bio}>{profile.bio}</Text>
                        )}
                    </View>

                    {/* Stats */}
                    <View style={styles.statsCard}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{profile.followersCount || 0}</Text>
                            <Text style={styles.statLabel}>Abonnés</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{profile.followingCount || 0}</Text>
                            <Text style={styles.statLabel}>Abonnements</Text>
                        </View>
                    </View>

                    {/* Actions */}
                    <View style={styles.actionsContainer}>
                        <TouchableOpacity
                            style={[styles.followButton, profile.isFollowing && styles.followingButton]}
                            onPress={handleFollow}
                            disabled={followLoading}
                        >
                            {followLoading ? (
                                <ActivityIndicator size="small" color={profile.isFollowing ? colors.secondary.goldSoft : colors.primary.blueNight} />
                            ) : (
                                <>
                                    <Ionicons 
                                        name={profile.isFollowing ? "checkmark" : "person-add"} 
                                        size={20} 
                                        color={profile.isFollowing ? colors.secondary.goldSoft : colors.primary.blueNight} 
                                    />
                                    <Text style={[styles.followText, profile.isFollowing && styles.followingText]}>
                                        {profile.isFollowing ? 'Abonné' : "S'abonner"}
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.messageButton} onPress={handleMessage}>
                            <Ionicons name="chatbubble-ellipses-outline" size={20} color={colors.secondary.creamWhite} />
                            <Text style={styles.messageText}>Message</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Combined Info Card */}
                <View style={styles.contentCard}>
                    {/* Interests Section */}
                    {profile.interests && profile.interests.length > 0 && (
                        <View style={styles.cardSection}>
                            <View style={styles.cardHeader}>
                                <Ionicons name="heart-outline" size={18} color={colors.secondary.goldSoft} />
                                <Text style={styles.cardTitle}>Centres d'intérêt</Text>
                            </View>
                            <View style={styles.interestsContainer}>
                                {profile.interests.slice(0, 5).map((interest, index) => (
                                    <View key={index} style={styles.interestChip}>
                                        <Text style={styles.interestText}>{interest}</Text>
                                    </View>
                                ))}
                                {profile.interests.length > 5 && (
                                    <View style={styles.moreChip}>
                                        <Text style={styles.moreText}>+{profile.interests.length - 5}</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    )}

                    {/* Informations Section */}
                    {/* Informations Section */}
                    {(profile.gender || true) && (
                        <View style={styles.cardSection}>
                            <View style={styles.cardHeader}>
                                <Ionicons name="information-circle-outline" size={18} color={colors.secondary.goldSoft} />
                                <Text style={styles.cardTitle}>Informations</Text>
                            </View>
                            <View style={styles.infoContainer}>
                                {profile.gender && (
                                    <View style={styles.infoItem}>
                                        <Ionicons name="person-outline" size={16} color={colors.secondary.creamWhite} />
                                        <Text style={styles.infoText}>
                                            {profile.gender === 'male' ? 'Homme' : 'Femme'}
                                        </Text>
                                    </View>
                                )}
                                <View style={styles.infoItem}>
                                    <Ionicons name="calendar-outline" size={16} color={colors.secondary.creamWhite} />
                                    <Text style={styles.infoText}>Membre depuis peu</Text>
                                </View>
                            </View>
                        </View>
                    )}
                </View>

                <View style={styles.bottomSpacer} />
            </Animated.ScrollView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    
    // Header fixe
    fixedHeader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 100,
        backgroundColor: colors.primary.blueNight + 'CC',
        zIndex: 1000,
        ...shadows.medium,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 50,
        paddingHorizontal: spacing.lg,
        height: 50,
    },
    headerBackButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: borderRadius.full,
        backgroundColor: colors.glass.white10,
    },
    headerTitle: {
        flex: 1,
        textAlign: 'center',
        fontFamily: typography.fonts.primary,
        fontSize: typography.sizes.h3,
        color: colors.secondary.creamWhite,
        fontWeight: typography.weights.semibold,
    },
    headerSpacer: {
        width: 40,
    },

    // Contenu principal
    scrollContent: {
        paddingTop: 120,
        paddingBottom: 40,
    },
    profileSection: {
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.xl,
    },
    
    // Avatar avec animation
    avatarContainer: {
        position: 'relative',
        marginBottom: spacing.lg,
    },

    avatarBorder: {
        position: 'absolute',
        top: -4,
        left: -4,
        width: 128,
        height: 128,
        borderRadius: 64,
        borderWidth: 2,
        borderColor: colors.glass.white20,
    },

    // Informations profil
    profileInfo: {
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    username: {
        fontFamily: typography.fonts.primary,
        fontSize: typography.sizes.h1,
        color: colors.secondary.creamWhite,
        marginBottom: spacing.sm,
        fontWeight: typography.weights.bold,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    location: {
        fontFamily: typography.fonts.primary,
        fontSize: typography.sizes.bodySmall,
        color: colors.secondary.goldSoft,
        marginLeft: spacing.xs,
    },
    bio: {
        fontFamily: typography.fonts.primary,
        fontSize: typography.sizes.body,
        color: colors.secondary.creamWhite,
        textAlign: 'center',
        lineHeight: 22,
        opacity: 0.9,
        paddingHorizontal: spacing.md,
    },

    // Stats card
    statsCard: {
        flexDirection: 'row',
        backgroundColor: colors.glass.white10,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        marginBottom: spacing.lg,
        borderWidth: 1,
        borderColor: colors.glass.white20,
        ...shadows.medium,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statDivider: {
        width: 1,
        backgroundColor: colors.glass.white20,
        marginHorizontal: spacing.md,
    },
    statValue: {
        fontFamily: typography.fonts.primary,
        fontSize: typography.sizes.h2,
        color: colors.secondary.creamWhite,
        fontWeight: typography.weights.bold,
        marginBottom: spacing.xs,
    },
    statLabel: {
        fontFamily: typography.fonts.primary,
        fontSize: typography.sizes.caption,
        color: colors.secondary.creamWhite,
        opacity: 0.7,
    },

    // Actions
    actionsContainer: {
        flexDirection: 'row',
        gap: spacing.md,
        width: '100%',
    },
    followButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 50,
        backgroundColor: colors.secondary.goldSoft,
        borderRadius: borderRadius.lg,
        gap: spacing.sm,
        borderWidth: 2,
        borderColor: colors.secondary.goldSoft,
        ...shadows.medium,
    },
    followingButton: {
        backgroundColor: 'transparent',
        borderColor: colors.secondary.goldSoft,
    },
    followText: {
        fontFamily: typography.fonts.primary,
        fontSize: typography.sizes.body,
        color: colors.primary.blueNight,
        fontWeight: typography.weights.semibold,
    },
    followingText: {
        color: colors.secondary.goldSoft,
    },
    messageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 50,
        paddingHorizontal: spacing.lg,
        backgroundColor: colors.glass.white10,
        borderRadius: borderRadius.lg,
        gap: spacing.sm,
        borderWidth: 1,
        borderColor: colors.glass.white20,
        ...shadows.medium,
    },
    messageText: {
        fontFamily: typography.fonts.primary,
        fontSize: typography.sizes.body,
        color: colors.secondary.creamWhite,
        fontWeight: typography.weights.medium,
    },

    // Cards de contenu
    contentCard: {
        backgroundColor: colors.glass.white10,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginHorizontal: spacing.lg,
        marginBottom: spacing.lg,
        borderWidth: 1,
        borderColor: colors.glass.white20,
        ...shadows.medium,
    },
    cardSection: {
        marginBottom: spacing.md,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    cardTitle: {
        fontFamily: typography.fonts.primary,
        fontSize: typography.sizes.body,
        color: colors.secondary.creamWhite,
        marginLeft: spacing.sm,
        fontWeight: typography.weights.semibold,
    },

    // Intérêts
    interestsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.xs,
    },
    interestChip: {
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.sm,
        borderRadius: borderRadius.md,
        backgroundColor: colors.secondary.goldSoft + '20',
        borderWidth: 1,
        borderColor: colors.secondary.goldSoft + '40',
    },
    interestText: {
        fontFamily: typography.fonts.primary,
        fontSize: typography.sizes.caption,
        color: colors.secondary.goldSoft,
        fontWeight: typography.weights.medium,
    },
    moreChip: {
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.sm,
        borderRadius: borderRadius.md,
        backgroundColor: colors.glass.white20,
        borderWidth: 1,
        borderColor: colors.glass.white20,
    },
    moreText: {
        fontFamily: typography.fonts.primary,
        fontSize: typography.sizes.caption,
        color: colors.secondary.creamWhite,
        fontWeight: typography.weights.medium,
        opacity: 0.7,
    },

    // Informations
    infoContainer: {
        gap: spacing.sm,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    infoText: {
        fontFamily: typography.fonts.primary,
        fontSize: typography.sizes.bodySmall,
        color: colors.secondary.creamWhite,
        opacity: 0.8,
    },

    bottomSpacer: {
        height: 40,
    },
});

export default UserProfileScreen;
