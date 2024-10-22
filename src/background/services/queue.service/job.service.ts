import type { LocalStorageService } from "../local-storage.service";
import type { UserService } from "../user.service";
import { CreateSummerizationAndInsights } from "./tasks";

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
        if (this.tasks[job.name]) {
            clearInterval(this.tasks[job.name]);
            delete this.tasks[job.name];
            delete this.taskData[job.name];
        }

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
        return this.addTask({
            name: TaskName.SUMMARIZATION_AND_INSIGHTS,
            data: {},
            type: 'recurring',
            // TODO: update this
            // interval: settings.options.executeSummariesAfter * 60 * 60 * 1000,
            interval: 60 * 1000, // 1 minute
            createdAt: Date.now(),
            updatedAt: Date.now(),
            execute: executor.do
        });
    }

    async createDataRetentionPolicyCleanupJob() {
        const settings = await this.localStorageService.get('settings');
        return this.addTask({
            name: TaskName.DATA_RETENTION_POLICY_CLEANUP,
            data: {},
            type: 'recurring',
            interval: settings.options.deleteDataEvery * 60 * 60 * 1000,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            execute: async () => {
                console.log('Cleaning up data retention policy', settings);
            }
        });
    }

    stop(name: string) {
        console.log('Queue service stopped');
        if (this.tasks[name]) {
            clearInterval(this.tasks[name]);
            delete this.tasks[name];
            delete this.taskData[name];
        }
    }
}