import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Image, Animated, TouchableOpacity, Text } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { AuthStackParamList } from '../navigation/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { clearAllUserData, debugStoredData } from '../utils/clearUserData';

type SplashScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Splash'>;

export const SplashScreen: React.FC = () => {
  const navigation = useNavigation<SplashScreenNavigationProp>();
  const dot1Opacity = useRef(new Animated.Value(0.3)).current;
  const dot2Opacity = useRef(new Animated.Value(0.3)).current;
  const dot3Opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // Animation des points de chargement
    const animateDots = () => {
      Animated.sequence([
        Animated.timing(dot1Opacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(dot2Opacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(dot3Opacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.parallel([
          Animated.timing(dot1Opacity, {
            toValue: 0.3,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dot2Opacity, {
            toValue: 0.3,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dot3Opacity, {
            toValue: 0.3,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => animateDots());
    };

    animateDots();

    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        
        if (token || refreshToken) {
          // Utilisateur connecté (avec access token ou refresh token)
          console.log('🔵 User has tokens, checking PIN settings...');
          
          // Vérifier si le verrouillage par PIN est activé
          const pinEnabled = await SecureStore.getItemAsync('pinEnabled');
          const pinConfigured = await SecureStore.getItemAsync('pinConfigured');

          console.log('🔵 PIN enabled:', pinEnabled, 'PIN configured:', pinConfigured);

          if (pinEnabled === 'true' && pinConfigured === 'true') {
            // PIN activé et configuré → LockScreen
            console.log('🔵 Navigating to LockScreen');
            navigation.replace('LockScreen');
          } else {
            // PIN désactivé ou non configuré → Main directement
            console.log('🔵 Navigating to Main');
            navigation.replace('Main');
          }
        } else {
          // Pas de tokens → Nettoyer les données PIN et aller à l'onboarding
          console.log('🔵 No tokens found, clearing PIN data and going to Onboarding');
          
          // Nettoyer les données PIN car l'utilisateur n'est pas connecté
          await SecureStore.deleteItemAsync('pinEnabled').catch(() => {});
          await SecureStore.deleteItemAsync('pinConfigured').catch(() => {});
          await SecureStore.deleteItemAsync('userPIN').catch(() => {});
          
          navigation.replace('Onboarding');
        }
      } catch (error) {
        console.error('🔴 Auth check error:', error);
        
        // En cas d'erreur, nettoyer les données PIN et aller à l'onboarding
        try {
          await SecureStore.deleteItemAsync('pinEnabled').catch(() => {});
          await SecureStore.deleteItemAsync('pinConfigured').catch(() => {});
          await SecureStore.deleteItemAsync('userPIN').catch(() => {});
        } catch (cleanupError) {
          console.error('🔴 Cleanup error:', cleanupError);
        }
        
        navigation.replace('Onboarding');
      }
    };

    const timer = setTimeout(() => {
      checkAuth();
    }, 800);

    return () => clearTimeout(timer);
  }, [navigation, dot1Opacity, dot2Opacity, dot3Opacity]);

  const handleClearData = async () => {
    try {
      await clearAllUserData();
      // Redémarrer le processus d'authentification
      setTimeout(() => {
        navigation.replace('Onboarding');
      }, 500);
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  };

  const handleDebugData = async () => {
    await debugStoredData();
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/Zemons.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Points de chargement animés */}
      <View style={styles.dotsContainer}>
        <Animated.View style={[styles.dot, { opacity: dot1Opacity }]} />
        <Animated.View style={[styles.dot, { opacity: dot2Opacity }]} />
        <Animated.View style={[styles.dot, { opacity: dot3Opacity }]} />
      </View>

      {/* Boutons de debug temporaires - À SUPPRIMER EN PRODUCTION */}
      <View style={styles.debugContainer}>
        <TouchableOpacity style={styles.debugButton} onPress={handleDebugData}>
          <Text style={styles.debugText}>Debug Data</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.debugButton} onPress={handleClearData}>
          <Text style={styles.debugText}>Clear All Data</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#7A3EFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logo: {
    width: 350,
    height: 350,
  },
  dotsContainer: {
    flexDirection: 'row',
    marginTop: 40,
    gap: 12,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
  },
  // Styles temporaires pour les boutons de debug
  debugContainer: {
    position: 'absolute',
    bottom: 100,
    flexDirection: 'row',
    gap: 10,
  },
  debugButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  debugText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default SplashScreen;