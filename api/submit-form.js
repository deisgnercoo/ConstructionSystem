// Vercel serverless function: validates website form submissions, then
// notifies the team on Slack and by email. Both the Slack webhook URL and
// the email API key are read from process.env at REQUEST TIME and never sent
// to or exposed in the browser -- this file only ever runs server-side.
//
// As of the HubSpot migration, this only serves the "Partner application"
// form on partners.html. The main contact.html form now embeds a HubSpot
// form directly (portal 51531033) and submits straight to HubSpot -- it never
// calls this endpoint, and HubSpot handles its own notification/CRM routing.
//
// Required environment variables (Vercel project -> Settings -> Environment
// Variables -> Production, then redeploy):
//   SLACK_WEBHOOK_URL  Incoming Webhook URL for the #contact-form channel.
//                      Create at https://api.slack.com/apps -> your app ->
//                      "Incoming Webhooks" -> Add New Webhook to Workspace.
//   RESEND_API_KEY     API key from https://resend.com (Dashboard -> API Keys).
//                      Set in Vercel only; it must never appear in this file,
//                      in any committed file, or in anything sent to a browser.
//   EMAIL_FROM         Optional override for the sender. Defaults to the
//                      verified production sender below, so it only needs
//                      setting if that address ever changes.
//
// Delivery is all-or-nothing on purpose: the browser is only told the
// submission succeeded once BOTH Slack and the email have gone out. A partial
// success used to be reported as a success, which is how a submission the team
// never received could still show the visitor a confirmation.

// Sender uses send.4ccs.com, the domain verified in Resend. Not a secret, so
// it is a code default rather than required configuration -- one less setting
// that can be missing or mistyped in a deploy.
const EMAIL_FROM_DEFAULT = "4C Website <website@send.4ccs.com>";
// Final destination for every form submission. This is the internal
// notification recipient only -- the address shown to visitors on the site
// (footer links, the contact page, GENERIC_DELIVERY_ERROR below) is still
// info@4ccs.com and is deliberately kept separate from this.
const EMAIL_TO = "denny@4ccs.com";
// Anchored and rejecting all whitespace, so a value that passes can never
// carry the CR/LF needed for header injection into the Reply-To.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Generous enough for a long project description, small enough that a bot
// can't push a megabyte of text into Slack or an email body.
const MAX_FIELD_LENGTH = 5000;
const MAX_FIELDS = 40;
// Upstream calls get their own deadline so a hanging provider surfaces as a
// clean 502 instead of running out the platform's function timeout.
const UPSTREAM_TIMEOUT_MS = 10000;

// What the visitor is shown when delivery fails. Deliberately free of provider
// names, status codes and stack traces -- the detail goes to the server log.
const GENERIC_DELIVERY_ERROR =
  "Sorry, we couldn't send your message just now. Please try again, or email us directly at info@4ccs.com.";

function findField(fields, name) {
  return fields.find((f) => f && f.name === name);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Provider error bodies are worth logging -- they are the only way to tell a
// bad Slack webhook from an unverified Resend domain -- but they are scrubbed
// first so a credential echoed back by a provider can never reach the log.
function redact(value) {
  return String(value == null ? "" : value)
    .replace(/re_[A-Za-z0-9_-]{6,}/g, "re_[redacted]")
    .replace(/https:\/\/hooks\.slack\.com\/\S*/gi, "[slack-webhook-redacted]")
    .replace(/(Bearer|Authorization)\s*[:=]?\s*\S+/gi, "$1 [redacted]")
    .slice(0, 400);
}

// Vercel's Node runtime normally parses a JSON body onto req.body, but that
// depends on the request carrying the right Content-Type. Falling back to the
// raw stream means a submission is never rejected as "empty" just because the
// platform didn't pre-parse it.
async function readJsonBody(req) {
  const parsed = req.body;
  if (parsed && typeof parsed === "object" && !Buffer.isBuffer(parsed)) return parsed;
  if (typeof parsed === "string" && parsed.trim()) {
    try {
      return JSON.parse(parsed);
    } catch (e) {
      return null;
    }
  }
  if (Buffer.isBuffer(parsed) && parsed.length) {
    try {
      return JSON.parse(parsed.toString("utf8"));
    } catch (e) {
      return null;
    }
  }
  try {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    if (!chunks.length) return null;
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch (e) {
    return null;
  }
}

async function sendSlack(webhookUrl, formName, fields) {
  const lines = fields.map((f) => `*${f.label}:* ${f.value}`);
  const text = ["*New Website Contact*", `_Submitted via: ${formName}_`, "", ...lines].join("\n");

  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
    signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Slack responded with ${res.status} ${redact(detail)}`);
  }
}

async function sendEmail(apiKey, from, formName, fields, replyTo) {
  const rows = fields
    .map(
      (f) =>
        `<tr><td style="padding:6px 12px 6px 0;color:#6b7684;white-space:nowrap;vertical-align:top;"><strong>${escapeHtml(
          f.label
        )}</strong></td><td style="padding:6px 0;">${escapeHtml(f.value).replace(/\n/g, "<br />")}</td></tr>`
    )
    .join("");
  const html = `<div style="font-family:sans-serif;font-size:15px;color:#14181f;">
    <h2 style="margin:0 0 16px;">New Website Contact</h2>
    <p style="margin:0 0 16px;color:#6b7684;">Submitted via: ${escapeHtml(formName)}</p>
    <table style="border-collapse:collapse;">${rows}</table>
  </div>`;
  const text = [
    "New Website Contact",
    `Submitted via: ${formName}`,
    "",
    ...fields.map((f) => `${f.label}: ${f.value}`),
  ].join("\n");

  const payload = {
    from: from || EMAIL_FROM_DEFAULT,
    to: [EMAIL_TO],
    subject: `New Website Contact — ${formName}`,
    html,
    text,
  };
  // Replying to the notification goes straight back to the visitor rather
  // than to the unattended sending address. Only ever set from a value that
  // has already passed EMAIL_RE.
  if (replyTo) payload.reply_to = [replyTo];

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Resend responded with ${res.status} ${redact(detail)}`);
  }
}

