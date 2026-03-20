import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, Dimensions, ActivityIndicator, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { spacing } from '../theme/spacing';
import { Avatar } from '../components';
import api from '../services/api';
// import { setExternalUserId } from '../services/OneSignalService'; // Disabled for Expo Go

const { width } = Dimensions.get('window');

const StoryItem = React.memo(({ item, index }: { item: any, index: number }) => {
    const navigation = useNavigation();
    return (
        <TouchableOpacity
            style={styles.storyContainer}
            onPress={() => {
                // @ts-ignore
                navigation.navigate('StoryViewer', { initialStoryIndex: index });
            }}
            activeOpacity={0.7}
        >
            <View style={[styles.storyBorder, item.isMe && styles.myStoryBorder]}>
                <Avatar uri={item.image} size={58} showBorder={false} />
                {item.isMe && (
                    <View style={styles.addStoryBadge}>
                        <Ionicons name="add" size={12} color="#FFFFFF" />
                    </View>
                )}
            </View>
            <Text style={styles.storyName} numberOfLines={1}>{item.name}</Text>
        </TouchableOpacity>
    );
});

// SearchBar Component
const SearchBar = React.memo(() => {
    const navigation = useNavigation();
    return (
        <TouchableOpacity
            style={styles.searchBar}
            onPress={() => {
                // @ts-ignore
                navigation.navigate('Search');
            }}
            activeOpacity={0.7}
        >
            <Ionicons name="search" size={20} color="rgba(255,255,255,0.6)" />
            <Text style={styles.searchPlaceholder}>Rechercher vibes, amis, villes...</Text>
        </TouchableOpacity>
    );
});

// Community Card Component
const CommunityCard = React.memo(({ item }: { item: any }) => {
    return (
        <TouchableOpacity style={styles.communityCard} activeOpacity={0.7}>
            <LinearGradient
                colors={item.gradient || ['rgba(123, 97, 255, 0.3)', 'rgba(51, 209, 196, 0.3)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.communityGradient}
            >
                <Ionicons name={item.icon} size={24} color="#FFFFFF" />
                <Text style={styles.communityName} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.communityMembers}>{item.members} membres</Text>
            </LinearGradient>
        </TouchableOpacity>
    );
});

// Vibe Card Component
const VibeCard = React.memo(({ item, onLike, onComment }: { item: any; onLike: (vibeId: string) => void; onComment: (vibeId: string) => void }) => {
    const navigation = useNavigation();
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(item.likes || 0);

    const handleUserPress = () => {
        if (item.userId?._id) {
            // @ts-ignore
            navigation.navigate('UserProfile', { userId: item.userId._id });
        }
    };

    const handleLike = async () => {
        try {
            if (isLiked) {
                // Unlike
                await api.post(`/vibes/${item._id}/unlike`);
                setIsLiked(false);
                setLikeCount(prev => Math.max(0, prev - 1));
            } else {
                // Like
                await api.post(`/vibes/${item._id}/like`);
                setIsLiked(true);
                setLikeCount(prev => prev + 1);
            }
            onLike(item._id);
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    };

    const handleComment = () => {
        onComment(item._id);
        // Navigate to vibe detail or open comment modal
        // @ts-ignore
        navigation.navigate('VibeDetail', { vibeId: item._id });
    };

    return (
        <View style={styles.vibeCard}>
            <View style={styles.vibeHeader}>
                <TouchableOpacity onPress={handleUserPress} activeOpacity={0.7}>
                    <Avatar uri={item.userId?.avatarUrl} size={40} style={styles.vibeAvatar} />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleUserPress} style={styles.vibeUserInfo} activeOpacity={0.7}>
                    <Text style={styles.vibeUser}>{item.userId?.username || 'Utilisateur'}</Text>
                    <Text style={styles.vibeTime}>{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {item.type}</Text>
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={0.7}>
                    <Ionicons name="ellipsis-horizontal" size={20} color="rgba(255,255,255,0.6)" />
                </TouchableOpacity>
            </View>
            <Text style={styles.vibeContent}>{item.text}</Text>
            <View style={styles.vibeActions}>
                <TouchableOpacity style={styles.vibeAction} activeOpacity={0.7} onPress={handleLike}>
                    <Ionicons
                        name={isLiked ? "heart" : "heart-outline"}
                        size={20}
                        color={isLiked ? "#FF6B9D" : "#FFFFFF"}
                    />
                    <Text style={styles.vibeActionText}>{likeCount}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.vibeAction} activeOpacity={0.7} onPress={handleComment}>
                    <Ionicons name="chatbubble-outline" size={20} color="#FFFFFF" />
                    <Text style={styles.vibeActionText}>{item.comments || 0}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.vibeAction} activeOpacity={0.7}>
                    <Ionicons name="share-social-outline" size={20} color="#FFFFFF" />
                </TouchableOpacity>
            </View>
        </View>
    );
});



