import type { LocalStorageMetadata } from "../commons/types";
import type { DatabaseService } from "./database.service";
import type { LocalStorageService } from "./local-storage.service";
import { SupabaseService } from "./supabase.service";
const PLAN_TIER = {
    FREE: 'free',
    PRO: 'pro',
}

const PLAN_DETAILS = {
    [PLAN_TIER.FREE]: {
        maxAllowedLinksPerMonth: 10000,
        maxAllowedSummariesPerMonth: 5,
        maxJourneysPerDay: 10,
    },
    [PLAN_TIER.PRO]: {
        maxAllowedLinksPerMonth: 100000,
        maxAllowedSummariesPerMonth: 60,
        maxJourneysPerDay: 100,
    },
}

const BY_PASS_SUBSCRIPTION_CHECK = [
    "williamscalg@gmail.com",
    "williams@viroke.com",
]

const getMonthStartAndEndTs = () => {
    const startDate = new Date();
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);
    const startTs = startDate.getTime();

    const endDate = new Date();
    endDate.setDate(31);
    endDate.setHours(23, 59, 59, 999);
    const endTs = endDate.getTime();
    console.log("startTs", startTs);
    console.log("endTs", endTs);

    return { startTs, endTs };
}


export class BillingService {
    private subscriptionCheckInterval: any;
    private supabaseService: SupabaseService;
    constructor(
      private readonly localStorageService: LocalStorageService<LocalStorageMetadata>,
      private readonly databaseService: DatabaseService,
    ) {
        this.supabaseService = new SupabaseService();
    }
  
    async getPlan() {
      const planTier = await this.localStorageService.get('planTier') || PLAN_TIER.FREE;
      const planData = await this.getPlanDetails(planTier);
      return planData;
    }

    async updatePlanTier(planTier: string) {
      await this.localStorageService.put('planTier', planTier);
    }

    async getPlanDetails(planTier: string) {
      return PLAN_DETAILS[planTier];
    }

    async getUsage(user?: any) {
        const planData = await this.getPlan();
        let planTier = await this.localStorageService.get('planTier') || PLAN_TIER.FREE;

        if (user && planTier === PLAN_TIER.FREE) {
            const subscription = await this.supabaseService.checkSubscription(user.email);
            const isOnPortalByPass = BY_PASS_SUBSCRIPTION_CHECK.includes(user.email);
            if (isOnPortalByPass) {
                this.updatePlanTier(PLAN_TIER.PRO);
                console.log(`User ${user.email} successfully upgraded to pro by pass`)
                planTier = PLAN_TIER.PRO;
            } else if (subscription.isPaidUser) {
                this.updatePlanTier(PLAN_TIER.PRO);
                console.log(`User ${user.email} successfully upgraded to pro`)
                planTier = PLAN_TIER.PRO;
            } else {
                console.log(`User ${user.email} is not a paid user, downgrading to free`);
                this.updatePlanTier(PLAN_TIER.FREE);
                planTier = PLAN_TIER.FREE;
            }
            if (this.subscriptionCheckInterval) {
                clearInterval(this.subscriptionCheckInterval);
            }
        }

        // Get monthly stats
        const { startTs: monthStartTs, endTs: monthEndTs } = getMonthStartAndEndTs();
        const pageData = await this.databaseService.db.PageData
            .where('createAtTs')
            .between(monthStartTs, monthEndTs)
            .reverse() // Get most recent first
            .toArray();

        const total_used = new Set(pageData.map((page: any) => page.url)).size;
        const website_stats = {
            total_used,
            total_allowed: planData.maxAllowedLinksPerMonth,
            total_remaining: planData.maxAllowedLinksPerMonth - total_used,
        }

        const summaryResults = await this.databaseService.db.SummaryResults
            .where('createAtTs')
            .between(monthStartTs, monthEndTs)
            .reverse() // Get most recent first
            .toArray();

        const total_used_summaries = summaryResults.length;
        const summary_stats = {
            total_used: total_used_summaries,
            total_allowed: planData.maxAllowedSummariesPerMonth,
            total_remaining: planData.maxAllowedSummariesPerMonth - total_used_summaries,
        }

        // Get daily journey stats
        const startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        const startTs = startDate.getTime();

        const endDate = new Date();
        endDate.setHours(23, 59, 59, 999);
        const endTs = endDate.getTime();

        const dailyJourneyData = await this.databaseService.db.JourneyJobs
            .where('createAtTs')
            .between(startTs, endTs)
            .reverse() // Get most recent first
            .toArray();

        const journeys_used = new Set(dailyJourneyData.map((page: any) => page.url)).size;
        const journey_stats = {
            journeys_used,
            journeys_allowed: planData.maxJourneysPerDay,
            journeys_remaining: planData.maxJourneysPerDay - journeys_used,
        }

        return {
            website_stats,
            summary_stats,
            journey_stats,
            isPaidUser: planTier === PLAN_TIER.PRO,
        }
    }

    async initiateCheckoutChecker(user: any) {
        if (this.subscriptionCheckInterval) {
            console.log("Clearing existing subscription check interval");
            clearInterval(this.subscriptionCheckInterval);
        }
        console.log("Initiating subscription check interval");
        const planData = await this.getPlan();
        const planTier = await this.localStorageService.get('planTier') || PLAN_TIER.FREE;
        
        let maxCheck = 12; // 1hr
        let checkCount = 0;

        const handleSubscriptionCheck = async () => {
            if (checkCount >= maxCheck) {
                console.log("Max check count reached, stopping subscription check interval");
                clearInterval(this.subscriptionCheckInterval);
                return;
            }

            const subscription = await this.supabaseService.checkSubscription(user.email);
            if (subscription.isPaidUser) {
                this.updatePlanTier(PLAN_TIER.PRO);
                console.log(`User ${user.email} successfully upgraded to pro`)
                clearInterval(this.subscriptionCheckInterval);
                return;
            }

            checkCount++;
        }

        const interval = 60000 * 5; // 5 minutes
        this.subscriptionCheckInterval = setInterval(async () => {
            await handleSubscriptionCheck();
        }, interval);
    }
}
