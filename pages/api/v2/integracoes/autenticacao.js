import {
  applyMockStatusOverride,
  formatDataExpiracao,
  generateToken,
} from "models/opini.js";

export default function autenticacao(request, response) {
  if (request.method !== "POST") {
    return response.status(405).json({ error: "Método não permitido" });
  }

  if (applyMockStatusOverride(request, response)) {
    return;
  }

  const { Email, Senha } = request.body || {};

  if (Senha === "invalida") {
    return response.status(401).json({ message: "Credenciais inválidas" });
  }

  const expiracao = new Date();
  expiracao.setDate(expiracao.getDate() + 1);

  return response.status(200).json({
    NomePerfil: "Usuário de Integração",
    Email: Email || "email@exemplo.com",
    Token: generateToken(),
    DataExpiracao: formatDataExpiracao(expiracao),
  });
}
