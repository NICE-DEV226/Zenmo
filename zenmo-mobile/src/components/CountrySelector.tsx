import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface Country {
    code: string;
    name: string;
    dialCode: string;
    flag: string;
}

export const AFRICAN_COUNTRIES: Country[] = [
    { code: 'DZ', name: 'Algérie', dialCode: '+213', flag: '🇩🇿' },
    { code: 'AO', name: 'Angola', dialCode: '+244', flag: '🇦🇴' },
    { code: 'BJ', name: 'Bénin', dialCode: '+229', flag: '🇧🇯' },
    { code: 'BW', name: 'Botswana', dialCode: '+267', flag: '🇧🇼' },
    { code: 'BF', name: 'Burkina Faso', dialCode: '+226', flag: '🇧🇫' },
    { code: 'BI', name: 'Burundi', dialCode: '+257', flag: '🇧🇮' },
    { code: 'CV', name: 'Cap-Vert', dialCode: '+238', flag: '🇨🇻' },
    { code: 'CM', name: 'Cameroun', dialCode: '+237', flag: '🇨🇲' },
    { code: 'CF', name: 'Centrafrique', dialCode: '+236', flag: '🇨🇫' },
    { code: 'TD', name: 'Tchad', dialCode: '+235', flag: '🇹🇩' },
    { code: 'KM', name: 'Comores', dialCode: '+269', flag: '🇰🇲' },
    { code: 'CG', name: 'Congo', dialCode: '+242', flag: '🇨🇬' },
    { code: 'CD', name: 'RDC', dialCode: '+243', flag: '🇨🇩' },
    { code: 'CI', name: 'Côte d\'Ivoire', dialCode: '+225', flag: '🇨🇮' },
    { code: 'DJ', name: 'Djibouti', dialCode: '+253', flag: '🇩🇯' },
    { code: 'EG', name: 'Égypte', dialCode: '+20', flag: '🇪🇬' },
    { code: 'GQ', name: 'Guinée Équat.', dialCode: '+240', flag: '🇬🇶' },
    { code: 'ER', name: 'Érythrée', dialCode: '+291', flag: '🇪🇷' },
    { code: 'SZ', name: 'Eswatini', dialCode: '+268', flag: '🇸🇿' },
    { code: 'ET', name: 'Éthiopie', dialCode: '+251', flag: '🇪🇹' },
    { code: 'GA', name: 'Gabon', dialCode: '+241', flag: '🇬🇦' },
    { code: 'GM', name: 'Gambie', dialCode: '+220', flag: '🇬🇲' },
    { code: 'GH', name: 'Ghana', dialCode: '+233', flag: '🇬🇭' },
    { code: 'GN', name: 'Guinée', dialCode: '+224', flag: '🇬🇳' },
    { code: 'GW', name: 'Guinée-Bissau', dialCode: '+245', flag: '🇬🇼' },
    { code: 'KE', name: 'Kenya', dialCode: '+254', flag: '🇰🇪' },
    { code: 'LS', name: 'Lesotho', dialCode: '+266', flag: '🇱🇸' },
    { code: 'LR', name: 'Liberia', dialCode: '+231', flag: '🇱🇷' },
    { code: 'LY', name: 'Libye', dialCode: '+218', flag: '🇱🇾' },
    { code: 'MG', name: 'Madagascar', dialCode: '+261', flag: '🇲🇬' },
    { code: 'MW', name: 'Malawi', dialCode: '+265', flag: '🇲🇼' },
    { code: 'ML', name: 'Mali', dialCode: '+223', flag: '🇲🇱' },
    { code: 'MR', name: 'Mauritanie', dialCode: '+222', flag: '🇲🇷' },
    { code: 'MU', name: 'Maurice', dialCode: '+230', flag: '🇲🇺' },
    { code: 'MA', name: 'Maroc', dialCode: '+212', flag: '🇲🇦' },
    { code: 'MZ', name: 'Mozambique', dialCode: '+258', flag: '🇲🇿' },
    { code: 'NA', name: 'Namibie', dialCode: '+264', flag: '🇳🇦' },
    { code: 'NE', name: 'Niger', dialCode: '+227', flag: '🇳🇪' },
    { code: 'NG', name: 'Nigeria', dialCode: '+234', flag: '🇳🇬' },
    { code: 'RW', name: 'Rwanda', dialCode: '+250', flag: '🇷🇼' },
    { code: 'ST', name: 'Sao Tomé', dialCode: '+239', flag: '🇸🇹' },
    { code: 'SN', name: 'Sénégal', dialCode: '+221', flag: '🇸🇳' },
    { code: 'SC', name: 'Seychelles', dialCode: '+248', flag: '🇸🇨' },
    { code: 'SL', name: 'Sierra Leone', dialCode: '+232', flag: '🇸🇱' },
    { code: 'SO', name: 'Somalie', dialCode: '+252', flag: '🇸🇴' },
    { code: 'ZA', name: 'Afrique du Sud', dialCode: '+27', flag: '🇿🇦' },
    { code: 'SS', name: 'Soudan du Sud', dialCode: '+211', flag: '🇸🇸' },
    { code: 'SD', name: 'Soudan', dialCode: '+249', flag: '🇸🇩' },
    { code: 'TZ', name: 'Tanzanie', dialCode: '+255', flag: '🇹🇿' },
    { code: 'TG', name: 'Togo', dialCode: '+228', flag: '🇹🇬' },
    { code: 'TN', name: 'Tunisie', dialCode: '+216', flag: '🇹🇳' },
    { code: 'UG', name: 'Ouganda', dialCode: '+256', flag: '🇺🇬' },
    { code: 'ZM', name: 'Zambie', dialCode: '+260', flag: '🇿🇲' },
    { code: 'ZW', name: 'Zimbabwe', dialCode: '+263', flag: '🇿🇼' },
];

