import React from 'react';
import { View, Image, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

interface AvatarProps {
    uri?: string | null;
    size?: number;
    style?: ViewStyle;
    borderColor?: string;
    borderWidth?: number;
    showBorder?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({
    uri,
    size = 50,
    style,
    borderColor = colors.secondary.goldSoft,
    borderWidth = 2,
    showBorder = true
}) => {
    const avatarStyle = {
        width: size,
        height: size,
        borderRadius: size / 2,
        ...(showBorder && {
            borderWidth,
            borderColor
        })
    };

    const iconSize = size * 0.5; // L'icône fait 50% de la taille de l'avatar

    if (uri && uri.trim() !== '') {
        return (
            <Image
                source={{ uri }}
                style={[avatarStyle, style]}
                defaultSource={undefined}
            />
        );
    }

    // Avatar par défaut avec icône
    return (
        <View style={[
            avatarStyle,
            {
                backgroundColor: colors.glass.white10,
                alignItems: 'center',
                justifyContent: 'center',
            },
            style
        ]}>
            <Ionicons 
                name="person" 
                size={iconSize} 
                color={colors.secondary.goldSoft} 
            />
        </View>
    );
};

const styles = StyleSheet.create({
    // Styles peuvent être ajoutés ici si nécessaire
});