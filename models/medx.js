import crypto from "crypto";

/**
 * If the request carries a ?mock_status=<code> query param, immediately
 * responds with that status and a generic error body, simulating a failure
 * from the real Medx API (e.g. 401, 429, 404, 500). Returns true when it has
 * already sent a response.
 */
export function applyMockStatusOverride(request, response) {
  const mockStatus = parseInt(request.query.mock_status, 10);

  if (!Number.isNaN(mockStatus)) {
    response.status(mockStatus).json({
      message: "Erro simulado via mock_status",
    });
    return true;
  }

  return false;
}

/**
 * Checks for an "Authorization: Bearer <anything>" header. The real JWT is
 * never validated, only its presence. Responds 401 and returns false when
 * the header is missing.
 */
export function requireBearer(request, response) {
  const authorization = request.headers.authorization || "";

  if (!/^Bearer\s+\S+/i.test(authorization)) {
    response.status(401).json({ message: "Token não informado" });
    return false;
  }

  return true;
}

export function generateAccessToken() {
  return `mock-jwt-${crypto.randomUUID()}`;
}

function isValidDia(dia) {
  return typeof dia === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dia);
}

export function resolveDia(dia) {
  return isValidDia(dia) ? dia : new Date().toISOString().slice(0, 10);
}

function buildAgendamentoListagem(dia, overrides = {}) {
  const base = {
    Id_do_Agendamento: 1275002001,
    Inicio: `${dia}T14:00:00`,
    Chegada: `${dia}T13:50:00`,
    Descricao: "Consulta de rotina, Convênio: Saúde",
    Id_da_Assinatura: 5001,
    Id_do_Paciente: 700001,
    Paciente: "Paciente Fictício Um",
    Nascimento: "1985-03-12T00:00:00",
    Sexo: "F",
    Tipo_Agendamento: "Consulta",
    Convenio: "Saúde",
    Email: "paciente1@exemplo.com",
    Telefone_Residencial: "3432001001",
    Telefone_Residencial_1: "",
    Celular: "5534992201095",
    Medico: "Dr. Médico Fictício",
    Conselho: "CRM",
    Numero_Conselho: "123456",
    UF_Conselho: "MG",
  };

  return { ...base, ...overrides };
}

/**
 * Returns the array for GET /agenda/integracao, shaped according to the
 * requested mock scenario.
 */
export function getAgendaFixture(dia, scenario) {
  switch (scenario) {
    case "vazio":
      return [];

    case "dados_invalidos": {
      // Items missing one required field each: they must be discarded by ASC.
      const semCelular = buildAgendamentoListagem(dia, {
        Id_do_Agendamento: 1275002901,
      });
      delete semCelular.Celular;

      const semMedico = buildAgendamentoListagem(dia, {
        Id_do_Agendamento: 1275002902,
      });
      delete semMedico.Medico;

      const semPaciente = buildAgendamentoListagem(dia, {
        Id_do_Agendamento: 1275002903,
      });
      delete semPaciente.Paciente;

      const semInicio = buildAgendamentoListagem(dia, {
        Id_do_Agendamento: 1275002904,
      });
      delete semInicio.Inicio;

      const valido = buildAgendamentoListagem(dia);

      return [valido, semCelular, semMedico, semPaciente, semInicio];
    }

    case "completo":
    default:
      return [
        buildAgendamentoListagem(dia),
        buildAgendamentoListagem(dia, {
          Id_do_Agendamento: 1275002002,
          Inicio: `${dia}T15:30:00`,
          Chegada: `${dia}T15:20:00`,
          Id_do_Paciente: 700002,
          Paciente: "Paciente Fictício Dois",
          Sexo: "M",
          Email: "paciente2@exemplo.com",
          Celular: "5521972514938",
          Medico: "Dra. Médica Fictícia",
          Numero_Conselho: "654321",
          UF_Conselho: "RJ",
        }),
      ];
  }
}

/**
 * Returns the array for GET /agenda/agendamentos/{id}: the full record,
 * which the ASC side sends back as-is in the confirmation PUT.
 */
export function getAgendamentoFixture(id, dia) {
  const numericId = Number(id);
  const inicio = `${dia}T14:00:00`;

  return [
    {
      Id_da_Assinatura: 5001,
      Id_do_Agendamento: Number.isNaN(numericId) ? id : numericId,
      Id_do_Usuario: 43013640,
      Inicio: inicio,
      Final: `${dia}T14:30:00`,
      Descricao: "Consulta de rotina, Convênio: Saúde",
      Status: 3,
      Id_do_Procedimento: 111,
      Vinculado_a: 30094605,
      Id_do_Diagnostico_QP: 0,
      Id_do_TipoConsulta: 111,
      Confirmacao: "",
      Usuario: "usuario.integracao",
      Nome: "Paciente Fictício Um",
      Chegada: `${dia}T13:50:00`,
      SMS: "",
      Atendido_as: inicio,
      Saiu_as: `${dia}T14:30:00`,
      LastEditDate: `${dia}T08:00:00`,
      CreationDate: `${dia}T07:00:00`,
      Pendente: true,
    },
  ];
}
