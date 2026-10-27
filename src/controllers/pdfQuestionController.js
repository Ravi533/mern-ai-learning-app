
import { pdfStore } from "../util/pdfStore.js";
import { createEmbedding } from "../config/embeddingConnection.js";
import { cosineSimilarity } from "../util/cosineSimilarity.js";

const askPdfQuestion = async (req, res, next) => {
  try {
    const { question } = req.body;

    if (!question || typeof question !== "string" || !question.trim()) {
      return res.status(400).json({
        message: "Question is required",
      });
    }

    if (!pdfStore.chunks.length) {
      return res.status(400).json({
        message: "Please upload a PDF before asking questions",
      });
    }

    // 1. Create an embedding for the question
    const questionEmbedding = await createEmbedding(question.trim());

    // 2. Find the most relevant chunks
    const rankedChunks = pdfStore.chunks
      .map((chunk) => ({
        ...chunk,
        score: cosineSimilarity(questionEmbedding, chunk.embedding),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    // 3. Build context from the retrieved chunks
    const context = rankedChunks
      .map((chunk, index) => `[Source ${index + 1}]\n${chunk.text}`)
      .join("\n\n");

    // 4. Ask Ollama to answer using the PDF context
    const response = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3.2:3b",
        messages: [
          {
            role: "system",
            content: `Answer the user's question using only the provided PDF context.
If the answer is not present in the context, clearly say that the PDF does not provide enough information.
Do not invent facts.

PDF context:
${context}`,
          },
          {
            role: "user",
            content: question.trim(),
          },
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.status}`);
    }

    const data = await response.json();

    return res.json({
      fileName: pdfStore.fileName,
      question: question.trim(),
      answer: data.message.content,
      sources: rankedChunks.map((chunk, index) => ({
        id: index + 1,
        text: chunk.text,
        score: Number(chunk.score.toFixed(4)),
      })),
    });
  } catch (error) {
    next(error);
  }
};

export { askPdfQuestion };
