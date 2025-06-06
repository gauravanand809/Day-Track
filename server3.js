// server.js

const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const cors = require("cors");
require("dotenv").config(); // Loads GEMINI_API_KEY from .env

// --- SETUP INSTRUCTIONS ---
// 1. Run: npm install express @google/generative-ai cors dotenv
// 2. Create a file named `.env` in the same directory as this file.
// 3. Add your API key in `.env` like: GEMINI_API_KEY=YOUR_API_KEY_HERE
// 4. Start server: node server.js
// 5. Send POST to http://localhost:3000/generate-todo with { "topic": "Your Topic" }
// --------------------------------------

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Check for API key
if (!process.env.GEMINI_API_KEY) {
  throw new Error("❌ Missing GEMINI_API_KEY in .env file.");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// POST /generate-todo — returns a Markdown to-do table for a topic
app.post("/generate-todo", async (req, res) => {
  const { topic } = req.body;

  if (!topic || typeof topic !== "string") {
    return res
      .status(400)
      .json({ error: "⚠️ Topic is required and must be a string." });
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
    });

    // ✅ Structured Prompt (minimal deviation, strict format)
    const prompt = `
You are a precise and consistent AI assistant.

Your task is to generate a complete and exhaustive **technical preparation to-do list** on the topic: **"${topic}"** for a student preparing for technical interviews and coding contests.

### 📋 OUTPUT REQUIREMENTS
Respond with **only** a single **Markdown table** and **no other text**. No titles, no explanations.

The table **must strictly follow this format**:
| Check | Category | Algorithm/Topic | Notes |
|-------|----------|------------------|-------|

- Each row must begin with: \`[ ]\` in the **Check** column.
- The **Category** column must group topics meaningfully (e.g., "Pattern Matching", "Suffix Structures", "Hashing", "DP", "Tries", etc.).
- The **Algorithm/Topic** column should use full standard names like: "Knuth-Morris-Pratt (KMP)", "Manacher’s Algorithm", "Edit Distance", etc.
- The **Notes** column should briefly describe time/space complexity, core idea, or use case.

### 📚 CONTENT REQUIREMENTS
- **Be exhaustive**: include basic to advanced subtopics.
- **No duplicates or vague entries** like "Advanced".
- Include lesser-known but important topics if relevant (e.g., "Lyndon Decomposition", "Duval’s Algorithm").
- For the topic "${topic}", include all subcategories (e.g., for "Strings": Pattern Matching, Suffix Trees, Hashing, Trie, DP, Anagram tricks, etc.).

⚠️ Important: You must **not** include any text **before or after the table**.

Begin with the table immediately. The first line must be:
| Check | Category | Algorithm/Topic | Notes |

Only the Markdown table. Start now.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();

    res.json({ todoList: text });
  } catch (error) {
    console.error("Error generating to-do list:", error);
    res
      .status(500)
      .json({ error: "❌ Failed to communicate with the AI model." });
  }
});

// Start server
app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
  console.log("📦 Ready to generate structured Markdown to-do lists.");
});
