chrome.storage.sync.get(null, fillData);
// The maximum rows containing data to display
let maxRows = 7;

function fillData(data) {
  var allKeys = Object.keys(data);
  var table = document.getElementById("datatable");
  let numRows = 0;
  for (key of allKeys) {
    if (key.charAt(0) == 'x') {
      var row = table.insertRow();
      let date = dateToString(key.substring(1));
      let time = secondsToString(data[key]);
      row.insertCell(0).innerHTML = date;
      row.insertCell(1).innerHTML = time;
      numRows++;
      if (numRows > maxRows) {
        table.deleteRow(1);
      }
    }
  }
}

/* Converts the stored date key into a readable string.
** Ex: 011020 --> 01/10/20
*/
function dateToString(date) {
  let month = date.substring(0, 2);
  let day = date.substring(2, 4);
  let year = date.substring(4, 6);
  return month + "/" + day + "/" + year;
}

/* Converts a number of seconds into a string with the form
** hh:mm */
function secondsToString(seconds) {
  let totalMinutes = Math.round(seconds / 60);
  let hours = Math.floor(totalMinutes / 60);
  let remMinutes = totalMinutes - (hours * 60);
  return hours + " : " + remMinutes;
}
