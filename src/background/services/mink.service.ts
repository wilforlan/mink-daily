import { analyticsTrack } from "../commons/analytics";
import { SegmentAnalyticsEvents } from "../commons/analytics";
import type { analytics } from "../commons/analytics/segment";
import { readableStringFromObject } from "../utils";
import type { DatabaseService } from "./database.service";
import type { LocalStorageService } from "./local-storage.service";
import type { QueueService } from "./queue.service";
import type { UserService } from "./user.service";
import crypto from "crypto";

export class MinkService {
    userService: UserService;
    localStorageService: LocalStorageService<any>;
    queueService: QueueService;
    databaseService: DatabaseService;

    constructor(
        userService: UserService,
        localStorageService: LocalStorageService<any>,
        queueService: QueueService,
        databaseService: DatabaseService
    ) {
        this.userService = userService;
        this.localStorageService = localStorageService;
        this.queueService = queueService;
        this.databaseService = databaseService;
    }

    async getAccountSettings() {
        try {
            const settings = await this.userService.getSettings();
            return { status: true, settings };
        } catch (error) {
            console.error(error);
            return { status: false, info: null, error: error.message || error };
        }
    }

    async saveWebpageSession(body: any) {
        try {
            const input = {
                ...body,
                createdAt: new Date(),
                updatedAt: new Date(),
                isProcessed: "false",
                createAtTs: Date.now(),
                updatedAtTs: Date.now(),
            };
            await this.databaseService.db.PageData.put(
                input,
                input.url
            );
            return { status: true };
        } catch (error) {
            console.error(error);
            return { status: false, info: null, error: error.message || error };
        }
    }

    async saveSummaryAndInsights(body: any) {
        try {
            const input = {
                summary: body.summary,
                analytics: body.analytics,
                insights: body.insights,
                suggestions: body.suggestions,
                createdAt: new Date(),
                updatedAt: new Date(),
                createAtTs: (new Date()).getTime(),
                updatedAtTs: (new Date()).getTime(),
                cost: body.cost || {
                    prompt_cost: 0,
                    completion_cost: 0,
                    total_cost: 0
                },
                id: body.sessionId
            };
            await this.databaseService.db.SummaryResults.put(input);
            return { status: true };
        } catch (error) {
            console.error(error);
            return { status: false, info: null, error: error.message || error };
        }
    }

    async getLatestSummaryAndInsight({ date = new Date().toISOString() }: { date?: string }) {
        try {
            // Get start of day timestamp
            const startDate = new Date(date);
            startDate.setHours(0, 0, 0, 0);
            const startTs = startDate.getTime();

            // Get end of day timestamp
            const endDate = new Date(date);
            endDate.setHours(23, 59, 59, 999);
            const endTs = endDate.getTime();

            const summaries = await this.databaseService.db.SummaryResults
                .where('createAtTs')
                .between(startTs, endTs)
                .reverse() // Get most recent first
                .toArray();

            if (!summaries || summaries.length === 0) {
                return null;
            }

            await analyticsTrack(SegmentAnalyticsEvents.USER_FETCHED_SUMMARY, {
                totalSummaries: summaries.length,
                date,
                timestamp: new Date().toISOString(),
            });
            return summaries[0];
        } catch (error) {
            console.error('Error getting summary:', error);
            return null;
        }
    }

    async getNotifications() {
        return this.databaseService.db.Notifications.where('isRead').equals('false').toArray();
    }

    async markNotificationAsRead(notificationId: string) {
        // delete notification
        await this.databaseService.db.Notifications.delete(notificationId);
        return { status: true };
    }

    async createNotification(notification: any) {
        await this.databaseService.db.Notifications.put(notification);
        return { status: true };
    }

    async getDailyMinkStats(url: string) {
        try {
            // Get start of day timestamp
            const startDate = new Date();
            startDate.setHours(0, 0, 0, 0);
            const startTs = startDate.getTime();

            // Get end of day timestamp
            const endDate = new Date();
            endDate.setHours(23, 59, 59, 999);
            const endTs = endDate.getTime();

            const pageData = await this.databaseService.db.PageData
                .where('createAtTs')
                .between(startTs, endTs)
                .reverse() // Get most recent first
                .toArray();

            return {
                total_pages_visited: pageData.length,
                total_unique_pages_visited: new Set(pageData.map((page: any) => page.url)).size,
                current_page_tracked: pageData.some((page: any) => page.url === url)
            }
        } catch (error) {
            console.error('Error getting daily mink stats:', error);
            return null;
        }
    }
}