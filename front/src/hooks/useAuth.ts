import { useEffect, useState, useCallback } from "react";
import { useLazyQuery } from "@apollo/client";
import { Profile } from "@/types/user";
import { GET_PROFILE } from "@/graph/user";

export const STORAGE_KEY = "nfc_userId";

export function useAuth() {
  const HOST_URL = import.meta.env.VITE_HOST_URL || "";
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [fetchProfile] = useLazyQuery(GET_PROFILE, {
    fetchPolicy: "network-only",
    onCompleted: (data) => {
      if (data?.profileByUserId) {
        setUser(data.profileByUserId);
      } else {
        setUser(null);
      }
      setLoading(false);
    },
    onError: (error) => {
      console.error("Failed to fetch profile:", error);
      // ローカルストレージからユーザーIDを削除
      setUser(null);
      setLoading(false);
    },
  });

  useEffect(() => {
    const savedUserId = localStorage.getItem(STORAGE_KEY);

    if (savedUserId) {
      fetchProfile({ variables: { id: savedUserId } });
    } else {
      (async () => {
        try {
          const res = await fetch(`${HOST_URL}api/v1/auth/getUser`, {
            credentials: "include", // Cookieを送る
          });

          if (res.ok) {
            const data = await res.json();
            if (data?.id) {
              localStorage.setItem(STORAGE_KEY, data.id);
              fetchProfile({ variables: { id: data.id } });
            }
          } else {
            console.error("getUser failed:", res.status);
          }
        } catch (error) {
          console.error("Error fetching user:", error);
        }
      })();
    }
  }, [HOST_URL, fetchProfile]);

  // ログイン時はlocalStorageに保存しプロフィール取得
  const login = useCallback(
    (id: string) => {
      localStorage.setItem(STORAGE_KEY, id);
      fetchProfile({ variables: { id } });
    },
    [fetchProfile],
  );

  // ログアウト時はlocalStorageをクリアしてuserをリセット
  const logout = useCallback(async () => {
    const res = await fetch(`${HOST_URL}api/v1/auth/logout`, {
      credentials: "include", // Cookieを送る
    });
    if (!res.ok) {
      console.error("Logout failed:", res.status);
    }
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, [HOST_URL]);

  const isAuthenticated = user !== null;

  return { user, isAuthenticated, login, logout, loading };
}
