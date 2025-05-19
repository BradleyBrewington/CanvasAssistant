// popup.js - Handles the extension popup interface

class AssistantPopup {
    constructor() {
        this.initializePopup();
    }
    
    async initializePopup() {
        console.log('Initializing Canvas AI Assistant popup...');
        
        // Check if we're on a Canvas page
        await this.checkCanvasStatus();
        
        // Check if assistant is active
        await this.checkAssistantStatus();
        
        // Load saved settings
        await this.loadSettings();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Load status information
        await this.loadStatusInfo();
    }
    
    async checkCanvasStatus() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            const isCanvasPage = tab.url && (
                tab.url.includes('instructure.com') || 
                tab.url.includes('canvaslms.com') ||
                tab.url.includes('canvas.tamu.edu')
            );
            
            const statusElement = document.getElementById('canvas-status');
            if (isCanvasPage) {
                statusElement.textContent = '✅ Active';
                statusElement.className = 'status-indicator active';
            } else {
                statusElement.textContent = '❌ Not on Canvas';
                statusElement.className = 'status-indicator inactive';
                
                // Disable actions that require Canvas
                this.disableCanvasActions();
            }
            
        } catch (error) {
            console.error('Error checking Canvas status:', error);
            document.getElementById('canvas-status').textContent = '❓ Unknown';
        }
    }
    
    async checkAssistantStatus() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            // Try to communicate with the content script
            const response = await chrome.tabs.sendMessage(tab.id, { action: 'ping' });
            
            const statusElement = document.getElementById('assistant-status');
            if (response && response.status === 'active') {
                statusElement.textContent = '✅ Running';
                statusElement.className = 'status-indicator active';
            } else {
                statusElement.textContent = '❌ Not Active';
                statusElement.className = 'status-indicator inactive';
            }
            
        } catch (error) {
            // Content script probably not injected or not responding
            document.getElementById('assistant-status').textContent = '❌ Not Active';
            document.getElementById('assistant-status').className = 'status-indicator inactive';
        }
    }
    
    async loadSettings() {
        const settings = await this.getStoredSettings();
        
        document.getElementById('auto-refresh').checked = settings.autoRefresh ?? true;
        document.getElementById('show-notifications').checked = settings.showNotifications ?? true;
        document.getElementById('dark-mode').checked = settings.darkMode ?? false;
    }
    
    async getStoredSettings() {
        try {
            const result = await chrome.storage.local.get(['assistantSettings']);
            return result.assistantSettings || {};
        } catch (error) {
            console.error('Error loading settings:', error);
            return {};
        }
    }
    
    async saveSettings() {
        const settings = {
            autoRefresh: document.getElementById('auto-refresh').checked,
            showNotifications: document.getElementById('show-notifications').checked,
            darkMode: document.getElementById('dark-mode').checked
        };
        
        try {
            await chrome.storage.local.set({ assistantSettings: settings });
            console.log('Settings saved successfully');
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    }
    
    setupEventListeners() {
        // Refresh data button
        document.getElementById('refresh-data').addEventListener('click', () => {
            this.refreshData();
        });
        
        // Toggle assistant button
        document.getElementById('toggle-assistant').addEventListener('click', () => {
            this.toggleAssistant();
        });
        
        // Export data button
        document.getElementById('export-data').addEventListener('click', () => {
            this.exportData();
        });
        
        // Settings checkboxes
        const settingsCheckboxes = ['auto-refresh', 'show-notifications', 'dark-mode'];
        settingsCheckboxes.forEach(id => {
            document.getElementById(id).addEventListener('change', () => {
                this.saveSettings();
                if (id === 'dark-mode') {
                    this.applyDarkMode();
                }
            });
        });
        
        // Footer links
        document.getElementById('help-link').addEventListener('click', (e) => {
            e.preventDefault();
            chrome.tabs.create({ 
                url: 'https://github.com/yourusername/canvas-ai-assistant/wiki/help' 
            });
        });
        
        document.getElementById('feedback-link').addEventListener('click', (e) => {
            e.preventDefault();
            chrome.tabs.create({ 
                url: 'https://github.com/yourusername/canvas-ai-assistant/issues/new' 
            });
        });
    }
    
    async refreshData() {
        const button = document.getElementById('refresh-data');
        const originalText = button.innerHTML;
        
        try {
            button.innerHTML = '<span class="button-icon">⏳</span>Refreshing...';
            button.disabled = true;
            
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            await chrome.tabs.sendMessage(tab.id, { action: 'refresh-data' });
            
            // Refresh status after a moment
            setTimeout(() => {
                this.checkAssistantStatus();
                this.loadStatusInfo();
            }, 1000);
            
        } catch (error) {
            console.error('Error refreshing data:', error);
            alert('Could not refresh data. Make sure you\'re on a Canvas page and the assistant is active.');
       } finally {
           button.innerHTML = originalText;
           button.disabled = false;
       }
   }
   
   async toggleAssistant() {
       const button = document.getElementById('toggle-assistant');
       const originalText = button.innerHTML;
       
       try {
           button.innerHTML = '<span class="button-icon">⏳</span>Toggling...';
           button.disabled = true;
           
           const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
           await chrome.tabs.sendMessage(tab.id, { action: 'toggle-visibility' });
           
           // Update status after toggle
           setTimeout(() => {
               this.checkAssistantStatus();
           }, 500);
           
       } catch (error) {
           console.error('Error toggling assistant:', error);
           alert('Could not toggle assistant. Make sure you\'re on a Canvas page.');
       } finally {
           button.innerHTML = originalText;
           button.disabled = false;
       }
   }
   
   async exportData() {
       const button = document.getElementById('export-data');
       const originalText = button.innerHTML;
       
       try {
           button.innerHTML = '<span class="button-icon">⏳</span>Exporting...';
           button.disabled = true;
           
           const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
           const response = await chrome.tabs.sendMessage(tab.id, { action: 'export-data' });
           
           if (response && response.success) {
               // Data export was successful
               button.innerHTML = '<span class="button-icon">✅</span>Exported!';
               setTimeout(() => {
                   button.innerHTML = originalText;
               }, 2000);
           } else {
               throw new Error('Export failed');
           }
           
       } catch (error) {
           console.error('Error exporting data:', error);
           alert('Could not export data. Make sure you\'re on a Canvas page and the assistant is active.');
           button.innerHTML = originalText;
       } finally {
           button.disabled = false;
       }
   }
   
   async loadStatusInfo() {
       try {
           const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
           const response = await chrome.tabs.sendMessage(tab.id, { action: 'get-status' });
           
           if (response && response.data) {
               document.getElementById('last-updated').textContent = 
                   response.data.lastUpdated || 'Never';
               document.getElementById('data-points').textContent = 
                   response.data.totalDataPoints || '0';
           }
       } catch (error) {
           // Content script not available, leave defaults
           console.log('Could not load status info (normal if not on Canvas)');
       }
   }
   
   disableCanvasActions() {
       const canvasActions = ['refresh-data', 'toggle-assistant', 'export-data'];
       canvasActions.forEach(id => {
           const button = document.getElementById(id);
           button.disabled = true;
           button.title = 'Available only on Canvas pages';
       });
   }
   
   applyDarkMode() {
       const isDarkMode = document.getElementById('dark-mode').checked;
       if (isDarkMode) {
           document.body.classList.add('dark-mode');
       } else {
           document.body.classList.remove('dark-mode');
       }
   }
}

// Handle messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
   if (message.type === 'status-update') {
       // Update popup with new status information
       if (message.data.lastUpdated) {
           document.getElementById('last-updated').textContent = message.data.lastUpdated;
       }
       if (message.data.totalDataPoints !== undefined) {
           document.getElementById('data-points').textContent = message.data.totalDataPoints;
       }
   }
});

// Initialize the popup when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
   new AssistantPopup();
});