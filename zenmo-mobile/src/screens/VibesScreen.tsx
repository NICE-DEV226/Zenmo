import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { spacing } from '../theme/spacing';
import { Avatar } from '../components';
import api from '../services/api';

interface Vibe {
    _id: string;
    user: {
        _id: string;
        username: string;
        avatarUrl?: string;
    };
    type: 'mood' | 'question' | 'confession';
    content: string;
    city?: string;
    likes: number;
    isLiked: boolean;
    createdAt: string;
}

const VibeCard = ({ item, onLike }: { item: Vibe; onLike: (id: string) => void }) => {
    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'mood': return '😊 Humeur';
            case 'question': return '❓ Question';
            case 'confession': return '🤫 Confession';
            default: return type;
        }
    };

    const getGradient = (type: string) => {
        switch (type) {
            case 'mood': return ['rgba(123, 97, 255, 0.2)', 'rgba(51, 209, 196, 0.2)'];
            case 'question': return ['rgba(255, 107, 107, 0.2)', 'rgba(255, 217, 61, 0.2)'];
            case 'confession': return ['rgba(228, 198, 109, 0.2)', 'rgba(255, 107, 107, 0.2)'];
            default: return ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)'];
        }
    };

    const navigation = useNavigation();

    return (
        <LinearGradient
            colors={getGradient(item.type) as any}
            style={styles.vibeCard}
        >
            <View style={styles.vibeHeader}>
                <TouchableOpacity
                    style={styles.userInfoContainer}
                    onPress={() => {
                        // @ts-ignore
                        navigation.navigate('UserProfile', { userId: item.user._id });
                    }}
                >
                    <Avatar
                        uri={item.user.avatarUrl}
                        size={40}
                    />
                    <View style={styles.userInfo}>
                        <Text style={styles.username}>{item.user.username}</Text>
                        <Text style={styles.vibeType}>{getTypeLabel(item.type)} • {item.city || 'Ouaga'}</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity>
                    <Ionicons name="ellipsis-horizontal" size={20} color="rgba(255,255,255,0.6)" />
                </TouchableOpacity>
            </View>

            <Text style={styles.content}>{item.content}</Text>

            <View style={styles.actions}>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => onLike(item._id)}
                >
                    <Ionicons
                        name={item.isLiked ? "heart" : "heart-outline"}
                        size={22}
                        color={item.isLiked ? "#FF6B6B" : "#FFFFFF"}
                    />
                    <Text style={styles.actionText}>{item.likes}</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => {
                        // @ts-ignore
                        navigation.navigate('Comments', { vibeId: item._id });
                    }}
                >
                    <Ionicons name="chatbubble-outline" size={20} color="#FFFFFF" />
                    <Text style={styles.actionText}>Répondre</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="paper-plane-outline" size={20} color="#FFFFFF" />
                </TouchableOpacity>
            </View>
        </LinearGradient>
    );
};

export const VibesScreen = () => {
    const [vibes, setVibes] = useState<Vibe[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedCity, setSelectedCity] = useState<string | null>(null);

    const cities = ['Toutes', 'Ouaga', 'Bobo', 'Koudougou', 'Ouahigouya'];

    const fetchVibes = async () => {
        try {
            const params = selectedCity && selectedCity !== 'Toutes'
                ? { city: selectedCity }
                : {};

            const response = await api.get('/vibes', { params });
            setVibes(response.data);
        } catch (error) {
            console.error('Error fetching vibes:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchVibes();
    }, [selectedCity]);

    const handleLike = async (vibeId: string) => {
        try {
            await api.post(`/vibes/${vibeId}/like`);
            setVibes(prev => prev.map(v =>
                v._id === vibeId
                    ? { ...v, isLiked: !v.isLiked, likes: v.isLiked ? v.likes - 1 : v.likes + 1 }
                    : v
            ));
        } catch (error) {
            console.error('Error liking vibe:', error);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchVibes();
    };

    return (
        <LinearGradient colors={['#0D0C1D', '#1A1A2E']} style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Vibes 🌍</Text>
            </View>

            {/* City Filter */}
            <View style={styles.filterContainer}>
                <FlatList
                    data={cities}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[
                                styles.filterChip,
                                (selectedCity === item || (item === 'Toutes' && !selectedCity)) && styles.filterChipActive
                            ]}
                            onPress={() => setSelectedCity(item === 'Toutes' ? null : item)}
                        >
                            <Text style={[
                                styles.filterText,
                                (selectedCity === item || (item === 'Toutes' && !selectedCity)) && styles.filterTextActive
                            ]}>
                                {item}
                            </Text>
                        </TouchableOpacity>
                    )}
                    contentContainerStyle={styles.filterList}
                />
            </View>

            {/* Vibes Feed */}
            <FlatList
                data={vibes}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => <VibeCard item={item} onLike={handleLike} />}
                contentContainerStyle={styles.list}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#E4C66D" />
                }
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Ionicons name="planet-outline" size={80} color="rgba(255,255,255,0.2)" />
                        <Text style={styles.emptyText}>Aucune vibe pour le moment</Text>
                        <Text style={styles.emptySubtext}>Sois le premier à partager ta vibe !</Text>
                    </View>
                }
            />
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: spacing.xl,
        paddingBottom: 20,
    },
    title: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 28,
        color: '#FFFFFF',
    },
    filterContainer: {
        marginBottom: 15,
    },
    filterList: {
        paddingHorizontal: spacing.xl,
        gap: 10,
    },
    filterChip: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    filterChipActive: {
        backgroundColor: '#E4C66D',
        borderColor: '#E4C66D',
    },
    filterText: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.7)',
    },
    filterTextActive: {
        color: '#0D0C1D',
    },
    list: {
        paddingHorizontal: spacing.xl,
        paddingBottom: 100,
    },
    vibeCard: {
        borderRadius: 20,
        padding: 20,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    vibeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    avatar: {
        marginRight: 12,
    },
    userInfoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    userInfo: {
        flex: 1,
    },
    username: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 14,
        color: '#FFFFFF',
        marginBottom: 2,
    },
    vibeType: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.6)',
    },
    content: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 16,
        color: '#FFFFFF',
        lineHeight: 24,
        marginBottom: 15,
    },
    actions: {
        flexDirection: 'row',
        gap: 20,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    actionText: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.7)',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 18,
        color: 'rgba(255, 255, 255, 0.6)',
        marginTop: 20,
    },
    emptySubtext: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.4)',
        marginTop: 8,
    },
});
