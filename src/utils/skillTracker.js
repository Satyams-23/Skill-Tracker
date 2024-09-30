const skillsList = [
    'JavaScript', 'Python', 'Java', 'C++', 'HTML', 'CSS', 'React', 'Angular', 'Vue',
    'Node.js', 'Express', 'Django', 'Flask', 'Spring', 'Docker', 'Kubernetes',
    'AWS', 'Azure', 'GCP', 'Git', 'SQL', 'MongoDB', 'Redis', 'GraphQL', 'REST API'
];

export function identifySkills(content) {
    const identifiedSkills = skillsList.filter(skill =>
        new RegExp(`\\b${skill}\\b`, 'i').test(content)
    );
    console.log('Identified skills:', identifiedSkills);
    return identifiedSkills;
}

export function updateSkillLevels(skills, timeSpent, content) {
    return new Promise((resolve) => {
        chrome.storage.local.get(['skillLevels', 'skills'], result => {
            const skillLevels = result.skillLevels || {};
            const updatedSkills = result.skills || {};

            skills.forEach(skill => {
                if (!skillLevels[skill]) {
                    skillLevels[skill] = { level: 1, experience: 0 };
                }
                if (!updatedSkills[skill]) {
                    updatedSkills[skill] = { timeSpent: 0, frequency: 0 };
                }

                const relevance = calculateRelevance(skill, content);
                const experienceGain = timeSpent * relevance;

                skillLevels[skill].experience += experienceGain;
                skillLevels[skill].level = calculateLevel(skillLevels[skill].experience);

                updatedSkills[skill].timeSpent += timeSpent;
                updatedSkills[skill].frequency += 1;
            });

            chrome.storage.local.set({ skillLevels, skills: updatedSkills }, () => {
                console.log('Updated skill levels:', skillLevels);
                console.log('Updated skills:', updatedSkills);
                resolve();
            });
        });
    });
}

function calculateRelevance(skill, content) {
    const occurrences = (content.match(new RegExp(`\\b${skill}\\b`, 'gi')) || []).length;
    return Math.min(occurrences / 10, 1);
}

function calculateLevel(experience) {
    return Math.floor(Math.log2(experience / 3600 + 1)) + 1;
}