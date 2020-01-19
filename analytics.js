/*
** The javascript behind analytics.html, a page where users can
** view their tracked time.
*/

chrome.storage.sync.get(null, fillData);

/** Populates the html table with the collected data. */
function fillData(data) {
  var allKeys = Object.keys(data);
  var table = document.getElementById("datatable");
  for (key of allKeys) {
    if (key.charAt(0) == 'x') {
      var row = table.insertRow(1);
      let date = dateToString(key.substring(1));
      let time = secondsToString(data[key]);
      row.insertCell(0).innerHTML = date;
      row.insertCell(1).innerHTML = time;
    }
  }
}

/* Converts the stored date key into a readable string.
** Ex: 200107 --> 01/07/20
*/
function dateToString(date) {
  let year = date.substring(0, 2);
  let month = date.substring(2, 4);
  let day = date.substring(4, 6);
  return month + "/" + day + "/" + year;
}

/* Converts a number of seconds into a string with the form
** hh:mm */
function secondsToString(seconds) {
  let totalMinutes = Math.round(seconds / 60);
  let hours = Math.floor(totalMinutes / 60);
  let remMinutes = totalMinutes - (hours * 60);
  if (remMinutes < 10) {
    remMinutes = "0" + remMinutes;
  }
  return hours + ":" + remMinutes;
}
