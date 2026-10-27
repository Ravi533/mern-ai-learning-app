
import { get_encoding } from "tiktoken";

const tokenHandler = (prompt = "How are you Today?") => {
  const encoder = get_encoding("cl100k_base");

  try {
    const tokens = encoder.encode(prompt);

    console.log("Token IDs:", tokens);
    console.log("Token count:", tokens.length);

    return tokens.length;
  } finally {
    encoder.free();
  }
};

export default tokenHandler;
