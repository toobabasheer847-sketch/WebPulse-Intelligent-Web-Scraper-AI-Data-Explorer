import * as projectRepo from '../../repositories/project/projectRepository.js';
import * as scrapeRepo from '../../repositories/project/scrapeRepository.js';
import * as changeLogRepo from '../../repositories/notification/changeLogRepository.js';
import * as notificationRepo from '../../repositories/notification/notificationRepository.js';

export async function getDashboardStats(userId) {
  const projects = await projectRepo.findByUserId(userId);
  const totalRecords = await scrapeRepo.countByUser(userId);
  const recentScrapes = await scrapeRepo.getRecentRunsForUser(userId, 5);
  const changeCount = await changeLogRepo.countByUser(userId);
  const notifications = await notificationRepo.findByUser(userId, { limit: 10 });
  const unreadCount = await notificationRepo.countUnread(userId);

  return {
    totalProjects: projects.length,
    totalRecords,
    recentScrapes,
    changeCount,
    notifications,
    unreadCount,
    projects: projects.slice(0, 5),
  };
}

export async function getProjectAnalytics(projectId) {
  const changeAnalytics = await changeLogRepo.getAnalyticsByProject(projectId);
  const runs = await scrapeRepo.findRunsByProject(projectId, { limit: 30 });

  const statusCounts = runs.reduce((acc, run) => {
    acc[run.status] = (acc[run.status] || 0) + 1;
    return acc;
  }, {});

  const timeline = runs
    .filter((r) => r.completed_at)
    .map((r) => ({
      date: r.completed_at,
      status: r.status,
    }))
    .reverse();

  const changeByType = changeAnalytics.reduce((acc, row) => {
    acc[row.change_type] = (acc[row.change_type] || 0) + row.count;
    return acc;
  }, {});

  const changesOverTime = changeAnalytics.reduce((acc, row) => {
    const day = row.day?.toISOString?.()?.split('T')[0] || String(row.day);
    if (!acc[day]) acc[day] = { added: 0, removed: 0, updated: 0 };
    acc[day][row.change_type] = row.count;
    return acc;
  }, {});

  return {
    statusCounts,
    timeline,
    changeByType,
    changesOverTime: Object.entries(changesOverTime).map(([date, counts]) => ({
      date,
      ...counts,
    })),
  };
}
