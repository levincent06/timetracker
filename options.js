document.getElementById("saveOptions").addEventListener("click", save);

/** Return a string form of today's date based on the user's OS timezone.
** Ex: January 7, 2020 === x010720. */
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
  return "x" + m + d + y;
}

/* Update the options html to have the previously saved options. */
chrome.storage.sync.get(["hideRecc", "hideSidebar", "showNumber", "timeunit", "showNotifications", "minutesAlertInterval", "silent", today()],
  (data) => {
    document.getElementById("hideRecc").checked = data.hideRecc;
    document.getElementById("hideSidebar").checked = data.hideSidebar;
    document.getElementById("showNumber").checked = data.showNumber;
    document.getElementById("timeunit").value = data.timeunit;
    document.getElementById("showNotifications").checked = data.showNotifications;
    document.getElementById("minutesAlertInterval").value = data.minutesAlertInterval;
    document.getElementById("silent").checked = data.silent;
    document.getElementById("timeSpent").textContent = Math.floor(data[today()] / 60) + "+";
  })


/* Update chrome storage to have the new defined options. */
function save() {
  var hideRecc = document.getElementById("hideRecc").checked;
  var hideSidebar = document.getElementById("hideSidebar").checked;
  var showNumber = document.getElementById("showNumber").checked;
  var timeunit = document.getElementById("timeunit").value;
  var showNotifications = document.getElementById("showNotifications").checked;
  var minutesAlertInterval = document.getElementById("minutesAlertInterval").value;
  var silent = document.getElementById("silent").checked;
  chrome.storage.sync.set(
    {
      "hideRecc": hideRecc,
      "hideSidebar": hideSidebar,
      "showNumber": showNumber,
      "timeunit": timeunit,
      "showNotifications": showNotifications,
      "minutesAlertInterval": minutesAlertInterval,
      "silent": silent
    }, () => {console.log("Saved settings.")}
  );
  var message = {
    txt: "savedOptions"
  }
  chrome.runtime.sendMessage("", message);
}
