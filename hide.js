/*
** A content script that listens for messages, then hides suggested videos on YouTube.
*/

chrome.runtime.onMessage.addListener(messageReceived);

function messageReceived(message, sender, sendResponse) {
  if (message.txt == "cleanSidebar") {
    cleanSidebar();
  } else if (message.txt == "cleanRecc") {
    cleanRecc();
  }
}

// Clears side bar videos
function cleanSidebar() {
  const sideBar = document.getElementById("related");
  if (sideBar != null) {
    sideBar.style.display = "none";
  }
}


/* Clears recommended videos on the front page and subscription page
** Videos on Home, Trending, Subs, and Library have tagname "YTD-BROWSE".
** Home videos have page-subtype.value "home"
** Trending videos have null page-Subtype
** Subscription videos have page-subtype.value "subscriptions"
** Library videos have null page-subtype
*/
function cleanRecc() {
  const videoPage = document.getElementsByClassName("ytd-page-manager");
  for (var vid of videoPage) {
    var subtype = vid.attributes.getNamedItem("page-subtype");
    var tag = vid.tagName;
    if (tag === "YTD-BROWSE" && (subtype == null || subtype.value === "home")) {
      vid.style.display = "none";
    }
  }
}
