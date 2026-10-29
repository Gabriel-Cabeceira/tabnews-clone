import {
  applyMockStatusOverride,
  getAgendamentosPeriodoFixture,
  parseDataPeriodo,
  requireBearer,
  setConfirmacao,
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

  return response.status(200).json(getAgendamentosPeriodoFixture(scenario));
}

function confirmarAgendamento(request, response) {
  if (applyMockStatusOverride(request, response)) {
    return;
  }

  if (!requireBearer(request, response)) {
    return;
  }

  const body = request.body || {};
  const lowercase = "id_do_Agendamento" in body;
  const id = lowercase ? body.id_do_Agendamento : body.Id_do_Agendamento;

  if (id === undefined || id === null) {
    return response
      .status(400)
      .json({ message: "id_do_Agendamento é obrigatório" });
  }

  console.log(
    `[mock medx] PUT agendamentos recebeu chaves ${lowercase ? "minúsculas" : "PascalCase"} (id ${id})`,
  );

  setConfirmacao(id, lowercase ? body.confirmacao : body.Confirmacao);

  return response.status(200).json("Agendamento atualizado com sucesso.");
}
