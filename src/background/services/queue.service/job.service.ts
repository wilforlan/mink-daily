import type { LocalStorageService } from "../local-storage.service";
import type { UserService } from "../user.service";
import { CreateSummerizationAndInsights } from "./tasks";
import { DataRetentionPolicyJob } from "./tasks/data-retention-policy-job";

enum TaskName {
    SUMMARIZATION_AND_INSIGHTS = 'SUMMARIZATION_AND_INSIGHTS',
    DATA_RETENTION_POLICY_CLEANUP = 'DATA_RETENTION_POLICY_CLEANUP',
}

interface IJob {
    name: TaskName.SUMMARIZATION_AND_INSIGHTS | TaskName.DATA_RETENTION_POLICY_CLEANUP;
    data: any;
    type: 'oneoff' | 'recurring';
    interval: number;
    createdAt: number;
    updatedAt: number;
    execute: (...args: any) => Promise<any>;
}

export class QueueService {

    currentTask: any;

    tasks = {};
    taskData = {};

    userService: UserService;
    localStorageService: LocalStorageService<any>;

    constructor(userService: UserService, localStorageService: LocalStorageService<any>) {
        this.userService = userService;
        this.localStorageService = localStorageService;
    }

    addTask(job: IJob) {
        this.stop(job.name);

        this.taskData[job.name] = job;
        
        const caller = job.type === 'oneoff' ? setTimeout : setInterval;

        const pointer = caller(async () => {
            try {
                await job.execute(job.data);
            } catch (error: any) {
                console.error("error executing job", error, job);
            }
        }, job.interval);

        this.tasks[job.name] = pointer;
        return pointer;
    }

    async createSummarizationJob() {
        const executor = new CreateSummerizationAndInsights();
        const settings = await this.localStorageService.get('settings');
        if (
            !settings.options.executeSummariesAfter ||
            settings.options.executeSummariesAfter === 0 ||
            settings.options.executeSummariesAfter === 'never'
        ) return console.log('Summarization job not created because it is disabled', { executeSummariesAfter: settings.options.executeSummariesAfter });

        return this.addTask({
            name: TaskName.SUMMARIZATION_AND_INSIGHTS,
            data: {},
            type: 'recurring',
            // TODO: update this
            interval: settings.options.executeSummariesAfter * 60 * 60 * 1000,
            // interval: 60 * 1000, // 1 minute
            createdAt: Date.now(),
            updatedAt: Date.now(),
            execute: executor.do
        });
    }

    async createDataRetentionPolicyCleanupJob() {
        const executor = new DataRetentionPolicyJob();
        const settings = await this.localStorageService.get('settings');

        if (
            !settings.options.deleteDataEvery ||
            settings.options.deleteDataEvery === 0 ||
            settings.options.deleteDataEvery === 'never'
        ) return console.log('Data clean up job not created because it is disabled', { executeSummariesAfter: settings.options.executeSummariesAfter });

        return this.addTask({
            name: TaskName.DATA_RETENTION_POLICY_CLEANUP,
            data: {},
            type: 'recurring',
            interval: settings.options.deleteDataEvery * 60 * 60 * 1000,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            execute: executor.do
        });
    }

    stop(name: string) {
        if (this.tasks[name]) {
            clearInterval(this.tasks[name]);
            delete this.tasks[name];
            delete this.taskData[name];
        }
    }
}