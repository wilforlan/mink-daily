import { supabase } from "@/src/core/supabase";
import { isProduction } from "@/src/misc";
import type { SupabaseClient } from "@supabase/supabase-js";

const PRODUCT_ID = isProduction ? "prod_ROXiGSyZunDCn7" : "prod_ROnNOYwZyE174G"

export class SupabaseService {
    private supabase: SupabaseClient;

    constructor() {
        this.supabase = supabase;
    }

    async queryOpenAI(body: any) {
        const response = await this.supabase.functions.invoke('openai', {
            body,
        });
        return response;
    }

    async sendEmail(data: any, email: string, subject: string) {
        const response = await this.supabase.functions.invoke('notifications', {
            body: {
                emailData: data,
                email,
                subject
            },
        }); 
        return response;
    }

    async checkSubscription(email: string) {
        const { data, error } = await this.supabase.functions.invoke('check-subscription', {
            body: { email, productId: PRODUCT_ID },
        });
        if (error) {
            throw error;
        }
        return data;
    }

    async getCurrentLoggedInUser() {
        const { data, error } = await this.supabase.auth.getUser();
        if (error) {
            throw error;
        }
        return data;
    }
}
