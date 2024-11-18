import { SegmentAnalyticsEvents } from '@/src/background/commons/analytics';
import { analyticsTrack } from '@/src/background/commons/analytics';
import { databaseService, minkService, userService } from '../..';
import { Task } from '../../../commons/types/task';
import OpenAIService from '../../openai.service';
import { isProduction } from '@/src/misc/constants';
import { scope as sentryScope } from '@/src/lib/sentry';

sentryScope.setTag("service", "tasks/create-summerization-and-insights.ts");

const MAX_CONTENT_LENGTH = 256000 - 1000; // 256KB - 1KB
export class CreateSummerizationAndInsights extends Task<string> {
  openAiService: any;

  constructor() {
    super('CreateSummerizationAndInsights');
  }

  async do() {
    try {
      console.log('Starting to create summerization and insights');
      let openAiService = new OpenAIService();
      await openAiService.init();

      const pages = await databaseService.db.PageData.where('isProcessed').notEqual('true').toArray();
      // const pages = await databaseService.db.PageData.toArray();
      if (!pages.length) return console.log('No pages to process');

      const summarizationSessionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      
      await analyticsTrack(SegmentAnalyticsEvents.SUMMARIZATION_STARTED, {
        sessionId: summarizationSessionId,
        settings: await userService.getSettings(),
        totalPages: pages.length,
        timestamp: new Date().toISOString(),
      });

      const validPages = pages.filter((page) => page.content.length > 0 && page.title.length > 0);
      console.log(`found ${validPages.length} valid pages to process`);

      const AiInput = validPages.map((page) => (
        `
          Full Link: ${page.url} \n \n
          Title: ${page.title} \n \n
          Content: ${page.content.substring(0, MAX_CONTENT_LENGTH)} \n \n
          Description: ${page.description} \n \n
          Origin: ${page.origin} \n \n
        `
      ));

      console.log("running get-summary-and-insights");

      const { result, cost } = await openAiService.getSummaryAndInsights(AiInput.join("\n\n"), summarizationSessionId);
      if (!result || !result.summary) {
        throw new Error('No summary found or generated');
      }
      
      await minkService.saveSummaryAndInsights({...result, cost, sessionId: summarizationSessionId});
      await databaseService.db.PageData.bulkPut(pages.map((page) => ({ ...page, isProcessed: 'true' })));
      if (isProduction) {
        // remove the pages from the database
        await databaseService.db.PageData.bulkDelete(pages.map((page) => page.id));
      }

      await analyticsTrack(SegmentAnalyticsEvents.SUMMARIZATION_COMPLETE, {
        cost,
        totalPages: pages.length,
        timestamp: new Date().toISOString(),
        settings: await userService.getSettings(),
        sessionId: summarizationSessionId,
      });

      console.log('Summary and insights saved');

      return {
        result,
        cost
      };

    } catch (error) {
      sentryScope.captureException(error);
      console.log("error in create-summerization-and-insights");
      console.error(error);
    }
  }
}
