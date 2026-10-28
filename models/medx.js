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
    if (mockStatus === 429) {
      response.setHeader("Retry-After", "60");
    }

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
    Telefone_Residencial: "1130000001",
    Telefone_Residencial_1: "",
    Celular: "5511900000001",
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
          Celular: "5511900000002",
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
      Id_do_Usuario: 90000001,
      Inicio: inicio,
      Final: `${dia}T14:30:00`,
      Descricao: "Consulta de rotina, Convênio: Saúde",
      Status: 3,
      Id_do_Procedimento: 111,
      Vinculado_a: 90000100,
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

/**
 * Extracts AAAA-MM-DD from a "inicio"/"fim" query param, which the real API
 * accepts as a date or a date-time. Returns null when it is missing/invalid.
 */
export function parseDataPeriodo(value) {
  if (typeof value !== "string") {
    return null;
  }

  const match = value.match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : null;
}

/**
 * Returns the array for GET /agenda/agendamentos?inicio&fim. Field names are
 * camelCase with the underscore preserved (id_Usuario, id_Paciente, ...), not
 * the PascalCase shown in openapi.yaml. Items cover the cases in
 * MEDX_AJUSTES.md: status as number and as text, status != 1, setores with
 * accents/°/º, negative and unknown doctor ids, patient 0/null/unknown (404),
 * repeated patients and phone fallbacks.
 */
export function getAgendamentosPeriodoFixture(dia, scenario) {
  if (scenario === "vazio") {
    return [];
  }

  const build = (overrides) => ({
    id_Usuario: 90000001,
    inicio: `${dia}T09:00:00`,
    fim: `${dia}T09:30:00`,
    descricao: "Descrição que não deve ser usada como nome",
    tipoAgendamento: "Consulta",
    status: 1,
    id_Paciente: 700001,
    id_Agendamento: 1275003001,
    id_do_Diagnostico_QP: 111,
    confirmacao: "",
    chegada: null,
    sms: "11900000010",
    atendido_as: null,
    saiu_as: null,
    lastEditDate: `${dia}T08:00:00`,
    creationDate: `${dia}T07:00:00`,
    setor: "Clínica Geral",
    ...overrides,
  });

  return [
    build({}),
    build({
      id_Agendamento: 1275003002,
      id_Usuario: -1234,
      inicio: `${dia}T09:30:00`,
      fim: `${dia}T10:00:00`,
      id_Paciente: 700002,
      setor: "Pediatria 1º Andar",
    }),
    build({
      id_Agendamento: 1275003003,
      id_Usuario: 90000002,
      inicio: `${dia}T10:00:00`,
      fim: `${dia}T10:30:00`,
      status: "1",
      id_Paciente: 0,
      descricao: "NOME NA DESCRICAO",
      setor: "Pediatria 1º Andar",
    }),
    build({
      id_Agendamento: 1275003004,
      id_Usuario: 99999999,
      inicio: `${dia}T10:30:00`,
      fim: `${dia}T11:00:00`,
      id_Paciente: 700001,
      setor: "Ortopedia 2° Andar",
    }),
    build({
      id_Agendamento: 1275003005,
      inicio: `${dia}T11:00:00`,
      fim: `${dia}T11:30:00`,
      status: 3,
      id_Paciente: 700002,
    }),
    build({
      id_Agendamento: 1275003006,
      inicio: `${dia}T11:30:00`,
      fim: `${dia}T12:00:00`,
      status: "2",
      id_Paciente: 700003,
    }),
    build({
      id_Agendamento: 1275003007,
      inicio: `${dia}T13:00:00`,
      fim: `${dia}T13:30:00`,
      id_Paciente: 700404,
      sms: "11900000011",
      setor: "Ortopedia 2° Andar",
    }),
    build({
      id_Agendamento: 1275003008,
      inicio: `${dia}T13:30:00`,
      fim: `${dia}T14:00:00`,
      id_Paciente: 700003,
      sms: "11900000012",
    }),
    build({
      id_Agendamento: 1275003009,
      id_Usuario: 90000002,
      inicio: `${dia}T14:00:00`,
      fim: `${dia}T14:30:00`,
      id_Paciente: 700004,
      setor: "Ortopedia 2º Andar",
    }),
    build({
      id_Agendamento: 1275003010,
      inicio: `${dia}T14:30:00`,
      fim: `${dia}T15:00:00`,
      id_Paciente: null,
      sms: null,
    }),
  ];
}

