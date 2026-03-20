import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { spacing } from '../theme/spacing';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface PrivacySettings {
    profileVisibility: 'public' | 'friends' | 'private';
    showOnlineStatus: boolean;
    allowMessages: 'everyone' | 'friends' | 'nobody';
    showPhoneNumber: boolean;
    showEmail: boolean;
    allowTagging: boolean;
    dataCollection: boolean;
    analyticsTracking: boolean;
}

const SettingItem = ({ 
    icon, 
    label, 
    description, 
    type = 'switch', 
    value, 
    onPress 
}: { 
    icon: string;
    label: string;
    description?: string;
    type?: 'switch' | 'select';
    value: boolean | string;
    onPress: () => void;
}) => (
    <TouchableOpacity style={styles.settingItem} onPress={type === 'select' ? onPress : undefined} disabled={type === 'switch'}>
        <View style={styles.settingLeft}>
            <View style={styles.iconContainer}>
                <Ionicons name={icon as any} size={20} color="#FFFFFF" />
            </View>
            <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>{label}</Text>
                {description && <Text style={styles.settingDescription}>{description}</Text>}
            </View>
        </View>
        <View style={styles.settingRight}>
            {type === 'switch' && (
                <Switch
                    value={value as boolean}
                    onValueChange={onPress}
                    trackColor={{ false: 'rgba(255,255,255,0.1)', true: '#E4C66D' }}
                    thumbColor={'#FFFFFF'}
                />
            )}
            {type === 'select' && (
                <View style={styles.selectContainer}>
                    <Text style={styles.selectValue}>{value as string}</Text>
                    <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.5)" />
                </View>
            )}
        </View>
    </TouchableOpacity>
);

