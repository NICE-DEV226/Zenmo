import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Contacts from 'expo-contacts';
import { spacing } from '../theme/spacing';
import { Avatar } from '../components';
import api from '../services/api';
import { sha256 } from '../utils/sha256';

interface Contact {
    id: string;
    name: string;
    phoneNumber: string;
    isOnZenmo: boolean;
    zenmoUser?: {
        _id: string;
        username: string;
        avatarUrl?: string;
    };
}

export const ContactsScreen = () => {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);

    useEffect(() => {
        loadContacts();
    }, []);

    const loadContacts = async () => {
        try {
            // Demander permission
            const { status } = await Contacts.requestPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert(
                    'Permission requise',
                    'Nous avons besoin d\'accéder à tes contacts pour te connecter avec tes amis sur Zenmo.',
                    [{ text: 'OK' }]
                );
                setLoading(false);
                return;
            }

            // Récupérer contacts téléphone
            const { data } = await Contacts.getContactsAsync({
                fields: [Contacts.Fields.PhoneNumbers],
            });

            // Synchroniser avec backend
            await syncContactsWithBackend(data);

        } catch (error) {
            console.error('Error loading contacts:', error);
            Alert.alert('Erreur', 'Impossible de charger les contacts');
        } finally {
            setLoading(false);
        }
    };

    const syncContactsWithBackend = async (phoneContacts: Contacts.Contact[]) => {
        setSyncing(true);
        try {
            // Extraire numéros de téléphone
            const phoneNumbers = phoneContacts
                .filter(c => c.phoneNumbers && c.phoneNumbers.length > 0)
                .map(c => ({
                    name: c.name || 'Sans nom',
                    phoneNumber: c.phoneNumbers![0].number || '',
                }));

            // Hasher et envoyer au backend
            // Hasher et envoyer au backend
            const hashes = await Promise.all(phoneNumbers.map(c =>
                sha256(c.phoneNumber.replace(/\s+/g, ''))
            ));

            const response = await api.post('/users/contacts/sync', { hashes });

            // Mapper résultats
            const zenmoContacts: Contact[] = phoneNumbers.map((contact, index) => ({
                id: index.toString(),
                name: contact.name,
                phoneNumber: contact.phoneNumber,
                isOnZenmo: response.data.matches?.includes(hashes[index]) || false,
                zenmoUser: response.data.users?.find((u: any) =>
                    u.phoneNumberHash === hashes[index]
                ),
            }));

            // Trier : contacts Zenmo en premier
            zenmoContacts.sort((a, b) => {
                if (a.isOnZenmo && !b.isOnZenmo) return -1;
                if (!a.isOnZenmo && b.isOnZenmo) return 1;
                return a.name.localeCompare(b.name);
            });

            setContacts(zenmoContacts);
        } catch (error) {
            console.error('Error syncing contacts:', error);
        } finally {
            setSyncing(false);
        }
    };

    const handleInvite = (contact: Contact) => {
        Alert.alert(
            'Inviter sur Zenmo',
            `Inviter ${contact.name} à rejoindre Zenmo ?`,
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Inviter',
                    onPress: () => {
                        // TODO: Implémenter invitation (SMS, WhatsApp, etc.)
                        Alert.alert('Invitation envoyée !', `${contact.name} recevra une invitation.`);
                    }
                },
            ]
        );
    };

    const renderContact = ({ item }: { item: Contact }) => (
        <TouchableOpacity style={styles.contactItem}>
            <Avatar
                uri={item.zenmoUser?.avatarUrl}
                size={50}
                style={styles.avatar}
            />
            <View style={styles.contactInfo}>
                <Text style={styles.contactName}>
                    {item.zenmoUser?.username || item.name}
                </Text>
                <Text style={styles.contactPhone}>
                    {item.isOnZenmo ? 'Sur Zenmo' : item.phoneNumber}
                </Text>
            </View>
            {item.isOnZenmo ? (
                <Ionicons name="checkmark-circle" size={24} color="#33D1C4" />
            ) : (
                <TouchableOpacity
                    style={styles.inviteButton}
                    onPress={() => handleInvite(item)}
                >
                    <Text style={styles.inviteText}>Inviter</Text>
                </TouchableOpacity>
            )}
        </TouchableOpacity>
    );

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
                <Text style={styles.headerTitle}>Contacts</Text>
                <TouchableOpacity onPress={loadContacts}>
                    <Ionicons name="refresh" size={24} color="#E4C66D" />
                </TouchableOpacity>
            </View>

            {syncing && (
                <View style={styles.syncBanner}>
                    <ActivityIndicator size="small" color="#E4C66D" />
                    <Text style={styles.syncText}>Synchronisation...</Text>
                </View>
            )}

            {contacts.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="people-outline" size={64} color="rgba(255,255,255,0.3)" />
                    <Text style={styles.emptyText}>Aucun contact</Text>
                    <Text style={styles.emptySubtext}>
                        Autorise l'accès à tes contacts pour retrouver tes amis
                    </Text>
                    <TouchableOpacity style={styles.retryButton} onPress={loadContacts}>
                        <Text style={styles.retryText}>Autoriser</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={contacts}
                    renderItem={renderContact}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                />
            )}
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.xl,
        paddingTop: 60,
        paddingBottom: 20,
    },
    headerTitle: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 28,
        color: '#FFFFFF',
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    syncBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        backgroundColor: 'rgba(228, 198, 109, 0.1)',
        gap: 10,
    },
    syncText: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 14,
        color: '#E4C66D',
    },
    listContent: {
        paddingHorizontal: spacing.lg,
        paddingBottom: 100,
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 15,
        marginBottom: 10,
    },
    avatar: {
        marginRight: 12,
    },
    contactInfo: {
        flex: 1,
    },
    contactName: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 16,
        color: '#FFFFFF',
        marginBottom: 4,
    },
    contactPhone: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.6)',
    },
    inviteButton: {
        backgroundColor: '#E4C66D',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 12,
    },
    inviteText: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 12,
        color: '#0D0C1D',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing.xl,
    },
    emptyText: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 20,
        color: '#FFFFFF',
        marginTop: 20,
    },
    emptySubtext: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.6)',
        marginTop: 10,
        textAlign: 'center',
    },
    retryButton: {
        backgroundColor: '#E4C66D',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
        marginTop: 20,
    },
    retryText: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 14,
        color: '#0D0C1D',
    },
});

export default ContactsScreen;