// The site is served from Bluehost while this function stays on Vercel, so
// every real submission is now cross-origin. Only these exact origins are
// answered; anything else gets no Access-Control-Allow-Origin header at all,
// which is what makes the browser refuse the response. Listed explicitly
// rather than "*" so a hostile page can't POST through a visitor's browser.
const ALLOWED_ORIGINS = new Set([
  "https://4ccs.com",
  "https://www.4ccs.com",
]);

export default async function handler(req, res) {
  // Echo the origin back only when it is on the allowlist. Vary: Origin keeps
  // a CDN from caching one origin's CORS answer and serving it to another.
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }

  // The form posts Content-Type: application/json, which is not a "simple"
  // request, so the browser sends this preflight first. It has to be answered
  // before the POST is ever attempted -- without it every submission fails.
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Access-Control-Max-Age", "86400");
    res.status(204).end();
    return;
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  // ---- Server-side validation (mirrors the form's own required/type=email
  // rules, so a request that bypasses the browser can't skip them). Nothing
  // below this block runs for an invalid submission, so an invalid submission
  // can never reach Slack or Resend. ----
  const body = await readJsonBody(req);
  const fields = body && body.fields;
  if (!Array.isArray(fields) || fields.length === 0) {
    res.status(400).json({ error: "No form fields submitted" });
    return;
  }

  const cleanFields = fields
    .slice(0, MAX_FIELDS)
    .filter((f) => f && typeof f.name === "string" && typeof f.value === "string" && f.value.trim())
    .map((f) => ({
      // Keyed off the input's name attribute, never its id or visible label.
      name: f.name,
      label: typeof f.label === "string" && f.label.trim() ? f.label.trim().slice(0, 120) : f.name,
      value: f.value.trim().slice(0, MAX_FIELD_LENGTH),
    }));

  const nameField = findField(cleanFields, "name");
  const emailField = findField(cleanFields, "email");
  if (!nameField) {
    res.status(400).json({ error: "Please enter your name." });
    return;
  }
  if (!emailField) {
    res.status(400).json({ error: "Please enter your email address." });
    return;
  }
  if (!EMAIL_RE.test(emailField.value)) {
    res.status(400).json({ error: "Please enter a valid email address." });
    return;
  }

  const safeFormName =
    body && typeof body.formName === "string" && body.formName.trim()
      ? body.formName.trim().slice(0, 120)
      : "website";

  // ---- Read both secrets at request time. Missing configuration is a server
  // fault, not a visitor mistake, so it is reported as one -- and never as a
  // success. ----
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  const apiKey = process.env.RESEND_API_KEY;
  const missing = [];
  if (!webhookUrl) missing.push("SLACK_WEBHOOK_URL");
  if (!apiKey) missing.push("RESEND_API_KEY");
  if (missing.length) {
    // Names only -- never the values.
    console.error(`submit-form: missing environment variable(s): ${missing.join(", ")}`);
    res.status(500).json({ error: GENERIC_DELIVERY_ERROR });
    return;
  }

  // Both channels are attempted together so one slow provider doesn't add its
  // latency to the other, but both have to succeed for this to be a success.
  const [slackResult, emailResult] = await Promise.allSettled([
    sendSlack(webhookUrl, safeFormName, cleanFields),
    sendEmail(apiKey, process.env.EMAIL_FROM, safeFormName, cleanFields, emailField.value),
  ]);

  const failures = [];
  if (slackResult.status === "rejected") {
    console.error(`submit-form: Slack notification failed: ${redact(slackResult.reason && slackResult.reason.message)}`);
    failures.push("slack");
  }
  if (emailResult.status === "rejected") {
    console.error(`submit-form: Resend email failed: ${redact(emailResult.reason && emailResult.reason.message)}`);
    failures.push("email");
  }

  if (failures.length) {
    // Logged so the Vercel function log says plainly which channel to fix.
    console.error(`submit-form: submission NOT fully delivered (failed: ${failures.join(", ")})`);
    res.status(502).json({ error: GENERIC_DELIVERY_ERROR });
    return;
  }

  console.log(`submit-form: delivered to Slack and ${EMAIL_TO} (form: ${safeFormName})`);
  res.status(200).json({ ok: true });
}
