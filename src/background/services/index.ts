import { UserService } from './user.service';
import { DatabaseService } from './database.service';
import { LocalStorageService } from './local-storage.service';
import { QueueService } from './queue.service';
import { configStore } from '@/src/background/commons/constants';
import type { LocalStorageMetadata } from '@/src/background/commons/types';

export * from './user.service';
export * from './local-storage.service';

export const localStorageService = new LocalStorageService<LocalStorageMetadata>();
export const userService = new UserService(localStorageService);

export const databaseService = new DatabaseService();
export const queueService = new QueueService();
