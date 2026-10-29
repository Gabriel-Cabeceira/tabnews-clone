import {
  applyMockStatusOverride,
  getContatoFixture,
  requireBearer,
} from "models/medx.js";

export default function contatoPorId(request, response) {
  if (request.method !== "GET") {
    return response.status(405).json({ error: "Método não permitido" });
  }

  if (applyMockStatusOverride(request, response)) {
    return;
  }

  if (!requireBearer(request, response)) {
    return;
  }

  const contato = getContatoFixture(request.query.id);

  if (!contato) {
    return response.status(400).json([
      {
        reasons: [],
        message: `Contato com id ${request.query.id} não encontrado`,
        metadata: {},
      },
    ]);
  }

  return response.status(200).json(contato);
}
