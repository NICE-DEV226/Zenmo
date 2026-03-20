import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Contacts from 'expo-contacts';
import * as Location from 'expo-location';
import { spacing } from '../theme/spacing';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const PermissionsSettingsScreen = () => {
    const navigation = useNavigation();
    const [contactStatus, setContactStatus] = useState<'granted' | 'denied' | 'undetermined'>('undetermined');
    const [locationStatus, setLocationStatus] = useState<'granted' | 'denied' | 'undetermined'>('undetermined');

    useEffect(() => {
        checkPermissions();
    }, []);

    const checkPermissions = async () => {
        const { status: contacts } = await Contacts.getPermissionsAsync();
        setContactStatus(contacts);

        const { status: location } = await Location.getForegroundPermissionsAsync();
        setLocationStatus(location);
    };

    const requestContacts = async () => {
        if (contactStatus === 'denied') {
            Linking.openSettings();
            return;
        }
        const { status } = await Contacts.requestPermissionsAsync();
        setContactStatus(status);
    };

    const requestLocation = async () => {
        if (locationStatus === 'denied') {
            Linking.openSettings();
            return;
        }

        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            setLocationStatus(status);

            if (status === 'granted') {
                // Update location data if granted
                const location = await Location.getCurrentPositionAsync({});
                const reverseGeocode = await Location.reverseGeocodeAsync({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude
                });

                if (reverseGeocode && reverseGeocode.length > 0) {
                    const address = reverseGeocode[0];
                    const city = address.city || address.region || '';
                    const countryCode = address.isoCountryCode || 'BF';

                    await api.patch('/users/me/profile', { city, countryCode });

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
            console.error('Error requesting location:', error);
        }
    };

    const renderPermissionItem = (
        icon: keyof typeof Ionicons.glyphMap,
        title: string,
        description: string,
        status: 'granted' | 'denied' | 'undetermined',
        onPress: () => void
    ) => (
        <TouchableOpacity style={styles.permissionItem} onPress={onPress} activeOpacity={0.7}>
            <View style={styles.iconContainer}>
                <Ionicons name={icon} size={24} color="#E4C66D" />
            </View>
            <View style={styles.textContainer}>
                <Text style={styles.permissionTitle}>{title}</Text>
                <Text style={styles.permissionDesc}>{description}</Text>
            </View>
            <View style={styles.statusContainer}>
                {status === 'granted' ? (
                    <View style={styles.statusBadge}>
                        <Text style={styles.statusText}>Autorisé</Text>
                        <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                    </View>
                ) : (
                    <View style={[styles.statusBadge, styles.statusDenied]}>
                        <Text style={[styles.statusText, styles.textDenied]}>
                            {status === 'denied' ? 'Refusé' : 'Activer'}
                        </Text>
                        <Ionicons name={status === 'denied' ? "close-circle" : "chevron-forward"} size={16} color={status === 'denied' ? "#FF5E62" : "rgba(255,255,255,0.5)"} />
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <LinearGradient colors={['#0D0C1D', '#1A1A2E']} style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.title}>Autorisations</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.sectionDescription}>
                    Gérez les accès de Zenmo aux fonctionnalités de votre appareil pour une meilleure expérience.
                </Text>

                <View style={styles.section}>
                    {renderPermissionItem(
                        'people',
                        'Contacts',
                        'Pour retrouver vos amis sur Zenmo',
                        contactStatus,
                        requestContacts
                    )}

                    {renderPermissionItem(
                        'location',
                        'Localisation',
                        'Pour voir les vibes et communautés locales',
                        locationStatus,
                        requestLocation
                    )}
                </View>

                <View style={styles.infoNote}>
                    <Ionicons name="information-circle" size={20} color="#E4C66D" />
                    <Text style={styles.infoText}>
                        Si vous avez refusé une permission de façon permanente, vous devrez l'activer dans les paramètres système de votre téléphone.
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
    },
    sectionDescription: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.6)',
        marginBottom: 30,
        lineHeight: 20,
    },
    section: {
        gap: 15,
    },
    permissionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        padding: 15,
        borderRadius: 15,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(228, 198, 109, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15,
    },
    textContainer: {
        flex: 1,
        marginRight: 10,
    },
    permissionTitle: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 16,
        color: '#FFFFFF',
        marginBottom: 4,
    },
    permissionDesc: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.5)',
    },
    statusContainer: {
        minWidth: 80,
        alignItems: 'flex-end',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 20,
    },
    statusDenied: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    statusText: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 12,
        color: '#4CAF50',
    },
    textDenied: {
        color: 'rgba(255, 255, 255, 0.5)',
    },
    infoNote: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: 'rgba(228, 198, 109, 0.1)',
        padding: 15,
        borderRadius: 15,
        marginTop: 30,
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

export default PermissionsSettingsScreen;
