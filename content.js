/**
 * @file content.js
 * @description This content script is responsible for reading the user-defined width from Chrome storage
 * and applying that width to the appropriate chat interface container on supported sites.
 *
 * The script supports two vendor sites:
 *  - ChatGPT (chat.openai.com): It targets a container with a unique class "group/turn-messages"
 *  - Gemini (gemini.google.com): It now targets the container with the CSS class "conversation-container"
 *    rather than a generic <main> element.
 *
 * @notes
 * - The DOM is observed for mutations in case the target container loads dynamically.
 * - In case the container is not immediately found, a warning is logged.
 * - The forward slash in the ChatGPT container selector must be escaped as \\/.
 */

// Helper function that applies the width change
function applyChatWidth(width, unit) {
  const url = window.location.href;
  let vendor = "";

  console.log("Applying width to", url);

  // Detect the vendor based on the current URL.
  if (url.includes("chatgpt.com")) {
    vendor = "chatgpt";
  } else if (url.includes("gemini.google.com")) {
    vendor = "gemini";
  } else if (url.includes("grok.com")) {
    vendor = "grok";
  } else if (url.includes("kapa.ai")) {
    vendor = "kapa";
  } else {
    console.warn("Unsupported chat interface for width expander.");
    return;
  }

  console.log("Applying width to", vendor, "with width", width, unit);

  if (vendor === "chatgpt") {
    // For ChatGPT, target the container with the unique class "group/turn-messages".
    // Note: the forward slash must be escaped as \\/ in the selector.
    const containers = document.querySelectorAll("div.group\\/turn-messages");
    if (containers.length > 0) {
      // Override the CSS variable that controls the max-width.
      containers.forEach(container => {
        container.style.setProperty("--thread-content-max-width", width + unit);
      });
      console.log(`Updated ${containers.length} ChatGPT container(s) CSS variable --thread-content-max-width to ${width}${unit}`);
    } else {
      console.log("No ChatGPT containers found.");
    }
  } else if (vendor === "gemini") {
    // For Gemini, target all containers with the "conversation-container" class.
    const containers = document.querySelectorAll(".conversation-container");
    if (containers.length > 0) {
      containers.forEach(container => {
        container.style.maxWidth = width + unit;
      });
      console.log(`Updated ${containers.length} Gemini conversation-container(s) max-width to ${width}${unit}`);
    } else {
      console.log("No Gemini conversation-containers found.");
    }
  } else if (vendor === "grok") {
    // For Grok, target all elements with the max-w-3xl class
    const containers = document.querySelectorAll(".max-w-3xl");
    if (containers.length > 0) {
      containers.forEach(container => {
        container.style.maxWidth = width + unit;
      });
      console.log(`Updated ${containers.length} Grok container(s) max-width to ${width}${unit}`);
    } else {
      console.log("No Grok containers found.");
    }
  } else if (vendor === "kapa") {
    // For Kapa.ai, target the specific container in the page structure
    const parentElement = document.querySelector("#__next > div > main > div > div > div > div");
    if (!parentElement) {
      console.warn(`Element with selector "${selector}" not found.`);
      return;
    }

    const descendantElements = parentElement.querySelectorAll('*');

    for (const el of descendantElements) {
      const computedDisplay = window.getComputedStyle(el).display;
      if (computedDisplay !== 'inline') {
        el.style.maxWidth = width + unit;
      }
    }
  }
}

// Store observer reference globally so we can disconnect it
let observer = null;

// Function to clean up observers and listeners
function cleanup() {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
}

// Function to initialize the extension
function initializeExtension() {
  try {
    chrome.storage.sync.get({ chatWidth: 768, widthUnit: 'px' }, function(data) {
      try {
        const initialWidth = data.chatWidth;
        const initialUnit = data.widthUnit;
        applyChatWidth(initialWidth, initialUnit);

        // Create and store the observer
        observer = new MutationObserver(() => {
          try {
            // Get the current values from storage each time to ensure we're using the latest
            chrome.storage.sync.get({ chatWidth: 768, widthUnit: 'px' }, function(data) {
              try {
                applyChatWidth(data.chatWidth, data.widthUnit);
              } catch (e) {
                console.warn('Error applying chat width:', e);
              }
            });
          } catch (e) {
            console.warn('Error in mutation observer:', e);
            // If we get an extension context invalidated error, clean up
            if (e.message && e.message.includes('Extension context invalidated')) {
              cleanup();
            }
          }
        });
        observer.observe(document.body, { childList: true, subtree: true });
      } catch (e) {
        console.warn('Error in storage callback:', e);
      }
    });
  } catch (e) {
    console.warn('Error accessing storage:', e);
  }
}

// Initialize the extension
initializeExtension();

// Listen for changes to the width value so that changes made via the popup update the page live.
try {
  const storageListener = (changes, areaName) => {
    try {
      console.log('Storage changed:', changes, areaName);
      if (areaName === "sync") {
        if (changes.chatWidth || changes.widthUnit) {
          const newWidth = changes.chatWidth ? changes.chatWidth.newValue : null;
          const newUnit = changes.widthUnit ? changes.widthUnit.newValue : null;

          if (newWidth !== null && newUnit !== null) {
            applyChatWidth(newWidth, newUnit);
          }
        }
      }
    } catch (e) {
      console.warn('Error in storage change listener:', e);
      if (e.message && e.message.includes('Extension context invalidated')) {
        cleanup();
      }
    }
  };

  chrome.storage.onChanged.addListener(storageListener);

  // Clean up on page unload
  window.addEventListener('unload', cleanup);
} catch (e) {
  console.warn('Error setting up storage change listener:', e);
}

// Listen for messages from the popup
try {
  const messageListener = (message, sender, sendResponse) => {
    if (message.action === "reloadWidth") {
      try {
        chrome.storage.sync.get(['chatWidth', 'widthUnit'], function(data) {
          applyChatWidth(data.chatWidth, data.widthUnit);
        });
      } catch (e) {
        console.warn('Error handling reloadWidth message:', e);
        if (e.message && e.message.includes('Extension context invalidated')) {
          cleanup();
        }
      }
    }
  };

  chrome.runtime.onMessage.addListener(messageListener);
} catch (e) {
  console.warn('Error setting up message listener:', e);
}
