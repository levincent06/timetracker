/*
** A content script that listens for a "cleanYouTube" message, then hides suggested videos on YouTube.
*/
console.log("Hide script ready!");
chrome.runtime.onMessage.addListener(messageReceived);

function messageReceived(message, sender, sendResponse) {
  console.log("hide.js received a message!: " + message.txt);
  if (message.txt == "cleanYouTube") {
    cleanYouTube();
  }
}

function cleanYouTube() {
  // Clears side bar videos
  const sideBar = document.getElementById("related");
  if (sideBar != null) {
    sideBar.remove();
  }

  // Clears recommended videos on the front page and subscription page
  //const reccVids = document.getElementsByClassName("ytd-page-manager");
  //for (var vid of reccVids) {
  //  vid.remove();
  //}
}
