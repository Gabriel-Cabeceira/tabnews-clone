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
    Telefone_Residencial: "00300000021",
    Telefone_Residencial_1: "",
    Celular: "0000900000031",
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
          Celular: "0000900000032",
          Medico: "Dra. Médica Fictícia",
          Numero_Conselho: "654321",
          UF_Conselho: "RJ",
        }),
      ];
  }
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

// Every mock appointment is placed on this day (tomorrow, 2026-10-29 + 1),
// whatever inicio/fim the list request asks for.
const DIA_AGENDA = "2026-10-30";

const SETOR_2 = "Clínica 2° Andar";
const SETOR_3 = "Clínica 3º andar";
const SETOR_4 = "Clinica 4° Andar";
const SETOR_15 = "Clínica 15° Andar";
// Differs from SETOR_2 only by "º" vs "°": setor filtering must be exact.
const SETOR_2_ORDINAL = "Clínica 2º Andar";

/**
 * Every row of the mock agenda. The ids are the same on any day, only the
 * dates change, so GET /agenda/agendamentos/{id} stays coherent with the list.
 * Row 1: the owner, alone in an exclusive setor. Every other phone uses DDD 00,
 * which can never exist. The rest covers every case of MEDX_AJUSTES.md: status
 * != 1 (number and text), status as text, positive and negative ids, patient
 * 0/null/unknown (400), unknown doctor and doctors named by usuarioNome,
 * nomeCompleto or neither, repeated patient, every phone fallback (celular,
 * telefone_Residencial, telefone_Residencial_1, sms), names with parentheses
 * and extra spaces, setores that differ only by "º"/"°", and the "NÃO AGENDAR"
 * block.
 */
const AGENDAMENTOS = [
  {
    id: 1275003006,
    usuario: 90000001,
    paciente: 700100,
    setor: SETOR_15,
    sms: "34992201095",
    nome: "Gabriel Cabeceira",
    prontuario: 100000100,
  },
  {
    id: 1275003007,
    usuario: 90000001,
    paciente: 700101,
    setor: SETOR_3,
    sms: "00900000001",
    nome: "PACIENTE TESTE UM",
    prontuario: 100000101,
  },
  {
    id: 1275003008,
    usuario: 90000001,
    paciente: 700102,
    setor: SETOR_2,
    sms: "00900000002",
    nome: "PACIENTE TESTE DOIS",
    prontuario: 100000102,
  },
  {
    id: 1275003009,
    usuario: 90000001,
    paciente: 700102,
    setor: SETOR_3,
    sms: "00900000002",
    status: 3,
    nome: "PACIENTE TESTE DOIS",
    prontuario: 100000102,
  },
  {
    id: 1275003010,
    usuario: 90000001,
    paciente: 0,
    setor: SETOR_2,
    sms: "00900000003",
    status: "1",
    nome: "NOME NA DESCRICAO (OBS)",
    prontuario: "",
  },
  {
    id: 1275003011,
    usuario: 99999999,
    paciente: 700404,
    setor: SETOR_4,
    sms: "00900000004",
    nome: "PACIENTE INEXISTENTE",
    prontuario: 100000404,
  },
  {
    id: 1275003012,
    usuario: 90000001,
    paciente: null,
    setor: SETOR_3,
    sms: null,
    nome: "",
    prontuario: "",
  },
  {
    id: 1071230099,
    usuario: 90000003,
    paciente: 700999,
    setor: SETOR_2,
    sms: null,
    bloqueio: true,
  },
  {
    id: 1275003013,
    usuario: 90000001,
    paciente: 700101,
    setor: SETOR_3,
    sms: "00900000005",
    status: "2",
    nome: "PACIENTE TESTE UM",
    prontuario: 100000101,
  },
  {
    id: -1058990001,
    usuario: -609770001,
    paciente: -1047160001,
    setor: SETOR_3,
    sms: "00900000011",
    nome: "PACIENTE FICTICIO UM (DR.FULANO)",
    prontuario: 100000001,
  },
  {
    id: -1058990002,
    usuario: -609770002,
    paciente: -1047160002,
    setor: SETOR_2,
    sms: "00900000012",
    nome: "PACIENTE FICTICIO DOIS",
    prontuario: 100000002,
  },
  {
    id: -1058990003,
    usuario: -609770003,
    paciente: -1047160003,
    setor: SETOR_4,
    sms: "00900000013",
    nome: "PACIENTE SO RESIDENCIAL 1",
    prontuario: 100000003,
  },
  {
    id: -1058990004,
    usuario: 90000001,
    paciente: -1047160004,
    setor: SETOR_3,
    sms: "00900000014",
    nome: "",
    prontuario: "",
  },
  {
    id: 1275003014,
    usuario: 90000001,
    paciente: 700004,
    setor: SETOR_4,
    sms: "00900000015",
    nome: "JOAO DA SILVA (DR.X)",
    prontuario: 100000012,
  },
  {
    id: 1275003015,
    usuario: 90000001,
    paciente: 700003,
    setor: SETOR_3,
    sms: "00900000016",
    nome: "",
    prontuario: "",
  },
  {
    id: 1275003016,
    usuario: 90000001,
    paciente: 700002,
    setor: SETOR_2,
    sms: "00900000017",
    nome: "MARIA EXEMPLO (DR.FULANO)",
    prontuario: 100000011,
  },
  {
    id: 1275003017,
    usuario: 90000001,
    paciente: 700001,
    setor: SETOR_3,
    sms: "00900000018",
    nome: "PACIENTE FICTICIO UM",
    prontuario: 100000010,
  },
  {
    id: 1275003018,
    usuario: 90000001,
    paciente: 700101,
    setor: SETOR_2_ORDINAL,
    sms: "00900000019",
    nome: "PACIENTE TESTE UM",
    prontuario: 100000101,
  },
];

