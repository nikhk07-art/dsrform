"use client";

import React, { useState, useEffect } from "react";
import { 
  User, 
  Lock, 
  FileText, 
  LayoutDashboard, 
  Users, 
  FileSpreadsheet, 
  Search, 
  Filter, 
  Download, 
  CheckCircle, 
  Clock, 
  RefreshCw, 
  ArrowRight, 
  Copy, 
  KeyRound,
  Eye,
  LogOut,
  Sparkles,
  X,
  FileCheck,
  AlertTriangle,
  FileSpreadsheet as SheetIcon
} from "lucide-react";
import ccLogo from "../assets/corporate-culture-logo.png";

// PERMANENT Google Sheet connection — this is the single source of truth for
// syncing DSR submissions across every device/browser. Admin & Management see
// data pulled live from this sheet (via doGet), not just their own browser's
// local cache. Override only if you redeploy the Apps Script and get a new URL.
const DEFAULT_GOOGLE_SHEET_URL =
  "https://script.google.com/macros/s/AKfycbzp_z3iDlugWfQivfl1gxUaUQ_57B3nGW7zUY4BTPJb58mpsbS00ZI5N9aPVTV9cq9ZcQ/exec";

interface FieldDef {
  id: string;
  label: string;
  type: string;
  default: string;
}

interface DeptSchema {
  title: string;
  subtitle: string;
  subject: string;
  theme: {
    bg: string;
    text: string;
    accent: string;
    border: string;
    accentBg: string;
    accentText: string;
    badge: string;
  };
  fields: FieldDef[];
  note?: string;
}

// Active Employees List: Manoj Menon is COMPLETELY REMOVED!
const DEFAULT_EMPLOYEES = [
  { id: 1, name: "Shradha Bayas", department: "Admin", role: "admin", pin: "1234" },
  { id: 2, name: "Atul Ranjan", department: "Management", role: "admin", pin: "1234" },
  { id: 3, name: "Shalu Richard", department: "Management", role: "admin", pin: "1234" },
  
  { id: 4, name: "Shivraj Patil", department: "Event", role: "user", pin: "" },
  { id: 5, name: "Siddheshwar Gomase", department: "Event", role: "user", pin: "" },
  { id: 6, name: "Arjun Gupta", department: "Sales", role: "user", pin: "" },
  { id: 7, name: "Rajit Dey", department: "Sales", role: "user", pin: "" },
  { id: 8, name: "Shruti Sutar", department: "Sales", role: "user", pin: "" },
  { id: 9, name: "Prakash Thapa", department: "Sales", role: "user", pin: "" },
  { id: 10, name: "Siddharth Shende", department: "Accounts", role: "user", pin: "" },
  { id: 11, name: "Saurabh Dhamne", department: "Accounts/Purchase", role: "user", pin: "" },
  { id: 12, name: "Subhransu Mahadani", department: "Creative", role: "user", pin: "" },
  { id: 13, name: "Gayatri Patil", department: "Creative", role: "user", pin: "" },
  { id: 14, name: "Aditya Bangar", department: "Operation", role: "user", pin: "" },
];

const DEPARTMENT_SCHEMAS: Record<string, DeptSchema> = {
  Creative: {
    title: "CREATIVE DSR FORMAT",
    subtitle: "Daily status report",
    subject: "Creative DSR",
    theme: {
      bg: "bg-indigo-900",
      text: "text-indigo-50",
      accent: "indigo",
      border: "border-indigo-200",
      accentBg: "bg-indigo-50",
      accentText: "text-indigo-700",
      badge: "bg-indigo-100 text-indigo-800"
    },
    fields: [
      { id: "briefs_received", label: "1. Briefs received today", type: "textarea", default: "" },
      { id: "brief_in_writing", label: "2. Brief received in writing?", type: "text", default: "Yes" },
      { id: "designs_completed", label: "3. Designs completed and shared today", type: "textarea", default: "Yes" },
      { id: "revisions_done", label: "4. Revisions done today", type: "text", default: "NA" },
      { id: "social_media_published", label: "5. Social media post published today", type: "text", default: "Done" },
      { id: "designs_pending", label: "6. Designs pending", type: "text", default: "NA" },
      { id: "brief_issues", label: "7. Any brief issue to flag", type: "text", default: "NA" },
    ]
  },
  Sales: {
    title: "SALES DSR FORMAT",
    subtitle: "Daily status report",
    subject: "Sales DSR — [Name] — [Date]",
    theme: {
      bg: "bg-emerald-900",
      text: "text-emerald-50",
      accent: "emerald",
      border: "border-emerald-200",
      accentBg: "bg-emerald-50",
      accentText: "text-emerald-700",
      badge: "bg-emerald-100 text-emerald-800"
    },
    note: "NOTE FOR ATUL SIR: Field 8 is specifically for you. Whenever you start working on a new client or have a client conversation — please fill this field so Shradha can coordinate the team and hotels properly without having to follow up separately.",
    fields: [
      { id: "calls_meetings", label: "1. Calls / meetings done today", type: "textarea", default: "" },
      { id: "new_leads", label: "2. New leads added", type: "text", default: "N" },
      { id: "quotations_prepared", label: "3. Quotations prepared / shared today", type: "textarea", default: "" },
      { id: "proposals_sent", label: "4. Proposals sent", type: "textarea", default: "" },
      { id: "follow_ups", label: "5. Follow ups done", type: "textarea", default: "" },
      { id: "pipeline_stage_change", label: "6. Pipeline stage change", type: "textarea", default: "" },
      { id: "deal_closed", label: "7. Deal closed today", type: "text", default: "N" },
      { id: "client_working_on", label: "8. Client working on", type: "textarea", default: "" },
      { id: "tomorrow_plan", label: "9. Tomorrow's plan", type: "textarea", default: "" },
      { id: "issues_to_flag", label: "10. Any issue to flag", type: "text", default: "N" },
    ]
  },
  Event: {
    title: "EVENTS DSR FORMAT",
    subtitle: "Daily status report",
    subject: "Events DSR — [Name] — [Date]",
    theme: {
      bg: "bg-red-955",
      text: "text-red-50",
      accent: "red",
      border: "border-red-200",
      accentBg: "bg-red-50",
      accentText: "text-red-700",
      badge: "bg-red-100 text-red-800"
    },
    fields: [
      { id: "event_project_working", label: "1. Event / project I am working on today", type: "textarea", default: "" },
      { id: "tasks_completed", label: "2. Tasks completed today", type: "text", default: "Yes" },
      { id: "quotations_prepared", label: "3. Quotations prepared today", type: "text", default: "Yes" },
      { id: "vendors_coordinated", label: "4. Vendors coordinated today", type: "text", default: "Yes" },
      { id: "client_communication", label: "5. Client communication done", type: "text", default: "Yes" },
      { id: "design_brief_submitted", label: "6. Design brief submitted today", type: "text", default: "Yes" },
      { id: "ground_vendor_issues", label: "7. Any issue on ground or with vendor", type: "text", default: "NO" },
      { id: "pending_items", label: "8. Pending items", type: "text", default: "NA" },
      { id: "tomorrow_plan", label: "9. Tomorrow's plan", type: "textarea", default: "" },
    ]
  },
  Accounts: {
    title: "Bookkeeping & Transaction Accounting Format",
    subtitle: "Daily status report",
    subject: "Accounts DSR",
    theme: {
      bg: "bg-slate-900",
      text: "text-slate-50",
      accent: "slate",
      border: "border-slate-200",
      accentBg: "bg-slate-50",
      accentText: "text-slate-700",
      badge: "bg-slate-100 text-slate-800"
    },
    fields: [
      { id: "tally_entries", label: "1. Accounting entries recorded in Tally today", type: "textarea", default: "Daily Entries" },
      { id: "vendor_invoices_tds", label: "2. Vendor invoices / TDS entries recorded", type: "textarea", default: "" },
      { id: "bookkeeping", label: "3. Bookkeeping", type: "text", default: "Nill" },
      { id: "employee_event_expense", label: "4. Employee event expense recorded", type: "text", default: "Nill" },
      { id: "credit_card_entries", label: "5. Credit card entries done", type: "text", default: "Yes" },
      { id: "electricity_expenses", label: "6. Electricity expenses recorded", type: "textarea", default: "All Electricity payable entries pending" },
      { id: "telephone_expenses", label: "7. Telephone expenses entries record", type: "textarea", default: "Telephonee bill & recharge payable pending, With AR & SR today payment" },
      { id: "payroll_reimbursements", label: "8. Payroll / reimbursement entries done", type: "text", default: "Nill" },
      { id: "bank_reconciliation", label: "9. Bank reconciliation status", type: "text", default: "Nill" },
      { id: "tds_working", label: "10. TDS working", type: "text", default: "Nill" },
      { id: "tds_payment", label: "11. TDS Payment", type: "text", default: "Nill" },
      { id: "gst_payment", label: "12. GST Payment", type: "text", default: "Nill" },
      { id: "other_work", label: "13. Other Work", type: "text", default: "Nill" },
      { id: "ledger_reconciliation_discrepancy", label: "14. Ledger / reconciliation discrepancy found", type: "text", default: "-" },
      { id: "pending_items", label: "15. Pending items", type: "text", default: "-" },
      { id: "tomorrow_priority", label: "16. Tomorrow's priority", type: "text", default: "-" },
    ]
  },
  Operation: {
    title: "OPERATIONS DSR FORMAT",
    subtitle: "Daily status report",
    subject: "Operations DSR",
    theme: {
      bg: "bg-amber-900",
      text: "text-amber-50",
      accent: "amber",
      border: "border-amber-200",
      accentBg: "bg-amber-50",
      accentText: "text-amber-700",
      badge: "bg-amber-100 text-amber-800"
    },
    fields: [
      { id: "event_client_working", label: "1. Event / client I am working on today", type: "textarea", default: "" },
      { id: "hotels_venues_checked", label: "2. Hotels / venues checked or confirmed", type: "textarea", default: "" },
      { id: "vendors_confirmed", label: "3. Vendors confirmed today", type: "textarea", default: "" },
      { id: "quotations_prepared", label: "4. Quotations prepared today", type: "textarea", default: "" },
      { id: "flights_transport_arranged", label: "5. Flights / transport arranged", type: "text", default: "No" },
      { id: "pis_submitted_finance", label: "6. PIs submitted to Finance today", type: "text", default: "Vendor name + amount" },
      { id: "bookings_pending", label: "7. Bookings still pending", type: "text", default: "Yes" },
      { id: "issues_delays", label: "8. Any issue or delay to flag", type: "text", default: "No" },
      { id: "tomorrow_priority", label: "9. Tomorrow's priority", type: "textarea", default: "" },
    ]
  }
};

function getDepartmentSchemaKey(dept: string): "Creative" | "Sales" | "Event" | "Accounts" | "Operation" {
  if (dept.startsWith("Accounts")) return "Accounts";
  if (dept.startsWith("Operation")) return "Operation";
  if (dept === "Creative") return "Creative";
  if (dept === "Sales") return "Sales";
  return "Event";
}

// Maps a Google Sheet tab name back to the department name the app uses.
const SHEET_TAB_TO_DEPARTMENT: Record<string, string> = {
  "Creative_DSR": "Creative",
  "Sales_DSR": "Sales",
  "Events_DSR": "Event",
  "Operations_DSR": "Operation",
  "Accounts_DSR": "Accounts",
};

