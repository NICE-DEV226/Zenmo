import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { spacing } from '../theme/spacing';

const SettingItem = ({ icon, label, value, type = 'arrow', onPress }: { icon: any, label: string, value?: string | boolean, type?: 'arrow' | 'switch' | 'value', onPress?: () => void }) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress} disabled={type === 'switch'}>
        <View style={styles.settingLeft}>
            <View style={styles.iconContainer}>
                <Ionicons name={icon} size={20} color="#FFFFFF" />
            </View>
            <Text style={styles.settingLabel}>{label}</Text>
        </View>
        <View style={styles.settingRight}>
            {type === 'arrow' && <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.5)" />}
            {type === 'value' && <Text style={styles.settingValue}>{value}</Text>}
            {type === 'switch' && (
                <Switch
                    value={value as boolean}
                    onValueChange={onPress}
                    trackColor={{ false: 'rgba(255,255,255,0.1)', true: '#E4C66D' }}
                    thumbColor={'#FFFFFF'}
                />
            )}
        </View>
    </TouchableOpacity>
);

export const SettingsScreen = () => {
    const navigation = useNavigation();
    const [notifications, setNotifications] = React.useState(true);
    const [darkMode, setDarkMode] = React.useState(true);

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
                <Text style={styles.title}>Paramètres</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Compte</Text>
                    <SettingItem
                        icon="person-outline"
                        label="Informations personnelles"
                        onPress={() => {
                            // @ts-ignore
                            navigation.navigate('PersonalInfo');
                        }}
                    />
                    <SettingItem
                        icon="shield-checkmark-outline"
                        label="Sécurité"
                        onPress={() => {
                            // @ts-ignore
                            navigation.navigate('SecuritySettings');
                        }}
                    />
                    <SettingItem
                        icon="lock-closed-outline"
                        label="Confidentialité"
                        onPress={() => {
                            // @ts-ignore
                            navigation.navigate('PrivacySettings');
                        }}
                    />
                    <SettingItem
                        icon="shield-outline"
                        label="Autorisations"
                        onPress={() => {
                            // @ts-ignore
                            navigation.navigate('PermissionsSettings');
                        }}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Préférences</Text>
                    <SettingItem
                        icon="notifications-outline"
                        label="Notifications"
                        type="switch"
                        value={notifications}
                        onPress={() => setNotifications(!notifications)}
                    />
                    <SettingItem
                        icon="moon-outline"
                        label="Mode Sombre"
                        type="switch"
                        value={darkMode}
                        onPress={() => {
                            setDarkMode(!darkMode);
                            // TODO: Implémenter le changement de thème
                        }}
                    />
                    <SettingItem icon="language-outline" label="Langue" type="value" value="Français" onPress={() => { }} />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Support</Text>
                    <SettingItem
                        icon="help-circle-outline"
                        label="Aide & Support"
                        onPress={() => {
                            // @ts-ignore
                            navigation.navigate('HelpSupport');
                        }}
                    />
                    <SettingItem
                        icon="document-text-outline"
                        label="Conditions d'utilisation"
                        onPress={() => {
                            // @ts-ignore
                            navigation.navigate('TermsOfService');
                        }}
                    />
                    <SettingItem
                        icon="information-circle-outline"
                        label="À propos"
                        value="v1.0.0"
                        type="value"
                        onPress={() => {
                            // @ts-ignore
                            navigation.navigate('About');
                        }}
                    />
                </View>

                <TouchableOpacity style={styles.logoutButton} onPress={async () => {
                    // Nettoyer les tokens d'authentification
                    await AsyncStorage.removeItem('accessToken');
                    await AsyncStorage.removeItem('refreshToken');
                    await AsyncStorage.removeItem('user');
                    await AsyncStorage.removeItem('userProfile');

                    // @ts-ignore
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'Splash' as never }],
                    });
                }}>
                    <Ionicons name="log-out-outline" size={20} color="#FF5E62" />
                    <Text style={styles.logoutText}>Se déconnecter</Text>
                </TouchableOpacity>

            </ScrollView>
        </LinearGradient >
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
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
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
    settingLabel: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 14,
        color: '#FFFFFF',
    },
    settingRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    settingValue: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.5)',
        marginRight: 10,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 94, 98, 0.1)',
        padding: 15,
        borderRadius: 15,
        marginTop: 10,
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
