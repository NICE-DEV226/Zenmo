import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { spacing } from '../theme/spacing';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const InfoItem = ({ icon, label, value, editable = false, onChangeText, multiline = false }: { 
    icon: string; 
    label: string; 
    value: string; 
    editable?: boolean; 
    onChangeText?: (text: string) => void;
    multiline?: boolean;
}) => (
    <View style={styles.infoItem}>
        <View style={styles.infoLeft}>
            <View style={styles.iconContainer}>
                <Ionicons name={icon as any} size={20} color="#FFFFFF" />
            </View>
            <Text style={styles.infoLabel}>{label}</Text>
        </View>
        <View style={styles.infoRight}>
            {editable ? (
                <TextInput
                    style={[styles.infoInput, multiline && styles.multilineInput]}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={`Entrer ${label.toLowerCase()}`}
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    multiline={multiline}
                />
            ) : (
                <Text style={[styles.infoValue, !editable && styles.disabledValue]}>{value || 'Non défini'}</Text>
            )}
        </View>
    </View>
);

export const PersonalInfoScreen = () => {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [userInfo, setUserInfo] = useState({
        username: '',
        email: '',
        phoneNumber: '',
        bio: '',
        countryCode: '',
        gender: ''
    });

    useEffect(() => {
        loadUserInfo();
    }, []);

    const loadUserInfo = async () => {
        try {
            const response = await api.get('/users/me/profile');
            setUserInfo(response.data);
        } catch (error: any) {
            console.error('Error loading user info:', error);
            if (error.response?.status === 401) {
                // L'API gère déjà la redirection, pas besoin d'afficher d'alerte
                return;
            }
            Alert.alert('Erreur', 'Impossible de charger les informations');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.patch('/users/me/profile', userInfo);
            await AsyncStorage.setItem('userProfile', JSON.stringify(userInfo));
            Alert.alert('Succès', 'Informations mises à jour');
        } catch (error: any) {
            console.error('Error saving user info:', error);
            if (error.response?.status === 401) {
                // L'API gère déjà la redirection, pas besoin d'afficher d'alerte
                return;
            }
            Alert.alert('Erreur', 'Impossible de sauvegarder les modifications');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <LinearGradient colors={['#0D0C1D', '#1A1A2E']} style={styles.container}>
                <ActivityIndicator size="large" color="#E4C66D" style={styles.loader} />
            </LinearGradient>
        );
    }

    return (
        <LinearGradient colors={['#0D0C1D', '#1A1A2E']} style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.title}>Informations personnelles</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Informations modifiables</Text>
                    
                    <InfoItem
                        icon="person-outline"
                        label="Nom d'utilisateur"
                        value={userInfo.username}
                        editable={true}
                        onChangeText={(text) => setUserInfo({...userInfo, username: text})}
                    />

                    <InfoItem
                        icon="text-outline"
                        label="Bio"
                        value={userInfo.bio}
                        editable={true}
                        multiline={true}
                        onChangeText={(text) => setUserInfo({...userInfo, bio: text})}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Informations protégées</Text>
                    
                    <InfoItem
                        icon="mail-outline"
                        label="Email"
                        value={userInfo.email}
                        editable={false}
                    />

                    <InfoItem
                        icon="call-outline"
                        label="Téléphone"
                        value={userInfo.phoneNumber}
                        editable={false}
                    />

                    <InfoItem
                        icon="location-outline"
                        label="Pays"
                        value={userInfo.countryCode}
                        editable={false}
                    />

                    <InfoItem
                        icon="person-outline"
                        label="Genre"
                        value={userInfo.gender === 'male' ? 'Homme' : userInfo.gender === 'female' ? 'Femme' : ''}
                        editable={false}
                    />
                </View>

                <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
                    {saving ? (
                        <ActivityIndicator size="small" color="#0D0C1D" />
                    ) : (
                        <>
                            <Ionicons name="save-outline" size={20} color="#0D0C1D" />
                            <Text style={styles.saveText}>Sauvegarder les modifications</Text>
                        </>
                    )}
                </TouchableOpacity>

                <View style={styles.infoNote}>
                    <Ionicons name="information-circle-outline" size={16} color="#E4C66D" />
                    <Text style={styles.infoText}>
                        L'email et le téléphone ne peuvent pas être modifiés pour des raisons de sécurité.
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
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        padding: 15,
        borderRadius: 15,
        marginBottom: 10,
        minHeight: 60,
    },
    infoLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1.5,
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
    infoLabel: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 13,
        color: '#FFFFFF',
        flex: 1,
        flexWrap: 'nowrap',
    },
    infoRight: {
        flex: 1,
        alignItems: 'flex-end',
    },
    infoValue: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 12,
        color: '#E4C66D',
        textAlign: 'right',
    },
    disabledValue: {
        color: 'rgba(255, 255, 255, 0.5)',
    },
    infoInput: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 12,
        color: '#FFFFFF',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        padding: 8,
        borderRadius: 8,
        minWidth: 150,
        textAlign: 'right',
    },
    multilineInput: {
        minHeight: 60,
        textAlignVertical: 'top',
    },
    saveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#E4C66D',
        padding: 15,
        borderRadius: 15,
        marginTop: 10,
        gap: 10,
    },
    saveText: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 14,
        color: '#0D0C1D',
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

export default PersonalInfoScreen;