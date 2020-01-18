console.log("Background script ready!");

/************
USER SETTINGS
************/
/** These values may be set by the user in the extension's options. */

/* Whether or not to hide recommended videos. */
let hideRecc = true;
/* Whether or not to hide sideBar videos. */
let hideSidebar = true;
/* Whether or not to show the time on the badge. */
let showNumber = false;
/* Whether or not to show notifications. */
let showNotifications = true;
/* The number of minutes between each notification. */
let minutesAlertInterval = 1;
/* Whether or not notifications should be silent. */
let silent = true;

/* Update the options html to have the previously saved options. */
function updateSettings() {
  chrome.storage.sync.get(["hideRecc", "hideSidebar", "showNumber", "showNotifications", "minutesAlertInterval", "silent"],
    (data) => {
      hideRecc = data.hideRecc;
      hideSidebar = data.hideSidebar;
      showNumber = data.showNumber;
      showNotifications = data.showNotifications;
      minutesAlertInterval = data.minutesAlertInterval;
      silent = data.silent;
    })
}
updateSettings();

/*****************
URL MATCHING REGEX
*****************/

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

chrome.runtime.onMessage.addListener(messageReceived);

function messageReceived(request, sender, sendResponse) {
  if (request.txt === "savedOptions") {
    updateSettings();
    updateBadge();
  }
}

/* Listen for page changes within the YouTube domain. */
chrome.webNavigation.onHistoryStateUpdated.addListener(historyUpdated);

/* Sends a message to clean YouTube if on a YouTube website. */
function historyUpdated(historyDetails) {
  //console.log("History state updated to "  + historyDetails.url);
  cleanYouTubeMessage(historyDetails.url, historyDetails.tabId);
}

/* Listen for when a tab is updated (ex: changed URL). */
chrome.tabs.onUpdated.addListener(tabUpdated);

/* Fired when a tab is updated (ex: by URL). */
function tabUpdated(tabId, changeInfo, tab) {
  if (changeInfo.status === "complete") {
    //console.log("A tab was updated to " + tab.url);
    cleanYouTubeMessage(tab.url, tabId);
    updateTimerState(tab.url);
  }
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
  if (hideSidebar && videoPage.test(url)) {
    //console.log("Sending cleanSidebar message for " + url);
    chrome.tabs.sendMessage(tabId, {txt: "cleanSidebar"});
  } else if (hideRecc && (youtubeHome.test(url) || youtubeTrending.test(url))) {
    //console.log("Sending cleanRecc message for " + url);
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

/** Updates the timer to the saved time for the UTC day. */
chrome.storage.sync.get(today(), (result) => {
              console.log("Saved time spent: " + result[today()]);
              timer.timeSpent = result[today()] || 0
              console.log("Time spent loaded to " + timer.timeSpent);});

/** Return a string form of today's date based on the user's OS timezone.
** Ex: January 7, 2020 === x200107. */
function today() {
  let date = new Date();
  let m = date.getMonth() + 1;
  m = m.toString();
  if (m.length == 1) {
    m = "0" + m;
  }
  let d = date.getDate().toString();
  if (d.length == 1) {
    d = "0" + d;
  }
  let y = date.getFullYear().toString();
  y = y.substring(2);
  return "x" + y + m + d;
}

/** Stores the timer state for later retrieval in the form
**  day : timeSpent */
function storeTimer() {
  let date = today();
  chrome.storage.sync.set({[date]: timer.timeSpent});
  //chrome.storage.sync.get(date, (result) => { console.log("Successfuly stored " + result[date])});
}

/** Stops or starts the timer based on the current URL. */
function updateTimerState(url) {
  if (!youtubeURL.test(url) && timer.running) {
    stopTimer();
  } else if (youtubeURL.test(url) && !timer.running){
    startTimer();
  }
}

/** Starts the timer. Running is set to true and timeSpent periodically increases. */
function startTimer() {
  if (timer.running == false) {
    console.log("Starting timer");
    timer.running = true;
    chrome.browserAction.setBadgeBackgroundColor({color: "#FF0333"}); // Red
    timer.interval = setInterval(runContinuous, 1000);
    function runContinuous() {
      // Reset the timer if running through midnight
      chrome.storage.sync.get(today(), (result) => {
        if (result[today()] === undefined) {
          console.log("Midnight! Resetting timer.");
          timer.timeSpent = 0;
          storeTimer();
        }
      });
      timer.timeSpent += 1;
      if (timer.timeSpent % 10 == 0) {
        storeTimer();
      }
      updateBadge();
    }
  } else {
    console.log("Timer should already be running");
  }
}

/** Stops the timer. Running is set to false and the timerSpent stops increasing. */
function stopTimer() {
  console.log("Stopping timer");
  storeTimer();
  timer.running = false;
  chrome.browserAction.setBadgeBackgroundColor({color: "#AAAAAA"}); // Grey
  clearInterval(timer.interval);
}


/** Updates the extension badge number. */
function updateBadge() {
  let timeSpentMinutes = timer.timeSpent / 60;
  let n = Math.floor(timeSpentMinutes);
  if (showNumber) {
    chrome.browserAction.setBadgeText({text: n.toString()});
  } else {
    chrome.browserAction.setBadgeText({text: ""});
  }

  if (timer.timeSpent != 0 && timeSpentMinutes % minutesAlertInterval == 0) {
    notify(`You've spent ${timeSpentMinutes} minutes on YouTube today.`);
  }
}

/** Sends a notification to the user with string S. */
function notify(s) {
  if (!showNotifications) {
    return;
  }
  var options = {
    type : "basic",
    title : "YouTube Tracker",
    message : s,
    iconUrl : "icons/icon128.png",
    silent : silent
  }
  chrome.notifications.create(options);
}
