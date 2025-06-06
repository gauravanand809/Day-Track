document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const topicSelect = document.getElementById('topic-select');
    const generateBtn = document.getElementById('generate-btn');
    const todoContainer = document.getElementById('todo-container');
    const downloadBtn = document.getElementById('download-btn');
    const loader = document.getElementById('loader');
    const pickForMeBtn = document.getElementById('pick-for-me-btn');
    const darkModeToggle = document.getElementById('dark-mode-toggle');

    const navLinks = document.querySelectorAll('.sidebar-nav .nav-link');
    const views = document.querySelectorAll('.view');
    
    const historySearchInput = document.getElementById('history-search');
    const clearHistoryBtn = document.getElementById('clear-history-btn');
    const historyListContainer = document.getElementById('history-list-container');
    const historyDetailContainer = document.getElementById('history-detail-container');
    const backToHistoryListBtn = document.getElementById('back-to-history-list-btn');
    const historyDetailTopic = document.getElementById('history-detail-topic');
    const historyDetailDate = document.getElementById('history-detail-date');
    const historyDetailContent = document.getElementById('history-detail-content');
    const historyDetailNotes = document.getElementById('history-detail-notes');
    const saveHistoryNoteBtn = document.getElementById('save-history-note-btn');

    const calendarGrid = document.getElementById('calendar-grid');
    const currentMonthYearDisplay = document.getElementById('current-month-year');
    const prevMonthBtn = document.getElementById('prev-month-btn');
    const nextMonthBtn = document.getElementById('next-month-btn');
    const todayBtn = document.getElementById('today-btn');
    const eventModal = document.getElementById('event-modal');
    const closeModalBtn = document.querySelector('.close-modal-btn');
    const saveEventBtn = document.getElementById('save-event-btn');
    const deleteEventBtn = document.getElementById('delete-event-btn');
    const eventModalTitle = document.getElementById('modal-title');
    const eventIdInput = document.getElementById('event-id');
    const eventDateInput = document.getElementById('event-date');
    const eventTitleInput = document.getElementById('event-title');
    const eventDescriptionInput = document.getElementById('event-description');
    const eventTagsInput = document.getElementById('event-tags');
    const eventCompletedCheckbox = document.getElementById('event-completed');
    
    const aiPlanTopicInput = document.getElementById('ai-plan-topic');
    const aiPlanStartDateInput = document.getElementById('ai-plan-start-date');
    const aiPlanEndDateInput = document.getElementById('ai-plan-end-date');
    const generateAiPlanBtn = document.getElementById('generate-ai-plan-btn');

    const topicOtherInput = document.getElementById('topic-other-input'); // For Generator view

    const sidebar = document.getElementById('sidebar');
    const toggleSidebarBtn = document.getElementById('toggle-sidebar-btn');

    // Settings View Elements
    const apiKeyInput = document.getElementById('api-key-input');
    const aiModelSelect = document.getElementById('ai-model-select');
    const aiModelOtherInput = document.getElementById('ai-model-other-input');
    const saveSettingsBtn = document.getElementById('save-settings-btn');
    const toastContainer = document.getElementById('toast-container');


    // --- App State ---
    let currentTopic = '';
    let todoContentRaw = ''; 
    let currentViewingHistoryItemId = null;
    let currentDate = new Date(); 
    const calendarEventsKey = 'customCalendarEvents';
    const appSettingsKey = 'appSettings';
    const defaultModel = 'gemini-2.5-pro-preview-06-05';

    // --- Toast Notification Logic ---
    function showToast(message, type = 'info', duration = 3000) {
        if (!toastContainer) { console.warn("Toast container not found"); return; }
        const toast = document.createElement('div');
        toast.classList.add('toast', type); 
        toast.textContent = message;
        toastContainer.appendChild(toast);
        setTimeout(() => { toast.classList.add('show'); }, 100);
        setTimeout(() => {
            toast.classList.remove('show');
            toast.addEventListener('transitionend', () => { if (toast.parentNode) { toast.remove(); } }, { once: true });
        }, duration);
    }

    // --- Dark Mode ---
    const applyDarkModePreference = () => {
        const isDarkMode = localStorage.getItem('darkMode') === 'true';
        document.body.classList.toggle('dark-mode', isDarkMode);
        if (darkModeToggle) darkModeToggle.textContent = isDarkMode ? '☀️' : '🌓';
    };
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', () => {
            localStorage.setItem('darkMode', document.body.classList.toggle('dark-mode'));
            applyDarkModePreference(); 
        });
    }
    applyDarkModePreference();

    // --- Collapsible Sidebar Logic ---
    const applySidebarState = () => {
        const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        if (sidebar) {
            sidebar.classList.toggle('collapsed', isCollapsed);
            if (toggleSidebarBtn) {
                toggleSidebarBtn.innerHTML = isCollapsed ? '>' : '<';
            }
        }
    };
    if (toggleSidebarBtn && sidebar) {
        toggleSidebarBtn.addEventListener('click', () => {
            const isCollapsed = sidebar.classList.toggle('collapsed');
            localStorage.setItem('sidebarCollapsed', isCollapsed);
            if (toggleSidebarBtn) {
                toggleSidebarBtn.innerHTML = isCollapsed ? '>' : '<';
            }
        });
    }
    applySidebarState();

    // --- Settings Management ---
    function getAppSettings() {
        const settingsString = localStorage.getItem(appSettingsKey);
        const defaultSettingsValues = { apiKey: '', aiModel: defaultModel };
        if (settingsString) {
            try {
                const parsedSettings = JSON.parse(settingsString);
                return { ...defaultSettingsValues, ...parsedSettings, aiModel: parsedSettings.aiModel || defaultModel };
            } catch (e) {
                console.error("Error parsing app settings from localStorage", e);
                return defaultSettingsValues;
            }
        }
        return defaultSettingsValues;
    }

    function saveAppSettings(settings) {
        localStorage.setItem(appSettingsKey, JSON.stringify(settings));
    }

    function loadSettingsIntoForm() {
        if (!apiKeyInput || !aiModelSelect || !aiModelOtherInput) {
            console.warn("Settings form elements not found for loading.");
            return;
        }
        const settings = getAppSettings();
        apiKeyInput.value = settings.apiKey || '';
        
        const savedModel = settings.aiModel || defaultModel;
        let modelIsPredefined = false;
        for (let i = 0; i < aiModelSelect.options.length; i++) {
            if (aiModelSelect.options[i].value === savedModel) {
                aiModelSelect.value = savedModel;
                modelIsPredefined = true;
                break;
            }
        }

        if (modelIsPredefined && aiModelSelect.value !== 'other') {
            aiModelOtherInput.style.display = 'none';
            aiModelOtherInput.value = '';
        } else { 
            aiModelSelect.value = 'other';
            aiModelOtherInput.value = (savedModel === 'other' && !settings.aiModel) ? '' : savedModel;
            aiModelOtherInput.style.display = 'block';
        }
    }

    if (aiModelSelect && aiModelOtherInput) {
        aiModelSelect.addEventListener('change', () => {
            if (aiModelSelect.value === 'other') {
                aiModelOtherInput.style.display = 'block';
            } else {
                aiModelOtherInput.style.display = 'none';
                aiModelOtherInput.value = ''; 
            }
        });
    }

    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', () => {
            if (!apiKeyInput || !aiModelSelect || !aiModelOtherInput) return;
            
            let finalModelName = aiModelSelect.value;
            if (aiModelSelect.value === 'other') {
                const customModelName = aiModelOtherInput.value.trim();
                if (!customModelName) {
                    showToast("Please enter a custom model name if 'Other' is selected.", 'error');
                    return;
                }
                finalModelName = customModelName;
            }

            const newSettings = {
                apiKey: apiKeyInput.value.trim(),
                aiModel: finalModelName
            };
            saveAppSettings(newSettings);
            showToast('Settings saved successfully!', 'success');
        });
    }
    
    // --- Custom Calendar Logic ---
    function getCustomCalendarEvents() { return JSON.parse(localStorage.getItem(calendarEventsKey)) || []; }
    function saveCustomCalendarEvents(events) { localStorage.setItem(calendarEventsKey, JSON.stringify(events)); }

    function renderCustomCalendar() {
        if (!calendarGrid || !currentMonthYearDisplay) { console.warn("Calendar elements not found for rendering."); return; }
        calendarGrid.innerHTML = '';
        const month = currentDate.getMonth();
        const year = currentDate.getFullYear();
        currentMonthYearDisplay.textContent = `${currentDate.toLocaleString('default', { month: 'long' })} ${year}`;
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const calendarEvents = getCustomCalendarEvents();
        for (let i = 0; i < firstDayOfMonth; i++) { const emptyCell = document.createElement('div'); emptyCell.classList.add('calendar-day', 'other-month'); calendarGrid.appendChild(emptyCell); }
        for (let day = 1; day <= daysInMonth; day++) {
            const dayCell = document.createElement('div'); dayCell.classList.add('calendar-day');
            const dayDate = new Date(year, month, day); const dateString = dayDate.toISOString().split('T')[0];
            if (day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear()) { dayCell.classList.add('today'); }
            dayCell.innerHTML = `<span class="day-number">${day}</span><div class="calendar-day-events"></div>`; dayCell.dataset.date = dateString;
            const dayEventsContainer = dayCell.querySelector('.calendar-day-events');
            calendarEvents.filter(event => event.date === dateString).forEach(event => {
                const eventDiv = document.createElement('div'); eventDiv.classList.add('calendar-event-item');
                if (event.isCompleted) eventDiv.classList.add('completed');
                if (event.type === 'ai-plan') eventDiv.classList.add('event-ai-plan'); else eventDiv.classList.add('event-manual');
                eventDiv.textContent = event.title; eventDiv.dataset.eventId = event.id;
                eventDiv.addEventListener('click', (e) => { e.stopPropagation(); openEventModal(event.id); });
                dayEventsContainer.appendChild(eventDiv);
            });
            dayCell.addEventListener('click', () => openEventModal(null, dateString)); calendarGrid.appendChild(dayCell);
        }
    }

    function openEventModal(eventId = null, dateString = null) {
        if (!eventModal || !eventIdInput || !deleteEventBtn || !eventModalTitle || !eventDateInput || !eventTitleInput || !eventDescriptionInput || !eventTagsInput || !eventCompletedCheckbox) { console.error("Event modal elements not found."); return; }
        eventModal.style.display = 'flex'; eventIdInput.value = eventId || '';
        deleteEventBtn.style.display = eventId ? 'inline-block' : 'none';
        eventModalTitle.textContent = eventId ? 'Edit Event' : 'Add Event';
        if (eventId) {
            const events = getCustomCalendarEvents(); const event = events.find(e => e.id === eventId);
            if (event) {
                eventDateInput.value = event.date; eventTitleInput.value = event.title;
                eventDescriptionInput.value = event.fullDescription || event.description || ''; 
                eventTagsInput.value = event.tags ? event.tags.join(', ') : '';
                eventCompletedCheckbox.checked = event.isCompleted || false;
            }
        } else {
            eventDateInput.value = dateString || new Date().toISOString().split('T')[0];
            eventTitleInput.value = ''; eventDescriptionInput.value = ''; eventTagsInput.value = ''; eventCompletedCheckbox.checked = false;
        }
    }

    function closeEventModal() { if (eventModal) eventModal.style.display = 'none'; }
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeEventModal);
    if (eventModal) eventModal.addEventListener('click', (e) => { if (e.target === eventModal) closeEventModal(); });

    if (saveEventBtn) {
        saveEventBtn.addEventListener('click', () => {
            const id = eventIdInput.value; const date = eventDateInput.value; const title = eventTitleInput.value.trim();
            const fullDesc = eventDescriptionInput.value.trim();
            if (!title || !date) { showToast('Event title and date are required.', 'error'); return; }
            let events = getCustomCalendarEvents();
            const eventData = {
                date: date, title: title, description: fullDesc, fullDescription: fullDesc,
                tags: eventTagsInput.value.split(',').map(tag => tag.trim()).filter(tag => tag),
                isCompleted: eventCompletedCheckbox.checked
            };
            if (id) {
                const index = events.findIndex(e => e.id === id);
                if (index > -1) { eventData.type = events[index].type || 'manual'; events[index] = { ...events[index], ...eventData };}
            } else { eventData.id = String(Date.now()); eventData.type = 'manual'; events.push(eventData); }
            saveCustomCalendarEvents(events); renderCustomCalendar(); closeEventModal();
            showToast(id ? 'Event updated!' : 'Event added!', 'success');
        });
    }
    if (deleteEventBtn) { deleteEventBtn.addEventListener('click', () => { const id = eventIdInput.value; if (!id) return; if (confirm('Are you sure you want to delete this event?')) { let events = getCustomCalendarEvents(); events = events.filter(e => e.id !== id); saveCustomCalendarEvents(events); renderCustomCalendar(); closeEventModal(); showToast('Event deleted.', 'info'); } }); }
    if (prevMonthBtn) prevMonthBtn.addEventListener('click', () => { currentDate.setMonth(currentDate.getMonth() - 1); renderCustomCalendar(); });
    if (nextMonthBtn) nextMonthBtn.addEventListener('click', () => { currentDate.setMonth(currentDate.getMonth() + 1); renderCustomCalendar(); });
    if (todayBtn) todayBtn.addEventListener('click', () => { currentDate = new Date(); renderCustomCalendar(); });
    
    // --- AI Plan Generation ---
    if (generateAiPlanBtn) {
        generateAiPlanBtn.addEventListener('click', async () => {
            const topic = aiPlanTopicInput.value.trim(); const startDate = aiPlanStartDateInput.value; const endDate = aiPlanEndDateInput.value;
            if (!topic || !startDate || !endDate) { showToast("Please provide a topic, start date, and end date for the AI plan.", 'error'); return; }
            if(loader) loader.style.display = 'block'; generateAiPlanBtn.disabled = true; generateAiPlanBtn.textContent = 'Processing...';
            console.log(`Requesting AI Plan: Topic: ${topic}, Start: ${startDate}, End: ${endDate}`);
            try {
                const appSettings = getAppSettings();
                const planData = await window.electronAPI.generateAiStudyPlan({ topic, startDate, endDate, apiKey: appSettings.apiKey, model: appSettings.aiModel });
                if (planData && planData.error) throw new Error(planData.error);
                if (planData && Array.isArray(planData) && planData.length > 0) {
                    let currentCalendarEvents = getCustomCalendarEvents(); const titleMaxLength = 30;
                    const newAiEvents = planData.map(p => {
                        let eventTitle = p.taskDescription; if (eventTitle.length > titleMaxLength) eventTitle = eventTitle.substring(0, titleMaxLength - 3) + "...";
                        return { id: String(Date.now() + Math.random().toString(36).substr(2, 9)), title: eventTitle, fullDescription: p.taskDescription, date: p.date, description: `Complexity: ${p.complexity || 'N/A'}. Task: ${p.taskDescription}`, isCompleted: false, tags: [topic.replace(/\s+/g, '-'), "AI-Plan"], type: 'ai-plan' };
                    });
                    currentCalendarEvents = currentCalendarEvents.concat(newAiEvents);
                    saveCustomCalendarEvents(currentCalendarEvents); renderCustomCalendar(); showToast("AI study plan generated and added to calendar!", 'success');
                } else showToast("AI did not return a valid plan, or the plan was empty.", 'info');
            } catch (error) { console.error("Error generating AI plan:", error); showToast(`Failed to generate AI plan: ${error.message}`, 'error'); } 
            finally { if(loader) loader.style.display = 'none'; generateAiPlanBtn.disabled = false; generateAiPlanBtn.textContent = 'Generate AI Plan'; }
        });
    }
    
    // --- View Switching ---
    function switchToView(viewId) {
        views.forEach(view => view.classList.toggle('active-view', view.id === viewId));
        navLinks.forEach(link => link.classList.toggle('active', link.dataset.view === viewId));
        if (viewId === 'history-view') { renderHistoryList(); if(historyDetailContainer) historyDetailContainer.style.display = 'none'; if(historyListContainer) historyListContainer.style.display = 'block'; }
        if (viewId === 'dashboard-view') renderDashboard();
        if (viewId === 'calendar-view') renderCustomCalendar();
        if (viewId === 'settings-view') loadSettingsIntoForm();
    }
    navLinks.forEach(link => { link.addEventListener('click', (e) => { e.preventDefault(); switchToView(link.dataset.view); }); });
    
    // --- Dashboard Rendering ---
    function renderDashboard() {
        console.log("Rendering dashboard...");
        const history = getHistory(); const topicCounts = {};
        history.forEach(item => { topicCounts[item.topic] = (topicCounts[item.topic] || 0) + 1; });
        const chartLabels = Object.keys(topicCounts); const chartDataValues = Object.values(topicCounts);
        const ctx = document.getElementById('myChart');
        if (ctx) {
            let existingChart = Chart.getChart(ctx); if (existingChart) existingChart.destroy();
            if (chartLabels.length === 0) { if (ctx.parentElement) ctx.parentElement.innerHTML = "<p style='text-align: center; padding: 20px;'>No data available to display charts. Generate some to-do lists first!</p>"; else console.log("No chart data, and canvas has no parent to display message in."); return; }
            try {
                new Chart(ctx, { type: 'bar', data: { labels: chartLabels, datasets: [{ label: 'Number of To-Do Lists Generated', data: chartDataValues, backgroundColor: 'rgba(221, 75, 57, 0.6)', borderColor: 'rgba(221, 75, 57, 1)', borderWidth: 1 }] }, options: { scales: { y: { beginAtZero: true, ticks: { stepSize: 1, color: document.body.classList.contains('dark-mode') ? 'rgba(224,224,224,0.8)' : 'rgba(32,32,32,0.8)' }, grid: { color: document.body.classList.contains('dark-mode') ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' } }, x: { ticks: { color: document.body.classList.contains('dark-mode') ? 'rgba(224,224,224,0.8)' : 'rgba(32,32,32,0.8)' }, grid: { color: document.body.classList.contains('dark-mode') ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' } } }, responsive: true, maintainAspectRatio: false, plugins: { legend: { display: true, position: 'top', labels: { color: document.body.classList.contains('dark-mode') ? 'rgba(224,224,224,0.9)' : 'rgba(32,32,32,0.9)' } }, title: { display: true, text: 'To-Do Lists Generated per Topic', color: document.body.classList.contains('dark-mode') ? 'rgba(224,224,224,1)' : 'rgba(32,32,32,1)', font: { size: 16 } } } } });
            } catch (e) { console.error("Chart.js error:", e); if (ctx.parentElement) ctx.parentElement.innerHTML = "<p style='text-align: center; padding: 20px;'>Chart could not be loaded.</p>"; }
        } else console.warn("myChart canvas not found.");
    }

    // --- History Management ---
    const getHistory = () => JSON.parse(localStorage.getItem('todoHistory')) || [];
    const saveHistory = (history) => localStorage.setItem('todoHistory', JSON.stringify(history));
    function addTopicToHistory(topic, content) { const history = getHistory(); const newEntry = { id: Date.now(), topic: topic, content: content, generatedAt: new Date().toISOString(), notes: '', itemStates: {} }; history.unshift(newEntry); saveHistory(history); }
    function renderHistoryList(searchTerm = '') { if (!historyListContainer) return; historyListContainer.innerHTML = ''; const history = getHistory(); const filteredHistory = history.filter(item => item.topic.toLowerCase().includes(searchTerm.toLowerCase())); if (filteredHistory.length === 0) { historyListContainer.innerHTML = '<p>No history found.</p>'; return; } filteredHistory.forEach(item => { const itemDiv = document.createElement('div'); itemDiv.classList.add('history-item'); itemDiv.dataset.historyId = item.id; itemDiv.innerHTML = `<div class="history-item-topic">${item.topic}</div><div class="history-item-date">${new Date(item.generatedAt).toLocaleString()}</div>`; itemDiv.addEventListener('click', () => viewHistoryDetail(item.id)); historyListContainer.appendChild(itemDiv); }); }
    function viewHistoryDetail(historyId) { const history = getHistory(); const item = history.find(h => h.id === historyId); if (!item) return; currentViewingHistoryItemId = historyId; historyDetailTopic.textContent = item.topic; historyDetailDate.textContent = `Generated: ${new Date(item.generatedAt).toLocaleString()}`; historyDetailContent.innerHTML = marked.parse(item.content); historyDetailNotes.value = item.notes || ''; const table = historyDetailContent.querySelector('table'); if (table) { const rows = table.querySelectorAll('tbody tr'); const currentHistoryItemStates = item.itemStates || {}; rows.forEach((row) => { const firstCell = row.cells[0]; const algorithmTopicCell = row.cells[2]; if (firstCell && algorithmTopicCell && firstCell.textContent.trim() === '[ ]') { const checkbox = document.createElement('input'); checkbox.type = 'checkbox'; const itemKey = algorithmTopicCell.textContent.trim(); checkbox.dataset.itemKey = itemKey; if (currentHistoryItemStates[itemKey]) checkbox.checked = true; checkbox.addEventListener('change', () => { currentHistoryItemStates[itemKey] = checkbox.checked; const allHistory = getHistory(); const historyItemIndex = allHistory.findIndex(h => h.id === historyId); if (historyItemIndex > -1) { allHistory[historyItemIndex].itemStates = currentHistoryItemStates; saveHistory(allHistory); } }); firstCell.innerHTML = ''; firstCell.appendChild(checkbox); } }); } historyListContainer.style.display = 'none'; historyDetailContainer.style.display = 'block'; }
    if (backToHistoryListBtn) backToHistoryListBtn.addEventListener('click', () => { historyDetailContainer.style.display = 'none'; historyListContainer.style.display = 'block'; currentViewingHistoryItemId = null; renderHistoryList(historySearchInput ? historySearchInput.value : ''); });
    if (saveHistoryNoteBtn) saveHistoryNoteBtn.addEventListener('click', () => { if (!currentViewingHistoryItemId) return; const history = getHistory(); const itemIndex = history.findIndex(h => h.id === currentViewingHistoryItemId); if (itemIndex > -1) { history[itemIndex].notes = historyDetailNotes.value; saveHistory(history); showToast('Note saved!', 'success'); } });
    if (historySearchInput) historySearchInput.addEventListener('input', (e) => renderHistoryList(e.target.value));
    if (clearHistoryBtn) clearHistoryBtn.addEventListener('click', () => { if (confirm('Are you sure you want to clear all history?')) { saveHistory([]); renderHistoryList(); historyDetailContainer.style.display = 'none'; historyListContainer.style.display = 'block'; showToast('All history cleared.', 'info'); } });
    
    // --- Helper functions for managing completed topics (for generator view) ---
    const getCompletedTopics = () => JSON.parse(localStorage.getItem('completedTopics')) || [];
    const saveCompletedTopics = (topics) => localStorage.setItem('completedTopics', JSON.stringify(topics));
    const updateTopicDisplay = () => { if (!topicSelect) return; const completedTopics = getCompletedTopics(); Array.from(topicSelect.options).forEach(option => { if (option.value) { const originalText = option.dataset.originalText || option.text.replace(" (Done)", ""); option.dataset.originalText = originalText; option.text = completedTopics.includes(option.value) ? `${originalText} (Done)` : originalText; } }); };
    const markTopicAsDone = (topicName) => { const completedTopics = getCompletedTopics(); if (!completedTopics.includes(topicName)) { completedTopics.push(topicName); saveCompletedTopics(completedTopics); updateTopicDisplay(); } };
    const markTopicAsNotDone = (topicName) => { let completedTopics = getCompletedTopics(); if (completedTopics.includes(topicName)) { completedTopics = completedTopics.filter(t => t !== topicName); saveCompletedTopics(completedTopics); updateTopicDisplay(); } };

    // --- Event Listeners for Generator View ---
    if (topicSelect && topicOtherInput) {
        topicSelect.addEventListener('change', () => {
            if (topicSelect.value === 'other-topic') {
                topicOtherInput.style.display = 'block';
            } else {
                topicOtherInput.style.display = 'none';
                topicOtherInput.value = ''; // Clear custom topic input
            }
        });
    }

     if (generateBtn) {
        generateBtn.addEventListener('click', async () => {
            if (topicSelect.value === 'other-topic') {
                currentTopic = topicOtherInput.value.trim();
                if (!currentTopic) {
                    showToast('Please enter a custom topic if "Other" is selected.', 'error');
                    return;
                }
            } else {
                currentTopic = topicSelect.value;
            }
            
            if (!currentTopic && topicSelect.value !== 'other-topic') { // Check if a predefined topic is selected if not 'other'
                showToast('Please select a topic or enter a custom one.', 'error');
                return;
            }
            if (!currentTopic && topicSelect.value === 'other-topic' && !topicOtherInput.value.trim()){ // Specifically for other topic being empty
                 showToast('Please enter a custom topic if "Other" is selected.', 'error');
                return;
            }


            if(loader) loader.style.display = 'block';
            generateBtn.disabled = true;
            generateBtn.textContent = 'Processing...';
            try {
                const appSettings = getAppSettings();
                const data = await window.electronAPI.generateTodo({
                    topic: currentTopic, 
                    apiKey: appSettings.apiKey, 
                    model: appSettings.aiModel 
                }); 
                if (data.error) throw new Error(data.error);
                todoContentRaw = data.todoList;
                addTopicToHistory(currentTopic, todoContentRaw); 
                if(todoContainer) todoContainer.innerHTML = marked.parse(todoContentRaw);
                const table = todoContainer ? todoContainer.querySelector('table') : null;
                if (table) {
                    const rows = table.querySelectorAll('tbody tr');
                    const itemStates = JSON.parse(localStorage.getItem(`todo-${currentTopic}`)) || {};
                    rows.forEach((row) => {
                        const firstCell = row.cells[0];
                        const algorithmTopicCell = row.cells[2];
                        if (firstCell && algorithmTopicCell && firstCell.textContent.trim() === '[ ]') {
                            const checkbox = document.createElement('input');
                            checkbox.type = 'checkbox';
                            const itemKey = algorithmTopicCell.textContent.trim(); 
                            checkbox.dataset.itemKey = itemKey;
                            if (itemStates[itemKey]) checkbox.checked = true;
                            checkbox.addEventListener('change', () => {
                                itemStates[itemKey] = checkbox.checked;
                                localStorage.setItem(`todo-${currentTopic}`, JSON.stringify(itemStates));
                                let currentAllChecked = true;
                                table.querySelectorAll('tbody tr input[type="checkbox"]').forEach(cb => { if (!cb.checked) currentAllChecked = false; });
                                if (currentAllChecked) markTopicAsDone(currentTopic); else markTopicAsNotDone(currentTopic);
                            });
                            firstCell.innerHTML = '';
                            firstCell.appendChild(checkbox);
                        } 
                    });
                    const allCheckboxes = table.querySelectorAll('tbody tr input[type="checkbox"]');
                    if (allCheckboxes.length > 0) { let allCurrentlyChecked = true; allCheckboxes.forEach(cb => { if (!cb.checked) allCurrentlyChecked = false; }); if (allCurrentlyChecked) markTopicAsDone(currentTopic); else if (getCompletedTopics().includes(currentTopic)) { let finalCheck = true; allCheckboxes.forEach(cb => { if (!cb.checked) finalCheck = false; }); if (!finalCheck) markTopicAsNotDone(currentTopic); }
                    } else if (rows.length > 0) markTopicAsNotDone(currentTopic);
                }
                if(downloadBtn) downloadBtn.style.display = 'block';
            } catch (error) { console.error('Error:', error); if(todoContainer) todoContainer.innerHTML = `<p style="color:red; text-align:center;">Error: ${error.message}</p>`; showToast(`Error generating to-do: ${error.message}`, 'error');} 
            finally { 
                if(loader) loader.style.display = 'none';
                generateBtn.disabled = false;
                generateBtn.textContent = 'Generate';
            }
        });
    }
    if (downloadBtn) { downloadBtn.addEventListener('click', () => { if (!todoContentRaw) { showToast('No todo list content to download.', 'error'); return; } const today = new Date(); const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`; const filename = `${dateStr}_${currentTopic.replace(/\s+/g, '_')}.txt`; const blob = new Blob([todoContentRaw], { type: 'text/plain;charset=utf-8' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = filename; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url); }); }
    if (pickForMeBtn) { pickForMeBtn.addEventListener('click', () => { const completedTopics = getCompletedTopics(); const availableOptions = Array.from(topicSelect.options).filter(option => option.value && !completedTopics.includes(option.value)).map(option => option.value); if (availableOptions.length === 0) { showToast('All topics are marked as done, or no topics available to pick.', 'info'); return; } const randomIndex = Math.floor(Math.random() * availableOptions.length); topicSelect.value = availableOptions[randomIndex]; }); }
    
    // Final initial calls
    updateTopicDisplay(); 
    switchToView('generator-view'); 
});
