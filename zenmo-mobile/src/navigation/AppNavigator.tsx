import React, { useRef, useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { SplashScreen } from '../screens/SplashScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { AuthWelcomeScreen } from '../screens/AuthWelcomeScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { SignupScreen } from '../screens/SignupScreen';
import { OTPVerifyScreen } from '../screens/OTPVerifyScreen';
import { ForgotPasswordScreen } from '../screens/ForgotPasswordScreen';
import { ProfileSetupScreen } from '../screens/ProfileSetupScreen';
import { PermissionsScreen } from '../screens/PermissionsScreen';
import { CreateVibeScreen } from '../screens/CreateVibeScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { SetupPINScreen } from '../screens/SetupPINScreen';
import { SecuritySettingsScreen } from '../screens/SecuritySettingsScreen';
import { PersonalInfoScreen } from '../screens/PersonalInfoScreen';
import { PrivacySettingsScreen } from '../screens/PrivacySettingsScreen';
import { PermissionsSettingsScreen } from '../screens/PermissionsSettingsScreen';
import { HelpSupportScreen } from '../screens/HelpSupportScreen';
import { TermsOfServiceScreen } from '../screens/TermsOfServiceScreen';
import { AboutScreen } from '../screens/AboutScreen';
import { LockScreen } from '../screens/LockScreen';
import { AppStack } from './AppStack';
import { AuthStackParamList } from './types';

const Stack = createStackNavigator<AuthStackParamList>();

export const AppNavigator = () => {
    const navigationRef = useRef<any>(null);

    useEffect(() => {
        // Stocker la référence de navigation globalement pour l'API
        (global as any).navigationRef = navigationRef;
    }, []);

    return (
        <NavigationContainer ref={navigationRef}>
            <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Splash">
                <Stack.Screen name="Splash" component={SplashScreen} />
                <Stack.Screen name="Onboarding" component={OnboardingScreen} />
                <Stack.Screen name="AuthWelcome" component={AuthWelcomeScreen} />
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Signup" component={SignupScreen} />
                <Stack.Screen name="OTPVerify" component={OTPVerifyScreen} />
                <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
                <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
                <Stack.Screen name="Permissions" component={PermissionsScreen} />
                <Stack.Screen name="SetupPIN" component={SetupPINScreen} />
                <Stack.Screen name="SecuritySettings" component={SecuritySettingsScreen} />
                <Stack.Screen name="PersonalInfo" component={PersonalInfoScreen} />
                <Stack.Screen name="PrivacySettings" component={PrivacySettingsScreen} />
                <Stack.Screen name="PermissionsSettings" component={PermissionsSettingsScreen} />
                <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
                <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} />
                <Stack.Screen name="About" component={AboutScreen} />
                <Stack.Screen name="LockScreen" component={LockScreen} />
                <Stack.Screen name="Main" component={AppStack} />
                <Stack.Screen
                    name="CreateVibe"
                    component={CreateVibeScreen}
                    options={{
                        presentation: 'modal',
                        cardStyle: { backgroundColor: 'transparent' }
                    }}
                />
                <Stack.Screen name="Settings" component={SettingsScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};