function buildDescricao(item) {
  if (item.bloqueio) {
    return "NÃO AGENDAR, , ,  , null,  ";
  }

  return `${item.nome}, ,  Nº prontuário ${item.prontuario}, , null, ${item.sms ?? ""}`;
}

function buildHorario(dia, index) {
  const minutos = 8 * 60 + index * 30;
  const hh = String(Math.floor(minutos / 60)).padStart(2, "0");
  const mm = String(minutos % 60).padStart(2, "0");
  const fimMinutos = minutos + 30;
  const fhh = String(Math.floor(fimMinutos / 60)).padStart(2, "0");
  const fmm = String(fimMinutos % 60).padStart(2, "0");

  return { inicio: `${dia}T${hh}:${mm}:00`, fim: `${dia}T${fhh}:${fmm}:00` };
}

// confirmacao written by PUT /agenda/agendamentos, kept in memory so a later
// GET by id returns it. Lost when the server process restarts. Kept on
// globalThis because each API route may bundle its own copy of this module.
const confirmacoes = (globalThis.medxMockConfirmacoes ??= new Map());

export function setConfirmacao(id, confirmacao) {
  confirmacoes.set(Number(id), confirmacao);
}

function findAgendamento(id) {
  const index = AGENDAMENTOS.findIndex((item) => item.id === Number(id));
  return { index, item: AGENDAMENTOS[index] };
}

/**
 * Returns the array for GET /agenda/agendamentos?inicio&fim. Field names are
 * camelCase with the underscore preserved (id_Usuario, id_Paciente, ...), not
 * the PascalCase shown in openapi.yaml.
 */
