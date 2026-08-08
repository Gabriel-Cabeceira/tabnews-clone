import crypto from "crypto";

/**
 * If the request carries a ?mock_status=<code> query param, immediately
 * responds with that status and a generic error body, simulating a failure
 * from the real OPINI API. Returns true when it has already sent a response.
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
 * Formats a Date as DD/MM/AAAA HH:mm:ss, the format used by OPINI's
 * DataExpiracao field.
 */
export function formatDataExpiracao(date) {
  const pad = (value) => String(value).padStart(2, "0");

  const day = pad(date.getDate());
  const month = pad(date.getMonth() + 1);
  const year = date.getFullYear();
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());

  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}

function buildRegistro(overrides = {}) {
  const base = {
    CodigoDestinatario: "10000001",
    Nome: "Cliente Fictício",
    Telefone: "5534992201095",
    TituloPesquisa: "Pesquisa de Satisfação - Mock (001)",
    PathLinkPesquisa: "aaaa1111bbbb2222/w",
    LinkPesquisa: "https://s.opini.one/aaaa1111bbbb2222/w",
    CodigoControle: "20000001",
    DataCadastro: "2026-01-01T09:00:00",
  };

  return { ...base, ...overrides };
}

/**
 * Returns a {Total, Registros} payload for GET /destinatarios/whatsapp,
 * shaped according to the requested mock scenario.
 */
export function getDestinatariosFixture(scenario) {
  switch (scenario) {
    case "sem_titulo": {
      const registro = buildRegistro({
        CodigoDestinatario: "10000003",
        CodigoControle: "20000003",
      });
      delete registro.TituloPesquisa;
      return { Total: 1, Registros: [registro] };
    }

    case "sem_telefone": {
      const registro = buildRegistro({
        CodigoDestinatario: "10000004",
        CodigoControle: "20000004",
      });
      delete registro.Telefone;
      return { Total: 1, Registros: [registro] };
    }

    case "sem_link": {
      const registro = buildRegistro({
        CodigoDestinatario: "10000005",
        CodigoControle: "20000005",
      });
      delete registro.PathLinkPesquisa;
      delete registro.LinkPesquisa;
      return { Total: 1, Registros: [registro] };
    }

    case "vazio":
      return { Total: 0, Registros: [] };

    case "completo":
    default:
      return {
        Total: 2,
        Registros: [
          buildRegistro({
            CodigoDestinatario: "10000001",
            Telefone: "5534992201095",
            PathLinkPesquisa: "aaaa1111bbbb2222/w",
            LinkPesquisa: "https://s.opini.one/aaaa1111bbbb2222/w",
            CodigoControle: "20000001",
          }),
          buildRegistro({
            CodigoDestinatario: "10000002",
            Telefone: "5521972514938",
            PathLinkPesquisa: "cccc3333dddd4444/w",
            LinkPesquisa: "https://s.opini.one/cccc3333dddd4444/w",
            CodigoControle: "20000002",
          }),
        ],
      };
  }
}

export function generateToken() {
  return crypto.randomUUID();
}
