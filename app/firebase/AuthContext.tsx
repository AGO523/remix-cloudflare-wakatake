import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { initializeFirebase } from "./firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAuthenticated: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const auth = initializeFirebase();
      if (auth) {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
          setUser(firebaseUser);
          setLoading(false);
        });

        return () => unsubscribe();
      } else {
        console.error("Auth initialization failed.");
        setLoading(false);
      }
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, isAuthenticated: user !== null }}
    >
      {children}
    </AuthContext.Provider>
  );
};