export function getAgendamentosPeriodoFixture(scenario) {
  const dia = DIA_AGENDA;

  if (scenario === "vazio") {
    return [];
  }

  return AGENDAMENTOS.map((item, index) => {
    const { inicio, fim } = item.bloqueio
      ? { inicio: `${dia}T07:00:00`, fim: `${dia}T17:00:00` }
      : buildHorario(dia, index);
    const criador = item.bloqueio
      ? { id: -2025830001, nome: "Atendente Exemplo" }
      : { id: 1, nome: "Administrador" };
    const datas = item.bloqueio
      ? "2026-07-31T14:33:43.707"
      : "2026-10-27T18:09:32.477";

    return {
      id_Usuario: item.usuario,
      inicio,
      fim,
      descricao: buildDescricao(item),
      tipoAgendamento: null,
      status: item.status ?? 1,
      id_Paciente: item.paciente,
      id_Agendamento: item.id,
      id_do_Diagnostico_QP: 0,
      confirmacao: confirmacoes.get(item.id) ?? null,
      chegada: null,
      sms: item.sms,
      atendido_as: null,
      saiu_as: null,
      lastEditDate: datas,
      creationDate: datas,
      quemcriouId: criador.id,
      quemcriounome: criador.nome,
      quemeditouId: criador.id,
      quemeditounome: criador.nome,
      setor: item.setor,
    };
  });
}

/**
 * Returns the array for GET /agenda/agendamentos/{id}: the full record in
 * lowercase keys, which the ASC side sends back as-is in the confirmation PUT.
 * Returns null when the id is unknown.
 */
export function getAgendamentoFixture(id) {
  const dia = DIA_AGENDA;

  const { index, item } = findAgendamento(id);

  if (!item) {
    return null;
  }

  const { inicio, fim } = item.bloqueio
    ? { inicio: `${dia}T07:00:00`, fim: `${dia}T17:00:00` }
    : buildHorario(dia, index);

  return [
    {
      id_da_Assinatura: 0,
      id_do_Agendamento: item.id,
      id_do_Usuario: item.usuario,
      inicio,
      final: fim,
      descricao: buildDescricao(item),
      status: item.status ?? 1,
      id_do_Procedimento: 0,
      vinculado_a: item.paciente,
      id_do_Diagnostico_QP: 0,
      id_do_TipoConsulta: 0,
      confirmacao: confirmacoes.get(item.id) ?? null,
      usuario: null,
      nome: null,
      chegada: null,
      sms: item.sms,
      atendido_as: null,
      saiu_as: null,
      lastEditDate: null,
      creationDate: null,
      quemcriouId: null,
      quemcriounome: null,
      quemeditouId: null,
      quemeditounome: null,
      pendente: false,
    },
  ];
}

/** Returns the array for GET /agenda/setores. */
export function getSetoresFixture() {
  return [
    {
      iddaAssinatura: 0,
      iddoSetor: -1791540001,
      setor: SETOR_2,
      smS_DDD: "00",
      smS_Telefone: "3000-0001",
    },
    {
      iddaAssinatura: null,
      iddoSetor: 1,
      setor: SETOR_3,
      smS_DDD: "00",
      smS_Telefone: "90000-0002",
    },
    {
      iddaAssinatura: 0,
      iddoSetor: -609870001,
      setor: SETOR_4,
      smS_DDD: "00",
      smS_Telefone: "3000-0003",
    },
    {
      iddaAssinatura: 0,
      iddoSetor: -1791540002,
      setor: SETOR_2_ORDINAL,
      smS_DDD: "00",
      smS_Telefone: "3000-0004",
    },
    {
      iddaAssinatura: 0,
      iddoSetor: 15,
      setor: SETOR_15,
      smS_DDD: "00",
      smS_Telefone: "3000-0015",
    },
  ];
}

