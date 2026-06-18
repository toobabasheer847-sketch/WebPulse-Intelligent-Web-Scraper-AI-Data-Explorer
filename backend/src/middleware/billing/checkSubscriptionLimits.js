import * as userRepo from '../../repositories/user/userRepository.js';
import * as scrapeRepo from '../../repositories/project/scrapeRepository.js';
import { hasProAccess, FREE_TIER, PRO_TIER } from '../../constants/subscription.js';
import { forbidden } from '../../utils/errors.js';

/**
 * Enforces Free-tier project limits on POST /api/projects.
 * Pro users (active or trialing) have unlimited projects.
 */
export async function checkSubscriptionLimits(req, res, next) {
  try {
    const user = await userRepo.findById(req.user.id);
    if (!user) {
      return next(forbidden('User not found'));
    }

    if (hasProAccess(user)) {
      return next();
    }

    const projectCount = await userRepo.countProjects(req.user.id);
    if (projectCount >= FREE_TIER.MAX_PROJECTS) {
      return next(
        forbidden('Free tier limit reached. Please upgrade to Pro.')
      );
    }

    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Enforces monthly record limits on POST /api/projects/:id/scrape.
 * Inactive or free-tier users are capped at FREE_TIER.MAX_RECORDS_PER_MONTH.
 */
export async function checkScrapeRecordLimits(req, res, next) {
  try {
    const user = await userRepo.findById(req.user.id);
    if (!user) {
      return next(forbidden('User not found'));
    }

    const monthlyLimit = hasProAccess(user)
      ? PRO_TIER.MAX_RECORDS_PER_MONTH
      : FREE_TIER.MAX_RECORDS_PER_MONTH;

    const monthlyRecords = await scrapeRepo.countMonthlyRecordsByUser(req.user.id);
    if (monthlyRecords >= monthlyLimit) {
      const message = hasProAccess(user)
        ? 'Monthly record limit reached for your Pro plan.'
        : 'Free tier monthly record limit reached. Please upgrade to Pro.';
      return next(forbidden(message));
    }

    next();
  } catch (err) {
    next(err);
  }
}
