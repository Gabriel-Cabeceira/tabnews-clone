import fs from "fs";
import path from "path";

async function base64File(request, response) {
    if (request.method !== "GET") {
        return response.status(405).json({ error: "Método não permitido" });
    }

    const filePath = path.join(process.cwd(), "pages", "api", "v1", "base64File", "boleto.pdf");

    try {
        const fileBuffer = fs.readFileSync(filePath);
        const base64 = fileBuffer.toString("base64");
        response.status(200).json({ base64 });
    } catch (error) {
        response.status(500).json({ error: error.message });
    }
}

export default base64File;