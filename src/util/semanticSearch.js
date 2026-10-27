
import { createEmbedding } from "../config/embeddingConnection.js";
import { cosineSimilarity } from "./cosineSimilarity.js";

const documents = [
  {
    id: 1,
    text: "React is a JavaScript library for building user interfaces.",
  },
  {
    id: 2,
    text: "Node.js lets us run JavaScript on the server.",
  },
  {
    id: 3,
    text: "MongoDB is a NoSQL database used to store application data.",
  },
  {
    id: 4,
    text: "React uses reusable components to build web applications.",
  },
];

const semanticSearch = async (query, limit = 2) => {
  const queryEmbedding = await createEmbedding(query);
  const results = [];

  for (const document of documents) {
    const documentEmbedding = await createEmbedding(document.text);

    const score = cosineSimilarity(
      queryEmbedding,
      documentEmbedding
    );

    results.push({
      ...document,
      score,
    });
  }

  results.sort((a, b) => b.score - a.score);

const relevantResults = results.filter(
  (document) => document.score >= 0.5
);

return relevantResults.slice(0, limit);
};

export { semanticSearch };
