import {
  applyMockStatusOverride,
  getAgendamentoFixture,
  requireBearer,
} from "models/medx.js";

export default function agendamentoPorId(request, response) {
  if (request.method !== "GET") {
    return response.status(405).json({ error: "Método não permitido" });
  }

  if (applyMockStatusOverride(request, response)) {
    return;
  }

  if (!requireBearer(request, response)) {
    return;
  }

  const agendamento = getAgendamentoFixture(request.query.id);

  if (!agendamento) {
    return response.status(404).json({ message: "Agendamento não encontrado" });
  }

  return response.status(200).json(agendamento);
}
