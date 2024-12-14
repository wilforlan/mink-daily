import { LocalStorageService } from "./local-storage.service";
import { userService } from ".";
import { encode, decode } from 'gpt-3-encoder';
import Tokenizer from "../utils/tokenizer.utils";
import { isProduction } from "@/src/misc";
import { SegmentAnalyticsEvents } from "../commons/analytics";
import { analyticsTrack } from "../commons/analytics";
import { scope as sentryScope } from "../../lib/sentry";
import { supabaseService } from "./index";

sentryScope.setTag("service", "openai.service.ts");
const responsePrompt = `
From my attachments, message history and your memory, generate summaries, analytics, insights and suggestions for me:

Keep your response in strictly JSON format using the following schema include double new lines to make paragraphs and single new lines to sentences.

{
  "summary": "This should never be empty and Make this really long, well formatted and feel free to use emojis and markdown formatting. This should be a really long narrative summary of what have done since the all through out my browsing and internet history.  include double new lines to make paragraphs and single new lines to sentences.",
  "insights": "This should never be empty and Very meaningful insights to help me work better and stay ahead of the competition.  include double new lines to make paragraphs and single new lines to sentences.",
  "suggestions": "This should never be empty and Suggestions to help me improve my work and productivity and shortcuts I can take to help me work faster (DO NOT INCLUDE THE WORD SHORTCUTS IN YOUR RESPONSE) Make this really long, well formatted and feel free to use emojis and markdown formatting and include double new lines to make paragraphs and single new lines to sentences.",
  "analytics": {
    "most_visited_link": {
      "title": "The title of the most visited link, make sure this is a valid link title from the content provided",
      "url": "https://www.example.com, ## make sure this is a valid link from the content provided",
      "count": 5 ## make sure this is a number from the content provided
    },
    "average_time_spent_browing": "The average time spent browsing the web in hours, make sure this is a number from the content provided",
    "topics_covered": ["Topic 1", "Topic 2", "Topic 3"], // List of top 5 topics covered in the content, make sure this is a list of topics from the content provided
    "additional_insights": [
      "A list of 5 - 10 bullet points of additional insights you may have based on the content provided, make sure this is a list of insights from the content provided",
      "For example:",
        - Links related to technology were visited the most.
        - Highest engagement time was on Link Title 1.
        - Links with visual content had a higher visit rate.
        - Users spent an average of 5 minutes per link.
        - Top three categories visited: Technology, Health, and Finance.
      "

      Ensure to use your own words and do not copy and paste from the content provided.
    ]
  }
}

Do not include the word JSON in your response or \`\`\`json\`\`\` markdown in your response. It should be a valid JSON object.
None of the fields should be empty and follow the description provided in the schema and make sure to use the correct values from the content you have been provided with. Failure to do so will result in a penalty.
Don't every fail to provide JSON response, always do with the information provided.
`;


const INSTRUCTIONS = `
    You are mink, a personal assistant for daily web research and work, helping your summarizie content from web pages that your users have access daily,
    provide super useful highlights, insights and recommendations to your users.
    
    Your goal is to help monitor your users' daily internet activities and provide them with useful information.

    You need to ensure that these insights are super accurate, helpful and relevant to your users' daily activities.
    For everytime you send the wrong data, a baby dies and cannot be brought back! So be wise and make sure to follow the instructions provided.
`

