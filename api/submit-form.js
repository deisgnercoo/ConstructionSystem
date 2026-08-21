// Vercel serverless function: validates website form submissions, then
// notifies the team on Slack and by email. Both the Slack webhook URL and
// the email API key are read from environment variables and never sent to
// or exposed in the browser — this file only ever runs server-side.
//
// Required environment variables (Vercel project -> Settings -> Environment
// Variables, then redeploy):
//   SLACK_WEBHOOK_URL  Incoming Webhook URL for the #contact-form channel.
//                      Create at https://api.slack.com/apps -> your app ->
//                      "Incoming Webhooks" -> Add New Webhook to Workspace.
//   RESEND_API_KEY     API key from https://resend.com (Dashboard -> API Keys).
//   EMAIL_FROM         Optional. Verified "from" address, e.g.
//                      "4C Construction System <notifications@4ccs.com>".
//                      Falls back to Resend's sandbox sender if unset, which
//                      is fine for testing but has production limitations.
//
// Slack and email are each attempted independently: if one is unconfigured
// or fails, the other can still go through, and nothing about the failure
// (or either secret) is ever sent back to the browser or logged.

// TEMPORARY: pointed at the Resend account's own signup address for testing,
// since Resend's sandbox sender (no verified domain yet) can only deliver to
// that address (confirmed via the 403 in Vercel's logs). Switch this back to
// the real destination once a sending domain is verified in Resend.
const EMAIL_TO = "deisgnercoo@gmail.com";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

async function sendSlack(webhookUrl, formName, fields) {
  const lines = fields.map((f) => `*${f.label}:* ${f.value}`);
  const text = [`*New Website Contact*`, `_Submitted via: ${formName}_`, "", ...lines].join("\n");

  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error(`Slack responded with ${res.status}`);
}

async function sendEmail(apiKey, from, formName, fields) {
  const rows = fields
    .map(
      (f) =>
        `<tr><td style="padding:6px 12px 6px 0;color:#6b7684;white-space:nowrap;"><strong>${escapeHtml(
          f.label
        )}</strong></td><td style="padding:6px 0;">${escapeHtml(f.value).replace(/\n/g, "<br />")}</td></tr>`
    )
    .join("");
  const html = `<div style="font-family:sans-serif;font-size:15px;color:#14181f;">
    <h2 style="margin:0 0 16px;">New Website Contact</h2>
    <p style="margin:0 0 16px;color:#6b7684;">Submitted via: ${escapeHtml(formName)}</p>
    <table style="border-collapse:collapse;">${rows}</table>
  </div>`;
  const text = [`New Website Contact`, `Submitted via: ${formName}`, "", ...fields.map((f) => `${f.label}: ${f.value}`)].join(
    "\n"
  );

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from: from || "4C Construction System <onboarding@resend.dev>",
      to: [EMAIL_TO],
      subject: `New Website Contact — ${formName}`,
      html,
      text,
    }),
  });
  if (!res.ok) throw new Error(`Resend responded with ${res.status}`);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  // ---- Server-side validation (mirrors the form's own required/type=email
  // rules, so a request that bypasses the browser can't skip them). ----
  const { formName, fields } = req.body || {};
  if (!Array.isArray(fields) || fields.length === 0) {
    res.status(400).json({ error: "No form fields submitted" });
    return;
  }
  const cleanFields = fields
    .filter((f) => f && typeof f.value === "string" && f.value.trim())
    .map((f) => ({ name: f.name, label: f.label || f.name || "Field", value: f.value.trim() }));

  const nameField = findField(cleanFields, "name");
  const emailField = findField(cleanFields, "email");
  if (!nameField || !emailField) {
    res.status(400).json({ error: "Name and email are required" });
    return;
  }
  if (!EMAIL_RE.test(emailField.value)) {
    res.status(400).json({ error: "A valid email address is required" });
    return;
  }

  const safeFormName = typeof formName === "string" && formName.trim() ? formName.trim() : "website";

  // ---- Notify Slack and email independently; one working is enough to
  // report success back to the client, so a single misconfigured channel
  // doesn't drop a real submission. ----
  const results = await Promise.allSettled([
    (async () => {
      const webhookUrl = process.env.SLACK_WEBHOOK_URL;
      if (!webhookUrl) throw new Error("Slack not configured");
      await sendSlack(webhookUrl, safeFormName, cleanFields);
    })(),
    (async () => {
      const apiKey = process.env.RESEND_API_KEY;
      if (!apiKey) throw new Error("Email not configured");
      await sendEmail(apiKey, process.env.EMAIL_FROM, safeFormName, cleanFields);
    })(),
  ]);

  const [slackResult, emailResult] = results;
  if (slackResult.status === "rejected") {
    // Never log the webhook URL or any request/response body — just enough
    // to tell from the Vercel function logs that Slack needs attention.
    console.error("submit-form: Slack notification failed:", slackResult.reason?.message || "unknown error");
  }
  if (emailResult.status === "rejected") {
    console.error("submit-form: Email notification failed:", emailResult.reason?.message || "unknown error");
  }

  const anySucceeded = results.some((r) => r.status === "fulfilled");
  if (!anySucceeded) {
    res.status(502).json({ error: "Failed to deliver submission" });
    return;
  }

  res.status(200).json({ ok: true });
}
