import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { spacing } from '../theme/spacing';
import { Avatar } from '../components';

// Mock Data
const CONVERSATIONS = [
    {
        id: '1',
        user: 'Sarah K.',
        avatar: null,
        lastMessage: 'Tu viens ce soir ? 🎉',
        time: '14:30',
        unread: 2,
        isOnline: true,
    },
    {
        id: '2',
        user: 'Marc D.',
        avatar: null,
        lastMessage: 'J\'ai adoré la vibe !',
        time: 'Hier',
        unread: 0,
        isOnline: false,
    },
    {
        id: '3',
        user: 'Team Zenmo',
        avatar: null,
        lastMessage: 'Bienvenue sur Zenmo ! 🚀',
        time: 'Lun',
        unread: 0,
        isOnline: true,
    },
];

const ChatItem = ({ item, onPress }: { item: any, onPress: () => void }) => (
    <TouchableOpacity style={styles.chatItem} onPress={onPress} activeOpacity={0.7}>
        <View style={styles.avatarContainer}>
            <Avatar uri={item.avatar} size={50} />
            {item.isOnline && <View style={styles.onlineBadge} />}
        </View>
        <View style={styles.chatContent}>
            <View style={styles.chatHeader}>
                <Text style={styles.userName}>{item.user}</Text>
                <Text style={styles.time}>{item.time}</Text>
            </View>
            <View style={styles.messageContainer}>
                <Text style={[styles.lastMessage, item.unread > 0 && styles.unreadMessage]} numberOfLines={1}>
                    {item.lastMessage}
                </Text>
                {item.unread > 0 && (
                    <View style={styles.unreadBadge}>
                        <Text style={styles.unreadText}>{item.unread}</Text>
                    </View>
                )}
            </View>
        </View>
    </TouchableOpacity>
);

export const ChatListScreen = () => {
    const navigation = useNavigation();

    const handlePress = (item: any) => {
        // @ts-ignore
        navigation.navigate('ChatDetail', { user: item });
    };

    return (
        <LinearGradient colors={['#0D0C1D', '#1A1A2E']} style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Messages</Text>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                    <TouchableOpacity style={styles.newChatButton} onPress={() => alert('New Group feature coming soon!')}>
                        <Ionicons name="people-outline" size={24} color="#E4C66D" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.newChatButton} onPress={() => alert('New Chat feature coming soon!')}>
                        <Ionicons name="create-outline" size={24} color="#E4C66D" />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <Ionicons name="search" size={20} color="rgba(255,255,255,0.5)" />
                    <TextInput
                        placeholder="Rechercher..."
                        placeholderTextColor="rgba(255,255,255,0.5)"
                        style={styles.searchInput}
                    />
                </View>
            </View>

            <FlatList
                data={CONVERSATIONS}
                renderItem={({ item }) => <ChatItem item={item} onPress={() => handlePress(item)} />}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
            />
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 60,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.xl,
        marginBottom: 20,
    },
    title: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 28,
        color: '#FFFFFF',
    },
    newChatButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(228, 198, 109, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    searchContainer: {
        paddingHorizontal: spacing.xl,
        marginBottom: 20,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 15,
        paddingHorizontal: 15,
        height: 50,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        color: '#FFFFFF',
        fontFamily: 'PottaOne-Regular',
        fontSize: 14,
    },
    listContent: {
        paddingHorizontal: spacing.xl,
    },
    chatItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        padding: 15,
        borderRadius: 20,
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 15,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    onlineBadge: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#33D1C4',
        borderWidth: 2,
        borderColor: '#0D0C1D',
    },
    chatContent: {
        flex: 1,
    },
    chatHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    userName: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 16,
        color: '#FFFFFF',
    },
    time: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.5)',
    },
    messageContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    lastMessage: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.6)',
        flex: 1,
        marginRight: 10,
    },
    unreadMessage: {
        color: '#FFFFFF',
    },
    unreadBadge: {
        backgroundColor: '#7B61FF',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    unreadText: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 10,
        color: '#FFFFFF',
    },
});
