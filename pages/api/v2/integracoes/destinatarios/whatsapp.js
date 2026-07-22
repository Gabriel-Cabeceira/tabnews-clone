import {
  applyMockStatusOverride,
  getDestinatariosFixture,
} from "models/opini.js";

export default function whatsapp(request, response) {
  if (applyMockStatusOverride(request, response)) {
    return;
  }

  if (request.method === "GET") {
    const scenario = request.query.mock_scenario || "completo";
    return response.status(200).json(getDestinatariosFixture(scenario));
  }

  if (request.method === "PUT") {
    return response.status(200).json({});
  }

  return response.status(405).json({ error: "Método não permitido" });
}
