// Function to check if tracking is allowed for a given URL
export function isTrackingAllowed(url) {
    return new Promise((resolve, reject) => {
        if (!url || typeof url !== 'string') {
            reject(new Error('Invalid URL'));
            return;
        }

        chrome.storage.local.get(['privacySettings'], result => {
            if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message));
                return;
            }

            const settings = result.privacySettings || { globalTracking: true, blockedSites: [] };

            if (!settings.globalTracking) {
                resolve(false);
                return;
            }

            try {
                const hostname = new URL(url).hostname;
                const isBlocked = settings.blockedSites.some(blockedSite => hostname.includes(blockedSite));
                resolve(!isBlocked);
            } catch (error) {
                reject(new Error('Invalid URL format'));
            }
        });
    });
}

// Function to update privacy settings
export function updatePrivacySettings(settings) {
    return new Promise((resolve, reject) => {
        if (!settings || typeof settings !== 'object') {
            reject(new Error('Invalid settings object'));
            return;
        }

        chrome.storage.local.set({ privacySettings: settings }, () => {
            if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message));
            } else {
                resolve();
            }
        });
    });
}

// Function to get current privacy settings
export function getPrivacySettings() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['privacySettings'], result => {
            if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message));
            } else {
                resolve(result.privacySettings || { globalTracking: true, blockedSites: [] });
            }
        });
    });
}