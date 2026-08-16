const U8Proto = Uint8Array.prototype as unknown as Record<string, unknown>;
if (typeof U8Proto.toHex !== "function") {
  U8Proto.toHex = function (this: Uint8Array) {
    let hex = "";
    for (let i = 0; i < this.length; i++) {
      hex += this[i].toString(16).padStart(2, "0");
    }
    return hex;
  };
}

function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  if (typeof file.arrayBuffer === "function") {
    return file.arrayBuffer();
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
}

const TOHEX_POLYFILL = `
if (typeof Uint8Array.prototype.toHex !== "function") {
  Uint8Array.prototype.toHex = function () {
    var h = "";
    for (var i = 0; i < this.length; i++) {
      h += this[i].toString(16).padStart(2, "0");
    }
    return h;
  };
}
`;

async function getPolyfillWorkerSrc(): Promise<string> {
  const res = await fetch("/pdf.worker.min.mjs");
  const workerCode = await res.text();
  const blob = new Blob([TOHEX_POLYFILL, workerCode], {
    type: "application/javascript",
  });
  return URL.createObjectURL(blob);
}

async function extractPagesFromData(
  pdfjsLib: typeof import("pdfjs-dist"),
  data: ArrayBuffer,
): Promise<string[]> {
  const doc = await pdfjsLib.getDocument({
    data,
    isEvalSupported: false,
  }).promise;

  const pages: string[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ");
    pages.push(pageText);
  }

  await doc.destroy();
  return pages;
}

export async function extractTextPagesFromPdf(file: File): Promise<string[]> {
  const pdfjsLib = await import("pdfjs-dist");
  const buffer = await readFileAsArrayBuffer(file);
  const fallbackCopy = buffer.slice(0);

  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  try {
    return await extractPagesFromData(pdfjsLib, buffer);
  } catch {
    // .mjs worker or toHex failed — retry with polyfilled worker blob
  }

  const blobSrc = await getPolyfillWorkerSrc();
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = blobSrc;
    return await extractPagesFromData(pdfjsLib, fallbackCopy);
  } finally {
    URL.revokeObjectURL(blobSrc);
  }
}

export async function extractTextFromPdf(file: File): Promise<string> {
  const pages = await extractTextPagesFromPdf(file);
  return pages.join("\n");
}
