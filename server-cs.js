// server.js

const express = require("express");
const fs = require("fs");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

if (!process.env.GEMINI_API_KEY) {
  throw new Error("❌ Missing GEMINI_API_KEY in .env file.");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function formatMarkdownTable(rawMarkdown) {
  const lines = rawMarkdown.trim().split("\n");
  const table = lines.map((line) =>
    line
      .split("|")
      .map((cell) => cell.trim())
      .filter(Boolean)
  );
  const colWidths = table[0].map((_, i) =>
    Math.max(...table.map((row) => (row[i] || "").length))
  );
  const paddedTable = table.map(
    (row) =>
      "| " + row.map((cell, i) => cell.padEnd(colWidths[i])).join(" | ") + " |"
  );
  return paddedTable.join("\n");
}

let lastGenerated = "";
let lastTopic = "";

app.post("/generate-todo", async (req, res) => {
  const { topic, force = false } = req.body;

  if (!topic || typeof topic !== "string") {
    return res
      .status(400)
      .json({ error: "⚠️ Topic is required and must be a string." });
  }

  // Reset cache if topic changes or force is true
  if (force || topic !== lastTopic) {
    lastGenerated = "";
    lastTopic = topic;
  }

  // Return cached version if available
  if (lastGenerated) {
    return res.json({ todoList: lastGenerated });
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
    });

    const prompt = `
You are an expert in computer science education and competitive programming.
Generate a comprehensive, deep, and structured Markdown to-do list for the topic: "${topic}".

## Format Instructions:
- Respond with ONLY a Markdown table (NO intro or extra text).
- Table must have **exactly 4 columns**: "Check", "Category", "Algorithm/Topic", "Notes"
- Start your output with this line (no heading, no explanation):
| Check | Category | Algorithm/Topic | Notes |
|-------|----------|------------------|-------|
- All rows must have: [ ] in the Check column.
- Ensure correct and meaningful grouping in the "Category" column.
- Use full algorithm names, e.g., "Knuth-Morris-Pratt (KMP)", not "KMP"
- "Notes" column must explain:
  - Time and space complexity (e.g., O(n log n), O(1) extra space)
  - Use case or intuition
  - Key edge cases or pitfalls

## Content Requirements:
- Cover all levels: beginner to expert.
- Include all fundamental operations (e.g., for strings: length, character access)
- Include ALL known techniques related to the topic:
  - For "Strings": Pattern Matching (Naive, KMP, Rabin-Karp, Z-algo, Aho-Corasick), Trie structures, Hashing, Suffix Trees/Arrays/Automaton, Sliding Window, Anagram Tricks, Palindromes (Manacher’s), DP on strings (LCS, Edit Distance), Sorting techniques, Regex, Duval, Lyndon, Compression (Burrows-Wheeler), etc.
  - For "Dynamic Programming": 1D, 2D, State DP, Tree DP, Bitmask, Digit DP, Knapsack, LIS, MCM, LCS, Edit Distance, etc.
- Include rare but important techniques (e.g., Lyndon decomposition, Duval’s algo, palindrome tricks, etc.)
- NO vague categories like "Advanced". Use precise and well-known classification.

DO NOT include anything outside the table.
Start the table now.
        `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const rawText = await response.text();

    const formattedText = formatMarkdownTable(rawText);
    lastGenerated = formattedText;

    res.json({ todoList: formattedText });
  } catch (error) {
    console.error("❌ AI error:", error);
    res.status(500).json({ error: "Failed to generate to-do list." });
  }
});

app.get("/download-todo", (req, res) => {
  if (!lastGenerated) {
    return res.status(404).send("❌ No to-do list generated yet.");
  }

  const filename = path.join(__dirname, "todo.md");
  fs.writeFileSync(filename, lastGenerated);

  res.download(filename, "todo.md", (err) => {
    if (err) {
      console.error("Download error:", err);
      res.status(500).send("Failed to download file.");
    } else {
      fs.unlinkSync(filename);
    }
  });
});

app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
  console.log("📦 Use POST /generate-todo and GET /download-todo");
});