function buildProfissional(overrides) {
  // Keys follow the order and types of the real API response.
  return {
    idDaAssinatura: 0,
    idDoUsuario: 0,
    usuarioNome: "",
    idDoSetor: 1,
    ativo: true,
    agenda: true,
    senha: "*".repeat(21),
    carimbo: '<p style="margin:0">&nbsp;</p>',
    cidade: "Cidade Exemplo",
    pacientes: true,
    prontuario: true,
    agendaS: true,
    gerencia: true,
    estatistica: true,
    usuarios: false,
    configuracao: true,
    prontuarioExibe: true,
    prontuarioEscreve: true,
    lastEditDate: "2022-08-17T14:57:17.393",
    creationDate: "2022-08-17T14:57:17.393",
    atendimentos: null,
    financeiro: true,
    idDaUnidadeDeNegocios: 1,
    estoque: 1,
    hora1i: "08:00",
    hora2i: "08:00",
    hora3i: "08:00",
    hora4i: "08:00",
    hora5i: "08:00",
    hora6i: "08:00",
    hora7i: "00:00",
    hora1f: "18:00",
    hora2f: "18:00",
    hora3f: "18:00",
    hora4f: "18:00",
    hora5f: "17:00",
    hora6f: "18:00",
    hora7f: "00:01",
    marketing: true,
    dashboard: true,
    qualidade: true,
    nomeCompleto: null,
    conselhoProfissional: "",
    numeroDoConselho: "",
    ufConselho: null,
    relatoriosFinanceiros: true,
    cripto: false,
    validade: "2018-05-10T00:00:00",
    ultimaSenha: "*".repeat(23),
    tentativas: null,
    grupos: null,
    eGrupo: null,
    biometria: false,
    portal: true,
    faturamentoEditar: false,
    faturamento: false,
    iCal: null,
    endereco: "Rua Exemplo, 100 - Centro",
    telefone: "",
    cpf: "",
    email: "",
    r1: true,
    ia: true,
    linkAgendamentoOnline: null,
    ...overrides,
  };
}

/**
 * Returns the array for GET /financas/profissionais, with the full structure
 * of the real API. Includes the sensitive fields (senha, ultimaSenha, cpf,
 * email) with fake values, so the consumer can be checked for not leaking
 * them.
 */
export function getProfissionaisFixture() {
  return [
    buildProfissional({
      idDoUsuario: 90000001,
      usuarioNome: "Fulano",
      nomeCompleto: "Fulano de Tal Exemplo",
      conselhoProfissional: "CRM",
      numeroDoConselho: "123456",
      ufConselho: "MG",
      telefone: "003000-0001",
      cpf: "00000000001",
      email: "profissional1@exemplo.com",
    }),
    buildProfissional({
      idDoUsuario: -609770001,
      usuarioNome: "Marcio",
      nomeCompleto: "Marcio Exemplo da Silva",
      idDoSetor: -1791540001,
      conselhoProfissional: "CRM",
      numeroDoConselho: "654.321",
      ufConselho: "MG",
      carimbo:
        '<p class="ql-align-right" style="margin:0"><strong><em>Dr. Marcio Exemplo</em></strong></p>',
      cripto: true,
      cpf: "00000000002",
      email: "profissional2@exemplo.com",
    }),
    buildProfissional({
      idDoUsuario: -609770002,
      usuarioNome: "",
      nomeCompleto: "Dra. Médica Fictícia Souza",
      ufConselho: "",
      telefone: "(00) 90000-0003",
      cpf: "00000000003",
      email: "profissional3@exemplo.com",
    }),
    buildProfissional({
      idDoUsuario: -609770003,
      usuarioNome: null,
      nomeCompleto: null,
      idDoSetor: -609870001,
      agenda: false,
      cpf: "",
      email: "profissional4@exemplo.com",
    }),
    buildProfissional({
      idDoUsuario: 90000003,
      usuarioNome: "Lester Exemplo",
      nomeCompleto: "Lester Exemplo Rodrigues",
      idDoSetor: -1791540001,
      cpf: "00000000005",
      email: "profissional5@exemplo.com",
    }),
  ];
}

