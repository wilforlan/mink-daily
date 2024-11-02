import { SegmentAnalyticsEvents } from '@/src/background/commons/analytics';
import { analyticsTrack } from '@/src/background/commons/analytics';
import { databaseService, minkService, userService } from '../..';
import { Task } from '../../../commons/types/task';
import { isProduction } from '@/src/misc';


export class RunPeriodicEmailJob extends Task<string> {
    openAiService: any;

    constructor() {
        super('RunPeriodicEmailJob');
    }

    async do() {
        try {
            console.log('Starting to run periodic email job');
            const summariesToSend = await databaseService.db.SummaryResults.toArray();
            const summariesToSendNotSent = summariesToSend.filter((summary) => summary.hasSentEmail === 'false' || summary.hasSentEmail === null || !summary.hasSentEmail);
            if (summariesToSendNotSent.length > 0) {
                console.log(`Sending ${summariesToSendNotSent.length} emails for summaries that were not sent yet`);
                const { email } = await userService.getAccountInfo();
                const promises = summariesToSendNotSent.map(async (summary) => {
                    try {
                        await minkService.sendMinkDigestEmail({
                            email,
                            ...summary
                        });
                        // update the summary to have the emailSentAt date
                        await databaseService.db.SummaryResults.put({
                            ...summary,
                            hasSentEmail: 'true'
                        }, summary.id);
                    } catch (error) {
                        console.error('Error sending email:', error);
                    }
                });
                await Promise.all(promises);
                console.log(`Emails sent for ${summariesToSendNotSent.length} summaries`);
            }
        } catch (error) {
            console.error('Error running periodic email job:', error);
        }
    }
}