export const ParseJson = (string: string) => {
    let response;
    try {
        response = JSON.parse(string);
    } catch (e) {
        try {
            const find_json_regex = /{(?:[^{}]|{[^{}]*})*}/;
            response = string.match(find_json_regex);
            if (!response || response.length === 0) throw new Error("Error parsing JSON");
            response = JSON.parse(response[0]);
        } catch (error) {
            try {
                response = JSON.parse(string.replace(/'/g, '"').replace("\n", ""));
            } catch (error) {
                throw new Error("Error parsing JSON");
            }
        }
    }
    return response;
}

const MAX_TOKEN_PER_COST_INPUT = 1000;
const MODELS_COST: any = {
    'gpt-4o': {
        input: 0.005,
        output: 0.015,
    },
    'gpt-4o-2024-05-13': {
        input: 0.005,
        output: 0.015,
    },
    'gpt-4-vision-preview': {
        input: 0.01,
        output: 0.03,
    },
    'gpt-4-turbo-preview': {
        input: 0.01,
        output: 0.03,
    },
    'gpt-3.5-turbo-0613': { // chat model
        input: 0.0015,
        output: 0.002,
    },
    'gpt-3.5-turbo-instruct': { // text model
        input: 0.0015,
        output: 0.002,
    },
    'gpt-4-32k': {
        input: 0.06,
        output: 0.12,
    },
    'gpt-4': {
        input: 0.03,
        output: 0.06,
    },
    'text-embedding-ada-002': {
        input: 0.0001,
        output: 0
    }
};

export const calculateCost = (usage: any, model: string) => {
    const modelCost = MODELS_COST[model];
    if (!modelCost) {
        throw new Error(`Model ${model} not found`);
    }
    const cost = {
        prompt_cost: ((usage?.prompt_tokens || 0) / MAX_TOKEN_PER_COST_INPUT) * modelCost.input,
        completion_cost: ((usage?.completion_tokens || 0) / MAX_TOKEN_PER_COST_INPUT) * modelCost.output,
        total_cost: 0,
    };
    cost.total_cost = ((cost?.prompt_cost || 0) + cost.completion_cost)
    return cost;
};

interface Cost {
    prompt_cost: number;
    completion_cost: number;
    total_cost: number;
}

class OpenAIService {
    private apiKey: string;
    private apiUrl: string;
    private openai: any;
    private localStorageService: any;
    private assistant: any;
    private tokenizer: Tokenizer;

    constructor(apiKey?: string) {
        this.apiKey = apiKey;
        this.apiUrl = 'https://api.openai.com';
        this.localStorageService = new LocalStorageService();

        this.init();
    }

    async init() {
        const user = await userService.getAccountInfo();
        if (!user) {
            throw new Error('User not logged in');
        }
        this.apiKey = user.llmApiKey;
        this.tokenizer = new Tokenizer();
    }

    async getChatCompletionWithRetry(
        messages: { role: string, content: string }[],
        apiKey?: string,
        retries: number = 5,
        { forceJson = false }: { forceJson?: boolean } = {}
    ): Promise<{ completion: string, cost: Cost }> {
        try {
            return await this.getChatCompletion(messages, apiKey, { forceJson });
        } catch (error) {
            if (retries === 0) {
                await analyticsTrack(SegmentAnalyticsEvents.LLM_SUMMARIZATION_FAILED, {
                    error: error.message,
                    timestamp: new Date().toISOString(),
                });
                throw new Error(`Failed to get chat completion after ${retries} retries: ${error.message}`);
            }
            await analyticsTrack(SegmentAnalyticsEvents.LLM_SUMMARIZATION_FAILED_WITH_RETRY, {
                error: error.message,
                timestamp: new Date().toISOString(),
            });
            return this.getChatCompletionWithRetry(messages, apiKey, retries - 1, { forceJson });
        }
    }

    async getChatCompletion(
        messages: { role: string, content: string }[],
        apiKey?: string,
        { forceJson = false }: { forceJson?: boolean } = {}
    ): Promise<{ completion: string, cost: Cost }> {
        try {
            const key = apiKey || this.apiKey;
            const body = {
                model: 'gpt-4o',
                messages: messages,
            };
            if (forceJson) {
                body['response_format'] = { type: "json_object" };
            }
            const response = await supabaseService.queryOpenAI(body);

            const {data, error} = response

            if (error) {
                console.log("response from openai error", error);
                let errorText = error?.message
                throw new Error(errorText);
            }

            

            if (data.choices && data.choices.length > 0) {
                return {
                    completion: data.choices[0].message.content.trim(),
                    cost: calculateCost(data.usage, 'gpt-4o')
                };
            } else {
                throw new Error('No chat completion found');
            }
        } catch (error) {
            sentryScope.captureException(error);
            throw new Error(`Error fetching chat completion: ${error.message}`);
        }
    }

    async getSummaryAndInsights(
        text: string,
        sessionId: string,
        apiKey?: string,
        retries: number = 5,
        summaryRetries: number = 5
    ): Promise<{ result: any, cost: Cost }> {
        try {
            const chunkedResults = await this.getSummaryAndInsightsWithChunking(text, sessionId, apiKey);
            if (chunkedResults.length === 0 && retries > 0) {
                console.log(`No chunked results found, retrying ${retries} more times`);
                return this.getSummaryAndInsights(text, sessionId, apiKey, retries - 1, summaryRetries);
            } else if (chunkedResults.length === 0) {
                throw new Error('No chunked results found');
            }

            const chunkedResultsString = chunkedResults.map((chunk) => chunk.completion).join("\n\n");

            const responder = `
            Your output has been chunked into smaller parts for better processing.
            Below is the result from the previous chunk:

            !Chunked Results:
            ${chunkedResultsString}

            !!From the above chunked outputs, generate a summary, insights, suggestions and analytics using all of the information provided.
            ${responsePrompt}                
        `;

            const messages = [
                { role: 'system', content: INSTRUCTIONS },
                { role: 'user', content: responder }
            ];

            const { completion, cost } = await this.getChatCompletionWithRetry(messages, apiKey, 5, { forceJson: true });
            const result = ParseJson(completion);
            if (!result || !result.summary) {
                // retry
                if (summaryRetries === 0) {
                    throw new Error('No summary found or generated');
                }
                return this.getSummaryAndInsights(text, sessionId, apiKey, retries, summaryRetries - 1);
            }
            return {
                result,
                cost
            };
        } catch (error) {
            console.log('Error getting summary and insights', error);
            sentryScope.captureException(error);
            throw error;
        }
    }

    async getSummaryAndInsightsWithChunking(
        text: string,
        sessionId: string,
        apiKey?: string
    ): Promise<any[]> {
        const key = apiKey || this.apiKey;
        try {
            const chunks = (await this.tokenizer.splitWithLangchain(
                text,
                100000
            ));

            await analyticsTrack(SegmentAnalyticsEvents.LLM_SUMMARIZATION_STARTED, {
                sessionId,
                totalChunks: chunks.length,
                timestamp: new Date().toISOString(),
            });

            let usableChunks = chunks;
            if (!isProduction) {
                console.log('Non-production mode, using only 2 chunks');
                usableChunks = chunks.slice(0, 2);
            }

            const executor = usableChunks.map(async (chunk, index) => {
                // console.log(`Processing chunk ${index + 1} of ${chunks.length}`);
                const messages = [
                    { role: 'system', content: INSTRUCTIONS },
                    { role: 'user', content: chunk },
                    { role: 'user', content: responsePrompt }
                ];
                return await this.getChatCompletionWithRetry(messages, key, 5, { forceJson: true });
            });

            return await Promise.all(executor);
        } catch (error) {
            sentryScope.captureException(error);
            throw error;
        }
    }

    public async testChatApiKey(apiKey: string): Promise<boolean> {
        try {
            const testMessages = [{ role: 'user', content: 'Say hello world' }];
            const { completion } = await this.getChatCompletionWithRetry(testMessages, apiKey, 5, { forceJson: false });
            return !!completion;
        } catch (error) {
            return false;
        }
    }

    async initAssistant(index: any) {
        this.assistant = await this.getAssistant();
        if (this.assistant) return this.assistant;
        this.assistant = await this.openai.beta.assistants.create({
            instructions: INSTRUCTIONS,
            name: "Mink Assistant",
            model: "gpt-4o-mini",
            tools: [{ type: "file_search" }],
            tool_resources: {
                file_search: {
                    vector_store_ids: [index.store.id],
                    // vector_stores: [{
                    //     file_ids: [index.file.id]
                    // }]
                }
            },
        });
        await this.localStorageService.put('assistant', this.assistant);
        console.log('Open AI Assistant created: ', this.assistant.name);
        return this.assistant;
    }

    async cleanupAssistant() {
        if (!this.assistant) return;
        await this.openai.beta.assistants.del(this.assistant.id);
        await this.localStorageService.delete('assistant');
        console.log('Open AI Assistant deleted: ', this.assistant.id);
        this.assistant = null;
    }

    async getAssistant() {
        return this.assistant || await this.localStorageService.get('assistant');
    }

    async QA(messages: { role: string, content: string }[], index: any) {
        if (!this.assistant) this.assistant = await this.getAssistant();

        const ThreadID = (await this.openai.beta.threads.create()).id;
        const thread = await this.openai.beta.threads.retrieve(ThreadID);

        if (index?.store?.id) {
            await this.openai.beta.threads.update(thread.id, {
                tool_resources: { file_search: { vector_store_ids: [index.store.id] } },
            });
            console.log('Thread updated with vector store: ', index.store.id);
        }

        const messagesPromise = messages.map(async (message) => {
            return await this.openai.beta.threads.messages.create(
                thread.id,
                message as any
            );
        });

        await Promise.all(messagesPromise);

        // await this.openai.beta.threads.messages.create(
        //     thread.id,
        //     message as any
        //     // index?.file ? {
        //     //     ...message as any,
        //     //     attachments: [{
        //     //         file_id: index.file.id,
        //     //         tools: [
        //     //             { type: "file_search" }
        //     //         ],
        //     //     }],
        //     // }
        //     //     : message as any,
        // );

        const run = await this.openai.beta.threads.runs.create(
            thread.id,
            {
                assistant_id: this.assistant.id,
                tools: [{ type: "file_search" }],
                tool_choice: { type: "file_search" },
            }
        );

        let response: any;

        while (!response) {
            const classicRun = await this.openai.beta.threads.runs.retrieve(
                thread.id,
                run.id,
            );
            if (classicRun.status === "completed") {
                const threadMessages = await this.openai.beta.threads.messages.list(
                    thread.id
                );
                const firstThreadMessage = threadMessages.data[0];
                if (firstThreadMessage.role === "assistant") {
                    response = {
                        assistant_response: firstThreadMessage,
                        usage: classicRun.usage,
                        threadId: thread.id,
                        threadMessages
                    };
                }
            } else if (classicRun.status === "failed") {
                throw new Error('Thread run failed');
            }
        }

        return response;
    }

    getIndexer(document: string) {

        let file: any;
        let vectorStore: any;
        let myVectorStoreFile: any;

        const index = async () => {
            file = await this.openai.files.create({
                file: new File([document], 'document.txt', { type: 'text/plain' }),
                purpose: "assistants",
            });

            vectorStore = await this.openai.beta.vectorStores.create({
                name: "Mink Page Index",
            });

            myVectorStoreFile = await this.openai.beta.vectorStores.files.create(
                vectorStore.id,
                {
                    file_id: file.id,
                }
            );

            console.log(`
                Created Vector Store Index:
                - File: ${file.id}
                - Vector Store: ${vectorStore.id}
                - Store File: ${myVectorStoreFile.id}
            `);

            return {
                file,
                store: vectorStore,
                StoreFile: myVectorStoreFile
            };
        }

        const cleanup = async () => {
            if (!file) return;
            const deletedVectorStoreFile = await this.openai.beta.vectorStores.files.del(
                vectorStore.id,
                myVectorStoreFile.id
            );
            const deletedVectorStore = await this.openai.beta.vectorStores.del(
                vectorStore.id
            );

            const deleteFile = await this.openai.files.del(file.id);

            console.log(`
                Clean Up Vector Store Index:
                - Deleted File: ${deleteFile.id}
                - Deleted Vector Store: ${deletedVectorStore.id}
                - Deleted Store File: ${deletedVectorStoreFile.id}
            `);

            return {
                deletedVectorStoreFile,
                deletedVectorStore,
                deleteFile
            };
        };

        return { index, cleanup };
    }

}

export default OpenAIService;
