import { createContext, useState, useEffect, type ReactNode } from 'react';

import { authService } from '../api/auth.service'; 

export interface UserType {
  nome: string; 
  email: string;
  cpf: string;
  roles: string[]; 
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserType | null;
  token: string | null;
  login: (token: string, user: UserType) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<UserType | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // 👇 CORREÇÃO: Usa o método limpo do authService
        const userData = await authService.getActiveSession();

        if (userData) {
          setUser(userData);
          setIsAuthenticated(true);
        } else {
           throw new Error("Sessão não encontrada");
        }
      } catch (error) {
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

 
  const login = (newToken: string, userData: UserType) => {
    // Esta função está correta, ela só atualiza o estado
    setToken(newToken);
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      // 👇 CORREÇÃO: Usa o método limpo do authService
      await authService.logout(); 
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setToken(null);
    }
  };

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