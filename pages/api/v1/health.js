export default function health(request, response) {
    if (request.method !== "GET") {
        return response.status(405).json({ error: "Método não permitido" });
    }
    
    return response.status(200).json({
        ok: true,
        status: "UP",
        timestamp: new Date().toISOString(),
    });
}
