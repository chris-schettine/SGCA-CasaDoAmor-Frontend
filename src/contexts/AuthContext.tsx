import { createContext, useState, useEffect, type ReactNode } from 'react';
import { isAxiosError } from 'axios';

import { authService } from '../api/auth.service'; 

export interface UserType {
  nome: string; 
  email: string;
  cpf: string;
  roles: string[];
  // tipoUsuario é o campo vindo do backend: e.g. 'ADMINISTRADOR' ou outro tipo
  tipoUsuario?: string;
  uuid?: string;
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
            
            // Valida a sessão com o backend. Se a validação falhar com 401 (token inválido/expirado)
            // limpamos a sessão local. Para 403 (acesso negado) ou outros erros transitórios,
            // mantemos o token/usuário restaurados do localStorage para evitar que o usuário
            // perca a sessão ao atualizar a página.
            try {
              const rawUser = await authService.getActiveSession();
              if (rawUser) {
                // Normalize backend user shape to our frontend UserType
                const normalizedUser: UserType = {
                  nome: rawUser.nome ?? rawUser.user?.nome ?? '',
                  email: rawUser.email ?? rawUser.user?.email ?? '',
                  cpf: rawUser.cpf ?? rawUser.user?.cpf ?? '',
                  roles: Array.isArray(rawUser.perfis)
                    ? rawUser.perfis
                        .map((perfil) => perfil?.nome)
                        .filter((roleName): roleName is string => Boolean(roleName))
                    : rawUser.roles ?? rawUser.user?.roles ?? [],
                  tipoUsuario: rawUser.tipo ?? rawUser.tipoUsuario ?? rawUser.user?.tipoUsuario,
                  uuid: rawUser.uuid ?? rawUser.user?.uuid,
                };

                setUser(normalizedUser);
                localStorage.setItem('authUser', JSON.stringify(normalizedUser));
              }
            } catch (error: unknown) {
              if (isAxiosError(error)) {
                const status = error.response?.status;
                console.warn('[AuthContext] Falha ao validar sessão:', status ?? error);
                if (status === 401) {
                  // Token inválido ou expirado - limpa sessão
                  localStorage.removeItem('authToken');
                  localStorage.removeItem('authUser');
                  setToken(null);
                  setUser(null);
                  setIsAuthenticated(false);
                } else {
                  // Para 403 (acesso negado) ou outros erros, mantemos o usuário localmente
                  // (evita que admins percam permissões ao recarregar a página quando /auth/me
                  // não estiver disponível para retornar o perfil por políticas do backend).
                  console.warn('[AuthContext] Mantendo sessão local apesar do erro de validação');
                  setIsAuthenticated(true);
                }
              } else {
                // Token inválido ou expirado - limpa sessão
                localStorage.removeItem('authToken');
                localStorage.removeItem('authUser');
                setToken(null);
                setUser(null);
                setIsAuthenticated(false);
                console.warn('[AuthContext] Falha ao validar sessão (erro inesperado):', error);
              }
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
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        console.error("Erro ao fazer logout:", error.response?.status ?? error.message);
      } else if (error instanceof Error) {
        console.error("Erro ao fazer logout:", error.message);
      } else {
        console.error("Erro ao fazer logout:", error);
      }
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