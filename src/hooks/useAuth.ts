import { useState, useEffect } from "react";
import { authUser } from "@/lib/api";

export interface TgUser {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  photo_url: string;
  balance: number;
  level: number;
  xp: number;
  referral_code: string;
}

interface TelegramWebApp {
  initData: string;
  initDataUnsafe: { start_param?: string };
  ready: () => void;
  expand: () => void;
}

declare global {
  interface Window {
    Telegram?: { WebApp: TelegramWebApp };
  }
}

export function useAuth() {
  const [user, setUser] = useState<TgUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshUser = (updated: Partial<TgUser>) => {
    setUser(prev => prev ? { ...prev, ...updated } : prev);
  };

  useEffect(() => {
    const init = async () => {
      try {
        const tg = window.Telegram?.WebApp;
        const initData = tg?.initData || "dev_mock";
        const startParam = tg?.initDataUnsafe?.start_param || "";
        const referredBy = startParam.startsWith("NOVA-") ? startParam : undefined;

        if (tg) {
          tg.ready();
          tg.expand();
        }

        const data = await authUser(initData, referredBy);
        if (data.user) {
          setUser(data.user);
        } else {
          setError(data.error || "Auth failed");
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  return { user, loading, error, refreshUser, setUser };
}
