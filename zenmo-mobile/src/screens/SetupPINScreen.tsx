import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../navigation/types';
import { useCustomAlert } from '../components';

type SetupPINScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'SetupPIN'>;

export const SetupPINScreen = () => {
    const navigation = useNavigation<SetupPINScreenNavigationProp>();
    const { showAlert, AlertComponent } = useCustomAlert();
    const [pin, setPin] = useState<string[]>([]);
    const [confirmPin, setConfirmPin] = useState<string[]>([]);
    const [isConfirming, setIsConfirming] = useState(false);

    const handlePress = async (value: string) => {
        if (value === 'back') {
            if (isConfirming) {
                setConfirmPin(prev => prev.slice(0, -1));
            } else {
                setPin(prev => prev.slice(0, -1));
            }
            return;
        }

        if (!isConfirming) {
            // Première saisie
            if (pin.length < 4) {
                const newPin = [...pin, value];
                setPin(newPin);

                if (newPin.length === 4) {
                    setTimeout(() => setIsConfirming(true), 300);
                }
            }
        } else {
            // Confirmation
            if (confirmPin.length < 4) {
                const newConfirmPin = [...confirmPin, value];
                setConfirmPin(newConfirmPin);

                if (newConfirmPin.length === 4) {
                    const enteredPin = pin.join('');
                    const confirmedPin = newConfirmPin.join('');

                    if (enteredPin === confirmedPin) {
                        await savePIN(enteredPin);
                    } else {
                        showAlert({
                            type: 'error',
                            title: 'Erreur',
                            message: 'Les codes PIN ne correspondent pas',
                            buttons: [
                                {
                                    text: 'Réessayer',
                                    onPress: () => {
                                        setPin([]);
                                        setConfirmPin([]);
                                        setIsConfirming(false);
                                    }
                                }
                            ]
                        });
                    }
                }
            }
        }
    };

    const savePIN = async (pinCode: string) => {
        try {
            // Hash le PIN avec SHA-256
            const pinHash = await Crypto.digestStringAsync(
                Crypto.CryptoDigestAlgorithm.SHA256,
                pinCode
            );

            // Sauvegarder dans SecureStore
            await SecureStore.setItemAsync('userPinHash', pinHash);
            await SecureStore.setItemAsync('pinConfigured', 'true');

            showAlert({
                type: 'success',
                title: 'Code PIN configuré !',
                message: 'Votre code PIN a été enregistré avec succès.',
                buttons: [
                    {
                        text: 'OK',
                        onPress: () => navigation.replace('Main')
                    }
                ]
            });
        } catch (error) {
            console.error('Error saving PIN:', error);
            showAlert({
                type: 'error',
                title: 'Erreur',
                message: 'Impossible de sauvegarder le code PIN'
            });
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

    const currentPin = isConfirming ? confirmPin : pin;

    return (
        <LinearGradient colors={['#0D0C1D', '#1A1A2E']} style={styles.container}>
            <SafeAreaView style={styles.content}>
                <View style={styles.header}>
                    <Ionicons name="shield-checkmark" size={50} color="#E4C66D" />
                    <Text style={styles.title}>
                        {isConfirming ? 'Confirmez votre code PIN' : 'Créez votre code PIN'}
                    </Text>
                    <Text style={styles.subtitle}>
                        {isConfirming
                            ? 'Entrez à nouveau votre code PIN'
                            : 'Choisissez un code à 4 chiffres'}
                    </Text>
                </View>

                <View style={styles.pinContainer}>
                    {[0, 1, 2, 3].map((i) => (
                        <View
                            key={i}
                            style={[
                                styles.pinDot,
                                currentPin.length > i && styles.pinDotFilled
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
                        <View style={styles.key} />
                        {renderKey('0', '0')}
                        {renderKey('back', <Ionicons name="backspace" size={28} color="#FFFFFF" />)}
                    </View>
                </View>
            </SafeAreaView>
            <AlertComponent />
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
        textAlign: 'center',
    },
    subtitle: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.6)',
        marginTop: 10,
        textAlign: 'center',
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

export default SetupPINScreen;
