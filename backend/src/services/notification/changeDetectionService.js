import * as changeLogRepo from '../../repositories/notification/changeLogRepository.js';
import { flattenForComparison } from '../project/dataProcessor.js';

export async function detectChanges(projectId, runId, previousData, currentData) {
  const prevFlat = previousData ? flattenForComparison(previousData) : {};
  const currFlat = flattenForComparison(currentData);

  const changes = [];
  const allKeys = new Set([...Object.keys(prevFlat), ...Object.keys(currFlat)]);

  for (const key of allKeys) {
    const oldVal = prevFlat[key];
    const newVal = currFlat[key];

    if (oldVal === undefined && newVal !== undefined) {
      changes.push({
        projectId,
        runId,
        fieldName: key,
        changeType: 'added',
        oldValue: null,
        newValue: newVal,
      });
    } else if (oldVal !== undefined && newVal === undefined) {
      changes.push({
        projectId,
        runId,
        fieldName: key,
        changeType: 'removed',
        oldValue: oldVal,
        newValue: null,
      });
    } else if (oldVal !== newVal) {
      changes.push({
        projectId,
        runId,
        fieldName: key,
        changeType: 'updated',
        oldValue: oldVal,
        newValue: newVal,
      });
    }
  }

  if (changes.length) {
    await changeLogRepo.createMany(changes);
  }

  return changes;
}
