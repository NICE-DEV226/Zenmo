import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Input, FormCard } from '../components';
import { spacing, borderRadius } from '../theme/spacing';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

const FAQItem = ({ question, answer }: { question: string; answer: string }) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <View style={styles.faqItem}>
            <TouchableOpacity
                style={styles.faqQuestion}
                onPress={() => setExpanded(!expanded)}
            >
                <Text style={styles.faqQuestionText}>{question}</Text>
                <Ionicons
                    name={expanded ? "chevron-up" : "chevron-down"}
                    size={20}
                    color={colors.secondary.goldSoft}
                />
            </TouchableOpacity>
            {expanded && (
                <View style={styles.faqAnswer}>
                    <Text style={styles.faqAnswerText}>{answer}</Text>
                </View>
            )}
        </View>
    );
};

const ContactOption = ({ 
    icon, 
    title, 
    description, 
    onPress 
}: { 
    icon: string; 
    title: string; 
    description: string; 
    onPress: () => void;
}) => (
    <TouchableOpacity style={styles.contactOption} onPress={onPress}>
        <View style={styles.contactIcon}>
            <Ionicons name={icon as any} size={24} color={colors.secondary.goldSoft} />
        </View>
        <View style={styles.contactContent}>
            <Text style={styles.contactTitle}>{title}</Text>
            <Text style={styles.contactDescription}>{description}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.secondary.creamWhite} />
    </TouchableOpacity>
);

