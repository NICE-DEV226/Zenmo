import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Svg, { Defs, Pattern, Rect, Circle, Path } from 'react-native-svg';
import { colors } from '../theme/colors';

interface PatternBackgroundProps {
    style?: ViewStyle;
    pattern?: 'adinkra' | 'kente' | 'bogolan' | 'geometric';
    opacity?: number;
    color?: string;
}

export const PatternBackground: React.FC<PatternBackgroundProps> = ({
    style,
    pattern = 'geometric',
    opacity = 0.08,
    color = colors.secondary.goldSoft,
}) => {
    const renderPattern = () => {
        switch (pattern) {
            case 'adinkra':
                return (
                    <Svg height="100%" width="100%" style={StyleSheet.absoluteFillObject}>
                        <Defs>
                            <Pattern
                                id="adinkra"
                                patternUnits="userSpaceOnUse"
                                width="60"
                                height="60"
                            >
                                {/* Symbole Adinkra stylisé - Sankofa */}
                                <Circle cx="30" cy="30" r="15" fill="none" stroke={color} strokeWidth="2" opacity={opacity} />
                                <Path
                                    d="M20 30 Q30 20 40 30 Q30 40 20 30"
                                    fill="none"
                                    stroke={color}
                                    strokeWidth="2"
                                    opacity={opacity}
                                />
                            </Pattern>
                        </Defs>
                        <Rect width="100%" height="100%" fill="url(#adinkra)" />
                    </Svg>
                );

            case 'kente':
                return (
                    <Svg height="100%" width="100%" style={StyleSheet.absoluteFillObject}>
                        <Defs>
                            <Pattern
                                id="kente"
                                patternUnits="userSpaceOnUse"
                                width="40"
                                height="40"
                            >
                                {/* Motif Kente stylisé */}
                                <Rect x="0" y="0" width="20" height="20" fill={color} opacity={opacity} />
                                <Rect x="20" y="20" width="20" height="20" fill={color} opacity={opacity} />
                                <Rect x="0" y="20" width="20" height="20" fill="none" stroke={color} strokeWidth="1" opacity={opacity * 0.5} />
                                <Rect x="20" y="0" width="20" height="20" fill="none" stroke={color} strokeWidth="1" opacity={opacity * 0.5} />
                            </Pattern>
                        </Defs>
                        <Rect width="100%" height="100%" fill="url(#kente)" />
                    </Svg>
                );

            case 'bogolan':
                return (
                    <Svg height="100%" width="100%" style={StyleSheet.absoluteFillObject}>
                        <Defs>
                            <Pattern
                                id="bogolan"
                                patternUnits="userSpaceOnUse"
                                width="80"
                                height="80"
                            >
                                {/* Motif Bogolan stylisé */}
                                <Circle cx="20" cy="20" r="3" fill={color} opacity={opacity} />
                                <Circle cx="60" cy="20" r="3" fill={color} opacity={opacity} />
                                <Circle cx="20" cy="60" r="3" fill={color} opacity={opacity} />
                                <Circle cx="60" cy="60" r="3" fill={color} opacity={opacity} />
                                <Path
                                    d="M40 10 L50 30 L40 50 L30 30 Z"
                                    fill="none"
                                    stroke={color}
                                    strokeWidth="1"
                                    opacity={opacity}
                                />
                            </Pattern>
                        </Defs>
                        <Rect width="100%" height="100%" fill="url(#bogolan)" />
                    </Svg>
                );

            case 'geometric':
            default:
                return (
                    <Svg height="100%" width="100%" style={StyleSheet.absoluteFillObject}>
                        <Defs>
                            <Pattern
                                id="geometric"
                                patternUnits="userSpaceOnUse"
                                width="50"
                                height="50"
                            >
                                {/* Motif géométrique moderne inspiré de l'art africain */}
                                <Path
                                    d="M25 5 L45 25 L25 45 L5 25 Z"
                                    fill="none"
                                    stroke={color}
                                    strokeWidth="1"
                                    opacity={opacity}
                                />
                                <Circle cx="25" cy="25" r="8" fill="none" stroke={color} strokeWidth="1" opacity={opacity * 0.6} />
                                <Circle cx="25" cy="25" r="3" fill={color} opacity={opacity * 0.8} />
                            </Pattern>
                        </Defs>
                        <Rect width="100%" height="100%" fill="url(#geometric)" />
                    </Svg>
                );
        }
    };

    return (
        <View style={[styles.container, style]}>
            {renderPattern()}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0,
    },
});

export default PatternBackground;