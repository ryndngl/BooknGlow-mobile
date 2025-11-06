// AuthContext.js - FIXED: Removed aggressive auto-logout
import { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FavoritesMigrationHelper } from "../utils/FavoritesMigrationHelper";
import API_URL from '../config/api.js';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [initialAuthCheck, setInitialAuthCheck] = useState(false);

  // Proper splash screen states
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [showSplashOnLogout, setShowSplashOnLogout] = useState(false);

  // Check authentication status with proper first-time logic
  const checkAuthStatus = async (showLogs = true) => {
    try {
      if (showLogs) setIsLoading(true);

      const token = await AsyncStorage.getItem("token");
      const userData = await AsyncStorage.getItem("user");
      const hasEverLoggedIn = await AsyncStorage.getItem("hasEverLoggedIn");

      // Proper first time detection
      if (hasEverLoggedIn === null) {
        setIsFirstTime(true);
        await AsyncStorage.setItem("hasEverLoggedIn", "false");
        if (showLogs) {
          console.log("First time user detected");
        }
      } else {
        setIsFirstTime(false);
        if (showLogs) {
          console.log("Returning user");
        }
      }

      // Check if user is authenticated
      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData);

          // 🔥 FIXED: Only verify token on initial load, not periodically
          // For booking app without sensitive data, trust the token until it expires
          const isValidToken = showLogs ? await verifyToken(token) : true;

          if (isValidToken) {
            const completeUserData = {
              ...parsedUser,
              id: parsedUser.id || parsedUser._id,
              _id: parsedUser._id || parsedUser.id,
            };

            setUser(completeUserData);
            setIsAuthenticated(true);

            if (showLogs) {
              console.log(
                "User auto-authenticated:",
                completeUserData.email || completeUserData.fullName
              );
            }

            // Try to migrate old favorites
            const userId = completeUserData.id || completeUserData._id;
            if (userId) {
              FavoritesMigrationHelper.migrateGlobalFavoritesToUser(
                userId
              ).catch((err) => console.warn("Migration warning:", err));
            }

            return true;
          } else {
            // Token expired, clear storage
            await clearAuthData();
            return false;
          }
        } catch (parseError) {
          console.error("User data parse error:", parseError);
          await clearAuthData();
          return false;
        }
      } else {
        return false;
      }
    } catch (error) {
      console.error("Auth check error:", error);
      await clearAuthData();
      return false;
    } finally {
      if (showLogs) {
        setIsLoading(false);
        setInitialAuthCheck(true);
      }
    }
  };

  // Verify token with backend (only on initial load)
  const verifyToken = async (token) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/verify-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data.isSuccess;
      }
      return false;
    } catch (error) {
      console.error("Token verification failed:", error);
      // 🔥 FIXED: For booking app, allow offline usage
      // Token is valid for 30 days anyway (set in backend)
      return true;
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/sign-in`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.isSuccess && data.token) {
        await AsyncStorage.setItem("token", data.token);

        const userData = {
          id: data.user._id || data.user.id,
          _id: data.user._id || data.user.id,
          fullName: data.user.fullName || data.user.name || "",
          name: data.user.fullName || data.user.name || "",
          email: data.user.email || "",
          phone: data.user.phone || "",
          photo: data.user.photo || data.user.profilePicture || "",
          ...data.user,
        };

        await AsyncStorage.setItem("user", JSON.stringify(userData));
        await AsyncStorage.setItem("hasEverLoggedIn", "true");

        setUser(userData);
        setIsAuthenticated(true);
        setIsFirstTime(false);
        return { success: true, data, user: userData };
      } else {
        return { success: false, message: data.message || "Login failed" };
      }
    } catch (error) {
      console.error("Login error:", error);
      if (
        error.name === "TypeError" &&
        error.message.includes("Network request failed")
      ) {
        return {
          success: false,
          message: "Network error. Please check your internet connection.",
        };
      }
      return { success: false, message: "Login failed. Please try again." };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      const currentUserId = user?.id || user?._id;
      if (currentUserId) {
        try {
          await FavoritesMigrationHelper.backupUserFavorites(currentUserId);
        } catch (backupError) {
          console.warn("Backup error:", backupError);
        }
      }

      await AsyncStorage.multiRemove(["token", "user"]);

      setUser(null);
      setIsAuthenticated(false);
      setShowSplashOnLogout(true);
      return { success: true };
    } catch (error) {
      console.error("Logout error:", error);
      await AsyncStorage.multiRemove(["token", "user"]);
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    }
  };

  // Clear only auth data
  const clearAuthData = async () => {
    try {
      await AsyncStorage.multiRemove(["token", "user"]);
    } catch (error) {
      console.error("Clear auth data error:", error);
    }
  };

  // Complete app reset (dev/admin only)
  const clearAllAppData = async (userId = null) => {
    try {
      console.warn("CLEARING ALL APP DATA - This will reset everything!");
      await AsyncStorage.clear();

      setUser(null);
      setIsAuthenticated(false);
      setIsFirstTime(true);
      setShowSplashOnLogout(false);
    } catch (error) {
      console.error("Clear all app data error:", error);
    }
  };

  // Update user data
  const updateUser = async (newUserData) => {
    try {
      const updatedUser = { ...user, ...newUserData };
      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      return { success: true };
    } catch (error) {
      console.error("Update user error:", error);
      throw error;
    }
  };

  // Check auth status on app startup
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // 🔥 REMOVED: Auto-refresh interval
  // For salon booking app without sensitive data, we trust the token until expiry (30 days)
  // This prevents random logouts due to network issues and improves UX
  // Token validation happens only on:
  // 1. App startup
  // 2. Manual login
  // 3. Explicit user actions requiring auth

  const value = {
    user,
    isAuthenticated,
    isLoading,
    initialAuthCheck,
    isFirstTime,
    showSplashOnLogout,
    setShowSplashOnLogout,
    login,
    logout,
    updateUser,
    checkAuthStatus,
    clearAllAppData,
    setUser,
    setIsAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};