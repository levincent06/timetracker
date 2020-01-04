console.log("Background script ready!");

chrome.webNavigation.onHistoryStateUpdated.addListener(historyUpdated);
var youtubeURL = /^https?:\/\/(?:[^./?#]+\.)?youtube\.com/;

function historyUpdated(historyDetails) {
  console.log("You are now on: " + historyDetails.url);
  console.log("Tab ID: " + historyDetails.tabId);
  if (youtubeURL.test(historyDetails.url)) {
    console.log("YouTube page detected!");
    console.log("Sending cleanYouTube message");
    // Sends a message with txt "cleanYouTube" to the current tab
    var currTabQuery = {
      active: true,
      lastFocusedWindow: true
    };
    chrome.tabs.sendMessage(historyDetails.tabId, {txt: "cleanYouTube"});
  } else {
    console.log("Not a YouTube page");
  }
}