export const HomeScreen = () => {
    const navigation = useNavigation();
    const [vibes, setVibes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [stories, setStories] = useState<any[]>([]);

    // Mock communities data
    // Mock Communities with location tags
    const allCommunities = [
        { id: '1', name: 'Tech BF Devs', icon: 'code-slash', members: '2.3k', gradient: ['rgba(123, 97, 255, 0.3)', 'rgba(51, 209, 196, 0.3)'], city: 'Ouagadougou', country: 'BF' },
        { id: '2', name: 'Confessions Ouaga', icon: 'chatbox-ellipses', members: '8.5k', gradient: ['rgba(255, 107, 107, 0.3)', 'rgba(255, 217, 61, 0.3)'], city: 'Ouagadougou', country: 'BF' },
        { id: '3', name: 'Mode & Style Africa', icon: 'sparkles', members: '4.2k', gradient: ['rgba(228, 198, 109, 0.3)', 'rgba(255, 107, 107, 0.3)'], country: 'BF' },
        { id: '4', name: 'MEMES Africa', icon: 'happy', members: '12k', gradient: ['rgba(51, 209, 196, 0.3)', 'rgba(123, 97, 255, 0.3)'] }, // Global
        { id: '5', name: 'Abidjan By Night', icon: 'moon', members: '5.1k', gradient: ['#FF9966', '#FF5E62'], city: 'Abidjan', country: 'CI' },
        { id: '6', name: 'Dakar Tech', icon: 'laptop', members: '1.8k', gradient: ['#00F260', '#0575E6'], city: 'Dakar', country: 'SN' },
    ];

    const [filteredCommunities, setFilteredCommunities] = useState(allCommunities);



    useEffect(() => {
        if (user) {
            const city = user.city;
            const country = user.countryCode;

            // 1. Local: Matches City (if city exists)
            const local = city ? allCommunities.filter(c => c.city === city) : [];

            // 2. National: Matches Country, NOT City (if country exists)
            const national = country ? allCommunities.filter(c => c.country === country && c.city !== city) : [];

            // 3. Global: No specific city or country
            const global = allCommunities.filter(c => !c.city && !c.country);

            // 4. Others: Everything else that hasn't been included
            // We use a Set to track IDs included so far to avoid ANY duplicates
            const includedIds = new Set([...local, ...national, ...global].map(c => c.id));
            const others = allCommunities.filter(c => !includedIds.has(c.id));

            setFilteredCommunities([...local, ...national, ...global, ...others]);
        } else {
            // If no user loaded yet, show all (or just global)
            setFilteredCommunities(allCommunities);
        }
    }, [user]);

    const loadUserAndVibes = useCallback(async () => {
        try {
            // Vérifier si l'utilisateur a des tokens valides
            const accessToken = await AsyncStorage.getItem('accessToken');
            const refreshToken = await AsyncStorage.getItem('refreshToken');

            if (!accessToken && !refreshToken) {
                console.log('🔴 No authentication tokens found, redirecting to login...');
                // @ts-ignore
                navigation.reset({ index: 0, routes: [{ name: 'Splash' }] });
                return;
            }

            const userJson = await AsyncStorage.getItem('userProfile');
            if (userJson) {
                setUser(JSON.parse(userJson));
            }

            const profileResponse = await api.get('/users/me/profile');
            const userData = profileResponse.data;
            setUser(userData);
            await AsyncStorage.setItem('userProfile', JSON.stringify(userData));

            // 🔔 Link User to OneSignal
            if (userData._id) {
                setExternalUserId(userData._id);
            }

            // 🎯 USE INTELLIGENT FEED - Core Zenmo Feature
            const feedResponse = await api.get('/vibes/feed', {
                params: { limit: 20 }
            });
            let feedVibes = feedResponse.data.vibes || feedResponse.data;

            // 🎭 Add mock vibes for testing if feed is empty or small
            if (feedVibes.length < 3) {
                const mockVibes = [
                    {
                        _id: 'mock1',
                        userId: {
                            _id: 'mockUser1',
                            username: 'sarah_bf',
                            avatarUrl: null
                        },
                        text: 'Première journée à Ouaga 🌞 Cette ville est incroyable !',
                        type: 'thought',
                        likes: 12,
                        comments: 3,
                        views: 45,
                        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2h ago
                        likedBy: []
                    },
                    {
                        _id: 'mock2',
                        userId: {
                            _id: 'mockUser2',
                            username: 'marc_tech',
                            avatarUrl: null
                        },
                        text: 'Quelqu\'un connaît un bon resto à Ouaga 2000 ? 🍽️',
                        type: 'question',
                        likes: 8,
                        comments: 15,
                        views: 67,
                        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4h ago
                        likedBy: []
                    },
                    {
                        _id: 'mock3',
                        userId: {
                            _id: 'mockUser3',
                            username: 'lea_mode',
                            avatarUrl: null
                        },
                        text: 'Le coucher de soleil sur le lac 🌅 C\'est magique ✨',
                        type: 'moment',
                        likes: 24,
                        comments: 7,
                        views: 89,
                        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6h ago
                        likedBy: []
                    },
                ];
                feedVibes = [...mockVibes, ...feedVibes];
            }

            setVibes(feedVibes);

            // Load stories from API
            try {
                const storiesResponse = await api.get('/stories', {
                    params: { city: userData.city || 'Ouagadougou' }
                });
                if (storiesResponse.data && storiesResponse.data.length > 0) {
                    setStories(storiesResponse.data);
                }
            } catch (storiesError) {
                console.log('Stories not available, using default');
            }
        } catch (error: any) {
            if (error.response?.status === 401) {
                console.log('🔴 Authentication expired, redirecting to login...');
                await AsyncStorage.clear();
                // @ts-ignore
                navigation.reset({ index: 0, routes: [{ name: 'Splash' }] });
            } else {
                console.error('Error loading feed:', error);
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [navigation]);

    useEffect(() => {
        loadUserAndVibes();
    }, [loadUserAndVibes]);

    // Recharger les données utilisateur quand l'écran devient actif
    useFocusEffect(
        useCallback(() => {
            const refreshUserData = async () => {
                try {
                    const userJson = await AsyncStorage.getItem('userProfile');
                    if (userJson) {
                        const userData = JSON.parse(userJson);
                        setUser(userData);
                        console.log('🔄 User data refreshed on focus:', userData.avatarUrl ? `Has avatar: ${userData.avatarUrl.substring(0, 50)}...` : 'No avatar');
                    }
                } catch (error) {
                    console.error('Error refreshing user data:', error);
                }
            };

            refreshUserData();
        }, [])
    );

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadUserAndVibes();
    }, [loadUserAndVibes]);

    if (loading && !refreshing) {
        return (
            <LinearGradient colors={['#0D0C1D', '#1A1A2E']} style={styles.container}>
                <ActivityIndicator size="large" color="#E4C66D" style={{ marginTop: 100 }} />
            </LinearGradient>
        );
    }

    // Dynamic stories with user's real avatar + API stories
    const dynamicStories = [
        { id: '1', name: 'Ma Vibe', image: user?.avatarUrl, isMe: true },
        ...stories.map((story: any, index: number) => ({
            id: story._id || `story-${index}`,
            name: story.userId?.username || 'User',
            image: story.userId?.avatarUrl || null,
            isMe: false
        }))
    ];

    return (
        <LinearGradient colors={['#0D0C1D', '#1A1A2E']} style={styles.container}>
            <View style={styles.fixedHeader}>
                <View style={{ pointerEvents: 'auto' }}>
                    <Text style={styles.greeting}>Hello, {user?.username || 'Zenmo'} 👋</Text>
                    <Text style={styles.subtitle}>Quelle est ta vibe ?</Text>
                </View>
                <TouchableOpacity
                    style={[styles.profileButton, { pointerEvents: 'auto' }]}
                    onPress={() => navigation.navigate('Profile' as never)}
                    activeOpacity={0.7}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    delayPressIn={0}
                    onLongPress={() => {
                        // Debug: Recharger les données utilisateur
                        console.log('🔄 Force refreshing user data...');
                        loadUserAndVibes();
                    }}
                >
                    <Avatar uri={user?.avatarUrl} size={44} borderWidth={2} borderColor="rgba(255, 255, 255, 0.2)" />
                    <View style={styles.onlineBadge} />
                </TouchableOpacity>
            </View>

            <FlatList
                data={vibes}
                renderItem={({ item }) => (
                    <View style={{ paddingHorizontal: spacing.xl }}>
                        <VibeCard
                            item={item}
                            onLike={(vibeId) => {
                                console.log('Liked vibe:', vibeId);
                                // Optionally refresh feed
                            }}
                            onComment={(vibeId) => {
                                console.log('Comment on vibe:', vibeId);
                            }}
                        />
                    </View>
                )}
                keyExtractor={(item: any) => item._id}
                ListHeaderComponent={() => (
                    <>
                        {/* Search Bar */}
                        <View style={{ paddingHorizontal: spacing.xl, marginBottom: 15 }}>
                            <SearchBar />
                        </View>

                        <View style={styles.storiesSection}>
                            <FlatList
                                data={dynamicStories.slice(0, 10)} // Max 10 stories
                                renderItem={({ item, index }) => <StoryItem item={item} index={index} />}
                                keyExtractor={(item) => item.id}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.storiesList}
                            />
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Vibe du jour ✨</Text>
                            <LinearGradient
                                colors={['rgba(123, 97, 255, 0.2)', 'rgba(51, 209, 196, 0.2)']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.dailyVibeCard}
                            >
                                <View style={styles.dailyVibeContent}>
                                    <Text style={styles.dailyVibeTitle}>Inspiration</Text>
                                    <Text style={styles.dailyVibeText}>"La seule limite à notre épanouissement de demain sera nos doutes d'aujourd'hui."</Text>
                                    <TouchableOpacity style={styles.dailyVibeButton} activeOpacity={0.7}>
                                        <Text style={styles.dailyVibeButtonText}>Partager ma vibe</Text>
                                    </TouchableOpacity>
                                </View>
                                <Ionicons name="sparkles" size={80} color="rgba(255,255,255,0.1)" style={styles.dailyVibeIcon} />
                            </LinearGradient>
                        </View>

                        {/* Communities Section */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>
                                {user?.city ? `Communautés à ${user.city} 📍` : 'Communautés 🌍'}
                            </Text>
                            <FlatList
                                data={filteredCommunities}
                                renderItem={({ item }) => <CommunityCard item={item} />}
                                keyExtractor={(item) => item.id}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.communitiesList}
                            />
                        </View>

                        <View style={[styles.section, { marginTop: 10 }]}>
                            <Text style={styles.sectionTitle}>Feed Intelligent 🎯</Text>
                        </View>
                    </>
                )}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#E4C66D" />}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyStateText}>Aucune vibe pour le moment dans ta zone.</Text>
                        <Text style={styles.emptyStateSubtext}>Sois le premier à poster !</Text>
                    </View>
                }
            />

            {/* Floating Action Button */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('CreateVibe' as never)}
                activeOpacity={0.8}
            >
                <LinearGradient
                    colors={['#667eea', '#764ba2']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.fabGradient}
                >
                    <Ionicons name="add" size={32} color="#FFFFFF" />
                </LinearGradient>
            </TouchableOpacity>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    fixedHeader: {
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: spacing.xl, paddingTop: 50, paddingBottom: 15,
        backgroundColor: 'rgba(13, 12, 29, 0.95)',
        borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.05)',
        pointerEvents: 'box-none',
    },
    listContent: { paddingTop: 125, paddingBottom: 100 },
    greeting: { fontFamily: 'PottaOne-Regular', fontSize: 24, color: '#FFFFFF' },
    subtitle: { fontFamily: 'PottaOne-Regular', fontSize: 14, color: 'rgba(255, 255, 255, 0.6)' },
    profileButton: { position: 'relative' },
    onlineBadge: { position: 'absolute', bottom: 0, right: 0, width: 12, height: 12, borderRadius: 6, backgroundColor: '#33D1C4', borderWidth: 2, borderColor: '#0D0C1D' },
    storiesSection: { marginBottom: 30 },
    storiesList: { paddingHorizontal: spacing.xl, gap: 15 },
    storyContainer: { alignItems: 'center', width: 70 },
    storyBorder: { width: 64, height: 64, borderRadius: 32, borderWidth: 2, borderColor: '#E4C66D', padding: 3, marginBottom: 5, alignItems: 'center', justifyContent: 'center' },
    myStoryBorder: { borderColor: 'rgba(255, 255, 255, 0.3)', borderStyle: 'dashed' },
    addStoryBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#E4C66D', width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#0D0C1D' },
    storyName: { fontFamily: 'PottaOne-Regular', fontSize: 12, color: '#FFFFFF', textAlign: 'center' },
    section: { paddingHorizontal: spacing.xl, marginBottom: 20 },
    sectionTitle: { fontFamily: 'PottaOne-Regular', fontSize: 20, color: '#FFFFFF', marginBottom: 15 },
    dailyVibeCard: { borderRadius: 20, padding: 20, position: 'relative', overflow: 'hidden' },
    dailyVibeContent: { zIndex: 1 },
    dailyVibeTitle: { fontFamily: 'PottaOne-Regular', fontSize: 16, color: '#E4C66D', marginBottom: 10 },
    dailyVibeText: { fontFamily: 'PottaOne-Regular', fontSize: 14, color: '#FFFFFF', lineHeight: 22, marginBottom: 15 },
    dailyVibeButton: { backgroundColor: 'rgba(228, 198, 109, 0.2)', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 15, alignSelf: 'flex-start', borderWidth: 1, borderColor: '#E4C66D' },
    dailyVibeButtonText: { fontFamily: 'PottaOne-Regular', fontSize: 14, color: '#E4C66D' },
    dailyVibeIcon: { position: 'absolute', right: -10, bottom: -10, opacity: 0.3 },
    vibeCard: { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 15, padding: 15, marginBottom: 15 },
    vibeHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    vibeAvatar: { marginRight: 10 },
    vibeUserInfo: { flex: 1 },
    vibeUser: { fontFamily: 'PottaOne-Regular', fontSize: 16, color: '#FFFFFF' },
    vibeTime: { fontFamily: 'PottaOne-Regular', fontSize: 12, color: 'rgba(255, 255, 255, 0.5)' },
    vibeContent: { fontFamily: 'PottaOne-Regular', fontSize: 14, color: '#FFFFFF', lineHeight: 20, marginBottom: 10 },
    vibeActions: { flexDirection: 'row', gap: 20 },
    vibeAction: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    vibeActionText: { fontFamily: 'PottaOne-Regular', fontSize: 12, color: 'rgba(255, 255, 255, 0.7)' },
    emptyState: { paddingVertical: 60, paddingHorizontal: 40, alignItems: 'center' },
    emptyStateText: { fontFamily: 'PottaOne-Regular', fontSize: 16, color: 'rgba(255, 255, 255, 0.6)', textAlign: 'center', marginBottom: 8 },
    emptyStateSubtext: { fontFamily: 'PottaOne-Regular', fontSize: 14, color: 'rgba(255, 255, 255, 0.4)', textAlign: 'center' },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
        paddingHorizontal: 15,
        paddingVertical: 8,
        gap: 10,
    },
    searchPlaceholder: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.6)',
        flex: 1,
    },
    communityCard: {
        width: 140,
        height: 120,
        marginRight: 15,
        borderRadius: 15,
        overflow: 'hidden',
    },
    communityGradient: {
        flex: 1,
        padding: 15,
        justifyContent: 'space-between',
    },
    communityName: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 13,
        color: '#FFFFFF',
        lineHeight: 16,
    },
    communityMembers: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 11,
        color: 'rgba(255, 255, 255, 0.7)',
    },
    communitiesList: {
        paddingRight: spacing.xl,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    seeAllText: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 12,
        color: '#E4C66D',
    },
    suggestionCard: {
        width: 200,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: 15,
        padding: 15,
        marginRight: 15,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    suggestionInfo: {
        flex: 1,
    },
    suggestionName: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 14,
        color: '#FFFFFF',
        marginBottom: 4,
    },
    suggestionMeta: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 10,
        color: 'rgba(255, 255, 255, 0.6)',
        lineHeight: 14,
    },
    followButton: {
        backgroundColor: '#E4C66D',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    followButtonText: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 11,
        color: '#0D0C1D',
        fontWeight: '600',
    },
    suggestionsList: {
        paddingRight: spacing.xl,
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        shadowColor: '#667eea',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 8,
        overflow: 'hidden',
    },
    fabGradient: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
