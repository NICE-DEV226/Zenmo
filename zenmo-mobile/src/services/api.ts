import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// URL de base du backend
// Pour Android Emulator: 10.0.2.2 (si backend sur localhost)
// Pour iOS Simulator: localhost
// Pour Device physique OU Emulator sur même réseau: IP locale (192.168.100.47)
const BASE_URL = Platform.select({
    android: 'http://192.168.100.47:3001/api/v1',  // IP locale de votre PC - PORT 3001
    ios: 'http://localhost:3001/api/v1',
    default: 'http://localhost:3001/api/v1',
});

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

// Log API configuration for debugging
console.log('🔗 API Base URL:', BASE_URL);
console.log('📱 Platform:', Platform.OS);

// Intercepteur pour ajouter le token JWT
api.interceptors.request.use(
    async (config) => {
        console.log(`📡 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        const token = await AsyncStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Intercepteur pour gérer les erreurs (ex: 401 Unauthorized)
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        console.error('❌ API Error:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        } else if (error.request) {
            console.error('No response received. Backend may be down or unreachable.');
            console.error('Request config:', error.config?.url);
        }

        if (error.response && error.response.status === 401) {
            // Token expiré - Essayer de le renouveler avec le refresh token
            console.log('🔄 401 Unauthorized - Attempting token refresh');
            
            const refreshToken = await AsyncStorage.getItem('refreshToken');
            if (refreshToken) {
                try {
                    // Essayer de renouveler le token
                    const refreshResponse = await axios.post(`${BASE_URL}/auth/refresh`, {
                        refreshToken
                    });

                    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = refreshResponse.data;
                    
                    // Sauvegarder les nouveaux tokens
                    await AsyncStorage.setItem('accessToken', newAccessToken);
                    if (newRefreshToken) {
                        await AsyncStorage.setItem('refreshToken', newRefreshToken);
                    }

                    console.log('✅ Token refreshed successfully');

                    // Retry the original request with the new token
                    if (error.config) {
                        error.config.headers.Authorization = `Bearer ${newAccessToken}`;
                        return axios.request(error.config);
                    }
                } catch (refreshError) {
                    console.log('❌ Token refresh failed:', refreshError);
                    // Si le refresh échoue, déconnecter l'utilisateur complètement
                    await AsyncStorage.removeItem('accessToken');
                    await AsyncStorage.removeItem('refreshToken');
                    await AsyncStorage.removeItem('user');
                    await AsyncStorage.removeItem('userProfile');
                    
                    // Nettoyer aussi les données PIN
                    try {
                        await SecureStore.deleteItemAsync('pinEnabled');
                        await SecureStore.deleteItemAsync('pinConfigured');
                        await SecureStore.deleteItemAsync('userPIN');
                        await SecureStore.deleteItemAsync('userPinHash');
                        console.log('🧹 PIN data cleared on logout');
                    } catch (pinCleanupError) {
                        console.error('Error clearing PIN data:', pinCleanupError);
                    }

                    // Redirection vers l'écran de connexion
                    setTimeout(() => {
                        if ((global as any).navigationRef?.current) {
                            (global as any).navigationRef.current.reset({
                                index: 0,
                                routes: [{ name: 'AuthWelcome' }],
                            });
                        }
                    }, 100);
                }
            } else {
                // Pas de refresh token, déconnecter l'utilisateur complètement
                console.log('🚪 No refresh token - Clearing all auth data');
                await AsyncStorage.removeItem('accessToken');
                await AsyncStorage.removeItem('user');
                await AsyncStorage.removeItem('userProfile');
                
                // Nettoyer aussi les données PIN
                try {
                    await SecureStore.deleteItemAsync('pinEnabled');
                    await SecureStore.deleteItemAsync('pinConfigured');
                    await SecureStore.deleteItemAsync('userPIN');
                    await SecureStore.deleteItemAsync('userPinHash');
                    console.log('🧹 PIN data cleared on logout');
                } catch (pinCleanupError) {
                    console.error('Error clearing PIN data:', pinCleanupError);
                }

                setTimeout(() => {
                    if ((global as any).navigationRef?.current) {
                        (global as any).navigationRef.current.reset({
                            index: 0,
                            routes: [{ name: 'AuthWelcome' }],
                        });
                    }
                }, 100);
            }
        }
        return Promise.reject(error);
    }
);

export default api;
