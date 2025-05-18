import { Header } from "@/components/Header";
import { AuthContext } from "@/contexts/authContext";
import { useAuth } from "@/hooks/useAuth";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

function RootComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      <Header />
      <main className="flex w-full flex-col items-center justify-center">
        <Outlet />
      </main>
      <TanStackRouterDevtools />
    </AuthContext.Provider>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
});
