import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, Animated, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { PanGestureHandler, State, LongPressGestureHandler } from 'react-native-gesture-handler';
import { spacing } from '../theme/spacing';
import { Avatar } from '../components';

const { width, height } = Dimensions.get('window');

interface Story {
    id: string;
    user: string;
    avatar: string | null;
    image: string;
    time: string;
}

// Mock Data for demo - in real app, pass this via route params or context
const STORIES: Story[] = [
    { id: '1', user: 'Ma Vibe', avatar: null, image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80', time: '2h' },
    { id: '2', user: 'Sarah', avatar: null, image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80', time: '4h' },
    { id: '3', user: 'Marc', avatar: null, image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80', time: '5h' },
];

export const StoryViewerScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    // @ts-ignore
    const { initialStoryIndex = 0 } = route.params || {};

    const [currentIndex, setCurrentIndex] = useState(initialStoryIndex);
    const [progress] = useState(new Animated.Value(0));
    const [isPaused, setIsPaused] = useState(false);
    const animationRef = useRef<Animated.CompositeAnimation | null>(null);

    const currentStory = STORIES[currentIndex];

    useEffect(() => {
        if (!isPaused) {
            startAnimation();
        }
        return () => {
            if (animationRef.current) {
                animationRef.current.stop();
            }
        };
    }, [currentIndex, isPaused]);

    const startAnimation = () => {
        progress.setValue(0);
        animationRef.current = Animated.timing(progress, {
            toValue: 1,
            duration: 5000, // 5 seconds per story
            useNativeDriver: false,
        });
        animationRef.current.start(({ finished }) => {
            if (finished) {
                handleNext();
            }
        });
    };

    const handleNext = () => {
        if (currentIndex < STORIES.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            navigation.goBack();
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        } else {
            startAnimation(); // Restart current story
        }
    };

    const handleClose = () => {
        navigation.goBack();
    };

    const handleReply = () => {
        // TODO: Navigate to chat with this user
        // @ts-ignore
        // navigation.navigate('Chat', { conversationId: currentStory.userId });
        console.log('Reply to', currentStory.user);
    };

    // Pan gesture handler for swipe navigation
    const onPanGestureEvent = (event: any) => {
        const { translationX, translationY, state } = event.nativeEvent;

        if (state === State.END) {
            // Vertical swipe down to close
            if (translationY > 100) {
                handleClose();
            }
            // Horizontal swipe left (next story)
            else if (translationX < -50) {
                handleNext();
            }
            // Horizontal swipe right (previous story)
            else if (translationX > 50) {
                handlePrev();
            }
        }
    };

    // Long press to pause
    const onLongPressStateChange = (event: any) => {
        if (event.nativeEvent.state === State.ACTIVE) {
            setIsPaused(true);
            if (animationRef.current) {
                animationRef.current.stop();
            }
        } else if (event.nativeEvent.state === State.END || event.nativeEvent.state === State.CANCELLED) {
            setIsPaused(false);
        }
    };

    return (
        <LongPressGestureHandler
            onHandlerStateChange={onLongPressStateChange}
            minDurationMs={200}
        >
            <PanGestureHandler onGestureEvent={onPanGestureEvent}>
                <View style={styles.container}>
                    <StatusBar hidden />

                    {/* Background Image */}
                    <Image
                        source={{ uri: currentStory.image }}
                        style={styles.image}
                        resizeMode="cover"
                    />

                    {/* Overlay Gradient */}
                    <LinearGradient
                        colors={['rgba(0,0,0,0.7)', 'transparent', 'rgba(0,0,0,0.3)']}
                        style={styles.gradient}
                    />

                    {/* Progress Bar */}
                    <View style={styles.progressBarContainer}>
                        {STORIES.map((_, index) => (
                            <View key={index} style={styles.progressBarBackground}>
                                {index === currentIndex ? (
                                    <Animated.View
                                        style={[
                                            styles.progressBarFill,
                                            {
                                                width: progress.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: ['0%', '100%'],
                                                }),
                                            },
                                        ]}
                                    />
                                ) : (
                                    <View
                                        style={[
                                            styles.progressBarFill,
                                            { width: index < currentIndex ? '100%' : '0%' },
                                        ]}
                                    />
                                )}
                            </View>
                        ))}
                    </View>

                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.userInfo}>
                            <Avatar uri={currentStory.avatar} size={32} />
                            <Text style={styles.username}>{currentStory.user}</Text>
                            <Text style={styles.time}>{currentStory.time}</Text>
                        </View>
                        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                            <Ionicons name="close" size={28} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>

                    {/* Touch Areas for Navigation */}
                    <View style={styles.touchContainer}>
                        <TouchableOpacity style={styles.touchArea} onPress={handlePrev} />
                        <TouchableOpacity style={styles.touchArea} onPress={handleNext} />
                    </View>

                    {/* Footer Actions */}
                    <View style={styles.footer}>
                        <View style={styles.replyContainer}>
                            <TouchableOpacity style={styles.replyInput} onPress={handleReply}>
                                <Text style={styles.replyPlaceholder}>Envoyer un message...</Text>
                            </TouchableOpacity>
                            <TouchableOpacity>
                                <Ionicons name="heart-outline" size={28} color="#FFFFFF" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleReply}>
                                <Ionicons name="paper-plane-outline" size={28} color="#FFFFFF" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </PanGestureHandler>
        </LongPressGestureHandler>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    image: {
        width: width,
        height: height,
        position: 'absolute',
    },
    gradient: {
        position: 'absolute',
        width: width,
        height: height,
    },
    progressBarContainer: {
        flexDirection: 'row',
        paddingHorizontal: 10,
        paddingTop: 50,
        gap: 5,
    },
    progressBarBackground: {
        flex: 1,
        height: 3,
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        marginTop: 15,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#FFFFFF',
    },
    username: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 14,
        color: '#FFFFFF',
        marginRight: 10,
    },
    time: {
        fontFamily: 'PottaOne-Regular',
        fontSize: 12,
        color: 'rgba(255,255,255,0.7)',
    },
    closeButton: {
        padding: 5,
    },
    touchContainer: {
        flexDirection: 'row',
        flex: 1,
    },
    touchArea: {
        flex: 1,
    },
    footer: {
        paddingHorizontal: 15,
        paddingBottom: 30,
    },
    replyContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    replyInput: {
        flex: 1,
        height: 45,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.5)',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    replyPlaceholder: {
        color: '#FFFFFF',
        fontFamily: 'PottaOne-Regular',
        fontSize: 14,
    },
});

export default StoryViewerScreen;
