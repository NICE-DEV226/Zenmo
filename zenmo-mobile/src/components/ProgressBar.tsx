import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';

interface Step {
    label: string;
    completed: boolean;
    current: boolean;
}

interface ProgressBarProps {
    steps: Step[];
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ steps }) => {
    return (
        <View style={styles.container}>
            {/* Labels */}
            <View style={styles.labelsContainer}>
                {steps.map((step, index) => (
                    <Text 
                        key={index} 
                        style={[
                            styles.stepLabel,
                            step.current && styles.currentStepLabel,
                            step.completed && styles.completedStepLabel
                        ]}
                    >
                        {step.label}
                    </Text>
                ))}
            </View>

            {/* Progress Line and Circles */}
            <View style={styles.progressContainer}>
                {/* Background Line */}
                <View style={styles.backgroundLine} />
                
                {/* Progress Line */}
                <View 
                    style={[
                        styles.progressLine,
                        { 
                            width: `${(steps.filter(s => s.completed).length / (steps.length - 1)) * 100}%` 
                        }
                    ]} 
                />

                {/* Step Circles */}
                {steps.map((step, index) => (
                    <View 
                        key={index}
                        style={[
                            styles.stepCircle,
                            { left: `${(index / (steps.length - 1)) * 100}%` },
                            step.completed && styles.completedCircle,
                            step.current && styles.currentCircle
                        ]}
                    >
                        {step.completed ? (
                            <Ionicons 
                                name="checkmark" 
                                size={16} 
                                color={colors.primary.blueNight} 
                            />
                        ) : (
                            <View style={[
                                styles.innerCircle,
                                step.current && styles.currentInnerCircle
                            ]} />
                        )}
                    </View>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        paddingHorizontal: spacing.md,
    },
    labelsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.md,
    },
    stepLabel: {
        fontFamily: typography.fonts.primary,
        fontSize: typography.sizes.caption,
        color: colors.secondary.creamWhite,
        opacity: 0.6,
        fontWeight: typography.weights.medium,
        textAlign: 'center',
        flex: 1,
    },
    currentStepLabel: {
        color: colors.secondary.goldSoft,
        opacity: 1,
        fontWeight: typography.weights.bold,
    },
    completedStepLabel: {
        color: colors.secondary.goldSoft,
        opacity: 0.8,
        fontWeight: typography.weights.semibold,
    },
    progressContainer: {
        height: 24,
        position: 'relative',
        alignItems: 'center',
    },
    backgroundLine: {
        position: 'absolute',
        top: 11,
        left: 12,
        right: 12,
        height: 2,
        backgroundColor: colors.glass.white20,
        borderRadius: 1,
    },
    progressLine: {
        position: 'absolute',
        top: 11,
        left: 12,
        height: 2,
        backgroundColor: colors.secondary.goldSoft,
        borderRadius: 1,
    },
    stepCircle: {
        position: 'absolute',
        top: 0,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: colors.glass.white20,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: -12, // Center the circle
        borderWidth: 2,
        borderColor: colors.glass.white20,
    },
    completedCircle: {
        backgroundColor: colors.secondary.goldSoft,
        borderColor: colors.secondary.goldSoft,
    },
    currentCircle: {
        backgroundColor: colors.secondary.goldSoft,
        borderColor: colors.secondary.goldSoft,
        borderWidth: 3,
    },
    innerCircle: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.secondary.creamWhite,
        opacity: 0.6,
    },
    currentInnerCircle: {
        backgroundColor: colors.primary.blueNight,
        opacity: 1,
    },
});