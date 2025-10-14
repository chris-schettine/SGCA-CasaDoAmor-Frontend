import { createContext, useState, useEffect, type ReactNode } from 'react';
import { apiGateway } from '../api/api.gateway';

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
  // O estado 'token' pode ser removido, pois o frontend não o gerencia mais.
  // Vamos mantê-lo nulo por enquanto para evitar quebrar outras partes do código.
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Verifica a sessão com o backend ao carregar a aplicação
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Supondo que exista um endpoint para buscar dados do usuário logado
        const response = await apiGateway.get('/api/user/me'); 
        if (response.data) {
          setUser(response.data);
          setIsAuthenticated(true);
        }
      } catch (error) {
        // Se a requisição falhar (ex: 401 Unauthorized), o usuário não está logado
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // O login agora apenas atualiza o estado após a chamada da API ter sido bem-sucedida
  const login = (userData: UserType) => {
    // A API de login foi responsável por setar o cookie HttpOnly.
    // Esta função só precisa atualizar o estado da UI.
    setUser(userData);
    setIsAuthenticated(true);
  };

  // O logout chama um endpoint no backend para invalidar o cookie
  const logout = async () => {
    try {
      // Supondo que exista um endpoint de logout
      await apiGateway.post('/auth/logout'); 
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    } finally {
      // Limpa o estado local independentemente do resultado da API
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const contextValue = {
    isAuthenticated,
    user,
    token, // Ainda aqui, mas como null
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