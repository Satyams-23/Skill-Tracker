console.log('Content script loaded');

function handleMessage(request, sender, sendResponse) {
    console.log('Message received in content script:', request);
    if (request.action === "getPageContent") {
        const content = document.body.innerText;
        console.log('Sending page content, length:', content.length);
        sendResponse({ content: content });
    }
}

chrome.runtime.onMessage.addListener(handleMessage);

function trackUserActivity() {
    try {
        chrome.runtime.sendMessage({ action: "trackInteraction", type: "activity" });
    } catch (error) {
        console.error('Error sending message:', error);
        // If there's an error, remove the event listeners to prevent further errors
        document.removeEventListener('scroll', debouncedTrackUserActivity);
        document.removeEventListener('click', trackUserActivity);
        document.removeEventListener('keypress', trackUserActivity);
    }
}

const debouncedTrackUserActivity = debounce(trackUserActivity, 250);

document.addEventListener('scroll', debouncedTrackUserActivity);
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