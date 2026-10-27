
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 30000,
});

const MAX_MESSAGES = 10;
const MAX_TOOL_ROUNDS = 3;

const context = [
  {
    role: "system",
    content: "You are a helpful assistant.",
  },
];

// 1. Define available tools
const tools = [
  {
    type: "function",
    function: {
      name: "get_current_datetime",
      description: "Get the current date and time.",
      parameters: {
        type: "object",
        properties: {},
        required: [],
        additionalProperties: false,
      },
      strict: true,
    },
  },
  {
    type: "function",
    function: {
      name: "calculate",
      description: "Perform basic arithmetic.",
      parameters: {
        type: "object",
        properties: {
          a: { type: "number" },
          b: { type: "number" },
          operation: {
            type: "string",
            enum: ["add", "subtract", "multiply", "divide"],
          },
        },
        required: ["a", "b", "operation"],
        additionalProperties: false,
      },
      strict: true,
    },
  },
];

// 2. Actual JavaScript functions
const getCurrentDateTime = () => new Date().toString();

const calculate = ({ a, b, operation }) => {
  switch (operation) {
    case "add":
      return a + b;
    case "subtract":
      return a - b;
    case "multiply":
      return a * b;
    case "divide":
      if (b === 0) throw new Error("Cannot divide by zero");
      return a / b;
    default:
      throw new Error("Unsupported operation");
  }
};

// 3. Map tool names to functions
const toolFunctions = {
  get_current_datetime: getCurrentDateTime,
  calculate,
};

// 4. Execute whichever tool the AI requests
const executeTool = async (toolCall) => {
  const { name, arguments: argsString } = toolCall.function;
  const toolFunction = toolFunctions[name];

  if (!toolFunction) {
    throw new Error(`Unknown tool: ${name}`);
  }
console.log("toolFunction",toolFunction)
  const args = JSON.parse(argsString || "{}");
  return toolFunction(args);
};

// 5. Keep the system message and recent history
const trimContext = () => {
  const recentMessages = context.slice(1).slice(-MAX_MESSAGES);

  context.length = 0;
  context.push(context[0], ...recentMessages);
};

// 6. Main AI connection
const openAIConnection = async (userInput, userName) => {
  if (!userInput?.trim()) {
    throw new Error("Please provide a question.");
  }

  context[0] = {
    role: "system",
    content: `You are a helpful assistant.
The user's name is ${userName || "Unknown"}.
Address the user by name when natural.`,
  };

  context.push({ role: "user", content: userInput });

  try {
    let response;
    let assistantMessage;
    let toolRounds = 0;

    do {
      response = await openai.chat.completions.create({
        model: "gpt-6-luna",
        messages: context,
        tools,
        tool_choice: "auto",
        reasoning_effort: "none",
      });

      assistantMessage = response.choices[0].message;
      context.push(assistantMessage);

      if (!assistantMessage.tool_calls?.length) {
        break;
      }

      if (++toolRounds > MAX_TOOL_ROUNDS) {
        throw new Error("Maximum tool rounds exceeded");
      }

      for (const toolCall of assistantMessage.tool_calls) {
        const result = await executeTool(toolCall);

        context.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: String(result),
        });
      }
    } while (true);

    trimContext();
    return assistantMessage.content;
  } catch (error) {
    console.error("OpenAI error:", error.message);
    throw error;
  }
};

export { openAIConnection };
