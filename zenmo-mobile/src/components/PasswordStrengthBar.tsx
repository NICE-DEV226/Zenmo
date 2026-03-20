import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

interface PasswordStrengthBarProps {
    password?: string;
}

const PasswordStrengthBar: React.FC<PasswordStrengthBarProps> = ({ password = '' }) => {
    const [strength, setStrength] = useState<'weak' | 'medium' | 'strong'>('weak');
    const [widthAnim] = useState(new Animated.Value(0));

    useEffect(() => {
        const len = password.length;
        let newStrength: 'weak' | 'medium' | 'strong' = 'weak';
        let targetWidth = 0;

        if (len === 0) {
            targetWidth = 0;
        } else if (len < 6) {
            newStrength = 'weak';
            targetWidth = 33;
        } else if (len < 10) {
            newStrength = 'medium';
            targetWidth = 66;
        } else {
            newStrength = 'strong';
            targetWidth = 100;
        }

        setStrength(newStrength);

        Animated.timing(widthAnim, {
            toValue: targetWidth,
            duration: 300,
            useNativeDriver: false,
        }).start();
    }, [password]);

    const getColor = () => {
        switch (strength) {
            case 'weak': return '#FF6B6B';
            case 'medium': return '#FFD93D';
            case 'strong': return '#6BCF7F';
        }
    };

    const getLabel = () => {
        if (password.length === 0) return '';
        switch (strength) {
            case 'weak': return 'Faible';
            case 'medium': return 'Moyen';
            case 'strong': return 'Fort';
        }
    };

    if (password.length === 0) return null;

    return (
        <View style={styles.container}>
            <View style={styles.barBackground}>
                <Animated.View
                    style={[
                        styles.barFill,
                        {
                            width: widthAnim.interpolate({
                                inputRange: [0, 100],
                                outputRange: ['0%', '100%'],
                            }),
                            backgroundColor: getColor(),
                        },
                    ]}
                />
            </View>
            <Text style={[styles.label, { color: getColor() }]}>{getLabel()}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 8,
        marginBottom: 16,
        width: '100%',
    },
    barBackground: {
        height: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 2,
        overflow: 'hidden',
    },
    barFill: {
        height: '100%',
        borderRadius: 2,
    },
    label: {
        marginTop: 4,
        fontSize: 12,
        fontFamily: 'PottaOne-Regular',
        textAlign: 'right',
    },
});

export default PasswordStrengthBar;
