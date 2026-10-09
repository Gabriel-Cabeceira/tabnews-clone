import {
  applyMockStatusOverride,
  getAgendaFixture,
  requireBearer,
  resolveDia,
} from "models/medx.js";

export default function integracao(request, response) {
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
  const scenario = request.query.mock_scenario || "completo";

  return response.status(200).json(getAgendaFixture(dia, scenario));
}
