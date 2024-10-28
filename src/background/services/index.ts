import { UserService } from './user.service';
import { DatabaseService } from './database.service';
import { LocalStorageService } from './local-storage.service';
import { QueueService } from './queue.service';
import type { LocalStorageMetadata } from '@/src/background/commons/types';
import { MinkService } from './mink.service';

export * from './user.service';
export * from './local-storage.service';

export const localStorageService = new LocalStorageService<LocalStorageMetadata>();
export const userService = new UserService(localStorageService);

export const databaseService = new DatabaseService();
export const queueService = new QueueService(userService, localStorageService);
export const minkService = new MinkService(
    userService,
    localStorageService,
    queueService,
    databaseService
);