// Forward direction: department name -> the tab it should be written to.
function departmentToSheetTabName(department: string): string {
  const schemaKey = getDepartmentSchemaKey(department || "Event");
  const map: Record<string, string> = {
    Creative: "Creative_DSR",
    Sales: "Sales_DSR",
    Event: "Events_DSR",
    Operation: "Operations_DSR",
    Accounts: "Accounts_DSR",
  };
  return map[schemaKey] || "Other_DSR";
}

// Builds the exact { sheet: { sheetName, headers, row } } shape this
// project's Apps Script doPost expects — headers are Date, Employee Name,
// Department, Created At, then every schema field's label in order; row is
// the matching values. The script auto-corrects the sheet's header row to
// whatever we send, so this stays correct even if the sheet's headers drift.
// "Created At" carries the exact submission instant (ISO 8601) so Early /
// On-time / Late stays accurate even after this row round-trips back out of
// the sheet — without it, only the reporting DATE would survive, and the
// time-of-day (needed for that status) would be permanently lost.
function buildSheetWritePayload(payload: { department: string; employeeName: string; date: string; fields: Record<string, any>; createdAt?: string }) {
  const schemaKey = getDepartmentSchemaKey(payload.department || "Event");
  const schema = DEPARTMENT_SCHEMAS[schemaKey];
  const fieldHeaders = schema ? schema.fields.map((f: FieldDef) => f.label) : [];
  const fieldIds = schema ? schema.fields.map((f: FieldDef) => f.id) : [];

  const headers = ["Date", "Employee Name", "Department", "Created At", ...fieldHeaders];
  const row = [
    payload.date,
    payload.employeeName,
    payload.department,
    payload.createdAt || new Date().toISOString(),
    ...fieldIds.map((id) => (payload.fields && payload.fields[id] != null ? String(payload.fields[id]) : "")),
  ];

  return {
    sheet: {
      sheetName: departmentToSheetTabName(payload.department),
      headers,
      row,
    },
  };
}

