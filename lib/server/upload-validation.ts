import { randomUUID } from "node:crypto";
import path from "node:path";

import { AppRouteError } from "@/lib/server/app-route-error";

export const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024;

const allowedMimeTypes = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "text/csv",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
]);

export function validateUploadFile(file: File) {
  if (file.size <= 0) {
    throw new AppRouteError("Please choose a file to upload.", {
      status: 400,
      code: "missing_file"
    });
  }

  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    throw new AppRouteError("File is too large. The limit is 10 MB.", {
      status: 400,
      code: "file_too_large"
    });
  }

  if (!allowedMimeTypes.has(file.type)) {
    throw new AppRouteError("Unsupported file type. Upload a PDF, PNG, JPG, CSV, or XLSX file.", {
      status: 400,
      code: "unsupported_file_type"
    });
  }

  const extension = path.extname(file.name).toLowerCase();
  const basename = path.basename(file.name, extension);
  const sanitizedBase = basename.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  const safeBase = sanitizedBase || "upload";
  const sanitizedFilename = `${Date.now()}-${randomUUID()}-${safeBase}${extension}`;

  return {
    mimeType: file.type,
    fileSize: file.size,
    sanitizedFilename
  };
}
