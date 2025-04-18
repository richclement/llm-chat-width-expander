// Load saved values when popup opens
document.addEventListener('DOMContentLoaded', function() {
  // Get saved width and unit
  chrome.storage.sync.get(['chatWidth', 'widthUnit'], function(data) {
    const widthInput = document.getElementById('widthInput');
    const unitRadios = document.getElementsByName('unit');
    
    if (data.chatWidth) {
      widthInput.value = data.chatWidth;
    }
    
    if (data.widthUnit) {
      unitRadios.forEach(radio => {
        if (radio.value === data.widthUnit) {
          radio.checked = true;
        }
      });
    }
    
    // Update input constraints based on unit
    updateInputConstraints();
  });
});

// Update input constraints when unit changes
document.getElementsByName('unit').forEach(radio => {
  radio.addEventListener('change', updateInputConstraints);
});

function updateInputConstraints() {
  const widthInput = document.getElementById('widthInput');
  const selectedUnit = document.querySelector('input[name="unit"]:checked').value;
  
  if (selectedUnit === '%') {
    widthInput.placeholder = 'e.g. 80';
    widthInput.max = '100';
  } else {
    widthInput.placeholder = 'e.g. 768';
    widthInput.max = '';
  }
}

document.getElementById('saveBtn').addEventListener('click', () => {
  const widthInput = document.getElementById('widthInput');
  const selectedUnit = document.querySelector('input[name="unit"]:checked').value;
  const widthValue = parseInt(widthInput.value, 10);
  
  if (!isNaN(widthValue) && widthValue > 0) {
    if (selectedUnit === '%' && widthValue > 100) {
      alert('Percentage cannot be greater than 100.');
      return;
    }
    
    console.log('Saving width:', widthValue, selectedUnit);
    // Save both the width value and the selected unit
    chrome.storage.sync.set({
      chatWidth: widthValue,
      widthUnit: selectedUnit
    }, function() {
      console.log('Storage updated successfully:', widthValue, selectedUnit);
      // Check if current tab is a supported site before sending message
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        const currentTab = tabs[0];
        if (currentTab.url.includes('chatgpt.com') || currentTab.url.includes('gemini.google.com')) {
          // Try to send message, but handle potential errors
          chrome.tabs.sendMessage(currentTab.id, {action: "reloadWidth"})
            .catch(error => {
              console.log('Could not send message to content script:', error);
              // This is not a critical error - the width will be applied when the page reloads
            });
        }
      });
    });
  } else {
    alert('Please enter a valid positive number.');
  }
});
  