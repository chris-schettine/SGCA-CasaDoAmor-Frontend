import { createContext, useState, useEffect, type ReactNode } from 'react';
export interface UserType {
  username: string;
  roles: string[]; // ex.: ["Médica", "Recepcionista"]
}
interface AuthContextType {
  isAuthenticated: boolean;
  user: UserType | null;
  token: string | null;
  login: (token: string, user: UserType) => void;
  logout: () => void;
  isLoading: boolean;
}

// criando o context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// criando o provider para envolver sua aplicação
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<UserType | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // verificar o token no localStorage/sessionStorage ao carregar a aplicação
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('authUsername');
    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        const parsedUser: UserType = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch {
        setUser(null);
      }
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const login = (newToken: string, userData: UserType) => {
    localStorage.setItem('authToken', newToken);
    localStorage.setItem('authUsername', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUsername');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  // fornecer o valor do contexto para os componentes filhos
  const contextValue = {
    isAuthenticated,
    user,
    token,
    login,
    logout,
    isLoading,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };