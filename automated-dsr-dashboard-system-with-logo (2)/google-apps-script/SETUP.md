# Connecting DSR Flow Portal to Google Sheets

## What was actually wrong

You shared your real deployed Apps Script (`Code.gs` in this folder — this
IS the correct, working script). The problem was never your script — it was
that the **app was sending the wrong payload shape**.

Your `doPost` expects:
```json
{ "sheet": { "sheetName": "Creative_DSR", "headers": [...], "row": [...] } }
```

But the app was sending its own internal submission object directly
(`{id, userId, employeeName, department, date, fields: {...}}`), which
doesn't have a `.sheet` property at all. Your script correctly detected this
and returned `{"status":"error","message":"Missing sheet payload"}` every
single time — but the app's *previous* version used `mode: "no-cors"`,
which throws away that response, so it always showed "Successfully saved!"
even though nothing was written. That combination is exactly why data
never appeared in the Sheet.

## What's fixed now

1. The app now builds the exact shape your script expects: `headers` is
   `["Date", "Employee Name", "Department", ...each field's question label]`
   and `row` is the matching values, per department tab
   (`Creative_DSR`, `Sales_DSR`, `Events_DSR`, `Operations_DSR`,
   `Accounts_DSR`).
2. The app reads the real response instead of firing blind (`no-cors` is
   gone), and now recognizes your script's actual error shape
   (`{status:"error", message:"..."}`) — so if anything does fail, the
   employee sees the real reason immediately instead of a false "success."
3. Failed writes are queued locally and retried automatically once the
   connection is confirmed healthy (Admin → Google Sheets Connection Link
   tab shows this queue and a manual "Retry Now" button).

## A caveat about "is the URL reachable" — please verify in your own browser

I tested this URL (and the one before it) directly from my side, repeatedly,
and got a 404 every time. But since **two different, freshly-deployed URLs
both came back 404 from my testing tool**, that pattern points to my
automated fetch being blocked or treated as suspicious traffic by Google
(a common thing for non-browser/datacenter requests hitting
script.google.com), rather than proof that your deployment is actually
broken. I can no longer treat my own test result as reliable for this
specific domain — **please verify by pasting the URL directly into a normal
browser tab yourself**:
```
https://script.google.com/macros/s/AKfycbzp_z3iDlugWfQivfl1gxUaUQ_57B3nGW7zUY4BTPJb58mpsbS00ZI5N9aPVTV9cq9ZcQ/exec
```
- If it shows JSON (starts with `{"status":"success"...`), the deployment is
  fine — the app should now sync correctly with this update, and if it
  still doesn't, the issue is something else (see below).
- If your own browser also shows a 404 or an error page, then follow the
  steps below.

If it turns out the deployment does need fixing:

1. Open your Sheet → **Extensions → Apps Script**.
2. Confirm the code there matches `Code.gs` in this folder.
3. **Deploy → Manage deployments** → click the pencil/edit icon on your
   existing Web App deployment (do **not** create a brand new deployment —
   that generates yet another different URL).
4. Set **Version: New version**, confirm **Execute as: Me** and
   **Who has access: Anyone**, then click **Deploy**.
5. Copy the `/exec` URL shown. If it's different from the one above, send
   it to me (or update `DEFAULT_GOOGLE_SHEET_URL` near the top of
   `src/components/DsrDashboard.tsx` yourself) and rebuild.

### About the `pubhtml` link you also sent

```
https://docs.google.com/spreadsheets/d/e/.../pubhtml
```
This is a **"Publish to web" static snapshot** of the spreadsheet — a
read-only web page Google regenerates periodically. It has nothing to do
with the Apps Script Web App and the app can't use it to read or write live
data (there's no JSON endpoint, and it's not real-time). It's fine as a
human-readable link to glance at the sheet in a browser, but the app must
keep using the `/exec` Apps Script URL above for actual syncing.


## Sheet structure

Each department's tab (`Creative_DSR`, `Sales_DSR`, `Events_DSR`,
`Operations_DSR`, `Accounts_DSR`) will have its header row automatically
kept in sync with: `Date, Employee Name, Department, Created At`, followed
by that department's question labels, in order. One row per employee per
day — resubmitting the same day updates that row instead of duplicating it.

## "I submitted at 5:30 PM but the dashboard shows 5:30 AM"

This is a timezone/format issue, not a bug in the timing rule itself. Here's
exactly what was happening and what's now fixed:

1. **The app wasn't sending a real timestamp to the sheet at all** — only
   the reporting date (e.g. "2026-09-19"), with no time-of-day. So once the
   dashboard re-synced from the sheet (which happens automatically), it had
   no way to know when you actually submitted. This is fixed: the app now
   also writes a `Created At` column with the exact submission instant.
2. **`Code.gs`'s `readAllDsrSheets()` was using `getDisplayValues()` for
   every cell**, which returns the date/time exactly as Google Sheets
   *displays* it — including whatever number format that column happens to
   have. If a time column's format doesn't include an AM/PM marker (e.g. it
   shows `5:30:00` instead of `5:30:00 PM`), that information is
   permanently gone by the time it leaves the sheet — no amount of fixing
   on the app's side can recover an AM/PM that was never sent. This is
   almost certainly what caused your 5:30 PM entry to show as 5:30 AM.

**Fix applied:** `readAllDsrSheets()` now reads both the display values
*and* the raw values for every cell. For any cell that's a real Date/Time
cell in Sheets, it exports the raw value as a full ISO 8601 timestamp
(unambiguous — no display formatting involved), instead of the
locale-formatted text. Hand-typed text cells are unaffected and still come
through exactly as typed.

**You'll need to redeploy** for this fix to take effect: paste the updated
`Code.gs` into your Apps Script project (Extensions → Apps Script), then
Deploy → Manage deployments → edit your existing deployment → New version →
Deploy. This only affects newly-read data going forward — it can't retroactively
fix AM/PM on rows that were already saved with the ambiguous format, since
that information is already gone from the sheet. Going forward, both the
app's own writes (with the new `Created At` column) and correctly-formatted
manual entries will show the right time.

## "Data is in the Sheet but the dashboard isn't showing it"

If your own browser test above (pasting the `/exec` URL directly) shows
real JSON, then this update should fix it — click "Refresh Now" in the
Admin → Google Sheets Connection Link tab. If it's still not showing after
that, screenshot the exact status/error text shown there and share it —
that'll tell us precisely what's happening rather than guessing further.