/** Returns the array for GET /agenda/setores. */
export function getSetoresFixture() {
  return [
    {
      iddaAssinatura: 5001,
      iddoSetor: 1,
      setor: "Clínica Geral",
      smS_DDD: "11",
      smS_Telefone: "900000001",
    },
    {
      iddaAssinatura: 5001,
      iddoSetor: 2,
      setor: "Pediatria 1º Andar",
      smS_DDD: "11",
      smS_Telefone: "900000002",
    },
    {
      iddaAssinatura: 5001,
      iddoSetor: 3,
      setor: "Ortopedia 2° Andar",
      smS_DDD: "",
      smS_Telefone: "",
    },
    {
      iddaAssinatura: 5001,
      iddoSetor: 4,
      setor: "Ortopedia 2º Andar",
      smS_DDD: "",
      smS_Telefone: "",
    },
  ];
}

/**
 * Returns the array for GET /financas/profissionais. Includes the sensitive
 * fields (senha, ultimaSenha, cpf, email) the real API returns, with fake
 * values, so the consumer can be checked for not leaking them.
 */
export function getProfissionaisFixture() {
  const sensivel = (n) => ({
    senha: `senha-fake-${n}`,
    ultimaSenha: `ultima-senha-fake-${n}`,
    cpf: `0000000000${n}`,
    email: `profissional${n}@exemplo.com`,
  });

  return [
    {
      idDaAssinatura: 5001,
      idDoUsuario: 90000001,
      usuarioNome: "dr.ficticio",
      nomeCompleto: "Dr. Médico Fictício da Silva",
      idDoSetor: 1,
      ativo: true,
      agenda: true,
      conselhoProfissional: "CRM",
      numeroDoConselho: "123456",
      ufConselho: "MG",
      ...sensivel(1),
    },
    {
      idDaAssinatura: 5001,
      idDoUsuario: -1234,
      usuarioNome: "",
      nomeCompleto: "Dra. Médica Fictícia Souza",
      idDoSetor: 2,
      ativo: true,
      agenda: true,
      conselhoProfissional: "CRM",
      numeroDoConselho: "654321",
      ufConselho: "RJ",
      ...sensivel(2),
    },
    {
      idDaAssinatura: 5001,
      idDoUsuario: 90000002,
      usuarioNome: null,
      nomeCompleto: null,
      idDoSetor: 3,
      ativo: true,
      agenda: true,
      conselhoProfissional: null,
      numeroDoConselho: null,
      ufConselho: null,
      ...sensivel(3),
    },
  ];
}

const CONTATOS = {
  700001: {
    nome: "PACIENTE FICTICIO UM",
    celular: "11900000020",
    telefone_Residencial: "1130000001",
    telefone_Residencial_1: null,
  },
  700002: {
    nome: "MARIA EXEMPLO (DR.FULANO)",
    celular: "",
    telefone_Residencial: "1130000002",
    telefone_Residencial_1: null,
  },
  700003: {
    nome: "",
    celular: null,
    telefone_Residencial: "",
    telefone_Residencial_1: null,
  },
  700004: {
    nome: "  JOAO   DA SILVA (DR.X)  ",
    celular: "",
    telefone_Residencial: "",
    telefone_Residencial_1: "1130000004",
  },
};

/**
 * Returns the ficha for GET /contatos/{id}, or null when the id is unknown
 * (the endpoint then answers 404).
 */
export function getContatoFixture(id) {
  const contato = CONTATOS[id];

  if (!contato) {
    return null;
  }

  return {
    id_da_Assinatura: 5001,
    id_do_Cliente: Number(id),
    ...contato,
    email: `contato${id}@exemplo.com`,
    sexo: "F",
    nascimento: "1985-03-12T00:00:00",
  };
}
