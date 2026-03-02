import {
    decodeId,
    listFolderChildrenDetailed,
} from "../../../../../models/onedrive.js";

export default function folder(request, response) {
    if (request.method !== "GET") {
        return response.status(405).json({ error: "Método não permitido" });
    }

    const { id } = request.query;
    const page = parseInt(request.query.page) || 1;
    const limit = parseInt(request.query.limit) || 10;

    let relativePath;
    try {
        relativePath = decodeId(id);
    } catch {
        return response.status(400).json({ error: "ID inválido" });
    }

    const allItems = listFolderChildrenDetailed(relativePath);

    if (allItems === null) {
        return response
            .status(404)
            .json({ error: "Pasta não encontrada ou o ID corresponde a um arquivo" });
    }

    const total = allItems.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedItems = allItems.slice(start, end);
    const pages = Math.max(1, Math.ceil(total / limit));

    return response.status(200).json({
        data: paginatedItems,
        total,
        page,
        limit,
        pages,
    });
}
