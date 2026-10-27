
import { semanticSearch } from "./semanticSearch.js";

const results = await semanticSearch(
  "How do I build a UI with React?"
);

console.log("results",results);
