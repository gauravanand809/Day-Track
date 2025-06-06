const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');
require('dotenv').config(); // To load environment variables

// Import the Gemini API interaction logic
const { GoogleGenerativeAI } = require("@google/generative-ai");

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200, // Increased width slightly
    height: 800,
    title: "Day-Planner", // Set the window title
    icon: path.join(__dirname, 'build/icon.png'), // Set window icon
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // We'll create this file next
      contextIsolation: true,
      nodeIntegration: false, // Important for security
    },
  });

  // Load index.html
  mainWindow.loadFile('index.html');

  // Open the DevTools (optional, for debugging)
  // mainWindow.webContents.openDevTools();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// In this file, you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

// --- IPC Handler for Gemini API (to be implemented fully later) ---
// This is where we'll move the logic from server.js
ipcMain.handle('generate-todo', async (event, { topic, apiKey, model: modelName }) => { // Destructure apiKey and modelName
  const effectiveApiKey = apiKey || process.env.GEMINI_API_KEY;
  const effectiveModelName = modelName || "gemini-2.5-pro-preview-06-05"; // Fallback to default model

  if (!effectiveApiKey) {
    console.error("GEMINI_API_KEY is not set in settings or .env file.");
    return { error: "API Key is not configured. Please set it in Settings." };
  }
  if (!topic) {
    return { error: "Topic is required" };
  }

  try {
    console.log(`Main process received topic: ${topic} (Using Model: ${effectiveModelName})`);
    const genAI = new GoogleGenerativeAI(effectiveApiKey);
    const model = genAI.getGenerativeModel({
      model: effectiveModelName,
      generationConfig: {
        maxOutputTokens: 20000,
      },
    });

    const prompt = `
Generate a highly detailed and exhaustive to-do list for a student preparing for technical interviews on the topic of **"${topic}"**. Your response MUST be a single Markdown table and nothing else. Do not include any introductory text before the table.

**Table Structure Requirements:**
1.  The table MUST have exactly four columns: "Check", "Category", "Algorithm/Topic", and "Notes".
2.  The "Check" column must only contain "[ ]" for each row.
3.  The "Category" column should group related concepts. For example, under "String Matching," categories could be "Pattern Matching," "Hashing," "Trie," "Suffix Structures," etc.
4.  The "Algorithm/Topic" column must list specific, individual algorithms, data structures, or key concepts.
5.  The "Notes" column is critical. For each item, provide a concise but informative note. This note should include the time/space complexity (e.g., O(n log n)), a key insight, a common use case, or a pitfall to watch out for.

**Content Requirements:**
* **Depth:** Be exhaustive. Cover the topic from the absolute basics to advanced, niche concepts. Include prerequisite knowledge, common variations of problems, and important theoretical underpinnings.
* **Completeness:** Do not leave out any major or minor sub-topics. For instance, if the topic is "Dynamic Programming," you must include sections for 1D DP, 2D DP, DP on Trees, Digit DP, Bitmask DP, etc.
* **Clarity:** Use clear and standard terminology.
* **Structure:** Logically group related items under the same "Category".

**Example Output Structure (for "String Matching"):**
| Check | Category          | Algorithm/Topic          | Notes                                      |
|-------|-------------------|--------------------------|--------------------------------------------|
| [ ]   | Pattern Matching  | Naive Pattern Matching   | Brute-force check. Time: O(n*m).           |
| [ ]   | Pattern Matching  | KMP (Knuth-Morris-Pratt) | Uses LPS array to avoid backtracking. Time: O(n+m). |
| [ ]   | Suffix Structures | Suffix Array             | Sorted array of all suffixes. Build: O(n log n). |
| [ ]   | DP on Strings     | Longest Common Subsequence | DP state: dp[i][j]. Time: O(n*m).          |

Now, generate this detailed to-do list for the topic: **"${topic}"**.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();

    return { todoList: text };
  } catch (error) {
    console.error("Error generating to-do list in main process:", error);
    // Send a more structured error back to the renderer
    return { error: error.message || "Failed to communicate with the AI model from main process." };
  }
});

ipcMain.handle('generate-ai-study-plan', async (event, { topic, startDate, endDate, apiKey, model: modelName }) => { // Destructure apiKey and modelName
  const effectiveApiKey = apiKey || process.env.GEMINI_API_KEY;
  const effectiveModelName = modelName || "gemini-2.5-pro-preview-06-05"; // Fallback to default model

  if (!effectiveApiKey) {
    console.error("GEMINI_API_KEY is not set in settings or .env file for AI Plan.");
    return { error: "API Key is not configured for AI Plan. Please set it in Settings." };
  }
  if (!topic || !startDate || !endDate) {
    return { error: "Topic, start date, and end date are required for AI plan generation." };
  }

  try {
    console.log(`Main process received AI Plan Request: Topic: ${topic}, Start: ${startDate}, End: ${endDate} (Using Model: ${effectiveModelName})`);
    const genAI = new GoogleGenerativeAI(effectiveApiKey);
    const model = genAI.getGenerativeModel({
      model: effectiveModelName,
      generationConfig: {
        maxOutputTokens: 4096,
        // responseMimeType: "application/json", // Keep commented unless sure model supports it well
      },
    });

    // More detailed prompt for structured plan
    const prompt = `
Generate a study plan for the topic "${topic}" from ${startDate} to ${endDate}.
Break it down into daily tasks or focus areas. For each day, provide a concise task description.
The output MUST be a JSON array of objects. Each object in the array should represent a day in the plan and MUST have the following properties:
- "date": The date for the task in "YYYY-MM-DD" format.
- "taskDescription": A brief description of the task or focus for that day.
- "complexity": An estimated complexity, which can be "low", "medium", or "high".

Example for a 2-day plan:
[
  {
    "date": "YYYY-MM-DD", 
    "taskDescription": "Introduction to [Sub-topic 1 of ${topic}], cover basic concepts.",
    "complexity": "low"
  },
  {
    "date": "YYYY-MM-DD",
    "taskDescription": "Practice problems for [Sub-topic 1 of ${topic}], explore [Sub-topic 2 of ${topic}].",
    "complexity": "medium"
  }
]

Ensure every day within the range ${startDate} to ${endDate} (inclusive) has an entry if appropriate for the plan. If the topic can be covered in fewer days, only generate entries for those days.
Do not include any text before or after the JSON array.
The JSON should be well-formed and directly parsable.
Topic: "${topic}"
Start Date: ${startDate}
End Date: ${endDate}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = await response.text();

    // Attempt to parse the text as JSON
    try {
      // Clean the response: remove potential markdown backticks and "json" label
      text = text.replace(/^```json\s*|```$/g, '').trim();
      const planArray = JSON.parse(text);
      // Basic validation of the parsed structure
      if (Array.isArray(planArray) && planArray.every(item => item.date && item.taskDescription)) {
        return planArray; // Return the array of plan objects
      } else {
        console.error("AI response for plan was not a valid array of plan objects:", text);
        return { error: "AI response was not in the expected format (array of plan objects)." };
      }
    } catch (parseError) {
      console.error("Failed to parse AI plan response as JSON:", parseError);
      console.error("Raw AI response for plan:", text);
      return { error: `Failed to parse AI plan response. Raw response: ${text.substring(0, 200)}...` };
    }

  } catch (error) {
    console.error("Error generating AI study plan in main process:", error);
    return { error: error.message || "Failed to communicate with the AI model for plan generation." };
  }
});
