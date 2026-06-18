import * as scrapeRepo from '../../repositories/project/scrapeRepository.js';

function parseContentJson(contentJson) {
  if (!contentJson) return null;
  if (typeof contentJson === 'string') {
    try {
      return JSON.parse(contentJson);
    } catch {
      return null;
    }
  }
  return contentJson;
}

function parsePrice(value) {
  if (value == null) return null;
  const cleaned = String(value).replace(/[£$€,\s]/g, '').trim();
  const num = parseFloat(cleaned);
  return Number.isFinite(num) ? num : null;
}

function formatChartDate(date) {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return String(date);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function extractMetrics(content) {
  const summary = content?.summary || {};
  const textCount = summary.textCount ?? (content?.text?.length || 0);
  const linkCount = summary.linkCount ?? (content?.links?.length || 0);
  const imageCount = summary.imageCount ?? (content?.images?.length || 0);

  let price = null;
  const items = Array.isArray(content?.items) ? content.items : [];
  if (items.length > 0 && items[0]?.price != null) {
    price = parsePrice(items[0].price);
  }

  return { price, textCount, linkCount, imageCount };
}

export async function getProjectHistory(projectId) {
  const runs = await scrapeRepo.findCompletedRunsWithData(projectId);

  const history = runs.map((run) => {
    const content = parseContentJson(run.content_json);
    const metrics = extractMetrics(content);

    return {
      date: formatChartDate(run.completed_at),
      completedAt: run.completed_at,
      runId: run.run_id,
      ...metrics,
    };
  });

  const hasPrice = history.some((point) => point.price != null);

  return { history, hasPrice };
}