export const PrivacySettingsScreen = () => {
    const navigation = useNavigation();
    const [settings, setSettings] = useState<PrivacySettings>({
        profileVisibility: 'public',
        showOnlineStatus: true,
        allowMessages: 'everyone',
        showPhoneNumber: false,
        showEmail: false,
        allowTagging: true,
        dataCollection: true,
        analyticsTracking: false,
    });

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const savedSettings = await AsyncStorage.getItem('privacySettings');
            if (savedSettings) {
                setSettings(JSON.parse(savedSettings));
            }
        } catch (error) {
            console.error('Error loading privacy settings:', error);
        }
    };

    const saveSettings = async (newSettings: PrivacySettings) => {
        try {
            await AsyncStorage.setItem('privacySettings', JSON.stringify(newSettings));
            setSettings(newSettings);
        } catch (error) {
            console.error('Error saving privacy settings:', error);
            Alert.alert('Erreur', 'Impossible de sauvegarder les paramètres');
        }
    };

    const showVisibilityOptions = () => {
        Alert.alert(
            'Visibilité du profil',
            'Choisissez qui peut voir votre profil',
            [
                { text: 'Public', onPress: () => saveSettings({...settings, profileVisibility: 'public'}) },
                { text: 'Amis seulement', onPress: () => saveSettings({...settings, profileVisibility: 'friends'}) },
                { text: 'Privé', onPress: () => saveSettings({...settings, profileVisibility: 'private'}) },
                { text: 'Annuler', style: 'cancel' }
            ]
        );
    };

    const showMessageOptions = () => {
        Alert.alert(
            'Messages autorisés',
            'Qui peut vous envoyer des messages',
            [
                { text: 'Tout le monde', onPress: () => saveSettings({...settings, allowMessages: 'everyone'}) },
                { text: 'Amis seulement', onPress: () => saveSettings({...settings, allowMessages: 'friends'}) },
                { text: 'Personne', onPress: () => saveSettings({...settings, allowMessages: 'nobody'}) },
                { text: 'Annuler', style: 'cancel' }
            ]
        );
    };

    const getVisibilityText = () => {
        switch (settings.profileVisibility) {
            case 'public': return 'Public';
            case 'friends': return 'Amis';
            case 'private': return 'Privé';
            default: return 'Public';
        }
    };

    const getMessageText = () => {
        switch (settings.allowMessages) {
            case 'everyone': return 'Tout le monde';
            case 'friends': return 'Amis';
            case 'nobody': return 'Personne';
            default: return 'Tout le monde';
        }
    };

    return (
        <LinearGradient colors={['#0D0C1D', '#1A1A2E']} style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.title}>Confidentialité</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Visibilité du profil</Text>
                    
                    <SettingItem
                        icon="eye-outline"
                        label="Visibilité du profil"
                        description="Contrôlez qui peut voir votre profil"
                        type="select"
                        value={getVisibilityText()}
                        onPress={showVisibilityOptions}
                    />

                    <SettingItem
                        icon="radio-outline"
                        label="Statut en ligne"
                        description="Afficher quand vous êtes en ligne"
                        value={settings.showOnlineStatus}
                        onPress={() => saveSettings({...settings, showOnlineStatus: !settings.showOnlineStatus})}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Communications</Text>
                    
                    <SettingItem
                        icon="chatbubble-outline"
                        label="Messages autorisés"
                        description="Qui peut vous envoyer des messages"
                        type="select"
                        value={getMessageText()}
                        onPress={showMessageOptions}
                    />

                    <SettingItem
                        icon="pricetag-outline"
                        label="Autoriser les mentions"
                        description="Permettre aux autres de vous mentionner"
                        value={settings.allowTagging}
                        onPress={() => saveSettings({...settings, allowTagging: !settings.allowTagging})}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Informations personnelles</Text>
                    
                    <SettingItem
                        icon="call-outline"
                        label="Afficher le numéro"
                        description="Rendre votre numéro visible aux autres"
                        value={settings.showPhoneNumber}
                        onPress={() => saveSettings({...settings, showPhoneNumber: !settings.showPhoneNumber})}
                    />

                    <SettingItem
                        icon="mail-outline"
                        label="Afficher l'email"
                        description="Rendre votre email visible aux autres"
                        value={settings.showEmail}
                        onPress={() => saveSettings({...settings, showEmail: !settings.showEmail})}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Données et analyse</Text>
                    
                    <SettingItem
                        icon="analytics-outline"
                        label="Collecte de données"
                        description="Autoriser la collecte de données pour améliorer l'app"
                        value={settings.dataCollection}
                        onPress={() => saveSettings({...settings, dataCollection: !settings.dataCollection})}
                    />

                    <SettingItem
                        icon="trending-up-outline"
                        label="Suivi analytique"
                        description="Partager des données d'usage anonymes"
                        value={settings.analyticsTracking}
                        onPress={() => saveSettings({...settings, analyticsTracking: !settings.analyticsTracking})}
                    />
                </View>

                <View style={styles.infoNote}>
                    <Ionicons name="shield-checkmark" size={20} color="#E4C66D" />
                    <Text style={styles.infoText}>
                        Vos données sont protégées et ne sont jamais partagées avec des tiers sans votre consentement explicite.
                    </Text>
                </View>
            </ScrollView>
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
        paddingBottom: 20,
        paddingHorizontal: spacing.xl,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    backButton: {
        marginRight: 15,
    },
    title: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 20,
        color: '#FFFFFF',
    },
    content: {
        padding: spacing.xl,
        paddingBottom: 40,
    },
    section: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 14,
        color: '#E4C66D',
        marginBottom: 15,
        marginLeft: 5,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        padding: 15,
        borderRadius: 15,
        marginBottom: 10,
        minHeight: 70,
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15,
    },
    settingContent: {
        flex: 1,
    },
    settingLabel: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 14,
        color: '#FFFFFF',
    },
    settingDescription: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 10,
        color: 'rgba(255, 255, 255, 0.6)',
        marginTop: 2,
    },
    settingRight: {
        marginLeft: 15,
    },
    selectContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    selectValue: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 12,
        color: '#E4C66D',
    },
    infoNote: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: 'rgba(228, 198, 109, 0.1)',
        padding: 15,
        borderRadius: 15,
        marginTop: 20,
        gap: 10,
        borderWidth: 1,
        borderColor: 'rgba(228, 198, 109, 0.3)',
    },
    infoText: {
        flex: 1,
        fontFamily: 'PottaOne-Regular',
        fontSize: 12,
        color: '#E4C66D',
        lineHeight: 18,
    },
});

export default PrivacySettingsScreen;