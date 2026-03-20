import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const PlaceholderScreen = ({ title }: { title: string }) => (
    <LinearGradient colors={['#0D0C1D', '#1A1A2E']} style={styles.container}>
        <Text style={styles.text}>{title}</Text>
        <Text style={styles.subtext}>Coming Soon</Text>
    </LinearGradient>
);

export const HomeScreen = () => <PlaceholderScreen title="Home" />;
export const ChatScreen = () => <PlaceholderScreen title="Chat" />;
export const VibesScreen = () => <PlaceholderScreen title="Vibes" />;
export const CreateVibeScreen = () => <PlaceholderScreen title="Create Vibe" />;
export const ContactsScreen = () => <PlaceholderScreen title="Contacts" />;
export const ProfileScreen = () => <PlaceholderScreen title="Profile" />;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 32,
        color: '#FFFFFF',
        marginBottom: 10,
    },
    subtext: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.5)',
    },
});
