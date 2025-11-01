import { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Animated,
  Dimensions,
  ImageBackground,
  StatusBar,
  LogBox,
  View,
  ActivityIndicator,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as Linking from "expo-linking";

LogBox.ignoreLogs([
  "Warning: Text strings must be rendered within a <Text> component.",
]);

// Navigation
import "react-native-screens";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Context
import { BookingProvider } from "./context/BookingContext";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Components - Clean organized imports
import {
  // Auth Components
  LoginScreen,
  RegisterScreen,
  GetStartedScreen,
  ForgotPasswordScreen,
  ResetPasswordScreen,

  // Service Components
  ServicesScreen,
  ServiceDetailScreen,

  // Booking Components
  BookingFormScreen,
  BookingSummaryScreen,
  BookingConfirmationScreen,
  BookingScreen,

  // Payment Components
  PaymentMethodScreen,

  // Profile Components
  FavoritesScreen,
  NotificationScreen,
  SettingsScreen,
  ProfileScreen,
  TermsConditionsScreen,
  PrivacyPolicyScreen,

  // Support Components
  FAQScreen,
  ContactUsScreen,
} from "./components";

// Import PastBookingsScreen
import PastBookingsScreen from "./components/ProfileComponents/PastBookingsScreen";

// Top-level Navigators
import BottomTabNavigator from "./navigation/BottomTabNavigator";

const Stack = createNativeStackNavigator();
const { width, height } = Dimensions.get("window");

const linking = {
  prefixes: [
    "salonmobileapp://",
    "exp://https://salon-app-server.onrender.com/--/",
    "https://salon-app-server.onrender.com/",
  ],
  config: {
    screens: {
      GetStarted: "get-started",
      LoginScreen: "login",
      Register: "register",
      ForgotPasswordScreen: "forgot-password",
      ResetPasswordScreen: {
        path: "ResetPasswordScreen",
        parse: {
          token: (token) => {
            return token;
          },
        },
        stringify: {
          token: (token) => token,
        },
      },
      MainTabs: {
        screens: {
          Home: "home",
          Services: "services",
        },
      },
      FAQs: "faqs",
      ContactUs: "contact-us",
      TermsConditions: "terms-conditions",
      PrivacyPolicy: "privacy-policy",
    },
  },
};

// Server Wake-up Function (runs silently in background)
const wakeUpServer = async () => {
  const API_URL = "https://salon-app-server.onrender.com";
  try {
    console.log("🚀 Waking up server...");
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    
    const response = await fetch(`${API_URL}/api/health`, {
      method: "GET",
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    console.log("✅ Server is awake:", response.ok);
    return true;
  } catch (error) {
    console.log("⏳ Server is starting up...");
    return false;
  }
};

// Auth Navigator Component
const AuthNavigator = () => {
  const {
    isAuthenticated,
    isLoading,
    isFirstTime,
    showSplashOnLogout,
    setShowSplashOnLogout,
  } = useAuth();

  const splashFadeOut = useRef(new Animated.Value(1)).current;

  // Deep link handling
  useEffect(() => {
    const handleInitialURL = async () => {
      try {
        const initialUrl = await Linking.getInitialURL();
        if (initialUrl) {
          console.log("Initial URL:", initialUrl);
        }
      } catch (error) {
        console.error("Error getting initial URL:", error);
      }
    };

    const handleDeepLink = (event) => {
      console.log("Deep link:", event.url);
    };

    handleInitialURL();

    const subscription = Linking.addEventListener("url", handleDeepLink);

    return () => {
      subscription?.remove();
    };
  }, []);

  // Handle logout splash animation
  useEffect(() => {
    if (showSplashOnLogout) {
      splashFadeOut.setValue(1);
      const timer = setTimeout(() => {
        Animated.timing(splashFadeOut, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }).start(() => {
          setShowSplashOnLogout(false);
        });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showSplashOnLogout]);

  // Show logout splash only
  if (showSplashOnLogout) {
    return (
      <Animated.View
        style={[styles.splashContainer, { opacity: splashFadeOut }]}
      >
        <ImageBackground
          source={require("./assets/SplashScreenImage/BGIMG.jpg")}
          style={styles.backgroundImage}
          imageStyle={styles.backgroundImageStyle}
        />
      </Animated.View>
    );
  }

  return (
    <Stack.Navigator
      initialRouteName={
        isAuthenticated
          ? "MainTabs"
          : isFirstTime
          ? "GetStarted"
          : "LoginScreen"
      }
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="GetStarted"
        component={GetStartedScreen}
        options={{ animation: "fade" }}
      />
      <Stack.Screen
        name="LoginScreen"
        component={LoginScreen}
        options={{ animation: "none" }}
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{ animation: "fade" }}
      />

      <Stack.Screen
        name="ForgotPasswordScreen"
        component={ForgotPasswordScreen}
        options={{
          title: "Forgot Password",
          animation: "fade",
        }}
      />
      <Stack.Screen
        name="ResetPasswordScreen"
        component={ResetPasswordScreen}
        options={{
          title: "Reset Password",
          animation: "fade",
        }}
      />

      <Stack.Screen
        name="FAQs"
        component={FAQScreen}
        options={{ animation: "fade" }}
      />
      <Stack.Screen
        name="ContactUs"
        component={ContactUsScreen}
        options={{ animation: "fade" }}
      />
      <Stack.Screen
        name="TermsConditions"
        component={TermsConditionsScreen}
        options={{ animation: "fade" }}
      />
      <Stack.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicyScreen}
        options={{ animation: "fade" }}
      />

      {isAuthenticated && (
        <>
          <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
          <Stack.Screen name="ServicesScreen" component={ServicesScreen} />
          <Stack.Screen
            name="ServiceDetailScreen"
            component={ServiceDetailScreen}
          />
          <Stack.Screen name="BookingScreen" component={BookingScreen} />
          <Stack.Screen
            name="BookingFormScreen"
            component={BookingFormScreen}
            options={{ title: "Booking Details", headerShown: true }}
          />
          <Stack.Screen
            name="BookingSummaryScreen"
            component={BookingSummaryScreen}
          />
          <Stack.Screen
            name="PaymentMethodScreen"
            component={PaymentMethodScreen}
          />
          <Stack.Screen
            name="NotificationScreen"
            component={NotificationScreen}
            options={{ title: "Notifications", headerShown: true }}
          />
          <Stack.Screen
            name="BookingConfirmationScreen"
            component={BookingConfirmationScreen}
          />
          <Stack.Screen name="FavoritesScreen" component={FavoritesScreen} />
          <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
          <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
          <Stack.Screen
            name="PastBookingsScreen"
            component={PastBookingsScreen}
            options={{ headerShown: false }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

// Main App Component - CLEAN SPLASH (No loading text messages)
const AppContent = () => {
  const [isAppReady, setIsAppReady] = useState(false);
  const splashFadeOut = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Wake up server silently in background
        await wakeUpServer();
        
        // Small delay for smooth transition
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Fade out splash screen
        Animated.timing(splashFadeOut, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }).start(() => {
          setIsAppReady(true);
        });
      } catch (error) {
        console.error("Initialization error:", error);
        // Even on error, show the app
        setTimeout(() => setIsAppReady(true), 2000);
      }
    };

    initializeApp();
  }, []);

  if (!isAppReady) {
    return (
      <Animated.View
        style={[styles.splashContainer, { opacity: splashFadeOut }]}
      >
        <ImageBackground
          source={require("./assets/SplashScreenImage/BGIMG.jpg")}
          style={styles.backgroundImage}
          imageStyle={styles.backgroundImageStyle}
        >
          {/* Clean loading indicator - NO TEXT MESSAGES */}
          <View style={styles.loadingIndicator}>
            <ActivityIndicator size="large" color="#FF6B6B" />
          </View>
        </ImageBackground>
      </Animated.View>
    );
  }

  return (
    <BookingProvider>
        <NavigationContainer
          linking={linking}
          onReady={() => {
            console.log("✅ Navigation ready");
          }}
          onStateChange={(state) => {
            if (state) {
              const currentRoute = state.routes[state.index];
              if (currentRoute.params) {
                console.log("Route params:", currentRoute.params);
              }
            }
          }}
        >
          <AuthNavigator />
          <StatusBar style="dark" />
        </NavigationContainer>
    </BookingProvider>
  );
};

// Root App Component
export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  backgroundImageStyle: {
    resizeMode: "cover",
  },
  loadingIndicator: {
    position: "absolute",
    bottom: 100,
    alignItems: "center",
  },
});