const prefix = 'Suggestion: ';
let isProcessing = false;
let typingTimer;
const typingDelay = 500;
const popupId = 'typing-helper-popup';

function onUserInput(event) {
  const inputValue = event.target.value;
  const target = event.target;
  // Clear the previous timer
  clearTimeout(typingTimer);

  // Set a new timer
  typingTimer = setTimeout(async () => {
    console.log('Fetching suggestion...');
    // getPhraseSuggestion(inputValue);
    // Only trigger for input, textarea, and div elements
    if (['INPUT', 'TEXTAREA', 'DIV'].includes(target.tagName)) {

      // Remove existing popup if it exists
      if (popup) popup.remove();

      // Create the popup element
      popup = document.createElement('div');
      popup.id = popupId;
      popup.textContent = await getPhraseSuggestion(target.value || target.innerText); // Dynamic phrase suggestion
      popup.style.position = 'absolute';
      popup.style.padding = '8px';
      popup.style.backgroundColor = '#f9f9f9';
      popup.style.border = '1px solid #ddd';
      popup.style.borderRadius = '4px';
      popup.style.boxShadow = '0px 2px 6px rgba(0,0,0,0.2)';
      popup.style.zIndex = '10000';
      popup.style.fontSize = '12px';
      popup.style.color = '#333';
      popup.callTimeout = 3;

      const coordinates = getTargetCoordinates(target);

      // Position the popup relative to the target element
      popup.style.top = `${coordinates.y + coordinates.height + 5}px`; // Below the element
      popup.style.left = `${coordinates.x}px`; // Aligned with the element's left edge

      document.body.appendChild(popup);

      // Remove the popup after a delay
      setTimeout(() => {
        if (popup) popup.remove();
      }, 5000); // Disappear after 5 seconds
    }
  }, typingDelay);
}

document.addEventListener('keydown', (event) => {
  popup = document.getElementById('typing-helper-popup');
  if (event.key === 'Tab' && popup && popup.textContent.startsWith(prefix)) {
    event.preventDefault(); // Prevent default tab behavior
    // text to add to the input/textarea remove prefix
    let textToAdd = popup.textContent.slice(prefix.length);
    if (event.target.tagName === 'DIV') {
      event.target.innerText += textToAdd; // Replace content for div
    } else {
      event.target.value += textToAdd; // Replace value for input/textarea
    }
    moveCursorToEnd(event.target);
    popup.remove(); // Remove the popup after applying suggestion
  }
});

document.addEventListener('input', async (event) => {
  onUserInput(event);

  let popup = document.getElementById(popupId);
  // count pause between typing
  if (popup && popup.callTimeout > 4) {
    console.log(popup.callTimeout);
    return;
  };
  onUserInput(event);
});

function getTargetCoordinates(element) {
  const rect = element.getBoundingClientRect();

  return {
    x: rect.left + window.scrollX, // Horizontal position
    y: rect.top + window.scrollY,  // Vertical position
    width: rect.width,             // Element width
    height: rect.height,           // Element height
  };
}

async function getPhraseSuggestion(inputValue) {
  // Mock implementation for phrase suggestion
  if (isProcessing) return;
  isProcessing = true;
  await sleep(1000); // Simulate network latency
  console.log(`${prefix} ${inputValue}`);
  isProcessing = false;

  const { available, defaultTemperature, defaultTopK, maxTopK } =
    await ai.languageModel.capabilities();
  console.log(available.defaultTopK, available.maxTopK);
  if (available !== "no") {
    for (let i = 0; i < 3; i++) {
      console.log('Prompting...');
      try {
        let result = getPhraseSuggestion(inputValue);
        return `${prefix}${result}`;
      }
      catch (error) {
        console.error("Error:", error);
      }
    }
    return "";
  }
}

async function getPhraseSuggestion(inputValue) {
  const session = await ai.languageModel.create({
    systemPrompt: `
      Your answer only in English. 4 words or less.`,
  });
  const suggestion =
    await session.prompt(`
      Your answer only in English. 4 words or less.
      I'll give you a sentence, and you need to complete it in 4 words or less. Replace only the three dots at the end with your continuation. Do not include the original sentence in your answer.
      Example:
      Input: Hi, ...
      Output: my name is Ivan
      Sentence: ${inputValue}`);
  session.destroy();
  return `${prefix}${suggestion}`;
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function moveCursorToEnd(inputElement) {
  if (inputElement.value) {
    const length = inputElement.value.length;
    inputElement.setSelectionRange(length, length);
    inputElement.focus();
  }

  if (inputElement.innerText) {
    const length = inputElement.innerText.length;
    const range = document.createRange();
    range.selectNodeContents(inputElement);
    range.collapse(false); // Collapse the range to the end
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  }
}
