// Vercel serverless function: relays website form submissions to Slack.
//
// The Slack Incoming Webhook URL must never reach the browser, so this runs
// server-side and reads it from an environment variable instead of from any
// request the client sends. Set SLACK_WEBHOOK_URL in the Vercel project's
// Settings -> Environment Variables (Production, and Preview if you want
// preview deployments to post too), then redeploy.
//
// Create the webhook itself at https://api.slack.com/apps -> your app ->
// "Incoming Webhooks" -> Add New Webhook to Workspace, pick the channel
// (e.g. #contact-form), and copy the URL it gives you.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) {
    res.status(500).json({ error: "SLACK_WEBHOOK_URL is not configured" });
    return;
  }

  const { formName, fields } = req.body || {};
  if (!Array.isArray(fields) || fields.length === 0) {
    res.status(400).json({ error: "No form fields submitted" });
    return;
  }

  const lines = fields
    .filter((f) => f && typeof f.value === "string" && f.value.trim())
    .map((f) => `*${f.label}:* ${f.value.trim()}`);

  if (lines.length === 0) {
    res.status(400).json({ error: "No form fields submitted" });
    return;
  }

  const text = [`:incoming_envelope: *New ${formName || "website"} submission*`, ...lines].join("\n");

  try {
    const slackRes = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!slackRes.ok) {
      throw new Error(`Slack responded with ${slackRes.status}`);
    }
    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(502).json({ error: "Failed to notify Slack", detail: String(err) });
  }
}
