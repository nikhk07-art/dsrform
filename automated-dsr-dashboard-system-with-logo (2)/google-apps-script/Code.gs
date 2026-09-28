/**
 * DSR Flow Portal — Google Apps Script Web App
 * This is the script currently deployed for this project. Paste this into
 * Extensions > Apps Script (opened from inside the Google Sheet), replacing
 * any existing code, then Deploy > Manage deployments > Edit (pencil) >
 * New version > Deploy.
 *
 * The front-end (src/components/DsrDashboard.tsx) sends writes shaped
 * exactly to match doPost below: { sheet: { sheetName, headers, row } }.
 * If you change this script's expected payload shape, update
 * `buildSheetWritePayload` in DsrDashboard.tsx to match.
 */

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheetInfo = data.sheet;
    if (!sheetInfo || !sheetInfo.sheetName || !sheetInfo.row) {
      return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Missing sheet payload" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(sheetInfo.sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetInfo.sheetName);
    }

    var headers = sheetInfo.headers || [];
    var row = sheetInfo.row;

    // Write / refresh the header row if it's missing or out of date
    if (headers.length > 0) {
      var existingHeaders = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
      var headersMatch = existingHeaders.length === headers.length &&
        existingHeaders.every(function (h, i) { return String(h) === String(headers[i]); });
      if (!headersMatch) {
        sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
        sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
      }
    }

    // Upsert by Employee Name (col 2) + Date (col 1) so re-submitting the
    // same day just updates the row instead of creating a duplicate.
    var lastRow = sheet.getLastRow();
    var updated = false;
    if (lastRow > 1) {
      var existingData = sheet.getRange(2, 1, lastRow - 1, 2).getValues();
      for (var i = 0; i < existingData.length; i++) {
        if (String(existingData[i][0]) === String(row[0]) && String(existingData[i][1]) === String(row[1])) {
          sheet.getRange(i + 2, 1, 1, row.length).setValues([row]);
          updated = true;
          break;
        }
      }
    }
    if (!updated) {
      sheet.appendRow(row);
    }

    return ContentService.createTextOutput(JSON.stringify({ status: "success", updated: updated }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * READ ENDPOINT — lets the DSR Flow Portal pull rows back OUT of this sheet.
 * Any row you type directly into a *_DSR tab will show up in the dashboard.
 * Supports ?callback=fn (JSONP) so the browser can read it without CORS issues.
 */
var DSR_SHEET_TABS = ["Creative_DSR", "Sales_DSR", "Events_DSR", "Operations_DSR", "Accounts_DSR"];

function readAllDsrSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var out = [];
  var sheets = ss.getSheets();
  for (var s = 0; s < sheets.length; s++) {
    var sheet = sheets[s];
    var name = sheet.getName();
    if (DSR_SHEET_TABS.indexOf(name) === -1) continue;

    var lastRow = sheet.getLastRow();
    var lastCol = sheet.getLastColumn();
    if (lastRow < 2 || lastCol < 1) {
      out.push({ sheetName: name, headers: [], rows: [] });
      continue;
    }

    var range = sheet.getRange(1, 1, lastRow, lastCol);
    // Read BOTH: actual typed values (real Date objects, unambiguous) and
    // display values (formatted text, exactly as it looks in the sheet —
    // needed for hand-typed text that isn't a real date/time).
    var rawValues = range.getValues();
    var displayValues = range.getDisplayValues();

    var headers = displayValues[0].map(function (h) { return String(h).trim(); });

    var rows = [];
    for (var r = 1; r < displayValues.length; r++) {
      if (displayValues[r].join("").trim() === "") continue;
      var rowOut = [];
      for (var c = 0; c < displayValues[r].length; c++) {
        var rawCell = rawValues[r][c];
        if (Object.prototype.toString.call(rawCell) === "[object Date]") {
          // A real Date/Timestamp cell — export as full ISO 8601 so the
          // exact instant (including AM/PM) is never ambiguous. Exporting
          // this as a plain display string like "5:30:00" (no AM/PM shown)
          // is what previously caused 5:30 PM submissions to show up as
          // 5:30 AM in the dashboard — the AM/PM info was already lost
          // before it ever reached the app.
          rowOut.push(rawCell.toISOString());
        } else {
          rowOut.push(displayValues[r][c]);
        }
      }
      rows.push(rowOut);
    }
    out.push({ sheetName: name, headers: headers, rows: rows });
  }
  return out;
}

function doGet(e) {
  var callback = (e && e.parameter && e.parameter.callback) ? e.parameter.callback : null;
  var payload;
  try {
    payload = {
      status: "success",
      fetchedAt: new Date().toISOString(),
      sheets: readAllDsrSheets()
    };
  } catch (err) {
    payload = { status: "error", message: err.message };
  }

  var json = JSON.stringify(payload);
  if (callback) {
    return ContentService.createTextOutput(callback + "(" + json + ");")
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(json)
    .setMimeType(ContentService.MimeType.JSON);
}