interface CountrySelectorProps {
    selectedCountry: Country;
    onSelect: (country: Country) => void;
    label?: string;
    style?: any;
    showDialCode?: boolean;
}

export const CountrySelector: React.FC<CountrySelectorProps> = ({ selectedCountry, onSelect, label, style, showDialCode = true }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredCountries = useMemo(() => {
        return AFRICAN_COUNTRIES.filter(country =>
            country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            country.dialCode.includes(searchQuery) ||
            country.code.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery]);

    const renderCountryItem = ({ item }: { item: Country }) => (
        <TouchableOpacity
            style={styles.countryItem}
            onPress={() => {
                onSelect(item);
                setModalVisible(false);
                setSearchQuery('');
            }}
        >
            <Text style={styles.flag}>{item.flag}</Text>
            <Text style={styles.countryName}>{item.name}</Text>
            <Text style={styles.dialCode}>{item.dialCode}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, style]}>
            {label && <Text style={styles.label}>{label}</Text>}

            <TouchableOpacity
                style={styles.selector}
                onPress={() => setModalVisible(true)}
            >
                <Text style={styles.selectedFlag}>{selectedCountry.flag}</Text>
                {showDialCode && <Text style={styles.selectedDialCode}>{selectedCountry.dialCode}</Text>}
                <Ionicons name="chevron-down" size={16} color="#FFFFFF" style={styles.chevron} />
            </TouchableOpacity>

            <Modal
                visible={modalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Sélectionne ton pays</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#FFFFFF" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.searchContainer}>
                            <Ionicons name="search" size={20} color="rgba(255, 255, 255, 0.5)" />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Rechercher un pays..."
                                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                        </View>

                        <FlatList
                            data={filteredCountries}
                            renderItem={renderCountryItem}
                            keyExtractor={(item) => item.code}
                            style={styles.list}
                            initialNumToRender={15}
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    label: {
        color: '#FFFFFF',
        fontFamily: 'PottaOne-Regular',
        fontSize: 14,
        marginBottom: 8,
        marginLeft: 4,
    },
    selector: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        paddingHorizontal: 8,
        height: 50,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        gap: 4,
        justifyContent: 'space-between',
    },
    selectedFlag: {
        fontSize: 20,
    },
    selectedDialCode: {
        color: '#FFFFFF',
        fontSize: 14,
        fontFamily: 'PottaOne-Regular',
        flex: 1,
    },
    chevron: {
        opacity: 0.7,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#1A1A2E',
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        paddingTop: 20,
        maxHeight: '80%', // Increased height
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    modalTitle: {
        fontSize: 20,
        fontFamily: 'PottaOne-Regular',
        color: '#FFFFFF',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        margin: 20,
        paddingHorizontal: 15,
        borderRadius: 12,
        height: 45,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        color: '#FFFFFF',
        fontFamily: 'PottaOne-Regular',
        fontSize: 16,
    },
    list: {
        paddingHorizontal: 20,
    },
    countryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    },
    flag: {
        fontSize: 28,
        marginRight: 15,
    },
    countryName: {
        flex: 1,
        fontSize: 16,
        fontFamily: 'PottaOne-Regular',
        color: '#FFFFFF',
    },
    dialCode: {
        fontSize: 14,
        fontFamily: 'PottaOne-Regular',
        color: 'rgba(255, 255, 255, 0.6)',
    },
});
