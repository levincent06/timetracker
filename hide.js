/*
** A content script that listens messages, then hides suggested videos on YouTube.
*/
console.log("Hide script ready!");
chrome.runtime.onMessage.addListener(messageReceived);

function messageReceived(message, sender, sendResponse) {
  console.log("hide.js received a message!: " + message.txt);
  if (message.txt == "cleanSidebar") {
    cleanSidebar();
  } else if (message.txt == "cleanRecc") {
    cleanRecc();
  }
}

function cleanSidebar() {
  // Clears side bar videos
  console.log("cleanSidebar received!");
  const sideBar = document.getElementById("related");
  if (sideBar != null) {
    sideBar.remove();
  }
}

function cleanRecc() {
  // Clears recommended videos on the front page and subscription page
  console.log("cleanRecc received!");
  const reccVids = document.getElementsByClassName("ytd-page-manager");
  for (var vid of reccVids) {
    vid.remove();
  }
}
