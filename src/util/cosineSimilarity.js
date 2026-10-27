
const cosineSimilarity = (vectorA, vectorB) => {
    if (vectorA.length !== vectorB.length) {
      throw new Error("Embedding dimensions must match");
    }
  
    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;
  
    for (let i = 0; i < vectorA.length; i++) {
      dotProduct += vectorA[i] * vectorB[i];
      magnitudeA += vectorA[i] ** 2;
      magnitudeB += vectorB[i] ** 2;
    }
  
    const denominator =
      Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB);
  
    if (denominator === 0) {
      throw new Error("Cannot compare a zero vector");
    }
  
    return dotProduct / denominator;
  };
  
  export { cosineSimilarity };
  