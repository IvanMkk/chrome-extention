// Sample list of autocomplete suggestions
const suggestions = ["hello", "help", "hero", "happy", "house"];

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "getSuggestions") {
    // Filter suggestions based on input
    const input = message.input.toLowerCase();
    const filteredSuggestions = suggestions.filter(word =>
      word.startsWith(input)
    );
    sendResponse(filteredSuggestions);
  }
});
