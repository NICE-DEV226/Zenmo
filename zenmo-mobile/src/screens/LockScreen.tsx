import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../navigation/types';

type LockScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'LockScreen'>;

export const LockScreen = () => {
    const navigation = useNavigation<LockScreenNavigationProp>();
    const [pin, setPin] = useState<string[]>([]);
    const [isBiometricSupported, setIsBiometricSupported] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkBiometricSupport();
    }, []);

    const checkBiometricSupport = async () => {
        const compatible = await LocalAuthentication.hasHardwareAsync();
        setIsBiometricSupported(compatible);

        if (compatible) {
            const savedBiometric = await AsyncStorage.getItem('biometricEnabled');
            if (savedBiometric === 'true') {
                authenticateBiometric();
            }
        }
        setLoading(false);
    };

    const authenticateBiometric = async () => {
        try {
            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: '🔒 Déverrouille Zenmo',
                cancelLabel: 'Annuler',
                fallbackLabel: 'Utiliser mon code PIN',
                disableDeviceFallback: false,
            });

            if (result.success) {
                unlockApp();
            }
        } catch (error) {
            console.error('Biometric auth error:', error);
        }
    };

    const unlockApp = () => {
        navigation.replace('Main');
    };

    const handlePress = async (value: string) => {
        if (value === 'back') {
            setPin(prev => prev.slice(0, -1));
            return;
        }

        if (value === 'biometric') {
            authenticateBiometric();
            return;
        }

        if (pin.length < 4) {
            const newPin = [...pin, value];
            setPin(newPin);

            if (newPin.length === 4) {
                const enteredPin = newPin.join('');
                const isValid = await verifyPIN(enteredPin);

                if (isValid) {
                    setTimeout(unlockApp, 300);
                } else {
                    Alert.alert('Erreur', 'Code PIN incorrect');
                    setPin([]);
                }
            }
        }
    };

    const verifyPIN = async (enteredPin: string): Promise<boolean> => {
        try {
            const savedPinHash = await SecureStore.getItemAsync('userPinHash');
            if (!savedPinHash) {
                console.error('No PIN configured');
                return false;
            }

            const enteredPinHash = await Crypto.digestStringAsync(
                Crypto.CryptoDigestAlgorithm.SHA256,
                enteredPin
            );

            return savedPinHash === enteredPinHash;
        } catch (error) {
            console.error('Error verifying PIN:', error);
            return false;
        }
    };

    const renderKey = (value: string, label?: string | React.ReactNode) => (
        <TouchableOpacity
            style={styles.key}
            onPress={() => handlePress(value)}
            activeOpacity={0.7}
        >
            {typeof label === 'string' ? (
                <Text style={styles.keyText}>{label}</Text>
            ) : (
                label
            )}
        </TouchableOpacity>
    );

    return (
        <LinearGradient colors={['#0D0C1D', '#1A1A2E']} style={styles.container}>
            <SafeAreaView style={styles.content}>
                <View style={styles.header}>
                    <Ionicons name="lock-closed" size={40} color="#E4C66D" />
                    <Text style={styles.title}>Zenmo Locked</Text>
                    <Text style={styles.subtitle}>Entrez votre code PIN</Text>
                </View>

                <View style={styles.pinContainer}>
                    {[0, 1, 2, 3].map((i) => (
                        <View
                            key={i}
                            style={[
                                styles.pinDot,
                                pin.length > i && styles.pinDotFilled
                            ]}
                        />
                    ))}
                </View>

                <View style={styles.keypad}>
                    <View style={styles.row}>
                        {renderKey('1', '1')}
                        {renderKey('2', '2')}
                        {renderKey('3', '3')}
                    </View>
                    <View style={styles.row}>
                        {renderKey('4', '4')}
                        {renderKey('5', '5')}
                        {renderKey('6', '6')}
                    </View>
                    <View style={styles.row}>
                        {renderKey('7', '7')}
                        {renderKey('8', '8')}
                        {renderKey('9', '9')}
                    </View>
                    <View style={styles.row}>
                        {isBiometricSupported ? (
                            renderKey('biometric', <Ionicons name="finger-print" size={32} color="#E4C66D" />)
                        ) : (
                            <View style={styles.key} />
                        )}
                        {renderKey('0', '0')}
                        {renderKey('back', <Ionicons name="backspace" size={28} color="#FFFFFF" />)}
                    </View>
                </View>
            </SafeAreaView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 50,
    },
    title: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 24,
        color: '#FFFFFF',
        marginTop: 20,
    },
    subtitle: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.6)',
        marginTop: 10,
    },
    pinContainer: {
        flexDirection: 'row',
        gap: 20,
        marginBottom: 50,
    },
    pinDot: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#E4C66D',
    },
    pinDotFilled: {
        backgroundColor: '#E4C66D',
    },
    keypad: {
        width: '80%',
        gap: 20,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    key: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    keyText: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 24,
        color: '#FFFFFF',
    },
});

export default LockScreen;
