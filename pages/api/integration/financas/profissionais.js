import {
  applyMockStatusOverride,
  getProfissionaisFixture,
  requireBearer,
} from "models/medx.js";

export default function profissionais(request, response) {
  if (request.method !== "GET") {
    return response.status(405).json({ error: "Método não permitido" });
  }

  if (applyMockStatusOverride(request, response)) {
    return;
  }

  if (!requireBearer(request, response)) {
    return;
  }

  return response.status(200).json(getProfissionaisFixture());
}
