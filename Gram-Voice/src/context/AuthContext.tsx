import React, { createContext, useContext, useState, useEffect } from "react";
import { loginUser, registerUser } from "../services/authService";

export interface UserProfile {
  name: string;
  email: string;

  // Real roles coming from backend
  role: "citizen" | "officer" | "admin";

  district?: string;
  department?: string;
  phone?: string;

  // Preferred language selected by the user
  preferredLanguage?: "en" | "ta";

  streak: number;

  // Optional legacy learning metrics
  level?: "Beginner" | "Intermediate" | "Advanced";
  nativeLanguage?: string;
  dailyGoal?: number;
  wordsCorrected?: number;
  minutesPracticed?: number;
  translationsCompleted?: number;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;

  login: (
    email: string,
    password: string
  ) => Promise<boolean>;

  signup: (
    name: string,
    email: string,
    phone: string,
    password: string,
    preferredLanguage: "en" | "ta"
  ) => Promise<boolean>;

  logout: () => void;

  updateStats: (
    stats: Partial<
      Pick<
        UserProfile,
        | "wordsCorrected"
        | "minutesPracticed"
        | "translationsCompleted"
        | "streak"
      >
    >
  ) => void;

  updateProfile: (
    profile: Partial<
      Pick<
        UserProfile,
        | "name"
        | "district"
        | "level"
        | "nativeLanguage"
        | "dailyGoal"
      >
    >
  ) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore logged-in user when the app starts
  useEffect(() => {
    const savedUser = localStorage.getItem("gv_user");
    const savedToken = localStorage.getItem("gv_token");

    if (savedUser && savedToken) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error("Failed to restore user:", error);

        localStorage.removeItem("gv_user");
        localStorage.removeItem("gv_token");
      }
    }

    setLoading(false);
  }, []);

  // LOGIN
  const login = async (
    email: string,
    password: string
  ): Promise<boolean> => {
    setLoading(true);

    try {
      const response = await loginUser({
        email,
        password,
      });

      const backendUser = response.data.user;

      // IMPORTANT:
      // Role comes directly from backend.
      // We do NOT check the email anymore.
      const loggedInUser: UserProfile = {
        name: backendUser.name,
        email: backendUser.email,
        role: backendUser.role,
        district: backendUser.district,
        department: backendUser.department,
        phone: backendUser.phone,
        preferredLanguage: backendUser.preferredLanguage,
        streak: 3,
      };

      setUser(loggedInUser);

      // Save user
      localStorage.setItem(
        "gv_user",
        JSON.stringify(loggedInUser)
      );

      // Save JWT
      localStorage.setItem(
        "gv_token",
        response.data.token
      );

      return true;
    } catch (err) {
      console.error("Login error:", err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // SIGNUP
  const signup = async (
    name: string,
    email: string,
    phone: string,
    password: string,
    preferredLanguage: "en" | "ta"
  ): Promise<boolean> => {
    setLoading(true);

    try {
      // First create the account
      await registerUser({
        name,
        email,
        phone,
        password,
        role: "citizen",
        preferredLanguage,
      });

      // Register API doesn't currently return a JWT.
      // So we login immediately after successful registration.
      const loginResponse = await loginUser({
        email,
        password,
      });

      const backendUser = loginResponse.data.user;

      const newUser: UserProfile = {
        name: backendUser.name,
        email: backendUser.email,
        role: backendUser.role,
        district: backendUser.district,
        department: backendUser.department,
        phone: backendUser.phone,
        preferredLanguage: backendUser.preferredLanguage,
        streak: 1,
      };

      setUser(newUser);

      // Save user
      localStorage.setItem(
        "gv_user",
        JSON.stringify(newUser)
      );

      // Save JWT
      localStorage.setItem(
        "gv_token",
        loginResponse.data.token
      );

      return true;
    } catch (err) {
      console.error("Signup error:", err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // LOGOUT
  const logout = () => {
    setUser(null);

    // Remove both user and JWT
    localStorage.removeItem("gv_user");
    localStorage.removeItem("gv_token");
  };

  // UPDATE STATS
  const updateStats = (
    stats: Partial<
      Pick<
        UserProfile,
        | "wordsCorrected"
        | "minutesPracticed"
        | "translationsCompleted"
        | "streak"
      >
    >
  ) => {
    if (!user) return;

    const updatedUser = {
      ...user,

      wordsCorrected:
        (user.wordsCorrected || 0) +
        (stats.wordsCorrected || 0),

      minutesPracticed:
        (user.minutesPracticed || 0) +
        (stats.minutesPracticed || 0),

      translationsCompleted:
        (user.translationsCompleted || 0) +
        (stats.translationsCompleted || 0),

      streak:
        stats.streak !== undefined
          ? stats.streak
          : user.streak,
    };

    setUser(updatedUser);

    localStorage.setItem(
      "gv_user",
      JSON.stringify(updatedUser)
    );
  };

  // UPDATE PROFILE
  const updateProfile = (
    profile: Partial<
      Pick<
        UserProfile,
        | "name"
        | "district"
        | "level"
        | "nativeLanguage"
        | "dailyGoal"
      >
    >
  ) => {
    if (!user) return;

    const updatedUser = {
      ...user,
      ...profile,
    };

    setUser(updatedUser);

    localStorage.setItem(
      "gv_user",
      JSON.stringify(updatedUser)
    );
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        updateStats,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error(
      "useAuth must be used within an AuthProvider"
    );
  }

  return context;
};