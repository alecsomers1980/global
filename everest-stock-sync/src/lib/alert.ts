import notifier from "node-notifier";
import { log } from "./logger.js";

/**
 * Failure alert. Three channels, all best-effort:
 *  1. loud console log,
 *  2. a Windows desktop popup (immediate, on-screen),
 *  3. a webhook POST if ALERT_WEBHOOK_URL is set (Slack/Discord/Telegram).
 * Email/WhatsApp can plug in here later.
 */
export async function sendAlert(subject: string, detail: string) {
  log("error", `ALERT: ${subject}`, detail);

  // Desktop popup — the "directly with a popup" channel.
  try {
    notifier.notify({
      title: `⚠️ ${subject}`,
      message: detail.slice(0, 240),
      sound: true,
      wait: false,
    });
  } catch (err) {
    log("warn", "Failed to show desktop popup", err);
  }

  const url = process.env.ALERT_WEBHOOK_URL;
  if (!url) return;

  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // Slack & Discord both accept a "text"/"content" field; send both.
      body: JSON.stringify({
        text: `*${subject}*\n${detail}`,
        content: `**${subject}**\n${detail}`,
      }),
    });
  } catch (err) {
    log("warn", "Failed to deliver webhook alert", err);
  }
}
