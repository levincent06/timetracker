window.onload = function () {
  /** Add an event listener for each checkbox. */
  document.querySelectorAll('.switch').forEach(item => {
    item.firstElementChild.addEventListener('click', save);
  })
  document.getElementById("websiteOptions").addEventListener("click", showWebsiteOptions);
  document.getElementById("showData").addEventListener("click", showData);
}

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

/* Update the options html to have the previously saved options. */
chrome.storage.sync.get(["hideRecc", "hideSidebar", "showNumber", "showNotifications", "minutesAlertInterval", "silent", today()],
  (data) => {
    document.getElementById("hideRecc").checked = data.hideRecc;
    document.getElementById("hideSidebar").checked = data.hideSidebar;
    document.getElementById("showNumber").checked = data.showNumber;
    document.getElementById("showNotifications").checked = data.showNotifications;
    //document.getElementById("minutesAlertInterval").value = data.minutesAlertInterval || 60;
    document.getElementById("silent").checked = data.silent;
    document.getElementById("timeSpent").textContent = data[today()] ? (Math.floor(data[today()] / 60) + "+") : "No";
  })


/* Update chrome storage to have the new defined options. */
function save() {
  var hideRecc = document.getElementById("hideRecc").checked;
  var hideSidebar = document.getElementById("hideSidebar").checked;
  var showNumber = document.getElementById("showNumber").checked;
  var showNotifications = document.getElementById("showNotifications").checked;
  //var minutesAlertInterval = document.getElementById("minutesAlertInterval").value;
  var silent = document.getElementById("silent").checked;
  chrome.storage.sync.set(
    {
      "hideRecc": hideRecc,
      "hideSidebar": hideSidebar,
      "showNumber": showNumber,
      "showNotifications": showNotifications,
      //"minutesAlertInterval": minutesAlertInterval,
      "silent": silent
    }, () => {console.log("Saved settings.")}
  );
  var message = {
    txt: "savedOptions"
  }
  chrome.runtime.sendMessage("", message);
}

function showWebsiteOptions() {
  chrome.tabs.create({url: chrome.extension.getURL("websites.html")})
}

function showData() {
  chrome.tabs.create({url: chrome.extension.getURL("analytics.html")})
}
