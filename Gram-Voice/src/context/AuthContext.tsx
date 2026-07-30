import React, { createContext, useContext, useState, useEffect } from "react";
import { loginUser, registerUser } from "../services/authService";

export interface UserProfile {
  name: string;
  email: string;
  role: "citizen" | "admin";
  district?: string;
  streak: number;
  // Optional legacy learning metrics to prevent compilation errors in legacy files
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
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateStats: (stats: Partial<Pick<UserProfile, "wordsCorrected" | "minutesPracticed" | "translationsCompleted" | "streak">>) => void;
  updateProfile: (profile: Partial<Pick<UserProfile, "name" | "district" | "level" | "nativeLanguage" | "dailyGoal">>) => void;
}



const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const savedUser = localStorage.getItem("gv_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await loginUser({ email, password });
      const emailLower = email.toLowerCase();
      const isGovAdmin = emailLower.includes("admin") || emailLower.includes("gov");

      const loggedInUser: UserProfile = {
        name: response.data.user.name,
        email: response.data.user.email,
        role: isGovAdmin ? "admin" : "citizen",
        district: "Madurai",
        streak: 3,
      };

      setUser(loggedInUser);
      localStorage.setItem("gv_user", JSON.stringify(loggedInUser));
      localStorage.setItem("gv_token", response.data.token);
      return true;
    } catch (err) {
      console.error("Login error:", err);
      return false;
    } finally {
      setLoading(false);
    }
  };

const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await registerUser({ name, email, password });
      const emailLower = email.toLowerCase();
      const isGovAdmin = emailLower.includes("admin") || emailLower.includes("gov");

      const newUser: UserProfile = {
        name: response.data.user.name,
        email: response.data.user.email,
        role: isGovAdmin ? "admin" : "citizen",
        district: "Madurai",
        streak: 1,
      };

      setUser(newUser);
      localStorage.setItem("gv_user", JSON.stringify(newUser));
      return true;
    } catch (err) {
      console.error("Signup error:", err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("gv_user");
  };

  const updateStats = (stats: Partial<Pick<UserProfile, "wordsCorrected" | "minutesPracticed" | "translationsCompleted" | "streak">>) => {
    if (!user) return;
    
    const updatedUser = {
      ...user,
      wordsCorrected: (user.wordsCorrected || 0) + (stats.wordsCorrected || 0),
      minutesPracticed: (user.minutesPracticed || 0) + (stats.minutesPracticed || 0),
      translationsCompleted: (user.translationsCompleted || 0) + (stats.translationsCompleted || 0),
      streak: stats.streak !== undefined ? stats.streak : user.streak,
    };
    
    setUser(updatedUser);
    localStorage.setItem("gv_user", JSON.stringify(updatedUser));
  };

  const updateProfile = (profile: Partial<Pick<UserProfile, "name" | "district" | "level" | "nativeLanguage" | "dailyGoal">>) => {
    if (!user) return;
    
    const updatedUser = {
      ...user,
      ...profile,
    };


    
    setUser(updatedUser);
    localStorage.setItem("gv_user", JSON.stringify(updatedUser));
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
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
