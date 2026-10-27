
import { createEmbedding } from "../config/embeddingConnection.js";
import { cosineSimilarity } from "./cosineSimilarity.js";

const sentences = [
  "I want to learn React",
  "I want to study React",
  "The weather is sunny today",
];

const embeddings = [];

for (const sentence of sentences) {
  embeddings.push(await createEmbedding(sentence));
}

console.log(
  "React vs study React:",
  cosineSimilarity(embeddings[0], embeddings[1])
);

console.log(
  "React vs weather:",
  cosineSimilarity(embeddings[0], embeddings[2])
);
