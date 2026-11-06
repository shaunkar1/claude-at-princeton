/**
 * Claude@Princeton: artifact submissions.
 *
 * This script turns the "Claude@Princeton artifact submissions" Google Sheet into the site's
 * backend. The site posts each new artifact here and reads artifacts back; the Sheet is the
 * database. Setup steps are in README.md under "Artifact submissions".
 *
 * Every submission starts unapproved. Its own page (#artifact/<id>) works right away with a
 * "waiting for review" note, and it joins the site's gallery once a lead ticks Approved.
 * Delete a row to take an artifact down. Only the columns in PUBLIC are ever sent to the
 * site, so the Email column stays private. Don't reorder the columns. Columns after these
 * (such as Notes) are ignored, so leads can keep private notes there.
 */

const SHEET_NAME = "Submissions";

// Column order in the Sheet: [key used by the site, header shown in the Sheet].
const COLUMNS = [
  ["id", "ID"],
  ["submittedAt", "Submitted"],
  ["approved", "Approved"],
  ["title", "Title"],
  ["name", "Name"],
  ["url", "Artifact link"],
  ["description", "What it does"],
  ["story", "Why and how they built it"],
  ["prompt", "Starting prompt"],
  ["email", "Email (private)"],
];
const PUBLIC = ["id", "submittedAt", "approved", "title", "name", "url", "description", "story", "prompt"];
const LIMITS = { title: 80, name: 80, url: 500, description: 600, story: 3000, prompt: 3000, email: 120 };
const REQUIRED = ["title", "name", "url", "description"];
// Published Claude artifacts live on claude.ai (older ones on claude.site).
const ARTIFACT_URL = /^https:\/\/(www\.)?claude\.(ai|site)\/\S+$/;

/** Run once from the editor (select "setup", then Run). It also asks for the permissions the web app needs. */
function setup() {
  const sheet = getSheet_();
  sheet.getRange(1, 1, 1, COLUMNS.length).setValues([COLUMNS.map((c) => c[1])]).setFontWeight("bold");
  sheet.setFrozenRows(1);
  // Unchecked boxes down the Approved column, ready for leads to tick.
  const checkbox = SpreadsheetApp.newDataValidation().requireCheckbox().build();
  sheet.getRange(2, column_("approved"), sheet.getMaxRows() - 1, 1).setDataValidation(checkbox);
}

/** GET ?id=<id> returns one artifact (approved or not). GET with no id returns the approved ones, newest first. */
function doGet(e) {
  const id = String((e && e.parameter && e.parameter.id) || "").trim();
  const rows = readRows_();
  if (id) {
    const row = rows.find((r) => r.id === id);
    return json_(row ? { ok: true, artifact: toPublic_(row) } : { ok: false, error: "not_found" });
  }
  return json_({ ok: true, artifacts: rows.filter((r) => r.approved === true).map(toPublic_).reverse() });
}

/** POST a JSON body (sent as text/plain so browsers skip the CORS preflight). Returns the new artifact's id. */
function doPost(e) {
  let data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return json_({ ok: false, error: "bad_request" });
  }
  if (data.website) return json_({ ok: true, id: "" }); // honeypot: only bots fill the hidden field

  const clean = {};
  Object.keys(LIMITS).forEach((k) => { clean[k] = String(data[k] || "").trim().slice(0, LIMITS[k]); });
  if (REQUIRED.some((k) => !clean[k])) return json_({ ok: false, error: "missing_fields" });
  if (!ARTIFACT_URL.test(clean.url)) return json_({ ok: false, error: "bad_url" });
  if (clean.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean.email)) return json_({ ok: false, error: "bad_email" });

  // One submission writes at a time, so two people sharing at once never get the same row.
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) return json_({ ok: false, error: "busy" });
  try {
    const sheet = getSheet_();
    const ids = sheet.getRange(1, 1, sheet.getMaxRows(), 1).getValues().map((r) => String(r[0]));
    // The site sends its own id and retries when Google is slow. If that id is already saved
    // with the same title and link, this is a retry of a request that got through: return it.
    const wanted = /^[a-z0-9-]{3,60}$/.test(String(data.id || "")) ? String(data.id) : "";
    const at = wanted ? ids.indexOf(wanted) : -1;
    if (at > 0) {
      const saved = sheet.getRange(at + 1, 1, 1, COLUMNS.length).getValues()[0];
      if (saved[column_("title") - 1] === clean.title && saved[column_("url") - 1] === clean.url) return json_({ ok: true, id: wanted });
    }
    let id = wanted && at === -1 ? wanted : makeId_(clean.title);
    while (ids.includes(id)) id = makeId_(clean.title);
    const row = nextRow_(sheet, ids);
    sheet.getRange(row, 1, 1, COLUMNS.length).setValues([COLUMNS.map(([key]) => {
      if (key === "id") return id;
      if (key === "submittedAt") return new Date();
      if (key === "approved") return false;
      return asText_(clean[key]);
    })]);
    sheet.getRange(row, column_("approved")).insertCheckboxes();
    SpreadsheetApp.flush(); // write the row before the next submission reads the sheet
    return json_({ ok: true, id: id });
  } finally {
    lock.releaseLock();
  }
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0].setName(SHEET_NAME);
}

// The row after the last ID (ids is column A, top to bottom). Not appendRow() or getLastRow():
// an unchecked checkbox counts as content, so those would put every submission below the last
// empty checkbox.
function nextRow_(sheet, ids) {
  let last = ids.length;
  while (last > 1 && ids[last - 1] === "") last--;
  if (last === sheet.getMaxRows()) sheet.insertRowsAfter(last, 100);
  return last + 1;
}

function column_(key) {
  return COLUMNS.findIndex((c) => c[0] === key) + 1;
}

function readRows_() {
  const values = getSheet_().getDataRange().getValues().slice(1);
  return values
    .filter((r) => r[0])
    .map((r) => {
      const row = {};
      COLUMNS.forEach(([key], i) => { row[key] = r[i]; });
      row.id = String(row.id);
      return row;
    });
}

function toPublic_(row) {
  const out = {};
  PUBLIC.forEach((k) => {
    const v = row[k];
    out[k] = v instanceof Date ? v.toISOString() : v === undefined || v === null ? "" : String(v);
  });
  out.approved = row.approved === true;
  return out;
}

// "Cool dining app" -> "cool-dining-app-k3x9p". The random end keeps links unguessable and unique.
function makeId_(title) {
  const base = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+/, "").slice(0, 40).replace(/-+$/, "") || "artifact";
  const chars = "abcdefghijkmnpqrstuvwxyz23456789";
  let suffix = "";
  for (let i = 0; i < 5; i++) suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  return base + "-" + suffix;
}

// A leading apostrophe stops Sheets from treating text such as "=IMPORTXML(...)" as a formula.
function asText_(value) {
  return /^[=+\-@]/.test(value) ? "'" + value : value;
}

function json_(body) {
  return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(ContentService.MimeType.JSON);
}
