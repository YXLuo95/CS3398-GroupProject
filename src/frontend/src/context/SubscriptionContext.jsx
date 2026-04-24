import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const SubscriptionContext = createContext({
  isPremium: false,
  tier: null,
  loading: true,
  refresh: () => {},
});

/**
 * Wrap your app (in App.jsx) with <SubscriptionProvider>
 * Use useSubscription() hook inside any component to read isPremium.
 */
export function SubscriptionProvider({ children }) {
  const [isPremium, setIsPremium] = useState(false);
  const [tier, setTier] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsPremium(false);
      setTier(null);
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get(`${API_URL}/api/v1/subscription/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsPremium(res.data.is_premium);
      setTier(res.data.tier);
    } catch (err) {
      console.error("Subscription status fetch failed:", err);
      setIsPremium(false);
      setTier(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  return (
    <SubscriptionContext.Provider value={{ isPremium, tier, loading, refresh: fetchStatus }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  return useContext(SubscriptionContext);
}
