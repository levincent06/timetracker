/*
** The javascript behind websites.html, a page where users can define what
** websites they want to be tracked.
** Sends a message to background.js to update the settings.
** Updates the html table when adding/removing.
*/

document.getElementById("add").addEventListener("click", add);
document.getElementById("remove").addEventListener("click", remove);

/* Initialize websites if not defined. */
chrome.storage.sync.get("websites", (data) => {
  if (data["websites"] == undefined) {
    chrome.storage.sync.set({"websites": new Array("youtube.com")});
  }
});

/** Populates the html table with the collected data. */
function fillData() {
  var table = document.getElementById("datatable");
  while (table.rows.length > 1) {
    table.deleteRow(1);
  }
  chrome.storage.sync.get("websites", (data) => {
    let websitesArray = data["websites"];
    websitesArray.forEach((item) => {
      var row = table.insertRow(1);
      row.insertCell(0).innerHTML = item;
    });
  })
}
fillData();

/* A message that tells background.js to update the settings internally. */
var message = {
  txt: "savedOptions"
}

/* Adds the specified website to be tracked. */
function add() {
  let website = document.getElementById("websites").value;
  chrome.storage.sync.get("websites", (data) => {
    let websitesArray = data["websites"];
    if (!websitesArray.includes(website)) {
      websitesArray.push(website);
      chrome.storage.sync.set({["websites"]: websitesArray});
      chrome.runtime.sendMessage("", message);
      fillData();
    }
  });
}

/* Removes the specified website from being tracked. */
function remove() {
  let website = document.getElementById("websites").value;
  chrome.storage.sync.get("websites", (data) => {
    let websitesArray = data["websites"];
    if (websitesArray.includes(website)) {
      let index = websitesArray.indexOf(website);
      websitesArray.splice(index, 1);
      chrome.storage.sync.set({["websites"]: websitesArray});
      chrome.runtime.sendMessage("", message);
      fillData();
    }
  });
}
