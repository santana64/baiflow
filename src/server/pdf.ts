import PDFDocument from "pdfkit";
import { LEGAL_DISCLAIMER } from "@/lib/constants";

export type PdfDocumentInput = {
  title: string;
  contentText: string;
  footer?: string;
};

export async function renderDocumentPdf(input: PdfDocumentInput) {
  const doc = new PDFDocument({
    size: "A4",
    margin: 54,
    info: {
      Title: input.title,
      Author: "BailFlow",
      Subject: "Document administratif locatif"
    }
  });
  const chunks: Buffer[] = [];
  doc.on("data", (chunk: Buffer) => chunks.push(chunk));
  const done = new Promise<Buffer>((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });

  const safeText = (value: string) =>
    value
      .replace(/[\u202f\u00a0]/g, " ")
      .replace(/[’‘]/g, "'")
      .replace(/[“”]/g, '"');

  doc.font("Helvetica-Bold").fontSize(20).fillColor("#0a0a0a").text(safeText(input.title), { align: "left" });
  doc.moveDown();
  doc.font("Helvetica").fontSize(10).fillColor("#0a0a0a");

  for (const block of input.contentText.split(/\n{2,}/)) {
    doc.text(safeText(block.trim()), { lineGap: 4, align: "left" });
    doc.moveDown(0.8);
  }

  const footer = input.footer ?? LEGAL_DISCLAIMER;
  doc.moveDown();
  doc.strokeColor("#e5e5e5").moveTo(54, doc.y).lineTo(541, doc.y).stroke();
  doc.moveDown();
  doc.fontSize(8).fillColor("#5d6670").text(safeText(footer), { lineGap: 3 });
  doc.end();
  return done;
}

export function pdfFileName(title: string) {
  return `${title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "document"}.pdf`;
}