function buildContato(id, overrides) {
  // Unfilled fields come as null in the real API, a few as "".
  return {
    id_da_Assinatura: null,
    id_do_Cliente: id,
    nome: "",
    nome_Social: null,
    endereco_Residencial: null,
    endereco_Comercial: null,
    cidade_Residencial: null,
    cidade_Comercial: null,
    estado_Residencial: null,
    estado_Comercial: null,
    cep_Residencial: null,
    cep_Comercial: null,
    pais_Residencial: null,
    pais_Comercial: null,
    telefone_Residencial: "",
    telefone_Residencial_1: null,
    celular: "",
    observacoes: null,
    sexo: "F",
    estado_Civil: null,
    bairro_Residencial: null,
    bairro_Comercial: null,
    telefone_Comercial: null,
    profissao: null,
    email: "clinica@exemplo.com",
    paginadaWeb: null,
    referencias: null,
    filhos: null,
    empresa: null,
    nascimento: "1990-05-10T03:00:00",
    cpF_CGC: null,
    tipo: null,
    mala_Direta: false,
    id_do_Convenio: null,
    vip: false,
    numero_da_Matricula: null,
    historico_Familiar_IAM_AVC_antes_50_anos: null,
    regiao: null,
    escolaridade: null,
    religiao: null,
    co_Morbidade: null,
    fadiga: null,
    fumante: null,
    rg: null,
    mae: null,
    pai: null,
    conjugue: null,
    acompanhante: null,
    contato: null,
    exclui_Mkt: 0,
    tags: null,
    como_conheceu: null,
    indicado_por: 0,
    pendente: "false",
    numeroCNS: null,
    ...overrides,
  };
}

const CONTATOS = {
  [-1047160001]: buildContato(-1047160001, {
    id_da_Assinatura: 100000001,
    nome: "PACIENTE FICTICIO UM (DR.FULANO)",
    celular: "00900000011",
    telefone_Residencial: "",
  }),
  [-1047160002]: buildContato(-1047160002, {
    id_da_Assinatura: null,
    nome: "PACIENTE FICTICIO DOIS",
    celular: "",
    telefone_Residencial: "00300000012",
  }),
  [-1047160003]: buildContato(-1047160003, {
    nome: "PACIENTE SO RESIDENCIAL 1",
    telefone_Residencial_1: "00300000013",
  }),
  [-1047160004]: buildContato(-1047160004, {
    nome: "",
    celular: null,
    telefone_Residencial: "",
  }),
  700001: buildContato(700001, {
    nome: "PACIENTE FICTICIO UM",
    celular: "00900000021",
    telefone_Residencial: "00300000021",
  }),
  700002: buildContato(700002, {
    nome: "MARIA EXEMPLO (DR.FULANO)",
    celular: "",
    telefone_Residencial: "00300000022",
  }),
  700003: buildContato(700003, {
    nome: "",
    celular: null,
    telefone_Residencial: "",
  }),
  700004: buildContato(700004, {
    nome: "  JOAO   DA SILVA (DR.X)  ",
    telefone_Residencial_1: "00300000024",
  }),
  700100: buildContato(700100, {
    nome: "Gabriel Cabeceira",
    celular: "34992201095",
    sexo: "M",
  }),
  700101: buildContato(700101, {
    nome: "PACIENTE TESTE UM",
    celular: "00900000001",
  }),
  700102: buildContato(700102, {
    nome: "PACIENTE TESTE DOIS",
    celular: "00900000002",
  }),
  700999: buildContato(700999, {
    nome: "NÃO AGENDAR",
    endereco_Residencial: " NULL ",
    cidade_Residencial: "",
    estado_Residencial: "",
    cep_Residencial: "",
    telefone_Residencial: " ",
    celular: " ",
    observacoes: "",
    sexo: "M",
    bairro_Residencial: "",
    email: "",
    referencias: "",
    nascimento: "1900-01-01T00:00:00",
    cpF_CGC: "",
    tipo: "1",
    rg: "",
  }),
};

/**
 * Returns the ficha for GET /contatos/{id}, or null when the id is unknown
 * (the endpoint then answers 400 with the real error array).
 */
export function getContatoFixture(id) {
  return CONTATOS[id] ?? null;
}
