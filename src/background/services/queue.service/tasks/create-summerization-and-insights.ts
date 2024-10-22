import { Task } from '../../../commons/types/task';
import { EndTaskWithError } from '@/src/background/commons/types/errors';


export class CreateSummerizationAndInsights extends Task<string> {
  constructor() {
    super('CreateMeetingTask');
  }

  async do() {
    console.log('Creating single page summerization');

    // throw new EndTaskWithError(new Error(id));
    return {
      summary: "This is a summary",
    };
  }
}
