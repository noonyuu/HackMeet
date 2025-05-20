import { Header } from "@/components/Header";
import { AuthContext } from "@/contexts/authContext";
import { useAuth } from "@/hooks/useAuth";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import { useEffect, useState } from "react";

function RootComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 700);

    return () => clearTimeout(timer);
  }, []);

  if (isInitializing) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      <div className="flex h-screen flex-col">
        <Header />
        <main className="flex w-full grow flex-col items-center justify-center">
          <Outlet />
        </main>
      </div>
      <TanStackRouterDevtools />
    </AuthContext.Provider>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
});
