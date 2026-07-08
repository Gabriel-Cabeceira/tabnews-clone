import crypto from "crypto";
import fs from "fs";
import path from "path";

const ONE_DRIVE_ROOT = path.join(process.cwd(), "one_drive_replica");

/**
 * Encodes a relative path (from one_drive_replica) into a base64 ID.
 * Empty string represents the root folder itself.
 */
export function encodeId(relativePath) {
    return Buffer.from(relativePath).toString("base64url");
}

/**
 * Decodes a base64 ID back into a relative path.
 */
export function decodeId(id) {
    return Buffer.from(id, "base64url").toString("utf-8");
}

/**
 * Returns the absolute path for a given relative path inside one_drive_replica.
 */
export function getAbsolutePath(relativePath) {
    return path.join(ONE_DRIVE_ROOT, relativePath);
}

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

/**
 * Builds a DriveItem object from a directory entry, mimicking the
 * Microsoft Graph / Azure OneDrive API response shape.
 */
function buildDriveItem(absolutePath, relativePath) {
    const stats = fs.statSync(absolutePath);
    const name = path.basename(absolutePath);
    const isFolder = stats.isDirectory();

    const encodedPath = relativePath
        .split("/")
        .map((segment) => encodeURIComponent(segment))
        .join("/");

    const webUrl = `${BASE_URL}/one_drive_replica/${encodedPath}`;

    return {
        id: encodeId(relativePath),
        name,
        webUrl,
        lastModifiedDateTime: stats.mtime.toISOString(),
        isFolder,
    };
}

/**
 * Lists immediate children of a folder.
 */
export function listFolderChildren(relativePath) {
    const absPath = getAbsolutePath(relativePath);

    if (!fs.existsSync(absPath)) return null;
    if (!fs.statSync(absPath).isDirectory()) return null;

    const entries = fs.readdirSync(absPath);

    return entries.map((entry) => {
        const entryRelative = relativePath ? `${relativePath}/${entry}` : entry;
        const entryAbsolute = path.join(absPath, entry);
        return buildDriveItem(entryAbsolute, entryRelative);
    });
}

/**
 * Recursively lists all items inside a folder (used for the tree endpoint).
 */
export function listAllItems(relativePath = "") {
    const absPath = getAbsolutePath(relativePath);

    if (!fs.existsSync(absPath)) return [];

    const entries = fs.readdirSync(absPath);
    let result = [];

    for (const entry of entries) {
        const entryRelative = relativePath ? `${relativePath}/${entry}` : entry;
        const entryAbsolute = path.join(absPath, entry);
        const item = buildDriveItem(entryAbsolute, entryRelative);
        result.push(item);

        if (fs.statSync(entryAbsolute).isDirectory()) {
            result = result.concat(listAllItems(entryRelative));
        }
    }

    return result;
}

/**
 * Computes a quick hash of a file to mimic the quickXorHash field.
 */
function computeQuickXorHash(absolutePath) {
    const content = fs.readFileSync(absolutePath);
    return crypto.createHash("sha256").update(content).digest("base64");
}

/**
 * Builds a detailed DriveItem (used by the folder/{id} endpoint).
 * Includes size, createdDateTime, file.mimeType, file.hashes and format.
 */
function buildDetailedDriveItem(absolutePath, relativePath) {
    const stats = fs.statSync(absolutePath);
    const name = path.basename(absolutePath);
    const isFolder = stats.isDirectory();

    const encodedPath = relativePath
        .split("/")
        .map((segment) => encodeURIComponent(segment))
        .join("/");

    const webUrl = `${BASE_URL}/one_drive_replica/${encodedPath}`;

    const item = {
        id: encodeId(relativePath),
        name,
        webUrl,
        size: stats.size,
        createdDateTime: stats.birthtime.toISOString(),
        lastModifiedDateTime: stats.mtime.toISOString(),
    };

    if (isFolder) {
        const children = fs.readdirSync(absolutePath);
        item.folder = { childCount: children.length };
    } else {
        const mimeType = getMimeType(name);
        const ext = path.extname(name).replace(".", "").toLowerCase();
        item.file = {
            mimeType,
            hashes: {
                quickXorHash: computeQuickXorHash(absolutePath),
            },
        };
        item.format = ext || "bin";
    }

    return item;
}

/**
 * Lists immediate children of a folder with detailed shape.
 */
export function listFolderChildrenDetailed(relativePath) {
    const absPath = getAbsolutePath(relativePath);

    if (!fs.existsSync(absPath)) return null;
    if (!fs.statSync(absPath).isDirectory()) return null;

    const entries = fs.readdirSync(absPath);

    return entries.map((entry) => {
        const entryRelative = relativePath ? `${relativePath}/${entry}` : entry;
        const entryAbsolute = path.join(absPath, entry);
        return buildDetailedDriveItem(entryAbsolute, entryRelative);
    });
}

/**
 * Checks if a relative path corresponds to a file and returns metadata + absolute path.
 */
export function getFileInfo(relativePath) {
    const absPath = getAbsolutePath(relativePath);

    if (!fs.existsSync(absPath)) return null;
    if (!fs.statSync(absPath).isFile()) return null;

    return {
        absolutePath: absPath,
        name: path.basename(absPath),
        mimeType: getMimeType(absPath),
    };
}

/**
 * Simple MIME type resolver based on file extension.
 */
function getMimeType(filename) {
    const ext = path.extname(filename).toLowerCase();
    const map = {
        ".pdf": "application/pdf",
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".gif": "image/gif",
        ".svg": "image/svg+xml",
        ".txt": "text/plain",
        ".csv": "text/csv",
        ".json": "application/json",
        ".xml": "application/xml",
        ".zip": "application/zip",
        ".docx":
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ".xlsx":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ".pptx":
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        ".mp4": "video/mp4",
        ".mp3": "audio/mpeg",
    };
    return map[ext] ?? "application/octet-stream";
}
