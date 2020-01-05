console.log("Background script ready!");

/* Listen for page changes within the YouTube domain. */
chrome.webNavigation.onHistoryStateUpdated.addListener(historyUpdated);

/* A regular expression that matches websites under the YouTube domain. */
var youtubeURL = /^https?:\/\/(?:[^./?#]+\.)?youtube\.com/;
/* A regular expression that matches the YouTube home page. */
var youtubeHome = /^https?:\/\/(?:[^./?#]+\.)?youtube\.com\/$/;
/* A regular expression that matches the YouTube trending page. */
var youtubeTrending = /^https?:\/\/(?:[^./?#]+\.)?youtube\.com\/feed\/trending/;
/* A regular expression that matches the YouTube subscription page. */
var subsPage = /^https?:\/\/(?:[^./?#]+\.)?youtube\.com\/feed\/subscriptions/;
/* A regular expression that matches a YouTube video page. */
var videoPage = /^https?:\/\/(?:[^./?#]+\.)?youtube\.com\/watch/;

/* Listen for when a tab is updated (ex: changed URL). */
chrome.tabs.onUpdated.addListener(tabUpdated);

/* Listen for when the active tab is changed. */
chrome.tabs.onActivated.addListener(tabActivated);

/* Sends a message to clean YouTube if on a YouTube website. */
function historyUpdated(historyDetails) {
  console.log("History state updated!");
  console.log("You are now on: " + historyDetails.url);
  cleanYouTubeMessage(historyDetails.url, historyDetails.tabId);
}

// Sends the appropriate message for cleaning YouTube if url matches
function cleanYouTubeMessage(url, tabId) {
  if (videoPage.test(url)) {
    console.log("Sending cleanSidebar message");
    // Sends a message to be accepted by hide.js
    chrome.tabs.sendMessage(tabId, {txt: "cleanSidebar"});
  }
  if (youtubeHome.test(url) || youtubeTrending.test(url)) {
    console.log("Sending cleanRecc message");
    chrome.tabs.sendMessage(tabId, {txt: "cleanRecc"});
  }
}

/********************
YOUTUBE TIMER METHODS
********************/

/* Fired when a tab is updated (ex: by URL). */
function tabUpdated(tabId, changeInfo, tab) {
  console.log("A tab was updated!");
  cleanYouTubeMessage(tab.url, tabId);
  if (youtubeURL.test(tab.url)) {

    if (!timer.running) {
      startTimer();
    }
  } else if (timer.running) {
    stopTimer();
  }
}

/* Fired when the active tab is changed.
** If the activated tab is not on YouTube, stop the timer.
*/
function tabActivated(activeInfo) {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (!youtubeURL.test(tab.url)) {
      stopTimer();
    } else {
      startTimer();
    }
  });
}

function startTimer() {
  if (timer.running == false) {
    console.log("Starting timer");
    timer.running = true;
    chrome.browserAction.setBadgeBackgroundColor({color: "#FF0033"}); // Red
    timer.interval = setInterval(() => {timer.timeSpent += 1;
                                        updateBadge(timer.timeSpent);}, 1000);
  } else {
    console.log("Timer should already be running");
  }
}

function stopTimer() {
  console.log("Stopping timer");
  timer.running = false;
  chrome.browserAction.setBadgeBackgroundColor({color: "#AAAAAA"}); // Grey
  clearInterval(timer.interval);
}

/* An object that keeps track of the states of the timer
** running: A boolean value indicating whether the timer is running.
** timeSpent: An int value in seconds
** interval: A variable to hold intervals to increment the timeSpent
*/
let timer = {
  running : false,
  timeSpent : 0,
  interval : null
};

/* Updates the extension badge number to N. */
function updateBadge(n) {
  chrome.browserAction.setBadgeText({text: n.toString()});
}
