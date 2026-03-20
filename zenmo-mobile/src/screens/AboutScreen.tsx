import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { FormCard } from '../components';
import { spacing, borderRadius } from '../theme/spacing';

const InfoItem = ({ icon, label, value, onPress }: { icon: string; label: string; value: string; onPress?: () => void }) => (
    <TouchableOpacity style={styles.infoItem} onPress={onPress} disabled={!onPress}>
        <View style={styles.infoLeft}>
            <Ionicons name={icon as any} size={20} color="#E4C66D" />
            <Text style={styles.infoLabel}>{label}</Text>
        </View>
        <View style={styles.infoRight}>
            <Text style={styles.infoValue}>{value}</Text>
            {onPress && <Ionicons name="chevron-forward" size={16} color="#FFFFFF" />}
        </View>
    </TouchableOpacity>
);

const TeamMember = ({ name, role }: { name: string; role: string }) => (
    <View style={styles.teamMember}>
        <View style={styles.memberAvatar}>
            <Text style={styles.memberInitial}>{name.charAt(0)}</Text>
        </View>
        <View style={styles.memberInfo}>
            <Text style={styles.memberName}>{name}</Text>
            <Text style={styles.memberRole}>{role}</Text>
        </View>
    </View>
);

export const AboutScreen = () => {
    const navigation = useNavigation();

    const handleWebsite = () => {
        Linking.openURL('https://zenmo.app');
    };

    const handleEmail = () => {
        Linking.openURL('mailto:contact@zenmo.app');
    };

    const handleTwitter = () => {
        Linking.openURL('https://twitter.com/zenmoapp');
    };

    return (
        <LinearGradient colors={['#0D0C1D', '#1A1A2E']} style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.title}>À propos</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* App Info */}
                <FormCard style={styles.formCard}>
                    <View style={styles.appHeader}>
                        <Image 
                            source={require('../../assets/Zemons.png')} 
                            style={styles.appLogo}
                            resizeMode="contain"
                        />
                        <Text style={styles.appName}>Zenmo</Text>
                        <Text style={styles.appTagline}>Connecte-toi à ton univers</Text>
                    </View>

                    <InfoItem
                        icon="information-circle-outline"
                        label="Version"
                        value="1.0.0"
                    />
                    <InfoItem
                        icon="calendar-outline"
                        label="Date de sortie"
                        value="Janvier 2024"
                    />
                    <InfoItem
                        icon="globe-outline"
                        label="Site web"
                        value="zenmo.app"
                        onPress={handleWebsite}
                    />
                    <InfoItem
                        icon="mail-outline"
                        label="Contact"
                        value="contact@zenmo.app"
                        onPress={handleEmail}
                    />
                </FormCard>

                {/* Mission */}
                <FormCard style={styles.formCard}>
                    <Text style={styles.sectionTitle}>Notre Mission</Text>
                    <Text style={styles.missionText}>
                        Zenmo a été créé pour connecter les jeunes africains et leur permettre de 
                        partager leurs passions, leurs vibes et leurs moments authentiques dans un 
                        environnement sûr et bienveillant.
                    </Text>
                </FormCard>

                {/* Team */}
                <FormCard style={styles.formCard}>
                    <Text style={styles.sectionTitle}>L'Équipe</Text>
                    
                    <TeamMember name="Amadou Traoré" role="Fondateur & CEO" />
                    <TeamMember name="Fatou Ouédraogo" role="CTO" />
                    <TeamMember name="Ibrahim Sawadogo" role="Designer UI/UX" />
                    <TeamMember name="Mariam Kaboré" role="Community Manager" />
                </FormCard>

                {/* Social Links */}
                <FormCard style={styles.formCard}>
                    <Text style={styles.sectionTitle}>Suivez-nous</Text>
                    
                    <View style={styles.socialLinks}>
                        <TouchableOpacity style={styles.socialButton} onPress={handleTwitter}>
                            <Ionicons name="logo-twitter" size={24} color="#FFFFFF" />
                            <Text style={styles.socialText}>Twitter</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity style={styles.socialButton}>
                            <Ionicons name="logo-instagram" size={24} color="#FFFFFF" />
                            <Text style={styles.socialText}>Instagram</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity style={styles.socialButton}>
                            <Ionicons name="logo-facebook" size={24} color="#FFFFFF" />
                            <Text style={styles.socialText}>Facebook</Text>
                        </TouchableOpacity>
                    </View>
                </FormCard>

                {/* Legal */}
                <View style={styles.legalSection}>
                    <Text style={styles.legalText}>
                        © 2024 Zenmo. Tous droits réservés.
                    </Text>
                    <Text style={styles.legalText}>
                        Développé avec ❤️ au Burkina Faso
                    </Text>
                    <Text style={styles.legalSubtext}>
                        Zenmo est une marque déposée de Zenmo SARL
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
        paddingBottom: 40,
    },
    formCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 15,
        padding: spacing.lg,
        marginBottom: spacing.lg,
    },
    appHeader: {
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    appLogo: {
        width: 80,
        height: 80,
        marginBottom: spacing.md,
    },
    appName: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 24,
        color: '#FFFFFF',
        fontWeight: 'bold',
        marginBottom: spacing.xs,
    },
    appTagline: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 14,
        color: '#E4C66D',
        textAlign: 'center',
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    infoLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    infoLabel: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 14,
        color: '#FFFFFF',
    },
    infoRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    infoValue: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 14,
        color: '#E4C66D',
        fontWeight: 'bold',
    },
    sectionTitle: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 16,
        color: '#E4C66D',
        marginBottom: spacing.lg,
        textAlign: 'center',
    },
    missionText: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 14,
        color: '#FFFFFF',
        lineHeight: 24,
        opacity: 0.9,
    },
    teamMember: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    memberAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#E4C66D',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    memberInitial: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 18,
        color: '#0D0C1D',
        fontWeight: 'bold',
    },
    memberInfo: {
        flex: 1,
    },
    memberName: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 14,
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    memberRole: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 12,
        color: '#E4C66D',
        marginTop: 2,
    },
    socialLinks: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        width: '100%',
    },
    socialButton: {
        alignItems: 'center',
        padding: spacing.md,
        borderRadius: 15,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        width: 80,
        height: 80,
        justifyContent: 'center',
    },
    socialText: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 10,
        color: '#FFFFFF',
        marginTop: spacing.xs,
    },
    legalSection: {
        alignItems: 'center',
        paddingVertical: spacing.xl,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
    },
    legalText: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 12,
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: spacing.xs,
        opacity: 0.8,
    },
    legalSubtext: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 10,
        color: '#FFFFFF',
        textAlign: 'center',
        opacity: 0.6,
        marginTop: spacing.sm,
    },
});

export default AboutScreen;