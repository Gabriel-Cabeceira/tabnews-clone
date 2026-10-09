import {
  applyMockStatusOverride,
  getAgendamentoFixture,
  requireBearer,
  resolveDia,
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

  const dia = resolveDia(request.query.dia);

  return response
    .status(200)
    .json(getAgendamentoFixture(request.query.id, dia));
}
