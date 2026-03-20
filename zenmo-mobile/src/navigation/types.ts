export type AuthStackParamList = {
    Splash: undefined;
    Onboarding: undefined;
    AuthWelcome: undefined;
    Login: undefined;
    Signup: undefined;
    OTPVerify: {
        email: string;
        phoneNumber?: string;
        password?: string;
        fullName?: string;
    };
    ForgotPassword: undefined;
    ProfileSetup: undefined;
    Permissions: undefined;
    SetupPIN: undefined;
    LockScreen: undefined;
    SecuritySettings: undefined;
    PersonalInfo: undefined;
    PrivacySettings: undefined;
    PermissionsSettings: undefined;
    HelpSupport: undefined;
    TermsOfService: undefined;
    About: undefined;
    Main: undefined;
    CreateVibe: undefined;
    Settings: undefined;
    UserProfile: { userId: string };
};
