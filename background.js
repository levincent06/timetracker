console.log("Background script ready!");

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

/**************
EVENT LISTENERS
**************/

/* Listen for page changes within the YouTube domain. */
chrome.webNavigation.onHistoryStateUpdated.addListener(historyUpdated);

/* Sends a message to clean YouTube if on a YouTube website. */
function historyUpdated(historyDetails) {
  console.log("History state updated to "  + historyDetails.url);
  cleanYouTubeMessage(historyDetails.url, historyDetails.tabId);
}

/* Listen for when a tab is updated (ex: changed URL). */
chrome.tabs.onUpdated.addListener(tabUpdated);

/* Fired when a tab is updated (ex: by URL). */
function tabUpdated(tabId, changeInfo, tab) {
  console.log("A tab was updated to " + tab.url);
  cleanYouTubeMessage(tab.url, tabId);
  updateTimerState(tab.url);
}

/* Listen for when the active tab is changed. */
chrome.tabs.onActivated.addListener(tabActivated);

/* Fired when the active tab is changed.
** If the activated tab is not on YouTube, stop the timer.
*/
function tabActivated(activeInfo) {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    updateTimerState(tab.url);
  });
}

/* Listen for when a window is closed. */
chrome.windows.onRemoved.addListener(windowClosed);

/* Fired when a window is closed.
** If a window is closed, stop the timer.
*/
function windowClosed(windowId) {
  console.log("Window was closed!");
  stopTimer();
}


/****************************
CORE CONTENT SCRIPT MESSENGER
****************************/

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

console.log("Before loading timeSpent: " + timer.timeSpent);
console.log("Saved timeSpent: " + chrome.storage.sync.get([today()], (result) => {}));
chrome.storage.sync.get([today()], (result) => {
              timer.timeSpent = result.key || 0});
console.log("After loading timeSpent: " + timer.timeSpent);

function today() {
  let date = new Date();
  let m = date.getUTCMonth().toString();
  let d = date.getUTCDate().toString();
  let y = date.getUTCFullYear().toString();
  return m + "/" + d + "/" + y;
}

function storeTimer() {
  let key = today();
  let newTimeSpent = timer.timeSpent;
  chrome.storage.sync.set({key: newTimeSpent}, () => {});
}

function updateTimerState(url) {
  if (!youtubeURL.test(url) && timer.running) {
    stopTimer();
  } else if (youtubeURL.test(url) && !timer.running){
    startTimer();
  }
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
  storeTimer();
  timer.running = false;
  chrome.browserAction.setBadgeBackgroundColor({color: "#AAAAAA"}); // Grey
  clearInterval(timer.interval);
}


/* Updates the extension badge number to N. */
function updateBadge(n) {
  const minutesAlertInterval = 1;
  let timeSpentMinutes = n / 60;
  chrome.browserAction.setBadgeText({text: n.toString()});
  if (timeSpentMinutes % minutesAlertInterval == 0) {
    window.alert(`You've spent ${timeSpentMinutes} minutes on YouTube today.`)
  }
}
