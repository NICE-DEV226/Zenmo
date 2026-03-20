import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View, Platform } from 'react-native';
import { HomeScreen } from '../screens/HomeScreen';
import { ChatStack } from './ChatStack';
import { VibesScreen } from '../screens/VibesScreen';
import { CreateVibeScreen } from '../screens/CreateVibeScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { ContactsScreen } from '../screens/ContactsScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { UserProfileScreen } from '../screens/UserProfileScreen';
import { CommentsScreen } from '../screens/CommentsScreen';
import { StoryViewerScreen } from '../screens/StoryViewerScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const TabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarStyle: (() => {
                    // Get the focused route name from nested navigators
                    const routeName = getFocusedRouteNameFromRoute(route) ?? route.name;

                    // Contract to circle in ChatDetail
                    if (routeName === 'ChatDetail') {
                        return {
                            ...styles.tabBar,
                            width: 60,
                            height: 60,
                            borderRadius: 30,
                            left: undefined,
                            right: 20,
                            bottom: 100,
                            paddingBottom: 0,
                            overflow: 'hidden',
                        };
                    }
                    return styles.tabBar;
                })(),
                tabBarActiveTintColor: '#E4C66D',
                tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.5)',
                tabBarShowLabel: false,
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: keyof typeof Ionicons.glyphMap;

                    if (route.name === 'Home') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'Chat') {
                        iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
                    } else if (route.name === 'Create') {
                        iconName = 'add-circle';
                        return (
                            <View style={styles.createButton}>
                                <Ionicons name={iconName} size={40} color="#E4C66D" />
                            </View>
                        );
                    } else if (route.name === 'Contacts') {
                        iconName = focused ? 'people' : 'people-outline';
                    } else if (route.name === 'Profile') {
                        iconName = focused ? 'person' : 'person-outline';
                    } else {
                        iconName = 'help-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Chat" component={ChatStack} />
            <Tab.Screen
                name="Create"
                component={CreateVibeScreen}
                options={{
                    tabBarButton: (props) => (
                        <View style={styles.createButtonContainer}>
                            {props.children}
                        </View>
                    ),
                }}
            />
            <Tab.Screen name="Contacts" component={ContactsScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
};

export const AppStack = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="MainTabs" component={TabNavigator} />
            <Stack.Screen name="Search" component={SearchScreen} />
            <Stack.Screen name="UserProfile" component={UserProfileScreen} />
            <Stack.Screen name="Comments" component={CommentsScreen} />
            <Stack.Screen name="StoryViewer" component={StoryViewerScreen} />
        </Stack.Navigator>
    );
};

const styles = StyleSheet.create({
    tabBar: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        height: 70,
        backgroundColor: 'rgba(13, 12, 29, 0.95)',
        borderRadius: 25,
        borderTopWidth: 0,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        paddingBottom: Platform.OS === 'ios' ? 10 : 0,
    },
    createButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(13, 12, 29, 0.95)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
        borderWidth: 3,
        borderColor: '#E4C66D',
    },
    createButtonContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
