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
    type: string;
    interval: number;
    createdAt: number;
    updatedAt: number;
    execute: (...args: any) => Promise<any>;
    nextExecution: number;
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

        const timeUntilNextExecution = job.nextExecution - Date.now();

        const pointer = setTimeout(async () => {
            try {
                await job.execute(job.data);
                job.nextExecution = job.nextExecution + job.interval;
                this.localStorageService.put(
                    `tasks-${job.name}`,
                    job
                );
                this.addTask(job);
            } catch (error: any) {
                console.error("error executing job", error, job);
            }
        }, timeUntilNextExecution);

        this.tasks[job.name] = pointer;


        return pointer;
    }

    async createSummarizationJob({ source, updatedSettings }: { source: string, updatedSettings?: any }) {
        const executor = new CreateSummerizationAndInsights();
        const settings = updatedSettings || (await this.localStorageService.get('settings'))?.options;
        if (
            !settings.executeSummariesAfter ||
            settings.executeSummariesAfter === 0 ||
            settings.executeSummariesAfter === 'never'
        ) return console.log('Summarization job not created because it is disabled', { executeSummariesAfter: settings.executeSummariesAfter });

        const isSettingsChange = source === 'settings-change';
        const cacheTaskId = `tasks-${TaskName.SUMMARIZATION_AND_INSIGHTS}`;
        const cacheTask = isSettingsChange ? undefined : await this.localStorageService.get(cacheTaskId);
        const hasPointer = this.tasks[TaskName.SUMMARIZATION_AND_INSIGHTS];

        const interval = parseInt(settings.executeSummariesAfter) * 60 * 60 * 1000;
        // const interval = 60 * 1000 // 1 min
        const isNextExecutionInThePast = cacheTask?.nextExecution && Date.now() > cacheTask.nextExecution
        const nextExecution = isNextExecutionInThePast ? Date.now() + interval : cacheTask?.nextExecution || Date.now() + interval;

        const taskObject = cacheTask || {
            name: TaskName.SUMMARIZATION_AND_INSIGHTS,
            data: {},
            type: 'recurring',
            // TODO: update this
            interval,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            nextExecution
        };

        this.localStorageService.put(
            cacheTaskId,
            taskObject
        );

        this.addTask({
            ...taskObject,
            execute: executor.do,
        });

        console.log('Summarization job created', taskObject);
        return taskObject;
    }

    async createDataRetentionPolicyCleanupJob() {
        const executor = new DataRetentionPolicyJob();
        const settings = await this.localStorageService.get('settings');

        if (
            !settings.options.deleteDataEvery ||
            settings.options.deleteDataEvery === 0 ||
            settings.options.deleteDataEvery === 'never'
        ) return console.log('Data clean up job not created because it is disabled', { deleteDataEvery: settings.options.deleteDataEvery });

        const cacheTaskId = `tasks-${TaskName.DATA_RETENTION_POLICY_CLEANUP}`;
        const cacheTask = await this.localStorageService.get(cacheTaskId);

        const interval = settings.options.deleteDataEvery * 60 * 60 * 1000;
        const isNextExecutionInThePast = cacheTask?.nextExecution && Date.now() > cacheTask.nextExecution
        const nextExecution = isNextExecutionInThePast ? Date.now() + interval : cacheTask?.nextExecution || Date.now() + interval;

        const taskObject = cacheTask || {
            name: TaskName.DATA_RETENTION_POLICY_CLEANUP,
            data: {},
            type: 'recurring',
            interval,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            nextExecution
        };

        this.localStorageService.put(
            cacheTaskId,
            taskObject
        );

        return this.addTask({
            ...taskObject,
            execute: executor.do
        });
    }

    stop(name: string) {
        if (this.tasks[name]) {
            clearTimeout(this.tasks[name]);
            delete this.tasks[name];
            delete this.taskData[name];
        }
    }
}