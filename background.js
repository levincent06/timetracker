/*
** The core backend script.
** Involves several event handlers to update the status of the timer.
** Receives messages from options.js and websites.js to update user-defined options.
** Sends messages to hide.js to hide YouTube elements
*/

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

/* Given a string, return the string with escaped characters for regex purposes. */
function escape(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/***************
WEBSITE MATCHING
***************/

let websites = [];
/* Gets all the websites that need to be tracked shown at websites.html. */
function getWebsites() {
  chrome.storage.sync.get("websites", (data) => {
    websites = data["websites"];
    websites.forEach((item, i) => {
      websites[i] = new RegExp(escape(websites[i]));
    });
    console.log("Loaded websites: " + websites);
  })
}
getWebsites();

/************
USER SETTINGS
************/
/* These values may be set by the user in the extension's options.
** Settings are updated when receiving a message from options.js or websites.js
*/

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

/* Update the internal options based on user settings. */
function updateSettings() {
  chrome.storage.sync.get(["hideRecc", "hideSidebar", "showNumber", "showNotifications", "minutesAlertInterval", "silent"],
    (data) => {
      hideRecc = data.hideRecc;
      hideSidebar = data.hideSidebar;
      showNumber = data.showNumber;
      showNotifications = data.showNotifications;
      minutesAlertInterval = data.minutesAlertInterval;
      silent = data.silent;
      getWebsites();
    })
}
updateSettings();

/**************
EVENT LISTENERS
**************/

/* Receives "savedOptions" from options.js and websites.js .*/
chrome.runtime.onMessage.addListener(messageReceived);
function messageReceived(request, sender, sendResponse) {
  if (request.txt === "savedOptions") {
    updateSettings();
    updateBadge();
  }
}

/* Listen for page changes within the YouTube domain.
** Sends a message to clean YouTube if on a YouTube website.
*/
chrome.webNavigation.onHistoryStateUpdated.addListener(historyUpdated);

function historyUpdated(historyDetails) {
  cleanYouTubeMessage(historyDetails.url, historyDetails.tabId);
}

/* Listen for when a tab is updated (ex: changed URL).
** Send a cleanYouTubeMessage if necessary and update the timer state.
*/
chrome.tabs.onUpdated.addListener(tabUpdated);
function tabUpdated(tabId, changeInfo, tab) {
  if (changeInfo.status === "complete") {
    cleanYouTubeMessage(tab.url, tabId);
    updateTimerState(tab.url);
  }
}

/* Listen for when the active tab is changed. */
chrome.tabs.onActivated.addListener(tabActivated);

/* Fired when the active tab is changed.
** Update the timer state accordingly.
*/
function tabActivated(activeInfo) {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    updateTimerState(tab.url);
  });
}

/* Listen for when a window is closed and stop the timer. */
chrome.windows.onRemoved.addListener(windowClosed);
function windowClosed(windowId) {
  stopTimer();
}

/*****************
WINDOW FOCUS CHECK
*****************/

/* Continuously check whether there is a chrome window currently being focused
** If so, update the timer state
** Otherwise, stop the timer.
*/
let windowFocusInterval = setInterval(checkFocus, 1000);
function checkFocus() {
  chrome.windows.getCurrent(windowChange);
}

/* When switching between chrome windows, update the timer status as necessary.
** windowId is the id of the newly-focused window.
** -1 represents a "null" chrome window.
*/
chrome.windows.onFocusChanged.addListener(focusChanged);
function focusChanged(windowId) {
  if (windowId != -1) {
    chrome.windows.get(windowId, windowChange);
  }
}

/* If there is no browser focused, stop the timer if it is running.
** Otherwise if there IS a browser focused, update the timer state.
*/
function windowChange(window) {
  if (timer.running && !window.focused) { // Switched off chromes
    stopTimer();
  } else if (window.focused) { // Switching to a chrome
    chrome.tabs.query({active: true, lastFocusedWindow: true}, function(tabs) {
      updateTimerState(tabs[0].url);
    });
  }
}

/****************************
CORE CONTENT SCRIPT MESSENGER
****************************/

/* Sends the appropriate message to hide.js for cleaning YouTube if url matches. */
function cleanYouTubeMessage(url, tabId) {
  if (hideSidebar && videoPage.test(url)) {
    chrome.tabs.sendMessage(tabId, {txt: "cleanSidebar"});
  } else if (hideRecc && (youtubeHome.test(url) || youtubeTrending.test(url))) {
    chrome.tabs.sendMessage(tabId, {txt: "cleanRecc"});
  }
}

/***********************
CORE TIMER FUNCTIONALITY
***********************/

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

/** Update the timer to the saved time. */
chrome.storage.sync.get(today(), (result) => {
              timer.timeSpent = result[today()] || 0;});

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
}

/** Stops or starts the timer based on the current URL. */
function updateTimerState(url) {
  for (website of websites) {
    if (website.test(url)) {
      console.log("Matched " + website + ", starting timer.");
      startTimer();
      return;
    }
  }
  stopTimer();
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
  }
}

/** Stops the timer and stores it. */
function stopTimer() {
  if (timer.running) {
    console.log("Stopping timer");
    storeTimer();
    timer.running = false;
    chrome.browserAction.setBadgeBackgroundColor({color: "#AAAAAA"}); // Grey
    clearInterval(timer.interval);
  }
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
    title : "tracker.pro",
    message : s,
    iconUrl : "icons/icon128.png",
    silent : silent
  }
  chrome.notifications.create(options);
}
