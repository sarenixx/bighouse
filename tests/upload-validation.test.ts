import { describe, expect, it } from "vitest";

import {
  MAX_UPLOAD_SIZE_BYTES,
  validateUploadFile
} from "@/lib/server/upload-validation";

describe("validateUploadFile", () => {
  it("accepts supported files and returns a sanitized filename", () => {
    const file = new File(["test"], "Board Packet 2026!!.pdf", {
      type: "application/pdf"
    });

    const result = validateUploadFile(file);

    expect(result.mimeType).toBe("application/pdf");
    expect(result.fileSize).toBe(file.size);
    expect(result.sanitizedFilename).toMatch(/Board-Packet-2026\.pdf$/);
  });

  it("rejects unsupported file types", () => {
    const file = new File(["malware"], "payload.exe", {
      type: "application/x-msdownload"
    });

    expect(() => validateUploadFile(file)).toThrowError(
      "Unsupported file type. Upload a PDF, PNG, JPG, CSV, or XLSX file."
    );
  });

  it("rejects files larger than the configured limit", () => {
    const file = new File([new Uint8Array(MAX_UPLOAD_SIZE_BYTES + 1)], "large.pdf", {
      type: "application/pdf"
    });

    expect(() => validateUploadFile(file)).toThrowError(
      "File is too large. The limit is 10 MB."
    );
  });
});
