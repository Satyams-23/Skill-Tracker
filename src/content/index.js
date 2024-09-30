console.log('Content script loaded');

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Message received in content script:', request);
    if (request.action === "getPageContent") {
        const content = document.body.innerText;
        console.log('Sending page content, length:', content.length);
        sendResponse({ content: content });
    }
});

function trackUserActivity() {
    chrome.runtime.sendMessage({ action: "trackInteraction", type: "activity" });
}

document.addEventListener('scroll', debounce(trackUserActivity, 250));
document.addEventListener('click', trackUserActivity);
document.addEventListener('keypress', trackUserActivity);

function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

console.log('Content script setup complete');