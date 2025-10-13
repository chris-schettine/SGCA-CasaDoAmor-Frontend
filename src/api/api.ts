import type { UserType } from "../contexts/AuthContext";

export async function loginApi(user: UserType, password: string): Promise<{ token: string }> {
  await new Promise((resolve) => setTimeout(resolve, 700));

  // Removemos completamente a lógica insegura.
  // A função agora sempre retorna um erro, desativando o login mock.
  throw new Error("Funcionalidade de login em desenvolvimento. API real pendente.");
}

/*import type { UserType } from "../contexts/AuthContext";

export async function loginApi(user: UserType, password: string): Promise<{ token: string }> {
  // Simula um atraso da API
  await new Promise((resolve) => setTimeout(resolve, 700));

  // Aqui você pode criar lógica de validação fake
  if (user.username === "admin" && password === "123") {
    return { token: "token-admin" };
  } else {
    throw new Error("Usuário ou senha inválidos");
  }
}
*/