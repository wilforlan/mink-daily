import { SegmentAnalyticsEvents } from '@/src/background/commons/analytics';
import { analyticsTrack } from '@/src/background/commons/analytics';
import { databaseService, minkService, userService, billingService, supabaseService, localStorageService } from '../..';
import { Task } from '../../../commons/types/task';
import { isProduction } from '@/src/misc';
import { scope as sentryScope } from '@/src/lib/sentry';

sentryScope.setTag("service", "tasks/run-periodic-email-job.ts");

const summaryExhaustionChecker = async (email: string) => {
    try {
        const { timestamp } = await localStorageService.get('lastSummaryExhaustionCheck');
        const hasSentInTheLast8days = timestamp && new Date(timestamp).getTime() > (new Date().getTime() - (1000 * 60 * 60 * 24 * 8));
        if (hasSentInTheLast8days) {
            return console.log("Already sent a summary exhaustion notification in the last 8 days");
        }
        const { summary_stats, website_stats, isPaidUser } = await billingService.getUsage();
        if (summary_stats.total_remaining <= 0) {
            console.log("No remaining summaries allowed, sending notification to user");
            // Trigger a notification to the user
            await supabaseService.sendEmail(
                {
                    message: `You've used all your daily summaries. \n You will not be able to use Mink until the next month. \n Please upgrade your plan to continue using Mink Daily.`,
                },
                email,
                "Attention Needed: You've used all your daily summaries"
            );
            await analyticsTrack(SegmentAnalyticsEvents.USER_SUMMARY_EXHAUSTION_NOTIFICATION, {
                settings: await userService.getSettings(),
                timestamp: new Date().toISOString(),
                summary_stats,
                website_stats,
                email,
                isPaidUser
            });
            localStorageService.put('lastSummaryExhaustionCheck', {
                timestamp: new Date().toISOString(),
                email
            });
        }
    } catch (error) {
        sentryScope.captureException(error);
        console.error('Error running summary exhaustion checker:', error);
    }
}

export class RunPeriodicEmailJob extends Task<string> {
    openAiService: any;

    constructor() {
        super('RunPeriodicEmailJob');
    }

    async do() {
        try {
            console.log('Starting to run periodic email job');
            const { email } = await userService.getAccountInfo();
            await summaryExhaustionChecker(email);
            const summariesToSend = await databaseService.db.SummaryResults.toArray();
            const summariesToSendNotSent = summariesToSend.filter((summary) => summary.hasSentEmail === 'false' || summary.hasSentEmail === null || !summary.hasSentEmail);
            if (summariesToSendNotSent.length > 0) {
                console.log(`Sending ${summariesToSendNotSent.length} emails for summaries that were not sent yet`);
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
            sentryScope.captureException(error);
            console.error('Error running periodic email job:', error);
        }
    }
}