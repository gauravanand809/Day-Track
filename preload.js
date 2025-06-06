const { contextBridge, ipcRenderer } = require('electron');

// Expose a controlled API to the renderer process (app.js)
contextBridge.exposeInMainWorld('electronAPI', {
  // This function will be callable from app.js as window.electronAPI.generateTodo()
  generateTodo: (topic) => ipcRenderer.invoke('generate-todo', topic),
  // New function for AI study plan
  generateAiStudyPlan: (planDetails) => ipcRenderer.invoke('generate-ai-study-plan', planDetails)
});

console.log('Preload script loaded.');
