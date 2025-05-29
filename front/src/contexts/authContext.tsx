
import { Profile } from "@/types/user";
import { createContext } from "react";

export type AuthContextType = {
  user: Profile | null;
  isAuthenticated: boolean;
  login: (id: string) => void;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
});
