import {
  applyMockStatusOverride,
  getAgendamentosPeriodoFixture,
  parseDataPeriodo,
  requireBearer,
} from "models/medx.js";

export default function agendamentos(request, response) {
  if (request.method === "GET") {
    return listarAgendamentos(request, response);
  }

  if (request.method === "PUT") {
    return confirmarAgendamento(request, response);
  }

  return response.status(405).json({ error: "Método não permitido" });
}

function listarAgendamentos(request, response) {
  if (applyMockStatusOverride(request, response)) {
    return;
  }

  if (!requireBearer(request, response)) {
    return;
  }

  const inicio = parseDataPeriodo(request.query.inicio);
  const fim = parseDataPeriodo(request.query.fim);

  if (!inicio || !fim) {
    return response
      .status(400)
      .json({ message: "inicio e fim são obrigatórios (AAAA-MM-DD)" });
  }

  const scenario = request.query.mock_scenario || "completo";

  return response
    .status(200)
    .json(getAgendamentosPeriodoFixture(inicio, scenario));
}

function confirmarAgendamento(request, response) {
  if (applyMockStatusOverride(request, response)) {
    return;
  }

  if (!requireBearer(request, response)) {
    return;
  }

  return response.status(200).json("Agendamento atualizado com sucesso.");
}
