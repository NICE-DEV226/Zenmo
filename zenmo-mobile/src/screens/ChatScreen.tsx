import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { spacing } from '../theme/spacing';

// Mock Messages
const MESSAGES = [
    { id: '1', text: 'Salut ! Ça va ?', sender: 'them', time: '14:30' },
    { id: '2', text: 'Ça va super et toi ?', sender: 'me', time: '14:31' },
    { id: '3', text: 'Tu viens ce soir ? 🎉', sender: 'them', time: '14:32' },
];

export const ChatScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    // @ts-ignore
    const { user } = route.params || { user: { name: 'Chat' } };
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState(MESSAGES);

    const sendMessage = () => {
        if (message.trim()) {
            const newMessage = {
                id: Date.now().toString(),
                text: message,
                sender: 'me',
                time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
            };
            setMessages([...messages, newMessage]);
            setMessage('');
        }
    };

    const renderMessage = ({ item }: { item: any }) => (
        <View style={[
            styles.messageBubble,
            item.sender === 'me' ? styles.myMessage : styles.theirMessage
        ]}>
            <Text style={[
                styles.messageText,
                item.sender === 'me' ? styles.myMessageText : styles.theirMessageText
            ]}>
                {item.text}
            </Text>
            <Text style={styles.messageTime}>{item.time}</Text>
        </View>
    );

    return (
        <LinearGradient colors={['#0D0C1D', '#7B61FF']} style={styles.container}>
            <KeyboardAvoidingView 
                style={styles.container} 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity 
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <View style={styles.headerInfo}>
                        <Text style={styles.headerName}>{user.name}</Text>
                        <Text style={styles.headerStatus}>En ligne</Text>
                    </View>
                    <TouchableOpacity>
                        <Ionicons name="call" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>

                {/* Messages */}
                <FlatList
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={(item) => item.id}
                    style={styles.messagesList}
                    showsVerticalScrollIndicator={false}
                />

                {/* Input */}
                <View style={styles.inputContainer}>
                    <TouchableOpacity style={styles.attachButton}>
                        <Ionicons name="add" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <TextInput
                        style={styles.input}
                        value={message}
                        onChangeText={setMessage}
                        placeholder="Écris ton message..."
                        placeholderTextColor="rgba(255, 255, 255, 0.5)"
                        multiline
                    />
                    <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
                        <Ionicons name="send" size={20} color="#0D0C1D" />
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
        paddingTop: 50,
        paddingBottom: 15,
        paddingHorizontal: spacing.xl,
        backgroundColor: 'rgba(13, 12, 29, 0.9)',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    },
    backButton: {
        marginRight: 15,
    },
    headerInfo: {
        flex: 1,
    },
    headerName: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 18,
        color: '#FFFFFF',
    },
    headerStatus: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 12,
        color: '#33D1C4',
    },
    messagesList: {
        flex: 1,
        padding: spacing.xl,
    },
    messageBubble: {
        maxWidth: '80%',
        padding: 15,
        borderRadius: 20,
        marginBottom: 15,
    },
    myMessage: {
        alignSelf: 'flex-end',
        backgroundColor: '#7B61FF',
        borderBottomRightRadius: 5,
    },
    theirMessage: {
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderBottomLeftRadius: 5,
    },
    messageText: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 14,
        lineHeight: 20,
    },
    myMessageText: {
        color: '#FFFFFF',
    },
    theirMessageText: {
        color: '#FFFFFF',
    },
    messageTime: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 10,
        color: 'rgba(255, 255, 255, 0.5)',
        alignSelf: 'flex-end',
        marginTop: 5,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.05)',
    },
    attachButton: {
        padding: 10,
    },
    input: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 10,
        marginHorizontal: 10,
        color: '#FFFFFF',
        fontFamily: 'PottaOne-Regular',
        maxHeight: 100,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E4C66D',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
