import { applyMockStatusOverride, requireBearer } from "models/medx.js";

export default function confirmarAgendamento(request, response) {
  if (request.method !== "PUT") {
    return response.status(405).json({ error: "Método não permitido" });
  }

  if (applyMockStatusOverride(request, response)) {
    return;
  }

  if (!requireBearer(request, response)) {
    return;
  }

  return response.status(200).json("Agendamento atualizado com sucesso.");
}
