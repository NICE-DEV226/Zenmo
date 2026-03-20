import { LogLevel, OneSignal } from 'react-native-onesignal';
import Constants from 'expo-constants';

// Replace with your actual OneSignal App ID
const ONESIGNAL_APP_ID = '387aa36f-3bcf-4af7-99ab-8d95c232b843'; // TODO: Get from env or config

export const initOneSignal = () => {
    // OneSignal Initialization
    OneSignal.Debug.setLogLevel(LogLevel.Verbose);
    OneSignal.initialize(ONESIGNAL_APP_ID);

    // requestPermission will show the native iOS notification permission prompt.
    // We recommend removing the following code and instead using an In-App Message to prompt for notification permission
    OneSignal.Notifications.requestPermission(true);

    // Method for handling notifications received while app in foreground
    OneSignal.Notifications.addEventListener('foregroundWillDisplay', (event) => {
        console.log('OneSignal: notification will show in foreground:', event);
        // event.preventDefault() to hide the notification
    });

    // Method for handling notifications opened
    OneSignal.Notifications.addEventListener('click', (event) => {
        console.log('OneSignal: notification clicked:', event);
        // Navigate to specific screen based on data
    });
};

export const setExternalUserId = (userId: string) => {
    if (userId) {
        OneSignal.login(userId);
        console.log('OneSignal: User logged in with ID:', userId);
    }
};

export const logoutOneSignal = () => {
    OneSignal.logout();
    console.log('OneSignal: User logged out');
};
