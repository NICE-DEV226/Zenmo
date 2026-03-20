import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

/**
 * Fonction utilitaire pour nettoyer complètement toutes les données utilisateur
 * Utile pour les tests ou pour une déconnexion complète
 */
export const clearAllUserData = async (): Promise<void> => {
    try {
        console.log('🧹 Clearing all user data...');

        // Nettoyer AsyncStorage
        await AsyncStorage.multiRemove([
            'accessToken',
            'refreshToken',
            'user',
            'userProfile',
            'biometricEnabled',
            'onboardingCompleted'
        ]);

        // Nettoyer SecureStore (données PIN)
        const secureKeys = [
            'pinEnabled',
            'pinConfigured', 
            'userPIN',
            'userPinHash'
        ];

        for (const key of secureKeys) {
            try {
                await SecureStore.deleteItemAsync(key);
            } catch (error) {
                // Ignorer les erreurs si la clé n'existe pas
                console.log(`Key ${key} not found in SecureStore`);
            }
        }

        console.log('✅ All user data cleared successfully');
    } catch (error) {
        console.error('❌ Error clearing user data:', error);
        throw error;
    }
};

/**
 * Fonction pour vérifier quelles données sont stockées (pour debug)
 */
export const debugStoredData = async (): Promise<void> => {
    try {
        console.log('🔍 Debugging stored data...');

        // Vérifier AsyncStorage
        const asyncKeys = [
            'accessToken',
            'refreshToken', 
            'user',
            'userProfile',
            'biometricEnabled',
            'onboardingCompleted'
        ];

        for (const key of asyncKeys) {
            const value = await AsyncStorage.getItem(key);
            console.log(`AsyncStorage[${key}]:`, value ? 'EXISTS' : 'NULL');
        }

        // Vérifier SecureStore
        const secureKeys = [
            'pinEnabled',
            'pinConfigured',
            'userPIN', 
            'userPinHash'
        ];

        for (const key of secureKeys) {
            try {
                const value = await SecureStore.getItemAsync(key);
                console.log(`SecureStore[${key}]:`, value ? 'EXISTS' : 'NULL');
            } catch (error) {
                console.log(`SecureStore[${key}]: NOT_FOUND`);
            }
        }
    } catch (error) {
        console.error('❌ Error debugging stored data:', error);
    }
};