
const chunkText = (text, chunkSize = 1000, overlap = 150) => {
    if (!text || typeof text !== "string") {
      return [];
    }
  
    if (chunkSize <= 0 || overlap < 0 || overlap >= chunkSize) {
      throw new Error(
        "Overlap must be non-negative and smaller than chunk size"
      );
    }
  
    const cleanedText = text.replace(/\s+/g, " ").trim();
  
    if (!cleanedText) {
      return [];
    }
  
    const chunks = [];
    let start = 0;
  
    while (start < cleanedText.length) {
      const end = Math.min(start + chunkSize, cleanedText.length);
  
      chunks.push({
        text: cleanedText.slice(start, end),
        start,
        end,
      });
  
      if (end === cleanedText.length) {
        break;
      }
  
      start = end - overlap;
    }
  
    return chunks;
  };
  
  export { chunkText };
  