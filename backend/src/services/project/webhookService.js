import https from 'https';
import http from 'http';
import { URL } from 'url';
import * as webhookRepo from '../../repositories/webhookRepository.js';

// ─── Low-level HTTP POST (no external deps) ──────────────────────────────────
function postJson(webhookUrl, payload) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload);
    const parsed = new URL(webhookUrl);
    const isHttps = parsed.protocol === 'https:';
    const options = {
      hostname: parsed.hostname,
      port: parsed.port || (isHttps ? 443 : 80),
      path: parsed.pathname + parsed.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'User-Agent': 'WebPulse/1.0',
      },
    };

    const req = (isHttps ? https : http).request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ ok: true, status: res.statusCode });
        } else {
          resolve({ ok: false, status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(8000, () => { req.destroy(new Error('Webhook request timed out')); });
    req.write(body);
    req.end();
  });
}

// ─── Slack payload builder ────────────────────────────────────────────────────
function buildSlackPayload(projectName, websiteUrl, changeLogs) {
  const changeLines = changeLogs.slice(0, 15).map((c) => {
    const icon = c.change_type === 'added' ? '🟢' : c.change_type === 'removed' ? '🔴' : '🟡';
    const oldVal = c.old_value ?? '—';
    const newVal = c.new_value ?? '—';
    return `${icon} *${c.field_name}* (${c.change_type})\n   Before: \`${oldVal}\`\n   After:  \`${newVal}\``;
  });

  if (changeLogs.length > 15) {
    changeLines.push(`_…and ${changeLogs.length - 15} more change(s)_`);
  }

  return {
    blocks: [
      {
        type: 'header',
        text: { type: 'plain_text', text: `🔔 WebPulse — Changes detected in "${projectName}"`, emoji: true },
      },
      {
        type: 'section',
        text: { type: 'mrkdwn', text: `*URL:* <${websiteUrl}|${websiteUrl}>\n*Changes detected:* ${changeLogs.length}` },
      },
      { type: 'divider' },
      {
        type: 'section',
        text: { type: 'mrkdwn', text: changeLines.join('\n\n') || '_No detail available_' },
      },
      {
        type: 'context',
        elements: [{ type: 'mrkdwn', text: `Sent by *WebPulse* · ${new Date().toUTCString()}` }],
      },
    ],
  };
}

// ─── Discord payload builder ──────────────────────────────────────────────────
function buildDiscordPayload(projectName, websiteUrl, changeLogs) {
  const fieldEntries = changeLogs.slice(0, 20).map((c) => {
    const icon = c.change_type === 'added' ? '🟢' : c.change_type === 'removed' ? '🔴' : '🟡';
    return {
      name: `${icon} ${c.field_name} (${c.change_type})`,
      value: `**Before:** \`${c.old_value ?? '—'}\`\n**After:** \`${c.new_value ?? '—'}\``,
      inline: false,
    };
  });

  if (changeLogs.length > 20) {
    fieldEntries.push({
      name: 'More changes',
      value: `…and ${changeLogs.length - 20} more change(s)`,
      inline: false,
    });
  }

  return {
    embeds: [
      {
        title: `🔔 Changes detected in "${projectName}"`,
        url: websiteUrl,
        color: 0x7c3aed, // purple-700
        description: `**${changeLogs.length}** change(s) were detected during the latest scrape.`,
        fields: fieldEntries,
        footer: { text: 'WebPulse Monitoring' },
        timestamp: new Date().toISOString(),
      },
    ],
  };
}

// ─── Test payload builders ────────────────────────────────────────────────────
function buildSlackTestPayload() {
  return {
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '✅ *Hello from WebPulse!*\nYour Slack webhook integration is working successfully.',
        },
      },
    ],
  };
}

function buildDiscordTestPayload() {
  return {
    embeds: [
      {
        title: '✅ WebPulse — Test Notification',
        description: 'Hello from WebPulse! Your Discord webhook integration is working successfully.',
        color: 0x22c55e, // green-500
        footer: { text: 'WebPulse Monitoring' },
        timestamp: new Date().toISOString(),
      },
    ],
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Send change notifications to all active webhooks for a project.
 */
export async function sendWebhookNotification(projectId, changeLogs, projectName, websiteUrl) {
  if (!changeLogs?.length) return;

  let hooks;
  try {
    hooks = await webhookRepo.findActiveByProject(projectId);
  } catch (err) {
    console.error('[Webhook] Failed to fetch webhooks:', err.message);
    return;
  }

  for (const hook of hooks) {
    try {
      const payload =
        hook.platform === 'slack'
          ? buildSlackPayload(projectName, websiteUrl, changeLogs)
          : buildDiscordPayload(projectName, websiteUrl, changeLogs);

      const result = await postJson(hook.url, payload);
      if (!result.ok) {
        console.warn(`[Webhook] ${hook.platform} delivery failed (HTTP ${result.status}) for project ${projectId}`);
      } else {
        console.log(`[Webhook] ${hook.platform} notification sent for project ${projectId}`);
      }
    } catch (err) {
      console.error(`[Webhook] Error sending to ${hook.platform} (${hook.id}):`, err.message);
    }
  }
}

/**
 * Send a test ping to a single webhook URL.
 */
export async function sendTestNotification(platform, url) {
  const payload = platform === 'slack' ? buildSlackTestPayload() : buildDiscordTestPayload();
  return postJson(url, payload);
}
