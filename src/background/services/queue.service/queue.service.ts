import { userService } from '..';
import { CreateSinglePageSummerization } from './tasks';
import moment from 'moment';
import { PriorityQueue } from '@/src/background/commons/classes';
import { configStore } from '@/src/background/commons/constants';
import { captureError, createError } from '@/src/background/commons/sentry-log';
import { TaskRunner } from '@/src/background/commons/task-runner';
import { MeetingState, type QueueItem } from '@/src/background/commons/types';
import {
  EndTaskWithError,
  TaskWarning,
  AuthError,
  type TaskWarningMeta,
  QueueDegradationError,
  PriorityChangeError,
} from '@/src/background/commons/types/errors';
import { analyticsTrack, SegmentAnalyticsEvents } from '@/src/background/commons/analytics';
import type { UnknownType } from '@/src/interfaces';
import { unathenticatedUserErrors, maxUploadingTries } from '@/src/misc';

interface ProcessingRequest extends QueueItem {
  data: {
    meetingId: string;
  };
  attempts: number;
}

const TASK_WARNING_REPORT_THRESHOLD = +configStore.getConfig('TASK_WARNING_REPORT_THRESHOLD');
type ErrorType = 'warning' | 'irrecoverable' | 'recoverable' | 'auth';

export class QueueService {
  private readonly queue: PriorityQueue<ProcessingRequest> = new PriorityQueue();

  private currentTask: Promise<UnknownType> | null = null;

  // eslint-disable-next-line @typescript-eslint/ban-types
  private cancelCurrentTask: Function | null = null;

  private runningTimerId: number | null = null;

  private monitorTimerId: number | null = null;

  private taskWarningRegistry: Map<string, { instances: number; params: TaskWarningMeta }> = new Map();

  async addToFront(meetingId: string) {
    if (this.currentTask && this.cancelCurrentTask) {
      this.cancelCurrentTask(new PriorityChangeError());
    }

    let priority = 0;

    if (this.queue && this.queue.size) {
      priority = this.queue.peak()?.priority || 0;
    }

    // get a top priority
    priority -= 100;

    await this.addMeetingToProcessingQueue(meetingId, 0, priority);
    this.scheduleNextTick();
  }

  async addMeetingToProcessingQueue(meetingId: string, attempts?: number, fixedPriority?: number) {
    console.info(`adding meeting to queue`);

    // priority is based on attempts scaled out exponentially
    const attempt = attempts !== undefined ? attempts + 1 : 0;
    // min waiting time is 3 minutes and maz waiting of 1 hour
    const priority = fixedPriority
      ? fixedPriority
      : moment().unix() + (attempt == 0 ? 0 : 180 + 8 ** ((attempt % 6) - 1));

    this.queue.insert({
      priority: priority,
      data: { meetingId },
      attempts: attempt,
    });

    if (!this.currentTask) {
      console.info(`no current task, spawning new task`);
      await this.scheduleNextTick();
    } else {
      console.info(`current task exists, waiting for ${this.queue.size} tasks to complete`);
    }
  }

  private addCompletionAnalytics = async (id?: string) => {
    if (!id) return;

    analyticsTrack(SegmentAnalyticsEvents.MEETING_UPLOADED, {
      hasUploaded: true,
    });
  };

  private getErrorType = async (error: Error): Promise<ErrorType> => {
    const errorMsg = error?.message?.toLowerCase() || '';
    const isUserUnathenticated = unathenticatedUserErrors.find((e) => errorMsg.includes(e));
    if (isUserUnathenticated) return 'auth';
    if (error instanceof TaskWarning) return 'warning';
    if (error instanceof EndTaskWithError) return 'irrecoverable';
    return 'recoverable';
  };

  private startQueueHealthMonitor() {
    if (this.monitorTimerId) {
      clearTimeout(this.monitorTimerId);
    }

    // @ts-ignore
    this.monitorTimerId = setTimeout(async () => {
      console.error('Queue health degraded stopping and restarting queue');

      if (this.cancelCurrentTask) {
        await this.cancelCurrentTask(new QueueDegradationError());
      }

      await this.scheduleNextTick();
    }, configStore.getConfig('MAX_QUEUE_TIME_MS'));
  }

  private async scheduleNextTick() {
    const isLoggedin = await userService.isUserLoggedIn();
    if (!isLoggedin || !this.queue.peak()) {
      this.cancelCurrentTask = null;
      this.currentTask = null;
      return;
    }

    if (this.runningTimerId) {
      clearTimeout(this.runningTimerId);
    }

    const priority = this.queue.peak()!.priority;
    /**
     * Not all jobs require us to run it at the exact moment
     * that it is created. For example failed jobs have an
     * optional timeout after which it can be run. To ensure this
     * we'll create a timer here that will execute the nextTick
     * after certain time.
     */
    const secondsTillExecution = priority - moment().unix();
    if (secondsTillExecution > 2) {
      console.info(`next job execution in ${secondsTillExecution} seconds`);
      // @ts-ignore
      this.runningTimerId = setTimeout(() => {
        this.scheduleNextTick();
      }, secondsTillExecution * 1000);
      return;
    }

    this.startQueueHealthMonitor();

    const nextTask = this.queue.pop();

    this.currentTask = new Promise((resolve, reject) => {
      this.cancelCurrentTask = reject;

      const task = new TaskRunner('CreateSummerization', [
        CreateSinglePageSummerization
      ]);

      task
        .run(nextTask!.data.meetingId)
        .then(() => {
          this.cancelCurrentTask = null;
          this.addCompletionAnalytics(nextTask?.data.meetingId);
          console.info(`task runner completed`);
          resolve(true);
        })
        .catch(async (err): Promise<void> => {

          console.error(err);
          const errorKind = await this.getErrorType(err);
          console.info(`task failed with ${errorKind} error`);

          switch (errorKind) {
            case 'auth':
            case 'irrecoverable':
            case 'warning':
            case 'recoverable':
          }

          return;
        });
    });

    try {
      const taskCompletionStatus = await this.currentTask;
      if (!taskCompletionStatus) {
        console.error(`task failed`);
      } else {
        console.info(`task completed`);
      }
      await this.scheduleNextTick();
    } catch (err) {
      const cancelationReason = (err as Error)?.message || err || 'unknown reason';
      console.warn(`task canceled: ${cancelationReason}`);

      if (!(err instanceof AuthError)) {
        createError(`task canceled: ${cancelationReason}`);
      }

      if (err instanceof QueueDegradationError) {
        await this.addMeetingToProcessingQueue(nextTask!.data.meetingId, nextTask?.attempts);
        this.scheduleNextTick();
      }

      if (err instanceof PriorityChangeError) {
        await this.addMeetingToProcessingQueue(nextTask!.data.meetingId, nextTask?.attempts, nextTask?.priority);
      }
    }
  }

  stopService() {
    console.info(`stopping queue service`);
    this.cancelCurrentTask?.('service stopped');
    this.queue.clear();
    this.cancelCurrentTask = null;
    this.currentTask = null;
  }
}
