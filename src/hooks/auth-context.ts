import { createContext } from "react";
import { Session, User } from "@supabase/supabase-js";

export type AppRole = "client" | "lawyer" | "admin";

export interface AuthContextValue {
  user: User | null;
  session: Session | null;
  role: AppRole | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
