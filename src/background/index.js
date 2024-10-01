import { identifySkills, updateSkillLevels } from '../utils/skillTracker';
import { exportData } from '../utils/dataExport';
import { isTrackingAllowed } from '../utils/privacySettings';

let userActivity = {};

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        console.log('Tab updated:', tab.url);
        isTrackingAllowed(tab.url).then(allowed => {
            console.log('Tracking allowed:', allowed);
            if (allowed) {
                trackPageVisit(tab.url, tabId);
            }
        });
    }
});

chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
    console.log('Tab removed:', tabId);
    if (userActivity[tabId]) {
        const timeSpent = Date.now() - userActivity[tabId].startTime;
        console.log('Time spent on tab:', timeSpent);
        processPageData(userActivity[tabId].url, timeSpent, userActivity[tabId].content);
        delete userActivity[tabId];
    }
});

function trackPageVisit(url, tabId) {
    console.log('Tracking page visit:', url);
    userActivity[tabId] = {
        url: url,
        startTime: Date.now(),
        content: '',
        lastActiveTime: Date.now()
    };

    chrome.tabs.sendMessage(tabId, { action: "getPageContent" }, response => {
        if (chrome.runtime.lastError) {
            console.error('Error sending message:', chrome.runtime.lastError);
            return;
        }
        console.log('Received page content:', response ? 'yes' : 'no');
        if (response && response.content) {
            userActivity[tabId].content = response.content;
        }
    });
}

function processPageData(url, timeSpent, content) {
    console.log('Processing page data:', url);
    try {
        const skills = identifySkills(content);
        console.log('Identified skills:', skills);

        updateSkillLevels(skills, timeSpent, content).then(() => {
            console.log('Skills updated successfully');
        }).catch(error => {
            console.error('Error updating skills:', error);
        });
    } catch (error) {
        console.error('Error processing page data:', error);
    }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "trackInteraction") {
        const tabId = sender.tab.id;
        if (userActivity[tabId]) {
            const currentTime = Date.now();
            const timeSinceLastActivity = currentTime - userActivity[tabId].lastActiveTime;
            userActivity[tabId].lastActiveTime = currentTime;

            if (timeSinceLastActivity < 5 * 60 * 1000) {
                processPageData(userActivity[tabId].url, timeSinceLastActivity, userActivity[tabId].content);
            }
        }
    } else if (request.action === "getSkills") {
        chrome.storage.local.get(['skills', 'skillLevels'], result => {
            console.log('Sending skills to popup:', result.skills);
            console.log('Sending skill levels to popup:', result.skillLevels);
            sendResponse({ skills: result.skills || {}, skillLevels: result.skillLevels || {} });
        });
        return true;  // Will respond asynchronously
    }
});

chrome.alarms.create('dataExport', { periodInMinutes: 1440 });

chrome.alarms.onAlarm.addListener(alarm => {
    if (alarm.name === 'dataExport') {
        exportData();
    }
});

console.log('Background script loaded');