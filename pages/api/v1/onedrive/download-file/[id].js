import fs from "fs";
import { decodeId, getFileInfo } from "../../../../../models/onedrive.js";

export default function downloadFile(request, response) {
    if (request.method !== "GET") {
        return response.status(405).json({ error: "Método não permitido" });
    }

    const { id } = request.query;

    let relativePath;
    try {
        relativePath = decodeId(id);
    } catch {
        return response.status(400).json({ error: "ID inválido" });
    }

    const fileInfo = getFileInfo(relativePath);

    if (!fileInfo) {
        return response
            .status(404)
            .json({ error: "Arquivo não encontrado ou o ID corresponde a uma pasta" });
    }

    const fileBuffer = fs.readFileSync(fileInfo.absolutePath);

    response.setHeader("Content-Type", fileInfo.mimeType);
    response.setHeader(
        "Content-Disposition",
        `attachment; filename="${encodeURIComponent(fileInfo.name)}"`,
    );
    response.setHeader("Content-Length", fileBuffer.length);

    return response.status(200).send(fileBuffer);
}
