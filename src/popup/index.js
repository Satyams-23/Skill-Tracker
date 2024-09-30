import { exportData } from '../utils/dataExport';

document.addEventListener('DOMContentLoaded', () => {
    chrome.runtime.sendMessage({ action: "getSkills" }, response => {
        const skillsList = document.getElementById('skills-list');
        if (response && response.skills && response.skillLevels) {
            const skillsHTML = Object.entries(response.skills)
                .map(([skill, data]) => {
                    const level = response.skillLevels[skill] ? response.skillLevels[skill].level : 1;
                    return `
            <div class="skill-item">
              <span class="skill-name">${skill}</span>
              <span class="skill-level">Level: ${level}</span>
              <span class="skill-time">Time: ${Math.round(data.timeSpent / 60)} min</span>
              <span class="skill-frequency">Visits: ${data.frequency}</span>
            </div>
          `;
                })
                .join('');
            skillsList.innerHTML = skillsHTML || "<p>No skills tracked yet. Visit some tech websites!</p>";
        } else {
            skillsList.innerHTML = "<p>No skills tracked yet. Visit some tech websites!</p>";
        }
    });

    const exportButton = document.getElementById('export-btn');
    if (exportButton) {
        exportButton.addEventListener('click', () => {
            exportData().then(() => {
                console.log('Data exported successfully');
                alert('Data exported successfully!');
            }).catch(error => {
                console.error('Error exporting data:', error);
                alert('Error exporting data. Please try again.');
            });
        });
    }
});