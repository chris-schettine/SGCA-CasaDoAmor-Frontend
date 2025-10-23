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
        // Verifica se há token no localStorage
        const storedToken = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('authUser');

        if (storedToken && storedUser) {
          try {
            // Tenta fazer parse do usuário armazenado
            const parsedUser = JSON.parse(storedUser);
            
            // Restaura o estado do localStorage
            setToken(storedToken);
            setUser(parsedUser);
            setIsAuthenticated(true);
            
            // Valida a sessão com o backend
            try {
              const userData = await authService.getActiveSession();
              if (userData) {
                setUser(userData);
                localStorage.setItem('authUser', JSON.stringify(userData));
              }
            } catch (error) {
              console.warn('[AuthContext] Falha ao validar sessão:', error);
              // Se falhar a validação, limpa tudo
              localStorage.removeItem('authToken');
              localStorage.removeItem('authUser');
              setToken(null);
              setUser(null);
              setIsAuthenticated(false);
            }
          } catch (parseError) {
            // Erro ao fazer parse do JSON - dados corrompidos
            console.error('[AuthContext] Erro ao fazer parse do usuário armazenado:', parseError);
            // Limpa dados corrompidos
            localStorage.removeItem('authToken');
            localStorage.removeItem('authUser');
            setToken(null);
            setUser(null);
            setIsAuthenticated(false);
          }
        } else {
          // Sem token no localStorage - usuário não está autenticado
          console.log('[AuthContext] Nenhum token encontrado - usuário não autenticado');
          setUser(null);
          setIsAuthenticated(false);
          setToken(null);
        }
      } catch (error) {
        console.error('[AuthContext] Erro ao verificar autenticação:', error);
        setUser(null);
        setIsAuthenticated(false);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

 
  const login = (newToken: string, userData: UserType) => {
    // Salva no localStorage
    localStorage.setItem('authToken', newToken);
    localStorage.setItem('authUser', JSON.stringify(userData));
    
    // Atualiza o estado
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
      // Limpa localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
      
      // Limpa estado
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