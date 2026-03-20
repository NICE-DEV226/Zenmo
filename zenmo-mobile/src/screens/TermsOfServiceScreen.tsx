import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { FormCard } from '../components';
import { spacing, borderRadius } from '../theme/spacing';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

export const TermsOfServiceScreen = () => {
    const navigation = useNavigation();

    return (
        <LinearGradient colors={colors.gradients.background} style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <Ionicons name="arrow-back" size={24} color={colors.secondary.creamWhite} />
                </TouchableOpacity>
                <Text style={styles.title}>Conditions d'utilisation</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <FormCard style={styles.formCard}>
                    <Text style={styles.lastUpdated}>Dernière mise à jour : 1er Janvier 2024</Text>
                    
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>1. Acceptation des conditions</Text>
                        <Text style={styles.sectionText}>
                            En utilisant Zenmo, vous acceptez d'être lié par ces conditions d'utilisation. 
                            Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre service.
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>2. Description du service</Text>
                        <Text style={styles.sectionText}>
                            Zenmo est une plateforme de réseau social qui permet aux utilisateurs de partager 
                            des contenus, communiquer et interagir avec d'autres utilisateurs.
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>3. Compte utilisateur</Text>
                        <Text style={styles.sectionText}>
                            • Vous devez avoir au moins 13 ans pour créer un compte{'\n'}
                            • Vous êtes responsable de la sécurité de votre compte{'\n'}
                            • Une seule personne peut utiliser un compte{'\n'}
                            • Vous devez fournir des informations exactes
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>4. Contenu utilisateur</Text>
                        <Text style={styles.sectionText}>
                            • Vous conservez la propriété de votre contenu{'\n'}
                            • Vous accordez à Zenmo une licence d'utilisation{'\n'}
                            • Vous êtes responsable du contenu que vous publiez{'\n'}
                            • Le contenu illégal ou offensant est interdit
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>5. Comportement acceptable</Text>
                        <Text style={styles.sectionText}>
                            Il est interdit de :{'\n'}
                            • Harceler ou intimider d'autres utilisateurs{'\n'}
                            • Publier du contenu illégal ou offensant{'\n'}
                            • Usurper l'identité d'autrui{'\n'}
                            • Spammer ou envoyer des messages non sollicités{'\n'}
                            • Violer les droits d'auteur
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>6. Confidentialité</Text>
                        <Text style={styles.sectionText}>
                            Votre vie privée est importante pour nous. Consultez notre Politique de 
                            Confidentialité pour comprendre comment nous collectons et utilisons vos données.
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>7. Résiliation</Text>
                        <Text style={styles.sectionText}>
                            Nous nous réservons le droit de suspendre ou supprimer votre compte en cas 
                            de violation de ces conditions.
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>8. Modifications</Text>
                        <Text style={styles.sectionText}>
                            Nous pouvons modifier ces conditions à tout moment. Les modifications 
                            prendront effet dès leur publication dans l'application.
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>9. Contact</Text>
                        <Text style={styles.sectionText}>
                            Pour toute question concernant ces conditions, contactez-nous à :{'\n'}
                            support@zenmo.app
                        </Text>
                    </View>
                </FormCard>
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
        justifyContent: 'space-between',
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.glass.white10,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: borderRadius.full,
        backgroundColor: colors.glass.white10,
    },
    title: {
        fontFamily: typography.fonts.primary,
        fontSize: typography.sizes.h3,
        color: colors.secondary.creamWhite,
        fontWeight: typography.weights.semibold,
    },
    headerSpacer: {
        width: 40,
    },
    content: {
        padding: spacing.lg,
        paddingBottom: 40,
    },
    formCard: {
        marginBottom: spacing.lg,
    },
    lastUpdated: {
        fontFamily: typography.fonts.primary,
        fontSize: typography.sizes.caption,
        color: colors.secondary.goldSoft,
        textAlign: 'center',
        marginBottom: spacing.xl,
        fontStyle: 'italic',
    },
    section: {
        marginBottom: spacing.lg,
    },
    sectionTitle: {
        fontFamily: typography.fonts.primary,
        fontSize: typography.sizes.body,
        color: colors.secondary.goldSoft,
        fontWeight: typography.weights.semibold,
        marginBottom: spacing.sm,
    },
    sectionText: {
        fontFamily: typography.fonts.primary,
        fontSize: typography.sizes.bodySmall,
        color: colors.secondary.creamWhite,
        lineHeight: 22,
        opacity: 0.9,
    },
});

export default TermsOfServiceScreen;