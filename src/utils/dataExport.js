export function exportData() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['skills', 'skillLevels'], result => {
            const exportData = {
                skills: result.skills || {},
                skillLevels: result.skillLevels || {},
                exportDate: new Date().toISOString()
            };

            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            chrome.downloads.download({
                url: url,
                filename: 'tech_skills_export.json',
                saveAs: true
            }, downloadId => {
                if (chrome.runtime.lastError) {
                    console.error('Export error:', chrome.runtime.lastError);
                    reject(chrome.runtime.lastError);
                } else {
                    console.log('Export successful, download ID:', downloadId);
                    resolve(downloadId);
                }
            });
        });
    });
}