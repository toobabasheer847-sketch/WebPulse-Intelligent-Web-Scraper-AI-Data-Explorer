import * as projectRepo from '../../repositories/project/projectRepository.js';
import * as scrapeRepo from '../../repositories/project/scrapeRepository.js';
import * as notificationRepo from '../../repositories/notification/notificationRepository.js';
import { scrape } from '../scraper/scraperService.js';
import { processScrapedData, countExtractedItems } from './dataProcessor.js';
import { detectChanges } from '../notification/changeDetectionService.js';
import { sendWebhookNotification } from './webhookService.js';
import { generateEmbedding, extractTextForEmbedding } from '../ai/aiService.js';
import { notFound } from '../../utils/errors.js';

// Helper function to deep compare two values (objects, arrays, primitives)
function deepEqual(a, b) {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (typeof a !== 'object' || a === null || b === null) return false;
  
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  
  for (const key of keysA) {
    if (!keysB.includes(key)) return false;
    if (!deepEqual(a[key], b[key])) return false;
  }
  
  return true;
}

export async function executeScrapeJob({ projectId, runId, userId }) {
  const project = await projectRepo.findById(projectId);
  if (!project) throw notFound('Project not found');

  await scrapeRepo.updateRunStatus(runId, 'running');

  try {
    const { data: rawData, scraperUsed } = await scrape(project);
    console.log('[ScrapeJob] Raw scraped data:', JSON.stringify(rawData, null, 2));
    const processed = processScrapedData(rawData);
    processed.scraperUsed = scraperUsed;
    console.log('[ScrapeJob] Processed data:', JSON.stringify(processed, null, 2));

    const extractedCount = countExtractedItems(processed);
    console.log(`[ScrapeJob] Extracted ${extractedCount} item(s) for project "${project.name}"`);
    if (extractedCount === 0) {
      console.warn('[ScrapeJob] Scraper completed but 0 items were extracted.');
    }

    // Get previous data first to compare
    const previous = await scrapeRepo.getLatestDataForProject(projectId);
    let saved = null;
    let changes = [];
    let hasChanges = true;

    // Compare with previous data
    if (previous) {
      hasChanges = !deepEqual(processed, previous.content_json);
    }

    if (hasChanges) {
      // Only save data if there are changes
      let embedding = null;
      try {
        const text = extractTextForEmbedding(processed);
        if (text.length > 10) {
          embedding = await generateEmbedding(text);
        }
      } catch (err) {
        console.warn('Embedding generation skipped:', err.message);
      }

      saved = await scrapeRepo.saveScrapedData({
        runId,
        projectId,
        contentJson: processed,
        embedding,
      });

      changes = await detectChanges(
        projectId,
        runId,
        previous?.content_json,
        processed
      );

      // Fire webhook notifications for any detected changes (non-blocking)
      if (changes.length > 0) {
        sendWebhookNotification(projectId, changes, project.name, project.website_url).catch((err) =>
          console.error('[ScrapeJob] Webhook notification error:', err.message)
        );
      }
    }

    // Update run status with appropriate message
    if (hasChanges) {
      await scrapeRepo.updateRunStatus(runId, 'completed', null, null);
    } else {
      await scrapeRepo.updateRunStatus(runId, 'completed', null, "No changes detected. Data is identical to the previous run.");
    }

    await notificationRepo.create({
      userId,
      projectId,
      type: 'scrape_completed',
      title: 'Scrape completed',
      message: hasChanges 
        ? `Scrape for "${project.name}" completed successfully using ${scraperUsed}.` 
        : `Scrape for "${project.name}" completed successfully using ${scraperUsed}. No changes detected.`,
    });

    if (changes.length > 0) {
      await notificationRepo.create({
        userId,
        projectId,
        type: 'data_changed',
        title: 'Data changes detected',
        message: `${changes.length} change(s) detected in "${project.name}".`,
      });
    }

    return { runId, data: saved, changes: changes.length };
  } catch (err) {
    await scrapeRepo.updateRunStatus(runId, 'failed', err.message, null);
    await notificationRepo.create({
      userId,
      projectId,
      type: 'scrape_failed',
      title: 'Scrape failed',
      message: `Scrape for "${project.name}" failed: ${err.message}`,
    });
    throw err;
  }
}
