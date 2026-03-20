import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ChatListScreen } from '../screens/ChatListScreen';
import { ChatScreen } from '../screens/ChatScreen';

export type ChatStackParamList = {
    ChatList: undefined;
    ChatDetail: { user: any };
};

const Stack = createStackNavigator<ChatStackParamList>();

export const ChatStack = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="ChatList" component={ChatListScreen} />
            <Stack.Screen name="ChatDetail" component={ChatScreen} />
        </Stack.Navigator>
    );
};
