// background.js - Handles background processing and coordination

class AssistantBackground {
    constructor() {
        this.setupEventListeners();
        this.initializeBackground();
    }
    
    setupEventListeners() {
        // Listen for installation/update events
        chrome.runtime.onInstalled.addListener((details) => {
            this.handleInstallation(details);
        });
        
        // Listen for messages from content scripts and popup
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            this.handleMessage(message, sender, sendResponse);
            return true; // Keep the message channel open for async responses
        });
        
        // Listen for tab updates to detect Canvas navigation
        chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
            this.handleTabUpdate(tabId, changeInfo, tab);
        });
        
        // Listen for browser action clicks (extension icon)
        chrome.action.onClicked.addListener((tab) => {
            this.handleActionClick(tab);
        });
    }
    
    async initializeBackground() {
        console.log('Canvas AI Assistant background script initialized');
        
        // Initialize default settings if they don't exist
        await this.initializeDefaultSettings();
        
        // Set up periodic tasks
        this.setupPeriodicTasks();
    }
    
    async handleInstallation(details) {
        if (details.reason === 'install') {
            console.log('Canvas AI Assistant installed for the first time');
            
            // Open welcome/setup page
            chrome.tabs.create({
                url: chrome.runtime.getURL('welcome.html')
            });
            
            // Initialize first-time settings
            await this.initializeDefaultSettings();
            
        } else if (details.reason === 'update') {
            console.log('Canvas AI Assistant updated');
            
            // Handle any migration logic for updates
            await this.handleUpdate(details);
        }
    }
    
    async initializeDefaultSettings() {
        const existingSettings = await chrome.storage.local.get(['assistantSettings']);
        
        if (!existingSettings.assistantSettings) {
            const defaultSettings = {
                autoRefresh: true,
                showNotifications: true,
                darkMode: false,
                extractionDepth: 'comprehensive', // basic, standard, comprehensive
                notificationTiming: 'smart', // immediate, smart, scheduled
                dataRetention: 30, // days
                aiAnalysis: true,
                calendarSync: false
            };
            
            await chrome.storage.local.set({ assistantSettings: defaultSettings });
            console.log('Default settings initialized');
        }
    }
    
    async handleMessage(message, sender, sendResponse) {
        try {
            switch (message.action) {
                case 'ping':
                    sendResponse({ status: 'background-active' });
                    break;
                    
                case 'save-extracted-data':
                    await this.saveExtractedData(message.data, sender.tab.id);
                    sendResponse({ success: true });
                    break;
                    
                case 'get-stored-data':
                    const storedData = await this.getStoredData(sender.tab.id);
                    sendResponse({ data: storedData });
                    break;
                    
                case 'schedule-notification':
                    await this.scheduleNotification(message.notification);
                    sendResponse({ success: true });
                    break;
                    
                case 'sync-to-calendar':
                    const syncResult = await this.syncToGoogleCalendar(message.data);
                    sendResponse({ success: syncResult.success, error: syncResult.error });
                    break;
                    
                case 'analyze-content':
                    const analysisResult = await this.performAIAnalysis(message.content);
                    sendResponse({ analysis: analysisResult });
                    break;
                    
                default:
                    console.warn('Unknown message action:', message.action);
                    sendResponse({ error: 'Unknown action' });
            }
        } catch (error) {
            console.error('Error handling message:', error);
            sendResponse({ error: error.message });
        }
    }
    
    handleTabUpdate(tabId, changeInfo, tab) {
        // Check if this is a Canvas page
        if (changeInfo.status === 'complete' && tab.url) {
            const isCanvasPage = tab.url.includes('instructure.com') || tab.url.includes('canvaslms.com');
            
            if (isCanvasPage) {
                // Canvas page loaded, check if we should auto-inject or refresh
                this.handleCanvasPageLoad(tabId, tab);
            }
        }
    }
    
    async handleCanvasPageLoad(tabId, tab) {
        const settings = await this.getSettings();
        
        if (settings.autoRefresh) {
            // Send message to content script to refresh data
            try {
                await chrome.tabs.sendMessage(tabId, { action: 'auto-refresh' });
            } catch (error) {
                // Content script might not be ready yet, that's okay
                console.log('Content script not ready for auto-refresh');
            }
        }
    }
    
    handleActionClick(tab) {
        // This is called when user clicks the extension icon
        // Since we have a popup, this won't typically be called
        // But it's here for fallback scenarios
        
        const isCanvasPage = tab.url && (
            tab.url.includes('instructure.com') || 
            tab.url.includes('canvaslms.com')
        );
        
        if (!isCanvasPage) {
            // Not on Canvas, open a help page
            chrome.tabs.create({
                url: 'https://github.com/yourusername/canvas-ai-assistant/wiki/usage'
            });
        }
    }
    
    async saveExtractedData(data, tabId) {
        // Save the extracted data with timestamp and tab info
        const timestamp = new Date().toISOString();
        const storageKey = `extracted-data-${tabId}`;
        
        const dataToStore = {
            timestamp: timestamp,
            tabId: tabId,
            url: data.url || 'unknown',
            extractedData: data,
            version: '1.0.0'
        };
        
        await chrome.storage.local.set({ [storageKey]: dataToStore });
        
        // Also update the global summary
        await this.updateDataSummary(data);
        
        console.log('Extracted data saved for tab', tabId);
    }
    
    async getStoredData(tabId) {
        const storageKey = `extracted-data-${tabId}`;
        const result = await chrome.storage.local.get([storageKey]);
        return result[storageKey] || null;
    }
    
    async updateDataSummary(newData) {
        // Maintain a summary of all extracted data across tabs
        const summary = await chrome.storage.local.get(['dataSummary']) || {};
        const currentSummary = summary.dataSummary || {
            totalCourses: 0,
            totalAssignments: 0,
            totalAnnouncements: 0,
            lastUpdated: null,
            coursesById: {}
        };
        
        // Update summary with new data
        if (newData.courses) {
            newData.courses.forEach(course => {
                currentSummary.coursesById[course.id] = course;
            });
            currentSummary.totalCourses = Object.keys(currentSummary.coursesById).length;
        }
        
        if (newData.assignments) {
            currentSummary.totalAssignments = Math.max(
                currentSummary.totalAssignments, 
                newData.assignments.length
            );
        }
        
        if (newData.announcements) {
            currentSummary.totalAnnouncements = Math.max(
                currentSummary.totalAnnouncements,
                newData.announcements.length
            );
        }
        
        currentSummary.lastUpdated = new Date().toISOString();
        
        await chrome.storage.local.set({ dataSummary: currentSummary });
    }
    
    async scheduleNotification(notificationData) {
        // Schedule notifications for upcoming deadlines
        const settings = await this.getSettings();
        
        if (!settings.showNotifications) {
            return;
        }
        
        // Calculate when to show the notification
        let notificationTime;
        const dueDate = new Date(notificationData.dueDate);
        const now = new Date();
        
        switch (settings.notificationTiming) {
            case 'immediate':
                notificationTime = now;
                break;
            case 'smart':
                // Show 24 hours before for assignments, 1 week for exams
                const hoursBeforeNotice = notificationData.type === 'exam' ? 168 : 24;
                notificationTime = new Date(dueDate.getTime() - (hoursBeforeNotice * 60 * 60 * 1000));
                break;
            case 'scheduled':
                // Show at a specific time each day (e.g., 9 AM)
                notificationTime = new Date();
                notificationTime.setHours(9, 0, 0, 0);
                if (notificationTime <= now) {
                    notificationTime.setDate(notificationTime.getDate() + 1);
                }
                break;
        }
        
        // Only schedule if the notification time is in the future
        if (notificationTime > now) {
            const alarmName = `deadline-${notificationData.id || Date.now()}`;
            
            chrome.alarms.create(alarmName, {
                when: notificationTime.getTime()
            });
            
            // Store notification data for when alarm fires
            await chrome.storage.local.set({
                [`notification-${alarmName}`]: notificationData
            });
        }
    }
    
    async performAIAnalysis(content) {
        // Placeholder for future AI analysis integration
        // This would integrate with services like OpenAI, Google's Gemini, etc.
        
        const settings = await this.getSettings();
        
        if (!settings.aiAnalysis) {
            return { analyzed: false, reason: 'AI analysis disabled' };
        }
        
        // For now, return a simple pattern-based analysis
        const datePatterns = [
            /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?:st|nd|rd|th)?\b/gi,
            /\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/g,
            /\b(?:due|deadline|submit|turn in)\s+(?:by|on|before)?\s*\w+/gi
        ];
        
        const foundPatterns = [];
        
        datePatterns.forEach((pattern, index) => {
            const matches = content.match(pattern);
            if (matches) {
                foundPatterns.push({
                    type: ['month-day', 'numeric-date', 'deadline-keyword'][index],
                    count: matches.length,
                    examples: matches.slice(0, 3) // First 3 examples
                });
            }
        });
        
        return {
            analyzed: true,
            timestamp: new Date().toISOString(),
            patterns: foundPatterns,
            confidence: foundPatterns.length > 0 ? 'medium' : 'low'
        };
    }
    
    async syncToGoogleCalendar(assignmentData) {
        // Placeholder for Google Calendar integration
        // This would require OAuth setup and Google Calendar API integration
        
        const settings = await this.getSettings();
        
        if (!settings.calendarSync) {
            return { success: false, error: 'Calendar sync disabled' };
        }
        
        // For now, return a success message
        // In a real implementation, this would:
        // 1. Check for valid Google OAuth tokens
        // 2. Format assignment data as calendar events
        // 3. Make API calls to Google Calendar
        // 4. Handle errors and token refresh
        
        console.log('Calendar sync requested for:', assignmentData);
        
        return { 
            success: true, 
            message: 'Calendar sync feature coming soon!',
            eventsCreated: 0
        };
    }
    
    setupPeriodicTasks() {
        // Set up alarm for daily cleanup and maintenance
        chrome.alarms.create('daily-maintenance', {
            delayInMinutes: 1, // First run in 1 minute
            periodInMinutes: 24 * 60 // Then every 24 hours
        });
        
        // Listen for alarms
        chrome.alarms.onAlarm.addListener((alarm) => {
            this.handleAlarm(alarm);
        });
    }
    
    async handleAlarm(alarm) {
        switch (alarm.name) {
            case 'daily-maintenance':
                await this.performDailyMaintenance();
                break;
            default:
                if (alarm.name.startsWith('deadline-')) {
                    await this.handleDeadlineNotification(alarm.name);
                }
        }
    }
    
    async performDailyMaintenance() {
        console.log('Performing daily maintenance...');
        
        const settings = await this.getSettings();
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - settings.dataRetention);
        
        // Clean up old stored data
        const allItems = await chrome.storage.local.get(null);
        const keysToRemove = [];
        
        Object.keys(allItems).forEach(key => {
            if (key.startsWith('extracted-data-') || key.startsWith('notification-')) {
                const item = allItems[key];
                if (item.timestamp && new Date(item.timestamp) < cutoffDate) {
                    keysToRemove.push(key);
                }
            }
        });
        
        if (keysToRemove.length > 0) {
            await chrome.storage.local.remove(keysToRemove);
            console.log(`Cleaned up ${keysToRemove.length} old data items`);
        }
    }
    
    async handleDeadlineNotification(alarmName) {
        // Handle deadline notification when alarm fires
        const notificationData = await chrome.storage.local.get([`notification-${alarmName}`]);
        const data = notificationData[`notification-${alarmName}`];
        
        if (data) {
            // Show the notification
            chrome.notifications.create({
                type: 'basic',
                iconUrl: 'icons/icon48.png',
                title: 'Canvas Assignment Due Soon!',
                message: `${data.name} is due ${data.dueDate}`,
                buttons: [
                    { title: 'Open Canvas' },
                    { title: 'Dismiss' }
                ]
            });
            
            // Clean up the stored notification data
            await chrome.storage.local.remove([`notification-${alarmName}`]);
        }
    }
    
    async getSettings() {
        const result = await chrome.storage.local.get(['assistantSettings']);
        return result.assistantSettings || {};
    }
    
    async handleUpdate(details) {
        // Handle extension updates
        const previousVersion = details.previousVersion;
        const currentVersion = chrome.runtime.getManifest().version;
        
        console.log(`Updated from ${previousVersion} to ${currentVersion}`);
        
        // Add any version-specific migration logic here
        // For example:
        // if (previousVersion === '0.9.0' && currentVersion === '1.0.0') {
        //     await this.migrateSettingsFormat();
        // }
    }
}

// Initialize the background script
new AssistantBackground();