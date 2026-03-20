import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { spacing } from '../theme/spacing';
import { AuthStackParamList } from '../navigation/types';
import { useCustomAlert } from '../components';

type SecuritySettingsNavigationProp = StackNavigationProp<AuthStackParamList>;

export const SecuritySettingsScreen = () => {
    const navigation = useNavigation<SecuritySettingsNavigationProp>();
    const { showAlert, AlertComponent } = useCustomAlert();
    const [pinEnabled, setPinEnabled] = useState(false);
    const [pinConfigured, setPinConfigured] = useState(false);
    const [biometricEnabled, setBiometricEnabled] = useState(false);
    const [biometricAvailable, setBiometricAvailable] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSecuritySettings();
    }, []);

    const loadSecuritySettings = async () => {
        try {
            // Vérifier si PIN configuré
            const pinConf = await SecureStore.getItemAsync('pinConfigured');
            const pinEn = await SecureStore.getItemAsync('pinEnabled');
            setPinConfigured(pinConf === 'true');
            setPinEnabled(pinEn === 'true');

            // Vérifier si biométrie disponible
            const bioAvailable = await LocalAuthentication.hasHardwareAsync();
            setBiometricAvailable(bioAvailable);

            if (bioAvailable) {
                const bioEnabled = await AsyncStorage.getItem('biometricEnabled');
                setBiometricEnabled(bioEnabled === 'true');
            }
        } catch (error) {
            console.error('Error loading security settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleConfigurePIN = () => {
        // @ts-ignore
        navigation.navigate('SetupPIN');
    };

    const handleTogglePIN = async (value: boolean) => {
        if (!pinConfigured) {
            showAlert({
                type: 'warning',
                title: 'Code PIN non configuré',
                message: 'Vous devez d\'abord configurer un code PIN avant de l\'activer.',
                buttons: [
                    {
                        text: 'Configurer maintenant',
                        onPress: handleConfigurePIN
                    },
                    {
                        text: 'Annuler',
                        onPress: () => { },
                        style: 'cancel'
                    }
                ]
            });
            return;
        }

        try {
            await SecureStore.setItemAsync('pinEnabled', value ? 'true' : 'false');
            setPinEnabled(value);

            showAlert({
                type: 'success',
                title: value ? 'Code PIN activé' : 'Code PIN désactivé',
                message: value
                    ? 'Votre application sera verrouillée au prochain démarrage.'
                    : 'Le verrouillage par code PIN est désactivé.'
            });
        } catch (error) {
            console.error('Error toggling PIN:', error);
            showAlert({
                type: 'error',
                title: 'Erreur',
                message: 'Impossible de modifier le paramètre'
            });
        }
    };

    const handleToggleBiometric = async (value: boolean) => {
        if (!biometricAvailable) {
            showAlert({
                type: 'error',
                title: 'Non disponible',
                message: 'L\'authentification biométrique n\'est pas disponible sur cet appareil.'
            });
            return;
        }

        if (value) {
            // Tester la biométrie avant d'activer
            try {
                const result = await LocalAuthentication.authenticateAsync({
                    promptMessage: 'Authentifiez-vous pour activer la biométrie',
                    cancelLabel: 'Annuler',
                });

                if (result.success) {
                    await AsyncStorage.setItem('biometricEnabled', 'true');
                    setBiometricEnabled(true);
                    showAlert({
                        type: 'success',
                        title: 'Biométrie activée',
                        message: 'Vous pourrez utiliser votre empreinte ou Face ID pour déverrouiller l\'application.'
                    });
                }
            } catch (error) {
                console.error('Biometric error:', error);
            }
        } else {
            await AsyncStorage.setItem('biometricEnabled', 'false');
            setBiometricEnabled(false);
            showAlert({
                type: 'info',
                title: 'Biométrie désactivée',
                message: 'Vous devrez utiliser votre code PIN pour déverrouiller l\'application.'
            });
        }
    };

    const handleChangePIN = async () => {
        showAlert({
            type: 'warning',
            title: 'Changer le code PIN',
            message: 'Pour changer votre code PIN, vous devez d\'abord le désactiver, puis le reconfigurer avec un nouveau code.',
            buttons: [
                {
                    text: 'Annuler',
                    onPress: () => { },
                    style: 'cancel'
                },
                {
                    text: 'Désactiver et reconfigurer',
                    onPress: async () => {
                        try {
                            // Désactiver le PIN
                            await SecureStore.setItemAsync('pinEnabled', 'false');
                            await SecureStore.deleteItemAsync('userPinHash');
                            await SecureStore.deleteItemAsync('pinConfigured');

                            setPinEnabled(false);
                            setPinConfigured(false);

                            showAlert({
                                type: 'success',
                                title: 'PIN réinitialisé',
                                message: 'Vous pouvez maintenant configurer un nouveau code PIN.',
                                buttons: [
                                    {
                                        text: 'Configurer maintenant',
                                        onPress: handleConfigurePIN
                                    }
                                ]
                            });
                        } catch (error) {
                            console.error('Error resetting PIN:', error);
                            showAlert({
                                type: 'error',
                                title: 'Erreur',
                                message: 'Impossible de réinitialiser le code PIN'
                            });
                        }
                    },
                    style: 'destructive'
                }
            ]
        });
    };

    const handleLogout = async () => {
        showAlert({
            type: 'warning',
            title: 'Déconnexion',
            message: 'Êtes-vous sûr de vouloir vous déconnecter ?',
            buttons: [
                {
                    text: 'Annuler',
                    onPress: () => { },
                    style: 'cancel'
                },
                {
                    text: 'Déconnexion',
                    onPress: async () => {
                        await AsyncStorage.clear();
                        await SecureStore.deleteItemAsync('userPinHash');
                        await SecureStore.deleteItemAsync('pinConfigured');
                        await SecureStore.deleteItemAsync('pinEnabled');
                        // @ts-ignore
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'Splash' }],
                        });
                    },
                    style: 'destructive'
                }
            ]
        });
    };

    if (loading) {
        return (
            <LinearGradient colors={['#0D0C1D', '#1A1A2E']} style={styles.container}>
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Chargement...</Text>
                </View>
            </LinearGradient>
        );
    }

    return (
        <LinearGradient colors={['#0D0C1D', '#1A1A2E']} style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                    activeOpacity={0.7}
                    hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                    delayPressIn={0}
                >
                    <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.title}>Sécurité</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Info Sécurité */}
                <View style={styles.infoCard}>
                    <Ionicons name="shield-checkmark" size={40} color="#E4C66D" />
                    <Text style={styles.infoTitle}>Protégez votre compte</Text>
                    <Text style={styles.infoText}>
                        Activez le code PIN et la biométrie pour sécuriser l'accès à votre application et protéger vos données personnelles.
                    </Text>
                </View>

                {/* Code PIN */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Code PIN</Text>

                    {!pinConfigured ? (
                        <TouchableOpacity
                            style={styles.configureButton}
                            onPress={handleConfigurePIN}
                            activeOpacity={0.7}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            delayPressIn={0}
                        >
                            <View style={styles.configureLeft}>
                                <Ionicons name="key-outline" size={24} color="#E4C66D" />
                                <Text style={styles.configureText}>Configurer un code PIN</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.5)" />
                        </TouchableOpacity>
                    ) : (
                        <>
                            <View style={styles.settingItem}>
                                <View style={styles.settingLeft}>
                                    <Ionicons name="lock-closed" size={20} color="#4CAF50" />
                                    <Text style={styles.settingLabel}>Code PIN configuré</Text>
                                </View>
                                <Switch
                                    value={pinEnabled}
                                    onValueChange={handleTogglePIN}
                                    trackColor={{ false: 'rgba(255,255,255,0.1)', true: '#E4C66D' }}
                                    thumbColor={'#FFFFFF'}
                                />
                            </View>

                            <TouchableOpacity
                                style={styles.settingItem}
                                onPress={handleChangePIN}
                                activeOpacity={0.7}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                delayPressIn={0}
                            >
                                <View style={styles.settingLeft}>
                                    <Ionicons name="create-outline" size={20} color="#FFFFFF" />
                                    <Text style={styles.settingLabel}>Changer le code PIN</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.5)" />
                            </TouchableOpacity>
                        </>
                    )}
                </View>

                {/* Biométrie */}
                {biometricAvailable && pinConfigured && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Authentification biométrique</Text>
                        <View style={styles.settingItem}>
                            <View style={styles.settingLeft}>
                                <Ionicons name="finger-print" size={20} color="#FFFFFF" />
                                <Text style={styles.settingLabel}>Empreinte / Face ID</Text>
                            </View>
                            <Switch
                                value={biometricEnabled}
                                onValueChange={handleToggleBiometric}
                                trackColor={{ false: 'rgba(255,255,255,0.1)', true: '#E4C66D' }}
                                thumbColor={'#FFFFFF'}
                                disabled={!pinEnabled}
                            />
                        </View>
                        {!pinEnabled && (
                            <Text style={styles.helperText}>
                                Activez d'abord le code PIN pour utiliser la biométrie
                            </Text>
                        )}
                    </View>
                )}
            </ScrollView>

            <AlertComponent />
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 16,
        color: '#FFFFFF',
    },
    infoCard: {
        backgroundColor: 'rgba(228, 198, 109, 0.1)',
        borderRadius: 15,
        padding: 20,
        alignItems: 'center',
        marginBottom: 30,
        borderWidth: 1,
        borderColor: 'rgba(228, 198, 109, 0.3)',
    },
    infoTitle: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 18,
        color: '#E4C66D',
        marginTop: 10,
        marginBottom: 10,
    },
    infoText: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.7)',
        textAlign: 'center',
        lineHeight: 18,
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
    configureButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(228, 198, 109, 0.1)',
        padding: 15,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: 'rgba(228, 198, 109, 0.3)',
    },
    configureLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    configureText: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 14,
        color: '#E4C66D',
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        padding: 15,
        borderRadius: 15,
        marginBottom: 10,
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    settingLabel: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 14,
        color: '#FFFFFF',
    },
    helperText: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 11,
        color: 'rgba(255, 255, 255, 0.5)',
        marginTop: -5,
        marginLeft: 5,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 94, 98, 0.1)',
        padding: 15,
        borderRadius: 15,
        marginTop: 20,
        gap: 10,
        borderWidth: 1,
        borderColor: 'rgba(255, 94, 98, 0.3)',
    },
    logoutText: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 14,
        color: '#FF5E62',
    },
});
