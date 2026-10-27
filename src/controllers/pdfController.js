
import { PDFParse } from "pdf-parse";
import { chunkText } from "../util/chunkText.js";
import { createEmbedding } from "../config/embeddingConnection.js";
import { pdfStore } from "../util/pdfStore.js";


const uploadPdf = async (req, res, next) => {
  let parser;

  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Please upload a PDF file",
      });
    }

    // 1. Extract PDF text
    parser = new PDFParse({
      data: req.file.buffer,
    });

    const result = await parser.getText();
    const extractedText = result.text.trim();

    if (!extractedText) {
      return res.status(400).json({
        message: "No readable text found in this PDF",
      });
    }

    // 2. Split the text into chunks
    const chunks = chunkText(extractedText);

    // 3. Generate an embedding for each chunk
    const embeddedChunks = [];

    for (const chunk of chunks) {
      const embedding = await createEmbedding(chunk.text);

      embeddedChunks.push({
        text: chunk.text,
        start: chunk.start,
        end: chunk.end,
        embedding,
      });
    }
    pdfStore.fileName = req.file.originalname;
    pdfStore.chunks = embeddedChunks;
    // 4. Return a summary for testing
    return res.status(200).json({
      message: "PDF processed successfully",
      fileName: req.file.originalname,
      totalChunks: embeddedChunks.length,
      embeddingDimensions: embeddedChunks[0]?.embedding.length ?? 0,
      chunks: embeddedChunks.map((chunk, index) => ({
        index,
        textPreview: chunk.text.slice(0, 150),
        start: chunk.start,
        end: chunk.end,
      })),
    });
  } catch (error) {
    next(error);
  } finally {
    if (parser) {
      await parser.destroy();
    }
  }
};

export { uploadPdf };
