import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { spacing, borderRadius } from '../theme/spacing';
import { typography } from '../theme/typography';
import { AFRICAN_COUNTRIES, type Country } from './CountrySelector';

interface PhoneInputProps {
    label?: string;
    placeholder?: string;
    value: string;
    onChangeText: (text: string) => void;
    selectedCountry: Country;
    onCountrySelect: (country: Country) => void;
    error?: string;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
    label,
    placeholder = "612345678",
    value,
    onChangeText,
    selectedCountry,
    onCountrySelect,
    error,
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredCountries = AFRICAN_COUNTRIES.filter(country =>
        country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        country.dialCode.includes(searchQuery)
    );

    const handleCountrySelect = (country: Country) => {
        onCountrySelect(country);
        setModalVisible(false);
        setSearchQuery('');
    };

    const renderCountryItem = ({ item }: { item: Country }) => (
        <TouchableOpacity
            style={styles.countryItem}
            onPress={() => handleCountrySelect(item)}
        >
            <Text style={styles.countryFlag}>{item.flag}</Text>
            <Text style={styles.countryName}>{item.name}</Text>
            <Text style={styles.countryDialCode}>{item.dialCode}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {label && (
                <Text style={[styles.label, isFocused && styles.labelFocused]}>
                    {label}
                </Text>
            )}

            <View
                style={[
                    styles.inputContainer,
                    isFocused && styles.inputContainerFocused,
                    !!error && styles.inputContainerError,
                ]}
            >
                {/* Sélecteur de pays */}
                <TouchableOpacity
                    style={styles.countrySelector}
                    onPress={() => setModalVisible(true)}
                >
                    <Text style={styles.selectedFlag}>{selectedCountry.flag}</Text>
                    <Text style={styles.selectedDialCode}>{selectedCountry.dialCode}</Text>
                    <Ionicons name="chevron-down" size={14} color="rgba(255, 255, 255, 0.7)" />
                </TouchableOpacity>

                {/* Séparateur */}
                <View style={styles.separator} />

                {/* Champ numéro */}
                <TextInput
                    style={styles.input}
                    placeholder={placeholder}
                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                    value={value}
                    onChangeText={onChangeText}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    keyboardType="phone-pad"
                />
            </View>

            {error && (
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={16} color={colors.semantic.error} />
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            )}

            {/* Modal de sélection de pays */}
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
                                <Ionicons name="close" size={24} color={colors.secondary.creamWhite} />
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
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.lg,
        width: '100%',
    },
    label: {
        color: colors.secondary.creamWhite,
        fontFamily: typography.fonts.primary,
        fontSize: typography.sizes.bodySmall,
        marginBottom: spacing.sm,
        marginLeft: spacing.xs,
        letterSpacing: 0.5,
    },
    labelFocused: {
        color: colors.secondary.goldSoft,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.glass.white10,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        borderColor: colors.glass.white20,
        height: 50,
        overflow: 'hidden',
    },
    inputContainerFocused: {
        borderColor: colors.secondary.goldSoft,
        borderWidth: 2,
        backgroundColor: colors.glass.white10,
    },
    inputContainerError: {
        borderColor: colors.semantic.error,
        borderWidth: 2,
        backgroundColor: 'rgba(255, 107, 107, 0.1)',
    },
    countrySelector: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        gap: spacing.xs,
        minWidth: 90,
    },
    selectedFlag: {
        fontSize: 18,
    },
    selectedDialCode: {
        color: colors.secondary.creamWhite,
        fontSize: typography.sizes.bodySmall,
        fontFamily: typography.fonts.primary,
    },
    separator: {
        width: 1,
        height: '60%',
        backgroundColor: colors.glass.white20,
        marginHorizontal: spacing.xs,
    },
    input: {
        flex: 1,
        color: colors.secondary.creamWhite,
        fontFamily: typography.fonts.primary,
        fontSize: typography.sizes.body,
        paddingHorizontal: spacing.md,
        paddingVertical: 0,
        height: '100%',
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: spacing.sm,
        marginLeft: spacing.xs,
    },
    errorText: {
        color: colors.semantic.error,
        fontSize: typography.sizes.caption,
        marginLeft: spacing.xs,
        fontFamily: typography.fonts.primary,
        flex: 1,
    },
    
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: colors.primary.blueNight,
        borderTopLeftRadius: borderRadius.xl,
        borderTopRightRadius: borderRadius.xl,
        maxHeight: '80%',
        paddingTop: spacing.lg,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.xl,
        paddingBottom: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.glass.white20,
    },
    modalTitle: {
        fontSize: typography.sizes.h3,
        fontFamily: typography.fonts.primary,
        color: colors.secondary.creamWhite,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.glass.white10,
        margin: spacing.xl,
        paddingHorizontal: spacing.lg,
        borderRadius: borderRadius.lg,
        height: 50,
    },
    searchInput: {
        flex: 1,
        color: colors.secondary.creamWhite,
        fontFamily: typography.fonts.primary,
        fontSize: typography.sizes.body,
        marginLeft: spacing.md,
    },
    list: {
        paddingHorizontal: spacing.xl,
    },
    countryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.glass.white10,
    },
    countryFlag: {
        fontSize: 24,
        marginRight: spacing.lg,
    },
    countryName: {
        flex: 1,
        color: colors.secondary.creamWhite,
        fontFamily: typography.fonts.primary,
        fontSize: typography.sizes.body,
    },
    countryDialCode: {
        color: colors.secondary.goldSoft,
        fontFamily: typography.fonts.primary,
        fontSize: typography.sizes.bodySmall,
    },
});

export default PhoneInput;