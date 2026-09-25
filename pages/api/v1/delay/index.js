export default async function delay(request, response) {
    if (request.method !== "GET") {
        return response.status(405).json({ error: "Método não permitido" });
    }

    const delaySeconds = 55;

    await new Promise((resolve) => setTimeout(resolve, delaySeconds * 1000));

    return response.status(200).json({
        ok: true,
        delay_seconds: delaySeconds,
        timestamp: new Date().toISOString(),
    });
}
