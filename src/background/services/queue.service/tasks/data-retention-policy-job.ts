import { SegmentAnalyticsEvents } from '@/src/background/commons/analytics';
import { analyticsTrack } from '@/src/background/commons/analytics';
import { databaseService, minkService, userService } from '../..';
import { Task } from '../../../commons/types/task';
import { isProduction } from '@/src/misc';
import { scope as sentryScope } from '@/src/lib/sentry';

sentryScope.setTag("service", "tasks/data-retention-policy-job.ts");

const calculateSize = (data: string) => {
    return new Blob([data]).size;
}

export class DataRetentionPolicyJob extends Task<string> {
    openAiService: any;

    constructor() {
        super('DataRetentionPolicyJob');
    }

    async do() {
        try {
            console.log('Starting to clean up data retention policy');

            const allPageData = await databaseService.db.PageData.toArray();
            const allSummaryResults = await databaseService.db.SummaryResults.toArray();

            const totalSize = calculateSize(JSON.stringify(allPageData)) + calculateSize(JSON.stringify(allSummaryResults));
            const sizeInMB = (totalSize / 1024 / 1024).toFixed(2);
            console.log('Total size of data to be deleted', sizeInMB);

            if (!isProduction) return console.log('Data cleanup is disabled in non-production environment', {
                settings: await userService.getSettings(),
                totalSize: sizeInMB,
                timestamp: new Date().toISOString(),
            });

            await analyticsTrack(SegmentAnalyticsEvents.DATA_RETENTION_POLICY_CLEANUP, {
                settings: await userService.getSettings(),
                totalSize: sizeInMB,
                timestamp: new Date().toISOString(),
            });
            await databaseService.db.PageData.clear();
            await databaseService.db.SummaryResults.clear();
            console.log('Data retention policy cleaned up');
        } catch (error) {
            sentryScope.captureException(error);
            console.error(error);
        }
    }
}