export const HelpSupportScreen = () => {
    const navigation = useNavigation();
    const [feedbackMessage, setFeedbackMessage] = useState('');

    const faqs = [
        {
            question: "Comment modifier mon profil ?",
            answer: "Allez dans Paramètres > Informations personnelles pour modifier votre pseudo, bio et autres informations."
        },
        {
            question: "Comment signaler un utilisateur ?",
            answer: "Sur le profil de l'utilisateur, appuyez sur les 3 points en haut à droite et sélectionnez 'Signaler'."
        },
        {
            question: "Mes messages ne s'envoient pas",
            answer: "Vérifiez votre connexion internet. Si le problème persiste, redémarrez l'application."
        },
        {
            question: "Comment supprimer mon compte ?",
            answer: "Contactez notre support via l'option 'Nous contacter' ci-dessous. La suppression est définitive."
        },
        {
            question: "Comment changer mon mot de passe ?",
            answer: "Allez dans Paramètres > Sécurité > Changer le mot de passe."
        },
        {
            question: "L'application plante souvent",
            answer: "Assurez-vous d'avoir la dernière version. Si le problème persiste, contactez le support."
        }
    ];

    const handleEmailSupport = () => {
        Linking.openURL('mailto:support@zenmo.app?subject=Support Zenmo');
    };

    const handleWhatsAppSupport = () => {
        Linking.openURL('https://wa.me/22670000000?text=Bonjour, j\'ai besoin d\'aide avec Zenmo');
    };

    const handleSendFeedback = () => {
        if (!feedbackMessage.trim()) {
            Alert.alert('Erreur', 'Veuillez saisir votre message');
            return;
        }

        // Simuler l'envoi du feedback
        Alert.alert(
            'Merci !',
            'Votre feedback a été envoyé. Nous vous répondrons dans les plus brefs délais.',
            [{ text: 'OK', onPress: () => setFeedbackMessage('') }]
        );
    };

    return (
        <LinearGradient colors={colors.gradients.background} style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <Ionicons name="arrow-back" size={24} color={colors.secondary.creamWhite} />
                </TouchableOpacity>
                <Text style={styles.title}>Aide & Support</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Contact Options */}
                <FormCard style={styles.formCard}>
                    <Text style={styles.sectionTitle}>Nous contacter</Text>
                    
                    <ContactOption
                        icon="mail-outline"
                        title="Email"
                        description="support@zenmo.app"
                        onPress={handleEmailSupport}
                    />

                    <ContactOption
                        icon="logo-whatsapp"
                        title="WhatsApp"
                        description="Support rapide via WhatsApp"
                        onPress={handleWhatsAppSupport}
                    />

                    <ContactOption
                        icon="time-outline"
                        title="Horaires"
                        description="Lun-Ven: 8h-18h (GMT)"
                        onPress={() => {}}
                    />
                </FormCard>

                {/* FAQ */}
                <FormCard style={styles.formCard}>
                    <Text style={styles.sectionTitle}>Questions fréquentes</Text>
                    
                    {faqs.map((faq, index) => (
                        <FAQItem
                            key={index}
                            question={faq.question}
                            answer={faq.answer}
                        />
                    ))}
                </FormCard>

                {/* Feedback */}
                <FormCard style={styles.formCard}>
                    <Text style={styles.sectionTitle}>Envoyer un feedback</Text>
                    
                    <Input
                        label="Votre message"
                        placeholder="Décrivez votre problème ou suggestion..."
                        value={feedbackMessage}
                        onChangeText={setFeedbackMessage}
                        multiline
                        numberOfLines={4}
                        iconLeft="chatbubble-outline"
                    />

                    <TouchableOpacity
                        style={styles.sendButton}
                        onPress={handleSendFeedback}
                    >
                        <Ionicons name="send" size={20} color={colors.primary.blueNight} />
                        <Text style={styles.sendButtonText}>Envoyer</Text>
                    </TouchableOpacity>
                </FormCard>

                {/* App Info */}
                <View style={styles.appInfo}>
                    <Text style={styles.appInfoTitle}>Zenmo v1.0.0</Text>
                    <Text style={styles.appInfoText}>
                        Développé avec ❤️ au Burkina Faso
                    </Text>
                    <Text style={styles.appInfoText}>
                        © 2024 Zenmo. Tous droits réservés.
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
    sectionTitle: {
        fontFamily: typography.fonts.primary,
        fontSize: typography.sizes.h3,
        color: colors.secondary.creamWhite,
        marginBottom: spacing.lg,
        fontWeight: typography.weights.semibold,
    },
    contactOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.glass.white10,
    },
    contactIcon: {
        width: 50,
        height: 50,
        borderRadius: borderRadius.full,
        backgroundColor: colors.glass.white10,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    contactContent: {
        flex: 1,
    },
    contactTitle: {
        fontFamily: typography.fonts.primary,
        fontSize: typography.sizes.body,
        color: colors.secondary.creamWhite,
        fontWeight: typography.weights.medium,
    },
    contactDescription: {
        fontFamily: typography.fonts.primary,
        fontSize: typography.sizes.bodySmall,
        color: colors.secondary.creamWhite,
        opacity: 0.7,
        marginTop: 2,
    },
    faqItem: {
        borderBottomWidth: 1,
        borderBottomColor: colors.glass.white10,
    },
    faqQuestion: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: spacing.md,
    },
    faqQuestionText: {
        flex: 1,
        fontFamily: typography.fonts.primary,
        fontSize: typography.sizes.body,
        color: colors.secondary.creamWhite,
        fontWeight: typography.weights.medium,
    },
    faqAnswer: {
        paddingBottom: spacing.md,
        paddingRight: spacing.lg,
    },
    faqAnswerText: {
        fontFamily: typography.fonts.primary,
        fontSize: typography.sizes.bodySmall,
        color: colors.secondary.creamWhite,
        opacity: 0.8,
        lineHeight: 20,
    },
    sendButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.secondary.goldSoft,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderRadius: borderRadius.lg,
        marginTop: spacing.md,
        gap: spacing.sm,
    },
    sendButtonText: {
        fontFamily: typography.fonts.primary,
        fontSize: typography.sizes.body,
        color: colors.primary.blueNight,
        fontWeight: typography.weights.semibold,
    },
    appInfo: {
        alignItems: 'center',
        paddingVertical: spacing.xl,
        borderTopWidth: 1,
        borderTopColor: colors.glass.white10,
    },
    appInfoTitle: {
        fontFamily: typography.fonts.primary,
        fontSize: typography.sizes.h3,
        color: colors.secondary.goldSoft,
        fontWeight: typography.weights.bold,
        marginBottom: spacing.sm,
    },
    appInfoText: {
        fontFamily: typography.fonts.primary,
        fontSize: typography.sizes.bodySmall,
        color: colors.secondary.creamWhite,
        opacity: 0.7,
        textAlign: 'center',
        marginBottom: spacing.xs,
    },
});

export default HelpSupportScreen;