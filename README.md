# Day-Planner

An AI-powered desktop application for generating detailed to-do lists and study plans, with calendar integration, history tracking, and user-configurable settings. Built with Electron.

<!-- 
## Screenshot (Placeholder)
![App Screenshot](placeholder.png) 
(Replace placeholder.png with an actual screenshot of the application)
-->

## Features

*   **AI-Powered To-Do List Generation:** Generate comprehensive, Markdown-formatted to-do lists for various technical topics using the Google Gemini API.
*   **Customizable Topic Input:** Select from a predefined list of topics or enter a custom topic for to-do list generation.
*   **History Tracking:**
    *   Automatically saves all generated to-do lists.
    *   View past to-do lists.
    *   Add and save personal notes to each historical entry.
    *   Interactive checkboxes within historical to-do lists with persistent state (your progress is saved).
    *   Search functionality for history.
    *   Option to clear all history.
*   **Dashboard:**
    *   Visualizes "To-Do Lists Generated per Topic" using a bar chart.
    *   Adapts to light/dark mode.
*   **Custom Calendar & AI Study Planner:**
    *   Full monthly calendar view with navigation (previous/next month, today).
    *   Manually add, edit, and delete personal events/tasks on the calendar with persistence.
    *   **AI-Driven Study Plan Generation:** Input a main topic/goal and a date range to have the AI generate a structured study plan, which is then automatically added to your calendar.
    *   Distinct coloring for manually added events (blueish) and AI-generated plan events (yellowish).
    *   Truncated event titles on the calendar grid for better readability, with full details in the event modal.
*   **Modern User Interface:**
    *   Todoist-inspired design.
    *   Collapsible sidebar for navigation (defaults to expanded, state is saved).
    *   Responsive layout.
*   **Themes:** Light and Dark mode support, with user preference saved.
*   **User Settings:**
    *   Configure your Google Gemini API Key.
    *   Select the AI model for generation (from a predefined list or specify a custom model name).
    *   Settings are saved locally.
*   **User Feedback:** Non-intrusive toast notifications for actions and errors.
*   **Cross-Platform Potential:** Built with Electron, enabling packaging for Linux, Windows, and macOS (currently configured for Linux .deb).

## Tech Stack

*   **Electron:** For building the cross-platform desktop application.
*   **Frontend:** HTML, CSS, Vanilla JavaScript.
*   **Node.js:** For the Electron main process.
*   **AI Integration:** Google Gemini API (via `@google/generative-ai` npm package).
*   **Charting:** Chart.js (for the dashboard).
*   **Markdown Parsing:** Marked.js.

## Prerequisites (for Development)

*   [Node.js](https://nodejs.org/) (which includes npm). It's recommended to use a recent LTS version.
*   A Google Gemini API Key. You can obtain one from [Google AI Studio](https://aistudio.google.com/app/apikey).

## Setup and Installation (for Development)

1.  **Clone the repository (or download the source code):**
    ```bash
    # If using Git
    git clone <repository-url>
    cd day-planner 
    # Or simply navigate to the project directory if you downloaded the source
    ```

2.  **Install dependencies:**
    Open a terminal in the project root directory (`day-planner`) and run:
    ```bash
    npm install
    ```

3.  **Configure API Key:**
    *   **Option 1 (Recommended for Development):** Create a file named `.env` in the project root directory (`day-planner/`). Add your Gemini API key to this file:
        ```
        GEMINI_API_KEY=YOUR_ACTUAL_API_KEY_HERE
        ```
    *   **Option 2 (In-App Settings):** Alternatively, you can run the app once and set the API key via the "Settings" view within the application. The app will prioritize the key set in the Settings view.

## Running the Application (for Development)

To run the application in development mode:
```bash
npm start
```
This will launch the Electron application window.

## Building the Application (for Distribution)

To build distributable packages (currently configured for Linux `.deb`):
```bash
npm run dist
```
The packaged application will be found in the `dist/` directory. For example, `dist/day-planner_1.0.0_amd64.deb`.

You can install the `.deb` package on Debian-based systems (like Ubuntu) using:
```bash
sudo dpkg -i dist/day-planner_1.0.0_amd64.deb
# If there are dependency issues, run:
sudo apt-get install -f
```

## Using the Application

*   **Sidebar:** Use the sidebar on the left to navigate between different views: Generator, History, Dashboard, Calendar/Plan, and Settings. The sidebar can be collapsed/expanded using the toggle button at the bottom.
*   **Generator:**
    *   Select a predefined topic from the dropdown or choose "Other (Specify below)" to enter a custom topic.
    *   Click "Generate" to get an AI-generated to-do list.
    *   Use "Pick for Me" to have a random, non-completed topic selected.
    *   Download the generated list as a text file.
*   **History:**
    *   View all previously generated to-do lists.
    *   Search history by topic.
    *   Click on an item to view its details, add/edit notes, and interact with its checkboxes (progress is saved).
    *   Clear all history if needed.
*   **Dashboard:**
    *   View a chart showing the number of to-do lists generated for each topic.
*   **Calendar/Plan:**
    *   View a monthly calendar. Navigate with "Prev," "Next," and "Today" buttons.
    *   Click on a day to add a manual event. Click an existing event to edit or delete it.
    *   Use the "AI Study Plan Generator" section: enter a main topic, start date, and end date, then click "Generate AI Plan." The AI will create a structured plan and add it to your calendar.
*   **Settings:**
    *   Enter your Google Gemini API Key.
    *   Select your preferred AI model from the dropdown or specify a custom one if "Other" is selected.
    *   Click "Save Settings." These settings will be used for all AI interactions.
*   **Dark Mode:** Toggle between light and dark themes using the 🌓/☀️ button in the sidebar header.

## License

This project is licensed under the ISC License. See the `LICENSE` file (if one exists) or `package.json` for more details.

## Author

Gaurav Anand
gauravanand809@gmailcom
