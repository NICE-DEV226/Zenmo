import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { spacing } from '../theme/spacing';
import { Avatar } from '../components';
import api from '../services/api';

export const SearchScreen = () => {
    const navigation = useNavigation();
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'users' | 'vibes' | 'cities'>('users');

    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        if (query.length < 2) {
            setResults([]);
            return;
        }

        setLoading(true);
        try {
            if (activeTab === 'users') {
                const response = await api.get('/users/search', {
                    params: { query }
                });
                setResults(response.data);
            } else if (activeTab === 'vibes') {
                const response = await api.get('/vibes', {
                    params: { search: query }
                });
                setResults(response.data);
            }
        } catch (error) {
            console.error('Search error:', error);
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    const renderUserItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.resultItem}
            onPress={() => {
                // @ts-ignore
                navigation.navigate('UserProfile', { userId: item._id });
            }}
        >
            <Avatar uri={item.avatarUrl} size={48} />
            <View style={styles.resultInfo}>
                <Text style={styles.resultName}>{item.username}</Text>
                <Text style={styles.resultBio} numberOfLines={1}>{item.bio || item.city}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.4)" />
        </TouchableOpacity>
    );

    const renderVibeItem = ({ item }: { item: any }) => (
        <TouchableOpacity style={styles.resultItem}>
            <View style={styles.vibeIcon}>
                <Ionicons name="sparkles" size={24} color="#E4C66D" />
            </View>
            <View style={styles.resultInfo}>
                <Text style={styles.resultName}>{item.userId?.username}</Text>
                <Text style={styles.resultBio} numberOfLines={2}>{item.text}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <LinearGradient colors={['#0D0C1D', '#1A1A2E']} style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <View style={styles.searchInputContainer}>
                    <Ionicons name="search" size={20} color="rgba(255,255,255,0.6)" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Rechercher..."
                        placeholderTextColor="rgba(255,255,255,0.5)"
                        value={searchQuery}
                        onChangeText={handleSearch}
                        autoFocus
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={20} color="rgba(255,255,255,0.6)" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Tabs */}
            <View style={styles.tabs}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'users' && styles.activeTab]}
                    onPress={() => setActiveTab('users')}
                >
                    <Text style={[styles.tabText, activeTab === 'users' && styles.activeTabText]}>
                        Utilisateurs
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'vibes' && styles.activeTab]}
                    onPress={() => setActiveTab('vibes')}
                >
                    <Text style={[styles.tabText, activeTab === 'vibes' && styles.activeTabText]}>
                        Vibes
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'cities' && styles.activeTab]}
                    onPress={() => setActiveTab('cities')}
                >
                    <Text style={[styles.tabText, activeTab === 'cities' && styles.activeTabText]}>
                        Villes
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Results */}
            {loading ? (
                <ActivityIndicator size="large" color="#E4C66D" style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={results}
                    renderItem={activeTab === 'users' ? renderUserItem : renderVibeItem}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.resultsList}
                    ListEmptyComponent={
                        searchQuery.length >= 2 ? (
                            <View style={styles.emptyState}>
                                <Ionicons name="search-outline" size={64} color="rgba(255,255,255,0.2)" />
                                <Text style={styles.emptyText}>Aucun résultat trouvé</Text>
                            </View>
                        ) : (
                            <View style={styles.emptyState}>
                                <Ionicons name="compass-outline" size={64} color="rgba(255,255,255,0.2)" />
                                <Text style={styles.emptyText}>Recherchez des vibes, amis ou villes</Text>
                            </View>
                        )
                    }
                />
            )}
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingTop: 50,
        paddingBottom: 15,
        gap: 10,
    },
    backButton: {
        padding: 5,
    },
    searchInputContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
        paddingHorizontal: 15,
        gap: 10,
    },
    searchInput: {
        flex: 1,
        fontFamily: 'PottaOne-Regular',
        fontSize: 16,
        color: '#FFFFFF',
        paddingVertical: 10,
    },
    tabs: {
        flexDirection: 'row',
        paddingHorizontal: spacing.lg,
        marginBottom: 20,
        gap: 10,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: '#E4C66D',
    },
    tabText: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.5)',
    },
    activeTabText: {
        color: '#E4C66D',
    },
    resultsList: {
        paddingHorizontal: spacing.lg,
    },
    resultItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 12,
        padding: 15,
        marginBottom: 10,
        gap: 12,
    },
    vibeIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(228, 198, 109, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    resultInfo: {
        flex: 1,
    },
    resultName: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 16,
        color: '#FFFFFF',
        marginBottom: 4,
    },
    resultBio: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.6)',
    },
    emptyState: {
        alignItems: 'center',
        paddingTop: 100,
    },
    emptyText: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.4)',
        marginTop: 20,
    },
});

export default SearchScreen;
