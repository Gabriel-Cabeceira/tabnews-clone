import { listFolderChildren } from "../../../../models/onedrive.js";

export default function folders(request, response) {
    if (request.method !== "GET") {
        return response.status(405).json({ error: "Método não permitido" });
    }

    // Lists the root folders/files inside one_drive_replica
    const items = listFolderChildren("");

    if (items === null) {
        return response.status(404).json({ error: "Pasta raiz não encontrada" });
    }

    return response.status(200).json({
        "@odata.context":
            "https://graph.microsoft.com/v1.0/$metadata#Collection(driveItem)",
        value: items,
    });
}
