import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Font from 'expo-font';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
// import * as Notifications from 'expo-notifications';
import * as Contacts from 'expo-contacts';
import * as Location from 'expo-location';
import { spacing } from '../theme/spacing';
import { AuthStackParamList } from '../navigation/types';
import { ProgressBar, Header } from '../components';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

type PermissionsScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Permissions'>;

export const PermissionsScreen: React.FC = () => {
    const navigation = useNavigation<PermissionsScreenNavigationProp>();
    const [fontLoaded, setFontLoaded] = useState(false);

    const [contactStatus, setContactStatus] = useState<'undetermined' | 'granted' | 'denied'>('undetermined');
    const [locationStatus, setLocationStatus] = useState<'undetermined' | 'granted' | 'denied'>('undetermined');

    useEffect(() => {
        async function loadFont() {
            await Font.loadAsync({
                'PottaOne-Regular': require('../../assets/fonts/PottaOne-Regular.ttf'),
            });
            setFontLoaded(true);
        }
        loadFont();
    }, []);

    const requestContacts = async () => {
        const { status } = await Contacts.requestPermissionsAsync();
        setContactStatus(status);
    };

    const requestLocation = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            setLocationStatus(status);

            if (status === 'granted') {
                console.log('📍 Location permission granted, fetching position...');
                const location = await Location.getCurrentPositionAsync({});

                // Reverse geocoding to get city and country
                const reverseGeocode = await Location.reverseGeocodeAsync({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude
                });

                if (reverseGeocode && reverseGeocode.length > 0) {
                    const address = reverseGeocode[0];
                    const city = address.city || address.region || '';
                    const countryCode = address.isoCountryCode || 'BF';

                    console.log(`📍 Location found: ${city}, ${countryCode}`);

                    // Update user profile with location
                    await api.patch('/users/me/profile', {
                        city,
                        countryCode
                    });

                    // Update local storage
                    const userJson = await AsyncStorage.getItem('userProfile');
                    if (userJson) {
                        const userData = JSON.parse(userJson);
                        userData.city = city;
                        userData.countryCode = countryCode;
                        await AsyncStorage.setItem('userProfile', JSON.stringify(userData));
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching location:', error);
        }
    };

    const handleContinue = () => {
        navigation.replace('Main');
    };

    const renderPermissionItem = (
        icon: keyof typeof Ionicons.glyphMap,
        title: string,
        description: string,
        status: 'undetermined' | 'granted' | 'denied',
        onPress: () => void
    ) => (
        <View style={styles.permissionItem}>
            <View style={styles.iconContainer}>
                <Ionicons name={icon} size={22} color="#E4C66D" />
            </View>
            <View style={styles.textContainer}>
                <Text style={styles.permissionTitle}>{title}</Text>
                <Text style={styles.permissionDesc}>{description}</Text>
            </View>
            <TouchableOpacity
                style={[
                    styles.actionButton,
                    status === 'granted' && styles.grantedButton,
                    status === 'denied' && styles.deniedButton
                ]}
                onPress={onPress}
                disabled={status !== 'undetermined'}
            >
                {status === 'granted' ? (
                    <Ionicons name="checkmark" size={20} color="#0D0C1D" />
                ) : status === 'denied' ? (
                    <Ionicons name="close" size={18} color="#FFFFFF" />
                ) : (
                    <Text style={styles.actionButtonText}>Activer</Text>
                )}
            </TouchableOpacity>
        </View>
    );

    if (!fontLoaded) {
        return (
            <LinearGradient colors={['#7C5EF6', '#7C5EF6']} style={styles.container} />
        );
    }

    return (
        <LinearGradient colors={['#7C5EF6', '#7C5EF6']} style={styles.container}>
            <Header
                title="Autorisations"
                onBackPress={() => navigation.goBack()}
            />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.logo}>ZENMO</Text>
                    <Text style={styles.subtitle}>Dernière étape !</Text>

                    <ProgressBar
                        steps={[
                            { label: 'COMPTE', completed: true, current: false },
                            { label: 'PROFIL', completed: true, current: false },
                            { label: 'PERMISSIONS', completed: false, current: true }
                        ]}
                    />
                </View>

                <View style={styles.card}>
                    <Text style={styles.title}>Autorisations</Text>
                    <Text style={styles.cardSubtitle}>Pour une expérience optimale</Text>

                    {renderPermissionItem(
                        'people-outline',
                        'Contacts',
                        'Retrouve tes amis sur Zenmo.',
                        contactStatus,
                        requestContacts
                    )}

                    {renderPermissionItem(
                        'location-outline',
                        'Localisation',
                        'Découvre les vibes près de toi.',
                        locationStatus,
                        requestLocation
                    )}

                    <Text style={styles.infoText}>
                        💡 Ces permissions sont optionnelles mais améliorent ton expérience.
                    </Text>

                    <TouchableOpacity style={styles.button} onPress={handleContinue} activeOpacity={0.9}>
                        <Text style={styles.buttonText}>C'est parti ! 🚀</Text>
                    </TouchableOpacity>
                </View>
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
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xl,
        paddingTop: 100,
        alignItems: 'center',
    },

    header: {
        alignItems: 'center',
        marginBottom: spacing.xl,
        gap: spacing.lg,
        width: '100%',
    },

    logo: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 36,
        color: '#FFFFFF',
        textAlign: 'center',
        letterSpacing: 4,
        textShadowColor: '#7C5EF6',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 8,
    },

    card: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 25,
        paddingVertical: spacing.xl,
        paddingHorizontal: spacing.lg,
        width: '100%',
        maxWidth: '95%',
    },

    title: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 28,
        color: '#FFFFFF',
        marginBottom: 10,
        textAlign: 'center',
    },

    subtitle: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 18,
        color: '#E4C66D',
        textAlign: 'center',
        opacity: 0.9,
    },

    cardSubtitle: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center',
        marginBottom: 30,
    },

    permissionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        paddingVertical: 14,
        paddingHorizontal: 14,
        borderRadius: 16,
        width: '100%',
    },

    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(228, 198, 109, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },

    textContainer: {
        flex: 1,
        marginRight: 8,
        paddingRight: 0,
    },

    permissionTitle: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 15,
        color: '#FFFFFF',
        marginBottom: 2,
    },

    permissionDesc: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.7)',
        lineHeight: 16,
        flexWrap: 'wrap',
    },

    actionButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        minWidth: 65,
        alignItems: 'center',
        justifyContent: 'center',
    },

    grantedButton: {
        backgroundColor: '#E4C66D',
    },

    deniedButton: {
        backgroundColor: '#FF6B6B',
    },

    actionButtonText: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 12,
        color: '#FFFFFF',
    },

    infoText: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.7)',
        textAlign: 'center',
        marginTop: 20,
        marginBottom: 10,
        lineHeight: 20,
    },

    button: {
        backgroundColor: '#E4C66D',
        width: '100%',
        height: 60,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        shadowColor: '#000000',
        shadowOffset: { width: 4, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 10,
    },

    buttonText: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 16,
        color: '#0D0C1D',
        textTransform: 'lowercase',
    },
});

export default PermissionsScreen;
