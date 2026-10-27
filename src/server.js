import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import "dotenv/config";
import taskRoutes from "./routes/taskRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import pdfRoutes from "./routes/pdfRoutes.js";
import errorMiddleware from "./middleware/errorMiddleware.js";
import {  openAIConnection } from "./config/openAIConnection.js";
import tokenHandler from "./util/tokenHandler.js";
import { createEmbedding } from "./config/embeddingConnection.js";
import { semanticSearch } from "./util/semanticSearch.js";



const app = express();

const PORT = 5001;

connectDB();
app.use(cors());
app.use(express.json());





app.post("/api/ai/chat", async (req, res) => {
  console.log("1. Chat API route reached");

  try {
    const { question, username } = req.body;

    console.log("2. Question received:", question);
    console.log("3. Calling openAIConnection...");

    const answer = await openAIConnection(question, username);

    console.log("4. AI answer received:", answer);

    return res.status(200).json({ answer });
  } catch (error) {
    console.error("5. Chat route failed:", error.message);

    return res.status(500).json({
      message: error.message || "AI request failed",
    });
  }
});

app.post("/api/ai/embedding", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text?.trim()) {
      return res.status(400).json({
        message: "Text is required",
      });
    }

    const embedding = await createEmbedding(text);

    console.log("Embedding dimensions:", embedding.length);
    console.log("First five values:", embedding.slice(0, 5));

    return res.json({
      dimensions: embedding.length,
      preview: embedding.slice(0, 5),
    });
  } catch (error) {
    console.error("Embedding error:", error.message);

    return res.status(500).json({
      message: "Failed to create embedding",
    });
  }
});


app.post("/api/ai/search", async (req, res, next) => {
  try {
    const { question } = req.body;

    if (!question || typeof question !== "string" || !question.trim()) {
      return res.status(400).json({
        message: "Question is required",
      });
    }

    const results = await semanticSearch(question.trim());

    return res.json({ results });
  } catch (error) {
    next(error);
  }
});

app.post("/api/ai/rag", async (req, res, next) => {
  try {
    const { question } = req.body;

    if (
      !question ||
      typeof question !== "string" ||
      !question.trim()
    ) {
      return res.status(400).json({
        message: "Question is required",
      });
    }

    // 1. Retrieve relevant documents
    const results = await semanticSearch(question.trim());
    if (results.length === 0) {
      return res.json({
        question: question.trim(),
        answer:
          "The available documents do not contain enough information to answer this question.",
        sources: [],
      });
    }
    // 2. Build context from retrieved documents
    const context = results
      .map((document) => document.text)
      .join("\n");

    // 3. Ask Ollama to answer using the retrieved context
    const response = await fetch(
      "http://localhost:11434/api/chat",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama3.2:3b",
          messages: [
            {
              role: "system",
              content: `Answer the user's question using the
provided context. If the context does not contain the answer,
say that the available documents do not provide enough information.

Context:
${context}`,
            },
            {
              role: "user",
              content: question.trim(),
            },
          ],
          stream: false,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.status}`);
    }

    const data = await response.json();

    // 4. Return the generated answer
    return res.json({
      question: question.trim(),
      answer: data.message.content,
      sources: results.map(({ id, text, score }) => ({
        id,
        text,
        score,
      })),
    });
  } catch (error) {
    next(error);
  }
});




app.get("/", (req, res) => {
  res.send("hello i'm from server");
});

app.use("/api/tasks", taskRoutes);
app.use('/api/auth',authRoutes)
app.use("/api/pdf", pdfRoutes);


app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});



//let tasks = [];

// app.post("/api/tasks", async (req, res) => {
//   const { title, id } = req.body;

//   //   const task = {
//   //     id: tasks.length + 1,
//   //     title: title,
//   //     completed: false,
//   //   };

//   const task = await Task.create({
//     title,
//   });
//   res.status(201).json(task);
// });

// app.get("/api/tasks", async (req, res) => {
//   try {
//     const tasks = await Task.find();

//     res.json(tasks);
//   } catch (error) {
//     res.status(500).json({
//       message: error.message,
//     });
//   }
// });

// app.patch("/api/tasks/:id", async (req, res) => {
//   try {
//     const { id } = req.params;

//     const task = await Task.findByIdAndUpdate(id, req.body, {
//       new: true,
//       runValidators: true,
//     });
//     if (!task) {
//       return res.status(404).json({
//         message: "Task not found",
//       });
//     }

//     res.json(task);
//   } catch (error) {
//     res.status(500).json({
//       message: error.message,
//     });
//   }
// });

// app.delete("/api/tasks/:id",async (req,res)=>{
//     try {
//         const {id} = req.params;
//         const task = await Task.findByIdAndDelete(id);
//         if (!task) {
//             return res.status(404).json({
//               message: "Task not found",
//             });
//           }
      
//           res.json({
//             message: "Task deleted successfully",
//             task,
//           });
//     } catch (error) {
//         res.status(500).json({
//             message: error.message,
//           });
//     }
// })


