import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { spacing } from '../theme/spacing';
import api from '../services/api';

type VibeType = 'mood' | 'question' | 'confession';

const VIBE_TYPES = [
    { type: 'mood' as VibeType, label: 'Humeur', icon: 'happy-outline', gradient: ['#7B61FF', '#33D1C4'] },
    { type: 'question' as VibeType, label: 'Question', icon: 'help-circle-outline', gradient: ['#FF6B6B', '#FFD93D'] },
    { type: 'confession' as VibeType, label: 'Confession', icon: 'lock-closed-outline', gradient: ['#E4C66D', '#FF6B6B'] },
];

export const CreateVibeScreen = () => {
    const navigation = useNavigation();
    const [selectedType, setSelectedType] = useState<VibeType>('mood');
    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleCreate = async () => {
        if (!content.trim()) {
            Alert.alert('Erreur', 'Écris quelque chose avant de partager !');
            return;
        }

        setIsLoading(true);
        try {
            // Get user profile for city and country
            const userProfileStr = await AsyncStorage.getItem('userProfile');
            const userProfile = userProfileStr ? JSON.parse(userProfileStr) : null;

            await api.post('/vibes', {
                type: selectedType,
                text: content.trim(), // Changed from 'content' to 'text'
                city: userProfile?.city || 'Ouagadougou',
                countryCode: userProfile?.countryCode || 'BF',
            });

            Alert.alert('Succès', 'Ta vibe a été partagée ! 🎉');
            setContent('');
            navigation.goBack();
        } catch (error: any) {
            console.error('Error creating vibe:', error);
            Alert.alert('Erreur', error.response?.data?.message || 'Impossible de partager ta vibe');
        } finally {
            setIsLoading(false);
        }
    };

    const selectedVibeType = VIBE_TYPES.find(v => v.type === selectedType);

    return (
        <LinearGradient
            colors={selectedVibeType?.gradient || ['#0D0C1D', '#1A1A2E']}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
                        <Ionicons name="close" size={28} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Partage ta vibe</Text>
                    <View style={{ width: 28 }} />
                </View>

                {/* Type Selection */}
                <View style={styles.typeContainer}>
                    {VIBE_TYPES.map((vibe) => (
                        <TouchableOpacity
                            key={vibe.type}
                            style={[
                                styles.typeButton,
                                selectedType === vibe.type && styles.typeButtonActive
                            ]}
                            onPress={() => setSelectedType(vibe.type)}
                        >
                            <Ionicons
                                name={vibe.icon as any}
                                size={24}
                                color={selectedType === vibe.type ? '#0D0C1D' : '#FFFFFF'}
                            />
                            <Text style={[
                                styles.typeLabel,
                                selectedType === vibe.type && styles.typeLabelActive
                            ]}>
                                {vibe.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Content Input */}
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder={
                            selectedType === 'mood' ? "Comment tu te sens ?" :
                                selectedType === 'question' ? "Pose ta question..." :
                                    "Partage ton secret..."
                        }
                        placeholderTextColor="rgba(255, 255, 255, 0.5)"
                        value={content}
                        onChangeText={setContent}
                        multiline
                        maxLength={280}
                        autoFocus
                    />
                    <Text style={styles.charCount}>{content.length}/280</Text>
                </View>

                {/* Share Button */}
                <TouchableOpacity
                    style={[styles.shareButton, !content.trim() && styles.shareButtonDisabled]}
                    onPress={handleCreate}
                    disabled={!content.trim() || isLoading}
                >
                    <Text style={styles.shareButtonText}>
                        {isLoading ? 'Partage...' : 'Partager 🚀'}
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingTop: 60,
        paddingHorizontal: spacing.xl,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 20,
        color: '#FFFFFF',
    },
    typeContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 30,
    },
    typeButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        borderRadius: 15,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    typeButtonActive: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderColor: '#FFFFFF',
    },
    typeLabel: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 12,
        color: '#FFFFFF',
    },
    typeLabelActive: {
        color: '#0D0C1D',
    },
    inputContainer: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    input: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 18,
        color: '#FFFFFF',
        minHeight: 200,
        textAlignVertical: 'top',
    },
    charCount: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.5)',
        textAlign: 'right',
        marginTop: 10,
    },
    shareButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        paddingVertical: 18,
        borderRadius: 15,
        alignItems: 'center',
        marginBottom: 40,
    },
    shareButtonDisabled: {
        opacity: 0.5,
    },
    shareButtonText: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 16,
        color: '#0D0C1D',
    },
});
