import { applyMockStatusOverride, generateAccessToken } from "models/medx.js";

export default function token(request, response) {
  if (request.method !== "POST") {
    return response.status(405).json({ error: "Método não permitido" });
  }

  if (applyMockStatusOverride(request, response)) {
    return;
  }

  const { IntegrationToken } = request.body || {};

  if (!IntegrationToken) {
    return response
      .status(400)
      .json({ message: "IntegrationToken é obrigatório" });
  }

  return response.status(200).json({
    accessToken: generateAccessToken(),
    tokenType: "Bearer",
    expiresInSeconds: 900,
    scope: "agenda:read agenda:write",
  });
}
