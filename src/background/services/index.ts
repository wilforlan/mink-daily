import { UserService } from './user.service';
import { DatabaseService } from './database.service';
import { LocalStorageService } from './local-storage.service';
import { QueueService } from './queue.service';
import type { LocalStorageMetadata } from '@/src/background/commons/types';
import { MinkService } from './mink.service';
import { BillingService } from './billing.service';
import { SupabaseService } from './supabase.service';
export * from './user.service';
export * from './local-storage.service';

export const databaseService = new DatabaseService();
export const supabaseService = new SupabaseService();

export const localStorageService = new LocalStorageService<LocalStorageMetadata>();
export const userService = new UserService(localStorageService, databaseService, supabaseService);

export const queueService = new QueueService(userService, localStorageService);
export const minkService = new MinkService(
    userService,
    localStorageService,
    queueService,
    databaseService 
);


export const billingService = new BillingService(
    localStorageService,
    databaseService
);

// Import and export the journey service
import { journeyService } from './journey.service';
export { journeyService };

