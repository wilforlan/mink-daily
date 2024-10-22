class OpenAIService {
    private apiKey: string;
    private apiUrl: string;

    constructor(apiKey?: string) {
        this.apiKey = apiKey;
        this.apiUrl = 'https://api.openai.com';
    }

    async getChatCompletion(
        messages: { role: string, content: string }[],
        maxTokens: number = 100,
        apiKey?: string
    ): Promise<string> {
        try {
            const key = apiKey || this.apiKey;
            if (!key) {
                throw new Error('No API key provided');
            }
            const response = await fetch(this.apiUrl + "/v1/chat/completions", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${key}`,
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: messages,
                    max_tokens: maxTokens,
                }),
            });
    
            if (!response.ok) {
                throw new Error(`Error fetching chat completion: ${response.statusText}`);
            }
    
            const data = await response.json();
    
            if (data.choices && data.choices.length > 0) {
                return data.choices[0].message.content.trim();
            } else {
                throw new Error('No chat completion found');
            }
        } catch (error) {
            throw new Error(`Error fetching chat completion: ${error.message}`);
        }
    }
    public async testChatApiKey(apiKey: string): Promise<boolean> {
        try {
            const testMessages = [{ role: 'user', content: 'Say hello world' }];
            const completion = await this.getChatCompletion(testMessages, 5, apiKey);
            console.log('completion', completion);
            return !!completion;
        } catch (error) {
            return false;
        }
    }}

export default OpenAIService;
