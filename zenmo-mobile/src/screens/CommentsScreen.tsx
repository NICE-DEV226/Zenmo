import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { spacing } from '../theme/spacing';
import { Avatar } from '../components';
import api from '../services/api';

interface Comment {
    _id: string;
    content: string;
    user: {
        _id: string;
        username: string;
        avatarUrl?: string;
    };
    createdAt: string;
}

export const CommentsScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    // @ts-ignore
    const { vibeId } = route.params;

    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    useEffect(() => {
        loadComments();
    }, [vibeId]);

    const loadComments = async () => {
        try {
            const response = await api.get(`/vibes/${vibeId}/comments`);
            setComments(response.data);
        } catch (error) {
            console.error('Error loading comments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async () => {
        if (!newComment.trim()) return;

        setSending(true);
        try {
            const response = await api.post(`/vibes/${vibeId}/comments`, {
                content: newComment.trim()
            });
            setComments([...comments, response.data]);
            setNewComment('');
        } catch (error) {
            console.error('Error sending comment:', error);
        } finally {
            setSending(false);
        }
    };

    const renderComment = ({ item }: { item: Comment }) => (
        <View style={styles.commentItem}>
            <Avatar
                uri={item.user.avatarUrl}
                size={40}
                style={styles.avatar}
            />
            <View style={styles.commentContent}>
                <Text style={styles.username}>{item.user.username}</Text>
                <Text style={styles.text}>{item.content}</Text>
                <Text style={styles.time}>{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
            </View>
        </View>
    );

    return (
        <LinearGradient colors={['#0D0C1D', '#1A1A2E']} style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.title}>Commentaires</Text>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#E4C66D" style={styles.loader} />
            ) : (
                <FlatList
                    data={comments}
                    renderItem={renderComment}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>Aucun commentaire pour le moment.</Text>
                            <Text style={styles.emptySubtext}>Sois le premier à réagir !</Text>
                        </View>
                    }
                />
            )}

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
            >
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Ajouter un commentaire..."
                        placeholderTextColor="rgba(255,255,255,0.5)"
                        value={newComment}
                        onChangeText={setNewComment}
                        multiline
                    />
                    <TouchableOpacity
                        style={[styles.sendButton, !newComment.trim() && styles.sendButtonDisabled]}
                        onPress={handleSend}
                        disabled={!newComment.trim() || sending}
                    >
                        {sending ? (
                            <ActivityIndicator size="small" color="#0D0C1D" />
                        ) : (
                            <Ionicons name="send" size={20} color="#0D0C1D" />
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
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
        paddingTop: 60,
        paddingHorizontal: spacing.lg,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    backButton: {
        padding: 5,
        marginRight: 15,
    },
    title: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 20,
        color: '#FFFFFF',
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    list: {
        paddingHorizontal: spacing.lg,
        paddingTop: 20,
    },
    commentItem: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    commentContent: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 15,
        padding: 12,
        borderTopLeftRadius: 4,
    },
    username: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 14,
        color: '#E4C66D',
        marginBottom: 4,
    },
    text: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 14,
        color: '#FFFFFF',
        lineHeight: 20,
    },
    time: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 10,
        color: 'rgba(255,255,255,0.4)',
        marginTop: 8,
        alignSelf: 'flex-end',
    },
    emptyState: {
        alignItems: 'center',
        marginTop: 50,
    },
    emptyText: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 16,
        color: 'rgba(255,255,255,0.6)',
    },
    emptySubtext: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 14,
        color: 'rgba(255,255,255,0.4)',
        marginTop: 5,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        padding: 15,
        backgroundColor: '#1A1A2E',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
    },
    input: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 10,
        color: '#FFFFFF',
        fontFamily: 'PottaOne-Regular',
        fontSize: 14,
        maxHeight: 100,
        marginRight: 10,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E4C66D',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonDisabled: {
        backgroundColor: 'rgba(228, 198, 109, 0.3)',
    },
});

export default CommentsScreen;
