"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export interface UserProfile {
  id: string;
  username: string;
  avatar?: string;
  level?: number;
}

export function useUser() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Load user from local storage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("food_map_user");
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load user session", e);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (userData: UserProfile) => {
    setUser(userData);
    localStorage.setItem("food_map_user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("food_map_user");
    router.push("/login");
  };

  return {
    user,
    userId: user?.id,
    username: user?.username,
    level: user?.level || 1,
    avatar: user?.avatar,
    login,
    logout,
    resetUser: logout, // Alias for compatibility with ProfilePage
    loading
  };
}