// Turns "1. Briefs received today" or "Employee Name" into a stable,
// comparable key: lowercase, numbering stripped, non-alphanumerics collapsed.
function slugifyLabel(label: string): string {
  return String(label || "")
    .toLowerCase()
    .replace(/^\s*\d+[.)]\s*/, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

// Best-effort parse of whatever a spreadsheet cell holds into a yyyy-mm-dd
// string, since Apps Script may serialize Date cells as full ISO timestamps
// or as locale-formatted strings depending on how the sheet was built.
function normalizeSheetDate(raw: any): string {
  if (!raw) return "";
  const s = String(raw).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const parsed = new Date(s);
  if (!isNaN(parsed.getTime())) {
    const tzOffset = parsed.getTimezoneOffset() * 60000;
    return new Date(parsed.getTime() - tzOffset).toISOString().slice(0, 10);
  }
  return s;
}

export default function DsrDashboard() {
  const [employees, setEmployees] = useState<any[]>(DEFAULT_EMPLOYEES);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Authentication states
  const [selectedEmpId, setSelectedEmpId] = useState<string>("");
  const [enteredPin, setEnteredPin] = useState<string>("");
  const [loginError, setLoginError] = useState<string>("");
  const [showPinModal, setShowPinModal] = useState<boolean>(false);


  // Custom PIN states
  const [pinChangeCurrent, setPinChangeCurrent] = useState<string>("");
  const [pinChangeNew, setPinChangeNew] = useState<string>("");
  const [pinChangeSuccess, setPinChangeSuccess] = useState<string>("");
  const [pinChangeError, setPinChangeError] = useState<string>("");

  // DSR Form states
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitSuccessMsg, setSubmitSuccessMsg] = useState<string>("");
  const [submitErrorMsg, setSubmitErrorMsg] = useState<string>("");
  const [isSubmittedSuccessfully, setIsSubmittedSuccessfully] = useState<boolean>(false);

  // Submissions list
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<string>("form"); 
  const [viewingSubmission, setViewingSubmission] = useState<any>(null);

  // Dedicated client-side Interactive Preview Overlay Modal
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);

  // Mobile layout preview tabs
  const [mobileViewTab, setMobileViewTab] = useState<"edit" | "preview">("edit");

  // Admin filter states
  const [adminFilterDept, setAdminFilterDept] = useState<string>("All");
  const [adminFilterEmpId, setAdminFilterEmpId] = useState<string>("");
  const [adminFilterDate, setAdminFilterDate] = useState<string>("");
  const [adminSearchQuery, setAdminSearchQuery] = useState<string>("");

  // NEW tabs inside Admin Dashboard (Compliance Grid vs Excel Daily Submission Log vs Defaulters)
  const [adminSubTab, setAdminSubTab] = useState<"grid" | "excel-log" | "defaulters">("grid");

  // Excel log filter basis timeframe ("daily", "weekly", "monthly")
  const [excelTimeframe, setExcelTimeframe] = useState<"daily" | "weekly" | "monthly">("daily");

  // Live Google Sheets webhook configuration states
  const [webhookUrl, setWebhookUrl] = useState<string>(DEFAULT_GOOGLE_SHEET_URL);
  const [savingWebhook, setSavingWebhook] = useState<boolean>(false);
  const [webhookSaveMsg, setWebhookSaveMsg] = useState<string>("");

  // Live sync status: whether we can currently read data back from the sheet
  const [sheetSyncStatus, setSheetSyncStatus] = useState<"idle" | "syncing" | "connected" | "error">("idle");
  const [sheetSyncError, setSheetSyncError] = useState<string>("");
  const [lastSyncedAt, setLastSyncedAt] = useState<string>("");

  // Whether the most recent form submission actually made it into the sheet
  const [sheetWriteStatus, setSheetWriteStatus] = useState<"idle" | "ok" | "error">("idle");
  const [sheetWriteError, setSheetWriteError] = useState<string>("");

  const isPinRequiredForSelected = () => {
    if (!selectedEmpId) return false;
    const emp = employees.find((e) => String(e.id) === selectedEmpId);
    return emp?.role === "admin"; 
  };

  useEffect(() => {
    const today = new Date();
    const tzOffset = today.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(today.getTime() - tzOffset)).toISOString().slice(0, 10);
    setSelectedDate(localISOTime);

    // Load connection URL — always fall back to the permanent default so the
    // app is connected to Google Sheets out of the box on every browser/device.
    // If a browser has an OLD default cached (from a previous deployment that
    // stopped working), auto-upgrade it to the current default rather than
    // getting stuck on a dead URL forever. A genuinely custom URL an admin
    // typed in on purpose (i.e. not one of our own past defaults) is left alone.
    const KNOWN_OLD_DEFAULT_URLS = [
      "https://script.google.com/macros/s/AKfycbx7uLOSQLIWd6tvkdjAKJaSPeRVq_FV9NgP3pxUBzugcvbQyTiz8dnMTLsJjnJtJ2zurg/exec",
    ];
    const savedUrl = localStorage.getItem("dsr_google_sheet_url");
    const savedUrlIsStale = !!savedUrl && KNOWN_OLD_DEFAULT_URLS.includes(savedUrl.trim());
    const resolvedUrl = savedUrl && savedUrl.trim().length > 0 && !savedUrlIsStale ? savedUrl.trim() : DEFAULT_GOOGLE_SHEET_URL;
    setWebhookUrl(resolvedUrl);
    localStorage.setItem("dsr_google_sheet_url", resolvedUrl);

    // Initialize mock data in submissions_db if empty
    let currentDb: any[] = [];
    const savedSubs = localStorage.getItem("dsr_submissions_db");
    if (savedSubs) {
      try {
        currentDb = JSON.parse(savedSubs);
      } catch (e) {
        currentDb = [];
      }
    }

    if (currentDb.length === 0) {
      setSubmissions([]);
    } else {
      setSubmissions(currentDb);
    }

    // Check existing login session
    const storedUser = localStorage.getItem("dsr_session_user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setCurrentUser(parsed);
        if (parsed.role === "admin") {
          setActiveTab("dashboard");
        } else {
          setActiveTab("form");
        }
      } catch (e) {
        localStorage.removeItem("dsr_session_user");
      }
    }
  }, []);

  // Pull live data from the connected Google Sheet as soon as the app loads,
  // so previous submissions are visible immediately (not just after a manual save).
  useEffect(() => {
    syncSubmissionsFromSheet(false);
  }, []);

  // While an Admin/Management user has the dashboard open, keep it live —
  // refresh from the Google Sheet immediately and then every 30 seconds.
  useEffect(() => {
    if (!currentUser || currentUser.role !== "admin" || activeTab !== "dashboard") return;

    syncSubmissionsFromSheet(true);
    const intervalId = setInterval(() => syncSubmissionsFromSheet(false), 30000);
    return () => clearInterval(intervalId);
  }, [currentUser, activeTab]);

  useEffect(() => {
    if (!currentUser) return;

    const schemaKey = getDepartmentSchemaKey(currentUser.department);
    const schema = DEPARTMENT_SCHEMAS[schemaKey];
    if (!schema) return;

    const defaults: Record<string, string> = {};
    schema.fields.forEach((f: FieldDef) => {
      defaults[f.id] = f.default;
    });
    setFormData(defaults);
    setSubmitSuccessMsg("");
    setSubmitErrorMsg("");
    setIsSubmittedSuccessfully(false);
  }, [selectedDate, currentUser]);

  // Queue of submissions that saved locally but failed to reach the Google
  // Sheet — retried automatically whenever the connection is confirmed working.
  const getPendingSheetWrites = (): any[] => {
    try {
      const raw = localStorage.getItem("dsr_pending_sheet_writes");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  const setPendingSheetWrites = (items: any[]) => {
    localStorage.setItem("dsr_pending_sheet_writes", JSON.stringify(items));
  };

  const postSubmissionToSheet = async (submissionPayload: any, url: string): Promise<{ ok: boolean; error: string }> => {
    // This project's Apps Script doPost expects { sheet: { sheetName, headers, row } },
    // not the flat submission object — build that shape here.
    const wirePayload = buildSheetWritePayload(submissionPayload);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(wirePayload),
      });
      const rawText = await res.text();
      if (!res.ok) return { ok: false, error: `Sheet responded with HTTP ${res.status}` };
      try {
        const parsed = JSON.parse(rawText);
        // The deployed script returns {status:"error", message:"..."} on
        // failure (a different shape than our own Code.gs's {ok:false}) —
        // check both so real errors are never silently treated as success.
        if (parsed && (parsed.ok === false || parsed.status === "error")) {
          return { ok: false, error: `Google Apps Script error: ${parsed.message || parsed.error || "unknown error"}` };
        }
      } catch {
        // Non-JSON response body — still treat as delivered.
      }
      return { ok: true, error: "" };
    } catch (err: any) {
      return { ok: false, error: err?.message || "Network error reaching Google Sheet." };
    }
  };

  const flushPendingSheetWrites = async (url: string) => {
    const pending = getPendingSheetWrites();
    if (pending.length === 0) return;

    const stillPending: any[] = [];
    for (const item of pending) {
      const result = await postSubmissionToSheet(item, url);
      if (!result.ok) stillPending.push(item);
    }
    setPendingSheetWrites(stillPending);
    if (stillPending.length < pending.length) {
      // Something new made it in — refresh the shared view.
      syncSubmissionsFromSheet(false);
    }
  };

  const fetchSystemSettings = () => {
    const savedUrl = localStorage.getItem("dsr_google_sheet_url") || DEFAULT_GOOGLE_SHEET_URL;
    setWebhookUrl(savedUrl);
  };

  // Pull ALL submissions back from the connected Google Sheet (via the Apps
  // Script's doGet endpoint) so Admin & Management see every department's
  // data from every device — not just what happens to be cached in this
  // browser's localStorage.
  // Converts the site's own {status, sheets:[{sheetName, headers, rows}]}
  // export shape into the flat submission objects the rest of the app
  // expects: { id, userId, employeeName, department, date, subject, fields, createdAt }.
  const mapSheetsPayloadToSubmissions = (parsed: any): any[] => {
    const sheetsArr = Array.isArray(parsed?.sheets) ? parsed.sheets : [];
    const result: any[] = [];

    sheetsArr.forEach((sheetEntry: any) => {
      const sheetName: string = sheetEntry?.sheetName || "";
      const department = SHEET_TAB_TO_DEPARTMENT[sheetName] || sheetName.replace(/_DSR$/i, "");
      const headers: string[] = Array.isArray(sheetEntry?.headers) ? sheetEntry.headers : [];
      const rawRows: any[] = Array.isArray(sheetEntry?.rows) ? sheetEntry.rows : [];

      // Column lookups (case-insensitive, tolerant of naming variations).
      const findHeaderIndex = (...candidates: string[]) =>
        headers.findIndex((h) => candidates.includes(String(h || "").trim().toLowerCase()));
      const dateIdx = findHeaderIndex("date", "reporting date");
      const nameIdx = findHeaderIndex("employee name", "employee", "name");
      const deptIdx = findHeaderIndex("department");
      const timestampIdx = findHeaderIndex("timestamp", "created at", "submitted at", "submission time", "time submitted", "submitted time");

      const schemaKey = getDepartmentSchemaKey(department || "Event");
      const schema = DEPARTMENT_SCHEMAS[schemaKey];
      const labelToFieldId: Record<string, string> = {};
      if (schema) {
        schema.fields.forEach((f: FieldDef) => {
          labelToFieldId[slugifyLabel(f.label)] = f.id;
        });
      }

      // Some sheets end up with duplicate/near-duplicate header text (e.g. a
      // stray extra "Any issue to flag" column with no number prefix, which
      // normalizes to the same key as "10. Any issue to flag"). Decide the
      // header→fieldId mapping ONCE per sheet, first match wins, so a later
      // duplicate column can never silently overwrite real data with blanks.
      const headerIndexToFieldId: Record<number, string> = {};
      const claimedFieldIds = new Set<string>();
      headers.forEach((h, i) => {
        if (i === dateIdx || i === nameIdx || i === deptIdx || i === timestampIdx) return;
        const matchedId = labelToFieldId[slugifyLabel(h)];
        if (matchedId && !claimedFieldIds.has(matchedId)) {
          headerIndexToFieldId[i] = matchedId;
          claimedFieldIds.add(matchedId);
        }
      });

      rawRows.forEach((row: any, rowIdx: number) => {
        // Row can arrive either as an array aligned to `headers`, or already
        // as an object keyed by header name — support both.
        let rowObj: Record<string, any> = {};
        if (Array.isArray(row)) {
          headers.forEach((h, i) => { rowObj[h] = row[i]; });
        } else if (row && typeof row === "object") {
          rowObj = row;
        }

        const employeeName = nameIdx >= 0 ? rowObj[headers[nameIdx]] : rowObj["Employee Name"];
        const rawDate = dateIdx >= 0 ? rowObj[headers[dateIdx]] : rowObj["Date"];
        const dateStr = normalizeSheetDate(rawDate);
        if (!employeeName || !dateStr) return; // skip blank/header-only rows

        const rowDepartment = (deptIdx >= 0 ? rowObj[headers[deptIdx]] : "") || department;
        const matchedEmployee = employees.find(
          (e) => String(e.name).trim().toLowerCase() === String(employeeName).trim().toLowerCase()
        );

        // Prefer an actual submission timestamp column (has a time-of-day,
        // needed for Early/On-time/Late) over the plain reporting date.
        const timestampVal = timestampIdx >= 0 ? rowObj[headers[timestampIdx]] : "";

        const fields: Record<string, string> = {};
        const extras: { label: string; value: string }[] = [];
        headers.forEach((h, i) => {
          if (i === dateIdx || i === nameIdx || i === deptIdx || i === timestampIdx) return;
          const value = rowObj[h];
          if (value === undefined || value === null || value === "") return;
          const matchedId = headerIndexToFieldId[i];
          if (matchedId) {
            fields[matchedId] = String(value);
          } else {
            extras.push({ label: h, value: String(value) });
          }
        });

        result.push({
          id: `${sheetName}_${rowIdx}_${dateStr}`,
          userId: matchedEmployee ? matchedEmployee.id : `sheet:${slugifyLabel(String(employeeName))}`,
          employeeName: String(employeeName),
          department: rowDepartment || department,
          date: dateStr,
          subject: generateSubjectLine(rowDepartment || department, String(employeeName), dateStr),
          fields,
          _rawFields: extras,
          createdAt: timestampVal || rawDate || parsed?.fetchedAt || "",
        });
      });
    });

    return result;
  };

  const syncSubmissionsFromSheet = async (showLoadingState: boolean = true) => {
    const url = (localStorage.getItem("dsr_google_sheet_url") || DEFAULT_GOOGLE_SHEET_URL).trim();
    if (!url) return;

    if (showLoadingState) setSheetSyncStatus("syncing");

    try {
      const res = await fetch(url, { method: "GET" });
      const rawText = await res.text();

      if (!res.ok) {
        throw new Error(`Sheet responded with HTTP ${res.status}`);
      }

      let parsed: any;
      try {
        parsed = JSON.parse(rawText);
      } catch (parseErr) {
        // Not JSON at all — usually means Google returned an HTML page
        // (e.g. a sign-in/permission prompt) instead of your script's output.
        const snippet = rawText.replace(/\s+/g, " ").trim().slice(0, 140);
        throw new Error(`Google Sheet didn't return JSON. Raw response: "${snippet}${rawText.length > 140 ? "..." : ""}"`);
      }

      // Accept a plain array, our own {sheets:[...]} export shape, or a few
      // other common wrapper shapes.
      let data: any[] | null = null;
      if (Array.isArray(parsed)) {
        data = parsed;
      } else if (parsed && Array.isArray(parsed.sheets)) {
        data = mapSheetsPayloadToSubmissions(parsed);
      } else if (parsed && Array.isArray(parsed.data)) {
        data = parsed.data;
      } else if (parsed && Array.isArray(parsed.submissions)) {
        data = parsed.submissions;
      } else if (parsed && Array.isArray(parsed.rows)) {
        data = parsed.rows;
      } else if (parsed && (parsed.ok === false || parsed.status === "error")) {
        // This is the error shape the deployed script returns when it
        // itself threw an exception — surface that real message directly.
        throw new Error(`Google Apps Script error: ${parsed.message || parsed.error || "unknown error"}`);
      }

      if (!data) {
        const snippet = JSON.stringify(parsed).slice(0, 140);
        throw new Error(`Unexpected response shape from Google Sheet: ${snippet}`);
      }

      setSubmissions(data);
      localStorage.setItem("dsr_submissions_db", JSON.stringify(data));
      setSheetSyncStatus("connected");
      setSheetSyncError("");
      setLastSyncedAt(new Date().toLocaleTimeString());
      flushPendingSheetWrites(url);
    } catch (err: any) {
      console.warn("Google Sheet sync failed:", err);
      setSheetSyncStatus("error");
      setSheetSyncError(err?.message || "Could not reach the Google Sheet.");
    }
  };

  const handleSaveWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    setSavingWebhook(true);
    setWebhookSaveMsg("");
    try {
      const urlToSave = webhookUrl.trim() || DEFAULT_GOOGLE_SHEET_URL;
      localStorage.setItem("dsr_google_sheet_url", urlToSave);
      setWebhookUrl(urlToSave);
      setWebhookSaveMsg("✓ Live Google Sheet URL successfully connected! Verifying...");
      syncSubmissionsFromSheet(true);
    } catch (err) {
      setWebhookSaveMsg("⚠️ Failed to save connection URL.");
    } finally {
      setSavingWebhook(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    if (!selectedEmpId) {
      setLoginError("Please select your name.");
      return;
    }

    const emp = employees.find((x) => String(x.id) === selectedEmpId);
    if (!emp) {
      setLoginError("Employee not found.");
      return;
    }

    const pinNeeded = isPinRequiredForSelected();
    if (pinNeeded) {
      if (!enteredPin) {
        setLoginError("PIN is required for Admin & Management login.");
        return;
      }
      if (emp.pin !== enteredPin.trim()) {
        setLoginError("Incorrect Management PIN.");
        return;
      }
    }

    const loggedUser = {
      id: emp.id,
      name: emp.name,
      department: emp.department,
      role: emp.role
    };

    setCurrentUser(loggedUser);
    localStorage.setItem("dsr_session_user", JSON.stringify(loggedUser));
    setEnteredPin("");
    setSelectedEmpId("");

    if (loggedUser.role === "admin") {
      setActiveTab("dashboard");
    } else {
      setActiveTab("form");
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("dsr_session_user");
    setActiveTab("form");
    setFormData({});
  };

  const handlePinChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPinChangeSuccess("");
    setPinChangeError("");

    if (!pinChangeCurrent || !pinChangeNew) {
      setPinChangeError("All fields are required.");
      return;
    }

    const emp = employees.find(x => x.id === currentUser.id);
    if (!emp) return;

    if (emp.pin !== pinChangeCurrent.trim()) {
      setPinChangeError("Incorrect current PIN.");
      return;
    }

    emp.pin = pinChangeNew.trim();
    setPinChangeSuccess("PIN changed successfully!");
    setPinChangeCurrent("");
    setPinChangeNew("");
    setTimeout(() => {
      setShowPinModal(false);
      setPinChangeSuccess("");
    }, 1500);
  };

  const generateSubjectLine = (dept: string, name: string, dateStr: string) => {
    const formattedDate = dateStr.split("-").reverse().join("/");
    if (dept === "Creative") {
      return `Creative DSR`;
    } else if (dept.startsWith("Accounts")) {
      return `Accounts DSR`;
    } else if (dept.startsWith("Operation")) {
      return `Operations DSR`;
    } else if (dept === "Sales") {
      return `Sales DSR — ${name} — ${formattedDate}`;
    } else if (dept === "Event") {
      return `Events DSR — ${name} — ${formattedDate}`;
    }
    return `DSR — ${name} — ${formattedDate}`;
  };

  const handleFieldChange = (fieldId: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentUser) return;

    setSubmitting(true);
    setSubmitSuccessMsg("");
    setSubmitErrorMsg("");

    const subject = generateSubjectLine(currentUser.department, currentUser.name, selectedDate);
    const submittedTimestamp = new Date().toISOString();

    const submissionPayload = {
      id: Date.now(), 
      userId: currentUser.id,
      employeeName: currentUser.name,
      department: currentUser.department,
      date: selectedDate,
      subject,
      fields: formData,
      createdAt: submittedTimestamp
    };

    let currentDb: any[] = [];
    const savedSubs = localStorage.getItem("dsr_submissions_db");
    if (savedSubs) {
      try {
        currentDb = JSON.parse(savedSubs);
      } catch (e) {
        currentDb = [];
      }
    }

    const existingIdx = currentDb.findIndex(
      (sub) => sub.userId === currentUser.id && sub.date === selectedDate
    );

    if (existingIdx !== -1) {
      currentDb[existingIdx] = submissionPayload;
    } else {
      currentDb.push(submissionPayload);
    }

    localStorage.setItem("dsr_submissions_db", JSON.stringify(currentDb));
    setSubmissions(currentDb);

    // Permanent forward to the connected Google Sheet.
    // NOTE: no more "no-cors" — that mode makes the request fire-and-forget
    // and hides any failure (wrong payload shape, missing doPost handler,
    // script error, etc). Reading the real response lets us tell the user
    // immediately if the sheet write didn't actually happen.
    const savedUrl = (localStorage.getItem("dsr_google_sheet_url") || DEFAULT_GOOGLE_SHEET_URL).trim();
    let sheetWriteOk = false;
    let sheetWriteErrorMsg = "";
    if (savedUrl) {
      const result = await postSubmissionToSheet(submissionPayload, savedUrl);
      sheetWriteOk = result.ok;
      sheetWriteErrorMsg = result.error;

      if (sheetWriteOk) {
        // Pull the sheet back a moment later so Admin/Management dashboards
        // (on any device) reflect this submission as soon as possible.
        setTimeout(() => syncSubmissionsFromSheet(false), 2000);
      } else {
        console.warn("Google Sheet write failed:", sheetWriteErrorMsg);
        // Keep it queued so it auto-retries once the connection is fixed.
        const pending = getPendingSheetWrites();
        setPendingSheetWrites([...pending, submissionPayload]);
      }
      setSheetWriteStatus(sheetWriteOk ? "ok" : "error");
      setSheetWriteError(sheetWriteErrorMsg);
    }

    setSubmitSuccessMsg(
      sheetWriteOk || !savedUrl
        ? `Your daily status report has been successfully saved!`
        : `Your report was saved on this device, but sending it to Google Sheets failed: ${sheetWriteErrorMsg}. An admin will need to check the Apps Script setup — your data is not lost, it's saved locally and will sync once that's fixed.`
    );
    setIsSubmittedSuccessfully(true);
    setSubmitting(false);
  };

  const getFilteredSubmissions = () => {
    const today = new Date();
    
    return submissions.filter((sub) => {
      if (adminFilterDept !== "All") {
        const key = getDepartmentSchemaKey(sub.department);
        const filterKey = getDepartmentSchemaKey(adminFilterDept);
        if (key !== filterKey) return false;
      }
      if (adminFilterEmpId && String(sub.userId) !== adminFilterEmpId) {
        return false;
      }

      const subDate = new Date(sub.date);
      const diffTime = Math.abs(today.getTime() - subDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (excelTimeframe === "daily") {
        const targetDate = adminFilterDate || today.toISOString().slice(0, 10);
        if (sub.date !== targetDate) return false;
      } else if (excelTimeframe === "weekly") {
        if (diffDays > 7) return false;
      } else if (excelTimeframe === "monthly") {
        if (diffDays > 30) return false;
      }

      if (adminSearchQuery.trim().length > 0) {
        const q = adminSearchQuery.toLowerCase();
        const matchesName = sub.employeeName.toLowerCase().includes(q);
        const matchesSubject = sub.subject.toLowerCase().includes(q);
        const matchesDept = sub.department.toLowerCase().includes(q);
        const matchesFields = Object.values(sub.fields || {}).some((v) =>
          String(v).toLowerCase().includes(q)
        );
        return matchesName || matchesSubject || matchesDept || matchesFields;
      }

      return true;
    });
  };

  // Formats a createdAt value for display, without ever showing the ugly
  // "Invalid Date" string when the value can't be parsed as a real date/time
  // (this happens for rows synced from a sheet that only stores a plain
  // reporting date with no time-of-day).
  const formatSubmissionTime = (createdAtStr: string, opts: Intl.DateTimeFormatOptions = { hour: "2-digit", minute: "2-digit" }) => {
    if (!createdAtStr) return "—";
    const d = new Date(createdAtStr);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleTimeString([], opts);
  };

  // No time window is enforced: a DSR can be filled and submitted at any time.
  // The submission time is still recorded and shown, but there is no
  // Early / On-time / Late classification.
  const getSubmissionStatus = (createdAtStr: string) => {
    if (!createdAtStr) return { statusText: "Not yet", color: "text-rose-600 bg-rose-50 border-rose-200", badge: "Not yet", time: "" };

    const d = new Date(createdAtStr);
    if (isNaN(d.getTime())) {
      return { statusText: "✓ Submitted", color: "text-emerald-700 bg-emerald-50 border-emerald-200", badge: "Submitted", time: "" };
    }

    const formattedTime = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
    return { statusText: "✓ Submitted", color: "text-emerald-700 bg-emerald-50 border-emerald-200", badge: "Submitted", time: formattedTime };
  };

  const getDefaultersList = () => {
    const fieldStaff = employees.filter((e) => e.role !== "admin");
    const today = new Date();
    
    return fieldStaff.map((staff) => {
      const staffSubs = submissions
        .filter((s) => s.userId === staff.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      let lastDateText = "Never submitted";
      let daysMissed = 999; 
      
      if (staffSubs.length > 0) {
        const lastSubDate = new Date(staffSubs[0].date);
        lastDateText = staffSubs[0].date.split("-").reverse().join("/");
        const diffTime = Math.abs(today.getTime() - lastSubDate.getTime());
        daysMissed = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      }

      return {
        ...staff,
        lastSubmissionDate: lastDateText,
        daysMissed,
        isDefaulter: daysMissed >= 3
      };
    }).sort((a, b) => a.name.localeCompare(b.name)); 
  };

  const exportSubmissionLogToCSV = () => {
    const activeLogs = getFilteredSubmissions();
    if (activeLogs.length === 0) {
      alert("No log data available to export.");
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    const headers = [
      "Date", 
      "Employee Name", 
      "Department", 
      "Time Received", 
      "Submitted On", 
      "Status", 
      "Key Update (paste summary)", 
      "PendingItems"
    ];
    csvContent += headers.map(h => `"${h}"`).join(",") + "\r\n";

    activeLogs.forEach((sub) => {
      const statusDetails = getSubmissionStatus(sub.createdAt);
      const answers = Object.values(sub.fields || {}) as string[];
      
      const keyUpdate = (answers[0] || "-").replace(/"/g, '""');
      const pendingItems = (answers[5] || answers[answers.length - 1] || "NA").replace(/"/g, '""');

      const row = [
        sub.date.split("-").reverse().join("-"),
        `"${sub.employeeName}"`,
        `"${sub.department}"`,
        statusDetails.time || "—",
        statusDetails.badge === "Late" ? "Later" : "",
        statusDetails.statusText,
        `"${keyUpdate}"`,
        `"${pendingItems}"`
      ];

      csvContent += row.join(",") + "\r\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `DSR_Submission_Log_${excelTimeframe.toUpperCase()}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportDefaultersToCSV = () => {
    const overdueDefaulters = getDefaultersList().filter(d => d.isDefaulter);
    if (overdueDefaulters.length === 0) {
      alert("No defaulters found!");
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    const headers = ["Employee Name", "Department", "Last Submission Date", "Days Missed", "Status"];
    csvContent += headers.map(h => `"${h}"`).join(",") + "\r\n";

    overdueDefaulters.forEach((emp) => {
      const row = [
        `"${emp.name}"`,
        `"${emp.department}"`,
        emp.lastSubmissionDate,
        emp.daysMissed === 999 ? "Never Submitted" : emp.daysMissed,
        "Critical Overdue (3+ Days Missing)"
      ];
      csvContent += row.join(",") + "\r\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `DSR_Overdue_Defaulters_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Full date+time formatter for CSV exports — same "never show Invalid
  // Date" guard as formatSubmissionTime, but includes the date portion too.
  const formatSubmissionDateTime = (createdAtStr: string) => {
    if (!createdAtStr) return "—";
    const d = new Date(createdAtStr);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleString();
  };

  const exportToCSV = (subsToExport: any[], departmentName: string = "All") => {
    if (subsToExport.length === 0) {
      alert("No data available to export.");
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    
    if (departmentName !== "All") {
      const schemaKey = getDepartmentSchemaKey(departmentName);
      const schema = DEPARTMENT_SCHEMAS[schemaKey];
      
      const headers = ["Date", "Employee Name", "Department", "Subject", ...schema.fields.map((f: FieldDef) => `"${f.label.replace(/"/g, '""')}"`), "Submitted Time"];
      csvContent += headers.join(",") + "\r\n";

      subsToExport.forEach((sub) => {
        const row = [
          sub.date,
          `"${sub.employeeName.replace(/"/g, '""')}"`,
          `"${sub.department.replace(/"/g, '""')}"`,
          `"${sub.subject.replace(/"/g, '""')}"`,
          ...schema.fields.map((f: FieldDef) => {
            const val = (sub.fields && sub.fields[f.id]) || "";
            return `"${val.replace(/"/g, '""')}"`;
          }),
          new Date(sub.createdAt).toLocaleString()
        ];
        csvContent += row.join(",") + "\r\n";
      });
    } else {
      const headers = ["Date", "Employee Name", "Department", "Subject", "All Answers combined", "Submitted Time"];
      csvContent += headers.join(",") + "\r\n";

      subsToExport.forEach((sub) => {
        const fieldsCombined = Object.entries(sub.fields || {})
          .map(([k, v]) => `${k}: ${v}`)
          .join(" | ");

        const row = [
          sub.date,
          `"${sub.employeeName.replace(/"/g, '""')}"`,
          `"${sub.department.replace(/"/g, '""')}"`,
          `"${sub.subject.replace(/"/g, '""')}"`,
          `"${fieldsCombined.replace(/"/g, '""')}"`,
          new Date(sub.createdAt).toLocaleString()
        ];
        csvContent += row.join(",") + "\r\n";
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `DSR_Export_${departmentName}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getTodayCompliance = () => {
    const checkDate = adminFilterDate || new Date().toISOString().slice(0, 10);
    const fieldStaff = employees.filter(e => e.role !== "admin");
    
    const mapped = fieldStaff.map((emp) => {
      const submission = submissions.find(
        (sub) => sub.userId === emp.id && sub.date === checkDate
      );
      return {
        ...emp,
        submitted: !!submission,
        submission,
        checkDate
      };
    });

    return mapped.sort((a, b) => a.name.localeCompare(b.name));
  };

  const complianceList = getTodayCompliance();
  const complianceCount = complianceList.filter(c => c.submitted).length;
  const defaultersList = getDefaultersList();
  const criticalDefaultersCount = defaultersList.filter(d => d.isDefaulter).length;

  const userSchemaKey = currentUser ? getDepartmentSchemaKey(currentUser.department) : "Creative";
  const userSchema = DEPARTMENT_SCHEMAS[userSchemaKey];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-slate-900">
      
      {/* Header */}
      <header className="bg-indigo-900 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <img src={ccLogo} alt="Corporate Culture" className="h-10 w-auto" />
            <div className="border-l border-white/20 pl-3">
              <h1 className="text-base font-black tracking-tight uppercase">
                DSR Flow Portal
              </h1>
              <p className="text-[11px] text-indigo-200 font-medium">
                Saves to database + automatic sync with Google Sheet
              </p>
            </div>
          </div>

          {currentUser ? (
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <span className="font-bold text-xs block">{currentUser.name}</span>
                <span className="text-[10px] text-indigo-200 uppercase font-black tracking-wider block">
                  {currentUser.department}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer border border-white/10"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          ) : (
            <span className="text-xs bg-yellow-400 text-indigo-950 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
              Secure Submission Mode
            </span>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        
        {/* LOGIN SCREEN */}
        {!currentUser && (
          <div className="max-w-md mx-auto my-12 bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="bg-indigo-900 px-8 py-10 text-white text-center">
              <img src={ccLogo} alt="Corporate Culture" className="h-16 w-auto mx-auto mb-4" />
              <h2 className="text-xl font-black tracking-tight uppercase">Daily Status Report (DSR)</h2>
              <p className="text-indigo-200 text-xs mt-2 max-w-xs mx-auto font-medium leading-relaxed">
                Select your name to fill your daily status report. PIN is required only for Shradha Bayas, Atul Ranjan, and Shalu Richard.
              </p>
            </div>

            <form onSubmit={handleLogin} className="p-8 space-y-5">
              {loginError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3.5 rounded-xl text-xs font-bold">
                  ⚠️ {loginError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Select Your Name
                </label>
                <div className="relative">
                  <select
                    value={selectedEmpId}
                    onChange={(e) => setSelectedEmpId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none appearance-none cursor-pointer text-slate-800"
                  >
                    <option value="">-- Choose Your Name --</option>
                    {[...employees]
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.name} ({emp.department})
                        </option>
                      ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                    ▼
                  </div>
                </div>
              </div>

              {isPinRequiredForSelected() && (
                <div className="space-y-1.5 animate-fadeIn">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-rose-500" />
                    <span>Management PIN Required</span>
                  </label>
                  <input
                    type="password"
                    maxLength={10}
                    placeholder="Enter Private PIN"
                    value={enteredPin}
                    onChange={(e) => setEnteredPin(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm font-bold tracking-widest focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-800"
                  />
                  <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                    🔐 Access to the comprehensive dashboards, tables, and Google Sheets is restricted to Shradha Bayas, Atul Ranjan, and Shalu Richard.
                  </p>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg transition duration-200 flex items-center justify-center gap-2 cursor-pointer text-sm tracking-wider uppercase"
              >
                <span>{isPinRequiredForSelected() ? "Unlock Dashboards" : "Open DSR Form"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* LOGGED IN PORTALS */}
        {currentUser && (
          <div>
            
            {/* Nav Tabs for Admin / Management: Shradha, Atul, Shalu */}
            {currentUser.role === "admin" && (
              <div className="flex border-b border-slate-200 mb-6 bg-white p-1.5 rounded-xl shadow-xs gap-1">
                <button
                  onClick={() => { setActiveTab("dashboard"); setViewingSubmission(null); }}
                  className={`flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-xs font-bold transition duration-200 cursor-pointer ${
                    activeTab === "dashboard"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Interactive Dashboards</span>
                </button>

                <button
                  onClick={() => { setActiveTab("form"); setViewingSubmission(null); }}
                  className={`flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-xs font-bold transition duration-200 cursor-pointer ${
                    activeTab === "form"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>DSR Form Previewer</span>
                </button>

                <button
                  onClick={() => { setActiveTab("google-sheets-guide"); setViewingSubmission(null); }}
                  className={`flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-xs font-bold transition duration-200 cursor-pointer ${
                    activeTab === "google-sheets-guide"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Google Sheets Connection Link</span>
                </button>
              </div>
            )}

            {/* TAB CONTENT: THE ACTIVE FORM */}
            {activeTab === "form" && (
              <div className="space-y-6">
                
                {/* Employee Instruction Banner */}
                <div className="bg-indigo-50 border border-indigo-150 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs font-medium text-indigo-900 shadow-xs">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                    <span>
                      Hey <strong>{currentUser.name}</strong>! Fill in your daily status report parameters below. Click the <strong>&quot;Preview Form Option&quot;</strong> button to verify your structured Excel/Email format instantly before saving!
                    </span>
                  </div>
                  <span className="bg-indigo-200 text-indigo-800 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    {currentUser.department} DSR Template
                  </span>
                </div>

                <div className="max-w-3xl mx-auto">
                  {isSubmittedSuccessfully ? (
                    /* Vanished state */
                    <div className="bg-white rounded-3xl p-8 shadow-xl border border-emerald-200 text-center space-y-6 animate-fadeIn">
                      <div className="bg-emerald-100 text-emerald-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-sm">
                        <CheckCircle className="w-10 h-10 text-emerald-600" />
                      </div>
                      
                      <div className="space-y-2">
                        <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">DSR Submission Successful!</h2>
                        <p className="text-xs text-slate-500 font-medium">
                          Your status report for <strong className="text-slate-700">{selectedDate.split("-").reverse().join("/")}</strong> was recorded dynamically in the database and saved.
                        </p>
                      </div>

                      {sheetWriteStatus === "ok" && (
                        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-3 text-xs font-bold max-w-md mx-auto flex items-center gap-2 justify-center">
                          <CheckCircle className="w-4 h-4 flex-shrink-0" />
                          <span>Also synced to Google Sheets successfully.</span>
                        </div>
                      )}
                      {sheetWriteStatus === "error" && (
                        <div className="bg-amber-50 border border-amber-250 text-amber-800 rounded-xl p-3 text-xs font-bold max-w-md mx-auto text-left">
                          ⚠️ Saved on this device, but Google Sheets sync failed: {sheetWriteError || "unknown error"}. Please tell an admin — your entry is not lost, it will sync automatically once the sheet connection is fixed.
                        </div>
                      )}

                      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 text-left space-y-2 max-w-md mx-auto text-xs">
                        <div className="flex justify-between border-b border-slate-200/50 pb-2">
                          <span className="font-extrabold text-slate-400 uppercase tracking-wider text-[10px]">Employee:</span>
                          <span className="font-bold text-slate-800">{currentUser.name}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-200/50 pb-2">
                          <span className="font-extrabold text-slate-400 uppercase tracking-wider text-[10px]">Department:</span>
                          <span className="font-bold text-slate-800">{currentUser.department}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-extrabold text-slate-400 uppercase tracking-wider text-[10px]">Subject Line:</span>
                          <span className="font-mono font-bold text-indigo-900 truncate max-w-[200px]" title={generateSubjectLine(currentUser.department, currentUser.name, selectedDate)}>
                            {generateSubjectLine(currentUser.department, currentUser.name, selectedDate)}
                          </span>
                        </div>
                      </div>

                      <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
                        <button
                          onClick={() => setIsSubmittedSuccessfully(false)}
                          className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-755 font-black py-3 rounded-xl text-xs transition border border-slate-250 cursor-pointer"
                        >
                          ✏️ Edit My Submission
                        </button>
                        <button
                          onClick={handleLogout}
                          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3 rounded-xl text-xs transition cursor-pointer shadow-md"
                        >
                          👋 Done (Log Out / Exit)
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Active form fields - vanishes upon successful submission */
                    <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-200 space-y-6">
                      
                      {/* Header Controls */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
                        <div>
                          <h2 className="text-base font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                            <span>📋 Fill status fields</span>
                          </h2>
                          <p className="text-[11px] text-slate-500 font-medium">
                            Fill and submit your daily status report any time — no time restriction.
                          </p>
                        </div>

                        {/* Date adjustment */}
                        <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200 w-full sm:w-auto">
                          <span className="text-[11px] font-bold text-slate-600 whitespace-nowrap">DSR Reporting Date:</span>
                          <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="bg-white text-xs font-bold border border-slate-300 rounded px-2 py-1 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                          />
                        </div>
                      </div>

                      {submitSuccessMsg && (
                        <div className="bg-emerald-50 border border-emerald-250 text-emerald-800 p-4 rounded-xl text-xs font-bold flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                          <span>{submitSuccessMsg}</span>
                        </div>
                      )}

                      {submitErrorMsg && (
                        <div className="bg-rose-50 border border-rose-200 text-rose-850 p-4 rounded-xl text-xs font-bold">
                          ⚠️ {submitErrorMsg}
                        </div>
                      )}

                      {/* DSR Form Fields */}
                      <form onSubmit={handleFormSubmit} className="space-y-4">
                        {userSchema.fields.map((field: FieldDef) => (
                          <div key={field.id} className="space-y-1.5">
                            <label className="block text-xs font-extrabold text-slate-700 tracking-wide">
                              {field.label}
                            </label>
                            {field.type === "textarea" ? (
                              <textarea
                                rows={3}
                                value={formData[field.id] || ""}
                                onChange={(e) => handleFieldChange(field.id, e.target.value)}
                                placeholder="Describe today's status..."
                                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none text-slate-800"
                              />
                            ) : (
                              <input
                                type="text"
                                value={formData[field.id] || ""}
                                onChange={(e) => handleFieldChange(field.id, e.target.value)}
                                placeholder="e.g. NA, Done, Yes"
                                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none text-slate-800"
                              />
                            )}
                          </div>
                        ))}

                        {/* Action buttons including the requested "PREVIEW FILE/FORM" option */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
                          <button
                            type="button"
                            onClick={() => setShowPreviewModal(true)}
                            className="bg-amber-500 hover:bg-amber-600 text-white font-extrabold py-3.5 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer text-xs uppercase tracking-wider shadow-sm animate-pulse"
                          >
                            <Eye className="w-4 h-4" />
                            <span>👁️ Preview Form Option</span>
                          </button>

                          <button
                            type="submit"
                            disabled={submitting}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold py-3.5 rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer text-xs uppercase tracking-wider"
                          >
                            <FileCheck className="w-4 h-4" />
                            <span>{submitting ? "Submitting..." : "Submit My Daily DSR"}</span>
                          </button>
                        </div>
                      </form>

                    </div>
                  )}
                </div>

              </div>
            )}

            {/* TAB CONTENT: INTERACTIVE DASHBOARDS */}
            {activeTab === "dashboard" && currentUser.role === "admin" && (
              <div className="space-y-6">
                
                {/* Advanced Filtering Suite */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                      <Filter className="w-4 h-4 text-indigo-600" />
                      <span>Interactive Filter Panels</span>
                    </h3>
                    
                    {/* Timeframe quick filters */}
                    <div className="flex flex-wrap gap-1.5 items-center bg-slate-50 p-1 rounded-xl border border-slate-200">
                      <span className="text-[10px] font-black uppercase text-slate-400 px-2 font-mono">Basis Mode:</span>
                      <button 
                        onClick={() => {
                          const todayStr = new Date().toISOString().slice(0, 10);
                          setAdminFilterDate(todayStr);
                          setExcelTimeframe("daily");
                        }}
                        className={`px-3 py-1 rounded-lg text-[10px] font-bold transition ${excelTimeframe === "daily" ? "bg-indigo-900 text-white shadow-xs" : "text-slate-600 hover:bg-white"}`}
                      >
                        Daily
                      </button>
                      <button 
                        onClick={() => {
                          setExcelTimeframe("weekly");
                          setAdminFilterDate(""); 
                        }}
                        className={`px-3 py-1 rounded-lg text-[10px] font-bold transition ${excelTimeframe === "weekly" ? "bg-indigo-900 text-white shadow-xs" : "text-slate-600 hover:bg-white"}`}
                      >
                        Weekly (Last 7 Days)
                      </button>
                      <button 
                        onClick={() => {
                          setExcelTimeframe("monthly");
                          setAdminFilterDate(""); 
                        }}
                        className={`px-3 py-1 rounded-lg text-[10px] font-bold transition ${excelTimeframe === "monthly" ? "bg-indigo-900 text-white shadow-xs" : "text-slate-600 hover:bg-white"}`}
                      >
                        Monthly (Last 30 Days)
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setAdminFilterDept("All");
                          setAdminFilterEmpId("");
                          setAdminFilterDate("");
                          setAdminSearchQuery("");
                          setExcelTimeframe("daily");
                        }}
                        className="text-[11px] text-slate-600 hover:text-slate-900 bg-slate-100 py-1 px-2.5 rounded border border-slate-250 transition font-bold"
                      >
                        Clear Filters
                      </button>
                      <button
                        onClick={() => exportToCSV(getFilteredSubmissions(), adminFilterDept)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold py-1 px-2.5 rounded transition flex items-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Export CSV</span>
                      </button>
                    </div>
                  </div>

                  {/* Google Sheet live sync status */}
                  <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl px-3 py-2 border text-[11px] font-bold ${
                    sheetSyncStatus === "connected" ? "bg-emerald-50 border-emerald-200 text-emerald-700" :
                    sheetSyncStatus === "error" ? "bg-rose-50 border-rose-200 text-rose-700" :
                    sheetSyncStatus === "syncing" ? "bg-amber-50 border-amber-200 text-amber-700" :
                    "bg-slate-50 border-slate-200 text-slate-500"
                  }`}>
                    <div className="flex items-center gap-1.5">
                      <span className={`inline-block w-2 h-2 rounded-full ${
                        sheetSyncStatus === "connected" ? "bg-emerald-500" :
                        sheetSyncStatus === "error" ? "bg-rose-500" :
                        sheetSyncStatus === "syncing" ? "bg-amber-500 animate-pulse" :
                        "bg-slate-400"
                      }`}></span>
                      {sheetSyncStatus === "connected" && <span>Live — connected to Google Sheet{lastSyncedAt ? ` · last synced ${lastSyncedAt}` : ""}</span>}
                      {sheetSyncStatus === "syncing" && <span>Syncing with Google Sheet...</span>}
                      {sheetSyncStatus === "error" && <span>Could not reach Google Sheet{sheetSyncError ? ` — ${sheetSyncError}` : ""}. Showing last known data.</span>}
                      {sheetSyncStatus === "idle" && <span>Connecting to Google Sheet...</span>}
                    </div>
                    <button
                      onClick={() => syncSubmissionsFromSheet(true)}
                      className="flex items-center gap-1 self-start sm:self-auto bg-white hover:bg-slate-50 border border-current/30 py-1 px-2 rounded-lg transition"
                    >
                      <RefreshCw className={`w-3 h-3 ${sheetSyncStatus === "syncing" ? "animate-spin" : ""}`} />
                      <span>Refresh Now</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    {/* Department Select */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide">Select Department</span>
                      <select
                        value={adminFilterDept}
                        onChange={(e) => {
                          setAdminFilterDept(e.target.value);
                          setAdminFilterEmpId(""); 
                        }}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold focus:ring-1 focus:ring-indigo-500 cursor-pointer text-slate-800"
                      >
                        <option value="All">All Departments</option>
                        <option value="Sales">Sales</option>
                        <option value="Event">Event</option>
                        <option value="Accounts">Accounts</option>
                        <option value="Creative">Creative</option>
                        <option value="Operation">Operations</option>
                      </select>
                    </div>

                    {/* Employee select */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide">Select Employee</span>
                      <select
                        value={adminFilterEmpId}
                        onChange={(e) => setAdminFilterEmpId(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold focus:ring-1 focus:ring-indigo-500 cursor-pointer text-slate-800"
                      >
                        <option value="">All Staff</option>
                        {employees
                          .filter((e) => adminFilterDept === "All" || getDepartmentSchemaKey(e.department) === getDepartmentSchemaKey(adminFilterDept))
                          .map((emp) => (
                            <option key={emp.id} value={emp.id}>
                              {emp.name} ({emp.department})
                            </option>
                          ))}
                      </select>
                    </div>

                    {/* Date filter */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide">Reporting Date</span>
                      <input
                        type="date"
                        value={adminFilterDate}
                        onChange={(e) => setAdminFilterDate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold focus:ring-1 focus:ring-indigo-500 cursor-pointer text-slate-800"
                      />
                    </div>

                    {/* Full text search */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide">Keyword Search</span>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                          <Search className="w-3.5 h-3.5" />
                        </span>
                        <input
                          type="text"
                          placeholder="Search terms..."
                          value={adminSearchQuery}
                          onChange={(e) => setAdminSearchQuery(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-8 pr-3 py-2 text-xs font-bold focus:ring-1 focus:ring-indigo-500 text-slate-800"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sub Tab Selector for Admin Panel */}
                <div className="flex border-b border-slate-200 bg-white p-1 rounded-xl shadow-xs gap-1">
                  <button
                    onClick={() => setAdminSubTab("grid")}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${adminSubTab === "grid" ? "bg-indigo-900 text-white shadow-xs" : "text-slate-600 hover:bg-slate-50"}`}
                  >
                    📊 Daily Compliance Grid
                  </button>
                  <button
                    onClick={() => setAdminSubTab("excel-log")}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${adminSubTab === "excel-log" ? "bg-indigo-900 text-white shadow-xs" : "text-slate-600 hover:bg-slate-50"}`}
                  >
                    <SheetIcon className="w-4 h-4 text-emerald-600" />
                    <span>📂 DSR Daily Submission Log (Excel summary)</span>
                  </button>
                  <button
                    onClick={() => setAdminSubTab("defaulters")}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${adminSubTab === "defaulters" ? "bg-indigo-900 text-white shadow-xs" : "text-slate-600 hover:bg-slate-50"}`}
                  >
                    <AlertTriangle className="w-4 h-4 text-rose-500" />
                    <span>⚠️ Defaulters List ({criticalDefaultersCount})</span>
                  </button>
                </div>

                {/* SUB TAB 1: compliance grid */}
                {adminSubTab === "grid" && (
                  <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div>
                        <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                          <Users className="w-4 h-4 text-emerald-600" />
                          <span>Daily Submission & Compliance Tracker</span>
                        </h3>
                        <p className="text-[11px] text-slate-500 font-medium">
                          Instant tracking for date: <strong className="text-slate-700">{adminFilterDate || "Today"}</strong>
                        </p>
                      </div>

                      <div className="bg-slate-100 text-slate-800 text-[11px] font-black px-3 py-1 rounded-full border border-slate-250">
                        Completed: {complianceCount} / {complianceList.length}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                      {complianceList.map((emp) => (
                        <div
                          key={emp.id}
                          className={`p-3 rounded-xl border flex flex-col justify-between min-h-[90px] transition ${
                            emp.submitted
                              ? "bg-emerald-50/50 border-emerald-250"
                              : "bg-rose-50/20 border-rose-200"
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="font-extrabold text-xs text-slate-800 block leading-tight">{emp.name}</span>
                              <span className="text-[9px] text-slate-500 uppercase font-black block mt-0.5">{emp.department}</span>
                            </div>
                            {emp.submitted ? (
                              <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                <CheckCircle className="w-2.5 h-2.5 text-emerald-600" />
                                <span>FILLED</span>
                              </span>
                            ) : (
                              <span className="bg-rose-100 text-rose-800 text-[9px] font-black px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                <Clock className="w-2.5 h-2.5 text-rose-600 animate-pulse" />
                                <span>MISSING</span>
                              </span>
                            )}
                          </div>

                          <div className="pt-2 flex justify-between items-center text-[10px]">
                            {emp.submitted && emp.submission ? (
                              <>
                                <span className="text-slate-400 font-mono font-bold">
                                  {new Date(emp.submission.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <button
                                  onClick={() => setViewingSubmission(emp.submission)}
                                  className="text-indigo-600 hover:text-indigo-800 font-black underline cursor-pointer"
                                >
                                  View DSR
                                </button>
                              </>
                            ) : (
                              <span className="text-rose-500/80 font-bold italic">No status saved</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SUB TAB 2: EXCEL-LIKE DSR DAILY SUBMISSION LOG */}
                {adminSubTab === "excel-log" && (
                  <div className="bg-white rounded-2xl border border-slate-300 shadow-lg overflow-hidden font-sans">
                    
                    {/* Excel Header Styling from Screenshot */}
                    <div className="bg-indigo-950 text-white text-center py-4 px-6 border-b border-indigo-900 flex flex-col sm:flex-row justify-between items-center gap-3">
                      <div className="text-left">
                        <h2 className="text-lg font-black tracking-widest uppercase font-mono">DSR DAILY SUBMISSION LOG ({excelTimeframe.toUpperCase()} BASIS)</h2>
                        <p className="text-[10px] text-indigo-200 tracking-wide font-medium italic font-mono">
                          Submission time is recorded automatically for every entry.
                        </p>
                      </div>

                      {/* Download Excel-like Log directly */}
                      <button 
                        onClick={exportSubmissionLogToCSV}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 px-4 rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer font-mono"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download Log Summary (CSV)</span>
                      </button>
                    </div>

                    {/* Metadata Sub-Bar */}
                    <div className="bg-slate-50 border-b border-slate-300 px-6 py-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs font-bold text-slate-800 font-mono">
                      <div>
                        Selected Reporting Date: <span className="text-indigo-900 font-black underline">{selectedDate.split("-").reverse().join("-")}</span>
                      </div>
                      
                      <div className="bg-rose-50 border border-rose-200 text-rose-800 px-3 py-1 rounded-md flex items-center gap-1.5 animate-pulse">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                        <span>Missing today: {complianceList.filter(c => !c.submitted).length} not yet submitted</span>
                      </div>
                    </div>

                    {/* Spreadsheet View */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-slate-800 border-collapse">
                        <thead>
                          <tr className="bg-slate-900 border-b-2 border-slate-400 text-[10px] font-black uppercase text-white tracking-wider font-mono">
                            <th className="p-3 border-r border-slate-700 font-bold">Date</th>
                            <th className="p-3 border-r border-slate-700 font-bold">Employee</th>
                            <th className="p-3 border-r border-slate-700 font-bold">Dept</th>
                            <th className="p-3 border-r border-slate-700 text-center font-bold">Time Received</th>
                            <th className="p-3 border-r border-slate-700 text-center font-bold">Submitted On(if no...)</th>
                            <th className="p-3 border-r border-slate-700 text-center font-bold">Status</th>
                            <th className="p-3 border-r border-slate-700 font-bold">Key Update (paste summary)</th>
                            <th className="p-3 font-bold">PendingItems</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-300 font-mono">
                          {getFilteredSubmissions().map((sub, index) => {
                            const statusDetails = getSubmissionStatus(sub.createdAt);
                            const answers = Object.values(sub.fields || {}) as string[];
                            const keyUpdateSummary = (answers[0] || "-") as string;
                            const pendingItemsSummary = (answers[5] || answers[answers.length - 1] || "NA") as string;

                            return (
                              <tr key={index} className="hover:bg-slate-100 transition duration-150 odd:bg-slate-50/50">
                                <td className="p-3 border-r border-slate-250 font-bold text-indigo-900 whitespace-nowrap">
                                  {sub.date.split("-").reverse().join("-")}
                                </td>
                                <td className="p-3 border-r border-slate-250 font-black text-slate-900">
                                  {sub.employeeName}
                                </td>
                                <td className="p-3 border-r border-slate-250 text-slate-600 font-semibold uppercase text-[10px] whitespace-nowrap">
                                  {sub.department}
                                </td>
                                <td className="p-3 border-r border-slate-250 text-center font-bold">
                                  {statusDetails.time || "—"}
                                </td>
                                <td className="p-3 border-r border-slate-250 text-center text-slate-400 italic">
                                  {statusDetails.badge === "Late" ? "Later" : ""}
                                </td>
                                <td className="p-2 border-r border-slate-250 text-center">
                                  <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-black border ${statusDetails.color}`}>
                                    {statusDetails.statusText}
                                  </span>
                                </td>
                                <td className="p-3 border-r border-slate-250 max-w-xs truncate text-[11px] leading-relaxed" title={keyUpdateSummary}>
                                  {keyUpdateSummary}
                                </td>
                                <td className="p-3 text-rose-700 max-w-xs truncate text-[11px] font-bold" title={pendingItemsSummary}>
                                  {pendingItemsSummary}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* SUB TAB 3: DEFAULTERS LIST */}
                {adminSubTab === "defaulters" && (
                  <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-3">
                      <div>
                        <h3 className="text-xs font-black text-rose-750 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                          <AlertTriangle className="w-4 h-4 text-rose-600" />
                          <span>Critical Defaulters List (No DSR for last 3+ days)</span>
                        </h3>
                        <p className="text-[11px] text-slate-500 font-medium">
                          These employees have missed filling status reports for 3 or more consecutive days.
                        </p>
                      </div>

                      {/* Download Defaulters Excel directly! */}
                      <button 
                        onClick={exportDefaultersToCSV}
                        className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold py-2 px-4 rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer font-mono"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download Defaulters Report (CSV)</span>
                      </button>
                    </div>

                    <div className="space-y-2 font-mono">
                      {defaultersList.filter(d => d.isDefaulter).length === 0 ? (
                        <div className="p-8 text-center text-emerald-800 bg-emerald-50 rounded-xl font-bold border border-emerald-250 flex items-center justify-center gap-2">
                          <CheckCircle className="w-5 h-5 text-emerald-600 animate-bounce" />
                          <span>Fantastic! 100% compliance. Nobody is overdue on their status reports by more than 3 days.</span>
                        </div>
                      ) : (
                        <div className="divide-y divide-slate-200 font-mono bg-rose-50/20 rounded-xl p-3 border border-rose-100">
                          {defaultersList.filter(d => d.isDefaulter).map((emp) => (
                            <div 
                              key={emp.id} 
                              className="py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 last:border-b-0 px-3 hover:bg-rose-50/50 transition"
                            >
                              <div>
                                <span className="font-extrabold text-slate-800 block text-sm">{emp.name}</span>
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{emp.department}</span>
                              </div>

                              <div className="flex items-center gap-4 font-mono text-xs">
                                <div className="text-right">
                                  <span className="text-slate-455 block font-medium">Last Submitted Date:</span>
                                  <span className="font-mono font-black text-rose-700">{emp.lastSubmissionDate}</span>
                                </div>

                                <div className="px-3 py-1.5 rounded-lg text-xs font-black border bg-rose-100 text-rose-800 border-rose-300">
                                  {emp.daysMissed === 999 ? "Never Submitted" : `${emp.daysMissed} Days Overdue`}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* All Submissions Table */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden font-mono text-xs">
                  <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                    <span className="font-black text-xs uppercase tracking-wider text-slate-700">Weekly & Monthly Compliance Summary Reports</span>
                    <span className="text-[10px] text-slate-450 font-extrabold uppercase font-mono">
                      Management View
                    </span>
                  </div>

                  {getFilteredSubmissions().length === 0 ? (
                    <div className="p-12 text-center text-slate-500 text-xs font-bold">
                      🚫 No status reports match the specified filters. Try changing filters or date!
                    </div>
                  ) : (
                    <div className="overflow-x-auto font-mono">
                      <table className="w-full text-left text-xs text-slate-700 border-collapse">
                        <thead>
                          <tr className="bg-slate-100 border-b border-slate-200 text-[10px] font-black uppercase text-slate-500 tracking-wider">
                            <th className="p-4 font-bold">Reporting Date</th>
                            <th className="p-4 font-bold">Employee</th>
                            <th className="p-4 font-bold">Department</th>
                            <th className="p-4 font-bold">Generated Subject Line</th>
                            <th className="p-4 font-bold">Time Saved</th>
                            <th className="p-4 text-center font-bold">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 font-mono">
                          {getFilteredSubmissions().map((sub) => (
                            <tr key={sub.id} className="hover:bg-slate-50/80 transition">
                              <td className="p-4 font-bold font-mono text-indigo-900 whitespace-nowrap">
                                {sub.date.split("-").reverse().join("/")}
                              </td>
                              <td className="p-4 font-bold text-slate-800">
                                {sub.employeeName}
                              </td>
                              <td className="p-4 whitespace-nowrap">
                                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                                  sub.department.startsWith("Accounts") ? "bg-slate-100 text-slate-800" :
                                  sub.department === "Sales" ? "bg-emerald-100 text-emerald-800" :
                                  sub.department === "Creative" ? "bg-indigo-100 text-indigo-800" :
                                  sub.department === "Event" ? "bg-red-100 text-red-800" :
                                  "bg-amber-100 text-amber-800"
                                }`}>
                                  {sub.department}
                                </span>
                              </td>
                              <td className="p-4 max-w-xs truncate font-mono text-slate-600 font-medium">
                                {sub.subject}
                              </td>
                              <td className="p-4 whitespace-nowrap text-slate-500 font-medium">
                                {new Date(sub.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </td>
                              <td className="p-4 text-center whitespace-nowrap">
                                <button
                                  onClick={() => setViewingSubmission(sub)}
                                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold py-1.5 px-3.5 rounded-lg transition"
                                >
                                  Inspect Status Grid
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* TAB CONTENT: GOOGLE SHEETS WEB APP CONNECTION INPUT */}
            {activeTab === "google-sheets-guide" && currentUser.role === "admin" && (
              <div className="space-y-6">
                
                {/* Connection URL Box */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center gap-2.5">
                    <div className="bg-emerald-100 p-2.5 rounded-xl text-emerald-700">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider font-mono">
                        Connect Your DSR Flow Portal with Google Sheets
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5 font-medium font-mono">
                        This portal is permanently connected to the Google Sheet link below — it&apos;s built in, so every device and every login (Admin, Management, and staff) already syncs to the same sheet with zero setup. Only change this if you redeploy the Apps Script and get a new link.
                      </p>
                    </div>
                  </div>

                  {/* Live status */}
                  <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl px-3 py-2.5 border text-xs font-bold font-mono ${
                    sheetSyncStatus === "connected" ? "bg-emerald-50 border-emerald-200 text-emerald-700" :
                    sheetSyncStatus === "error" ? "bg-rose-50 border-rose-200 text-rose-700" :
                    sheetSyncStatus === "syncing" ? "bg-amber-50 border-amber-200 text-amber-700" :
                    "bg-slate-50 border-slate-200 text-slate-500"
                  }`}>
                    <div className="flex items-center gap-1.5">
                      <span className={`inline-block w-2 h-2 rounded-full ${
                        sheetSyncStatus === "connected" ? "bg-emerald-500" :
                        sheetSyncStatus === "error" ? "bg-rose-500" :
                        sheetSyncStatus === "syncing" ? "bg-amber-500 animate-pulse" :
                        "bg-slate-400"
                      }`}></span>
                      {sheetSyncStatus === "connected" && <span>Connected — reading live data from this sheet{lastSyncedAt ? ` (last synced ${lastSyncedAt})` : ""}</span>}
                      {sheetSyncStatus === "syncing" && <span>Checking connection...</span>}
                      {sheetSyncStatus === "error" && <span>Not reachable{sheetSyncError ? `: ${sheetSyncError}` : ""}. See setup notes below.</span>}
                      {sheetSyncStatus === "idle" && <span>Checking connection...</span>}
                    </div>
                    <button
                      onClick={() => syncSubmissionsFromSheet(true)}
                      className="flex items-center gap-1 self-start sm:self-auto bg-white hover:bg-slate-50 border border-current/30 py-1 px-2 rounded-lg transition"
                    >
                      <RefreshCw className={`w-3 h-3 ${sheetSyncStatus === "syncing" ? "animate-spin" : ""}`} />
                      <span>Test Connection</span>
                    </button>
                  </div>

                  <form onSubmit={handleSaveWebhook} className="space-y-3 pt-2">
                    <div className="space-y-1.5 font-mono">
                      <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wide block">
                        Google Sheets Web App Link (Deployment URL)
                      </span>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="url"
                          placeholder="Paste your deployed web app link here"
                          value={webhookUrl}
                          onChange={(e) => setWebhookUrl(e.target.value)}
                          className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-mono font-bold focus:ring-1 focus:ring-indigo-500 text-slate-800"
                        />
                        <button
                          type="submit"
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-5 rounded-xl text-xs transition whitespace-nowrap cursor-pointer"
                        >
                          {savingWebhook ? "Connecting..." : "Update Connection Link"}
                        </button>
                      </div>
                    </div>
                    {webhookSaveMsg && (
                      <p className="text-xs font-bold text-indigo-700 mt-1">
                        {webhookSaveMsg}
                      </p>
                    )}
                  </form>
                </div>

                {sheetSyncStatus === "error" && (
                  <div className="bg-rose-50 border border-rose-200 p-5 rounded-2xl space-y-2">
                    <span className="text-xs font-black text-rose-700 uppercase block font-mono">⚠️ Sheet not reachable — likely an Apps Script deployment issue</span>
                    <p className="text-xs text-rose-700 leading-relaxed font-bold font-mono">
                      This app can only READ previous submissions back if your Google Apps Script has a <code className="bg-white px-1.5 py-0.5 rounded border border-rose-200">doGet(e)</code> function that returns all rows as JSON (a plain <code className="bg-white px-1.5 py-0.5 rounded border border-rose-200">doPost</code> alone only lets it write). Open your Apps Script project (Extensions → Apps Script from your Sheet), make sure it includes a <code className="bg-white px-1.5 py-0.5 rounded border border-rose-200">doGet</code>, then Deploy → Manage deployments → edit your Web App deployment → set &quot;Who has access&quot; to <code className="bg-white px-1.5 py-0.5 rounded border border-rose-200">Anyone</code> → Deploy, and confirm the <code className="bg-white px-1.5 py-0.5 rounded border border-rose-200">/exec</code> link matches the one above.
                    </p>
                  </div>
                )}

                {getPendingSheetWrites().length > 0 && (
                  <div className="bg-amber-50 border border-amber-250 p-5 rounded-2xl space-y-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-xs font-black text-amber-800 uppercase block font-mono">
                        ⚠️ {getPendingSheetWrites().length} submission{getPendingSheetWrites().length > 1 ? "s" : ""} saved locally but not yet in the Sheet
                      </span>
                      <p className="text-xs text-amber-700 font-bold font-mono mt-1">
                        These failed to write to Google Sheets when submitted (most likely a <code className="bg-white px-1.5 py-0.5 rounded border border-amber-200">doPost</code> issue in your Apps Script). They'll retry automatically the next time the connection checks out — or click below to try right now.
                      </p>
                    </div>
                    <button
                      onClick={() => flushPendingSheetWrites((localStorage.getItem("dsr_google_sheet_url") || DEFAULT_GOOGLE_SHEET_URL).trim())}
                      className="flex items-center gap-1 self-start sm:self-auto bg-white hover:bg-amber-100 border border-amber-300 text-amber-800 font-bold py-1.5 px-3 rounded-lg transition text-xs whitespace-nowrap"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Retry Now</span>
                    </button>
                  </div>
                )}


                {/* File configuration details */}
                <div className="bg-slate-50 border border-slate-250 p-5 rounded-2xl space-y-2">
                  <span className="text-xs font-black text-slate-700 uppercase block font-mono">📋 Configuration Settings</span>
                  <p className="text-xs text-slate-655 leading-relaxed font-bold font-mono">
                    Workbook Name: <code className="bg-white px-2 py-0.5 rounded font-mono font-black border border-slate-200">DSR_Employee_Submissions_2026</code>
                  </p>
                  <p className="text-xs text-slate-500 leading-relaxed font-mono">
                    Make sure your Google Sheets workbook contains the 5 corresponding sheets named: <code className="bg-white px-1.5 py-0.5 rounded font-mono border text-slate-700">Creative_DSR</code>, <code className="bg-white px-1.5 py-0.5 rounded font-mono border text-slate-700">Sales_DSR</code>, <code className="bg-white px-1.5 py-0.5 rounded font-mono border text-slate-700">Events_DSR</code>, <code className="bg-white px-1.5 py-0.5 rounded font-mono border text-slate-700">Operations_DSR</code>, and <code className="bg-white px-1.5 py-0.5 rounded font-mono border text-slate-700">Accounts_DSR</code>.
                  </p>
                </div>

              </div>
            )}

            {/* DETAIL VIEW MODAL WHEN INSPECTING SUBMISSIONS */}
            {viewingSubmission && (
              <div className="bg-white rounded-2xl border border-indigo-200 shadow-xl overflow-hidden my-6 font-mono text-xs">
                <div className="bg-indigo-900 text-indigo-50 p-4 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    <span className="font-bold text-xs uppercase tracking-wide">
                      Reviewing status report #{viewingSubmission.id}
                    </span>
                  </div>
                  <button
                    onClick={() => setViewingSubmission(null)}
                    className="bg-white/10 hover:bg-white/20 text-white rounded px-2.5 py-1 text-xs font-bold transition cursor-pointer"
                  >
                    Close
                  </button>
                </div>

                <div className="p-6 space-y-4 font-mono">
                  <div className="border border-slate-300 rounded-xl overflow-hidden font-mono">
                    <div className={`${
                      viewingSubmission.department.startsWith("Accounts") ? "bg-slate-900 text-slate-50" :
                      viewingSubmission.department === "Sales" ? "bg-emerald-955 text-emerald-50" :
                      viewingSubmission.department === "Creative" ? "bg-indigo-955 text-indigo-50" :
                      viewingSubmission.department === "Event" ? "bg-red-955 text-red-55" :
                      "bg-amber-955 text-amber-50"
                    } p-4`}>
                      <h4 className="text-sm font-black uppercase tracking-wider font-mono">
                        {DEPARTMENT_SCHEMAS[getDepartmentSchemaKey(viewingSubmission.department)]?.title || viewingSubmission.department + " DSR"}
                      </h4>
                      <p className="text-[10px] opacity-80 mt-0.5 font-bold font-mono">
                        {DEPARTMENT_SCHEMAS[getDepartmentSchemaKey(viewingSubmission.department)]?.subtitle}
                      </p>
                    </div>

                    <div className="bg-slate-50 border-b border-slate-200 p-4 text-xs font-bold space-y-1 font-mono">
                      <div className="grid grid-cols-12 gap-1.5">
                        <span className="col-span-3 text-slate-400 font-bold uppercase text-[10px]">Subject:</span>
                        <span className="col-span-9 font-mono text-indigo-950 break-all">{viewingSubmission.subject}</span>
                      </div>
                      <div className="grid grid-cols-12 gap-1 pt-1 border-t border-slate-200/50">
                        <span className="col-span-3 text-slate-400 font-bold uppercase text-[10px]">Employee Name:</span>
                        <span className="col-span-9 text-slate-800">{viewingSubmission.employeeName}</span>
                      </div>
                      <div className="grid grid-cols-12 gap-1">
                        <span className="col-span-3 text-slate-400 font-bold uppercase text-[10px]">Reporting Date:</span>
                        <span className="col-span-9 text-slate-800 font-mono">{viewingSubmission.date.split("-").reverse().join("/")}</span>
                      </div>
                    </div>

                    <div className="divide-y divide-slate-200 font-mono">
                      {(() => {
                        const schemaKey = getDepartmentSchemaKey(viewingSubmission.department);
                        const schema = DEPARTMENT_SCHEMAS[schemaKey];
                        if (schema) {
                          return schema.fields.map((field: FieldDef) => {
                            const val = viewingSubmission.fields && viewingSubmission.fields[field.id];
                            return (
                              <div key={field.id} className="grid grid-cols-12 min-h-[44px]">
                                <div className="col-span-4 p-3 bg-slate-50/60 border-r border-slate-200 flex items-center font-bold text-slate-700 text-xs font-mono">
                                  {field.label.split(". ")[1] || field.label}
                                </div>
                                <div className="col-span-8 p-3 flex items-center text-xs text-slate-800 font-mono whitespace-pre-wrap leading-relaxed font-semibold">
                                  {val || <span className="text-slate-400 italic">No entry</span>}
                                </div>
                              </div>
                            );
                          });
                        }
                        return null;
                      })()}
                      {/* Any columns from the Google Sheet that didn't match a known
                          field label are still shown here, so nothing is lost. */}
                      {Array.isArray(viewingSubmission._rawFields) && viewingSubmission._rawFields.length > 0 &&
                        viewingSubmission._rawFields.map((extra: { label: string; value: string }, idx: number) => (
                          <div key={`extra-${idx}`} className="grid grid-cols-12 min-h-[44px]">
                            <div className="col-span-4 p-3 bg-amber-50/60 border-r border-slate-200 flex items-center font-bold text-slate-700 text-xs font-mono">
                              {extra.label}
                            </div>
                            <div className="col-span-8 p-3 flex items-center text-xs text-slate-800 font-mono whitespace-pre-wrap leading-relaxed font-semibold">
                              {extra.value || <span className="text-slate-400 italic">No entry</span>}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => {
                        const schemaKey = getDepartmentSchemaKey(viewingSubmission.department);
                        const schema = DEPARTMENT_SCHEMAS[schemaKey];
                        const fieldsStr = schema ? schema.fields.map((f: FieldDef, i: number) => `${i + 1}. ${f.label.split(". ")[1] || f.label}: ${viewingSubmission.fields[f.id] || "N/A"}`).join("\n") : "";
                        const fullReport = `Subject: ${viewingSubmission.subject}\nDate: ${viewingSubmission.date}\nEmployee: ${viewingSubmission.employeeName}\n\n${fieldsStr}`;
                        navigator.clipboard.writeText(fullReport);
                        alert("Report copied to clipboard!");
                      }}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 py-1.5 px-3 rounded-lg border border-slate-350 text-xs font-bold transition flex items-center gap-1 cursor-pointer font-mono"
                    >
                      <Copy className="w-4 h-4" />
                      <span>Copy text</span>
                    </button>
                    <button
                      onClick={() => setViewingSubmission(null)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white py-1.5 px-3 rounded-lg text-xs font-bold transition cursor-pointer font-mono"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

      </main>

      {/* DEDICATED PREVIEW OPTION MODAL */}
      {showPreviewModal && currentUser && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 font-mono">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden border border-slate-200">
            
            <div className="bg-slate-900 text-white p-5 flex justify-between items-center border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-amber-400" />
                <div>
                  <h4 className="font-extrabold text-sm uppercase tracking-wider font-mono">
                    DSR Form Preview Option
                  </h4>
                  <p className="text-[10px] text-slate-400 font-medium font-mono">
                    This is how your status report will save and appear inside Shradha&apos;s admin dashboard.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="text-slate-400 hover:text-white bg-slate-800 p-1.5 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4 font-mono">
              
              <div className="border-2 border-slate-300 rounded-xl overflow-hidden">
                
                <div className={`${userSchema.theme.bg} ${userSchema.theme.text} p-4`}>
                  <h3 className="text-xs font-black tracking-widest uppercase font-mono">{userSchema.title}</h3>
                  <p className="text-[10px] font-bold opacity-90 mt-0.5 font-mono">{userSchema.subtitle}</p>
                </div>

                <div className="bg-slate-50 border-b border-slate-200 p-4 text-xs font-bold space-y-1">
                  <div className="grid grid-cols-12 gap-1">
                    <span className="col-span-3 text-slate-400 font-extrabold text-[9px] uppercase tracking-wider">Subject Line:</span>
                    <span className="col-span-9 font-mono text-indigo-900 break-all">
                      {generateSubjectLine(currentUser.department, currentUser.name, selectedDate)}
                    </span>
                  </div>
                  <div className="grid grid-cols-12 gap-1 pt-1.5 border-t border-slate-200/50">
                    <span className="col-span-3 text-slate-400 font-extrabold text-[9px] uppercase tracking-wider">Employee Name:</span>
                    <span className="col-span-9 text-slate-900">{currentUser.name}</span>
                  </div>
                  <div className="grid grid-cols-12 gap-1">
                    <span className="col-span-3 text-slate-400 font-extrabold text-[9px] uppercase tracking-wider">Reporting Date:</span>
                    <span className="col-span-9 text-slate-900 font-mono">
                      {selectedDate.split("-").reverse().join("/")}
                    </span>
                  </div>
                </div>

                <div className="divide-y divide-slate-200">
                  {userSchema.fields.map((field: FieldDef) => {
                    const value = formData[field.id];
                    const isBlank = !value || value.trim() === "";
                    return (
                      <div key={field.id} className="grid grid-cols-12 min-h-[40px] hover:bg-slate-50 transition">
                        <div className="col-span-4 p-3 bg-slate-50/70 border-r border-slate-200 flex items-center">
                          <span className="text-xs font-black text-slate-700 leading-tight font-mono">
                            {field.label.split(". ")[1] || field.label}
                          </span>
                        </div>
                        <div className="col-span-8 p-3 flex items-center">
                          {isBlank ? (
                            <span className="text-xs text-rose-500 italic font-black font-mono">
                              [Field is empty]
                            </span>
                          ) : (
                            <span className="text-xs text-slate-800 whitespace-pre-wrap leading-relaxed font-mono font-bold">
                              {value}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>

            </div>

            <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end gap-2 font-mono">
              <button
                onClick={() => setShowPreviewModal(false)}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer font-mono"
              >
                Close Preview
              </button>
              <button
                onClick={() => {
                  setShowPreviewModal(false);
                  handleFormSubmit(new Event('submit') as any);
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <FileCheck className="w-4 h-4" />
                <span>Confirm & Submit Report Now</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* PIN SETTINGS MODAL */}
      {showPinModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-indigo-900 text-indigo-50 p-5">
              <h4 className="font-extrabold text-sm uppercase tracking-wider flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-yellow-400" />
                <span>Change Private PIN</span>
              </h4>
            </div>

            <form onSubmit={handlePinChangeSubmit} className="p-5 space-y-4">
              {pinChangeSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs font-bold">
                  ✓ {pinChangeSuccess}
                </div>
              )}

              {pinChangeError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs font-bold">
                  ⚠️ {pinChangeError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Current PIN
                </label>
                <input
                  type="password"
                  maxLength={10}
                  placeholder="Enter current PIN"
                  value={pinChangeCurrent}
                  onChange={(e) => setPinChangeCurrent(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-800"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  New PIN
                </label>
                <input
                  type="password"
                  maxLength={10}
                  placeholder="At least 4 digits"
                  value={pinChangeNew}
                  onChange={(e) => setPinChangeNew(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-800"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowPinModal(false);
                    setPinChangeCurrent("");
                    setPinChangeNew("");
                    setPinChangeSuccess("");
                    setPinChangeError("");
                  }}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-755 font-black py-3 rounded-xl text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-xs font-bold transition cursor-pointer"
                >
                  Save PIN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-indigo-950 text-slate-400 py-8 border-t border-slate-800 font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs space-y-1">
          <p className="font-extrabold text-slate-300">
            DSR Flow Portal
          </p>
          <div className="text-[10px] text-slate-600">
            Secured Database Synced
          </div>
        </div>
      </footer>
    </div>
  );
}
