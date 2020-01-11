/*
** A content script that listens for messages, then hides suggested videos on YouTube.
*/
console.log("Hide script ready!");
chrome.runtime.onMessage.addListener(messageReceived);

function messageReceived(message, sender, sendResponse) {
  if (message.txt == "cleanSidebar") {
    console.log("cleanSidebar received!");
    cleanSidebar();
  } else if (message.txt == "cleanRecc") {
    console.log("cleanRecc received!");
    cleanRecc();
  } else if (message.txt == "restore") {
    console.log("restore received!");
    restore();
  }
}

// Clears side bar videos
function cleanSidebar() {
  const sideBar = document.getElementById("related");
  if (sideBar != null) {
    //sideBar.remove();
    sideBar.style.display = "none";
  }
}

// Clears recommended videos on the front page and subscription page
function cleanRecc() {
  const reccVids = document.getElementsByClassName("ytd-page-manager");
  for (var vid of reccVids) {
    //vid.remove();
    vid.style.display = "none";
  }
}

// Restores recommended videos on the front page and subscription page
function restore() {
  const reccVids = document.getElementsByClassName("ytd-page-manager");
  for (var vid of reccVids) {
    //vid.remove();
    vid.style.display = "";
  }
}
