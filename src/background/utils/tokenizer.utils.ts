import { RecursiveCharacterTextSplitter, TokenTextSplitter } from "@langchain/textsplitters";

class Tokenizer {
    private specialTokens: Set<string>;

    constructor() {
        this.specialTokens = new Set([
            '.', ',', '!', '?', ':', ';', '(', ')', '[', ']', '{', '}',
            '+', '-', '*', '/', '=', '<', '>', '&', '|', '^', '~', '%', '$', '#', '@'
        ]);
    }

    isAlphanumeric(char) {
        return /[a-zA-Z0-9_]/.test(char);
    }

    tokenize(text) {
        const tokens = [];
        let currentToken = '';
        let inString = false;
        let stringDelimiter = null;

        for (let i = 0; i < text.length; i++) {
            const char = text[i];

            if (inString) {
                if (char === stringDelimiter && text[i - 1] !== '\\') {
                    tokens.push(currentToken + char);
                    currentToken = '';
                    inString = false;
                    stringDelimiter = null;
                } else {
                    currentToken += char;
                }
            } else if (char === '"' || char === "'") {
                if (currentToken) {
                    tokens.push(currentToken);
                    currentToken = '';
                }
                inString = true;
                stringDelimiter = char;
                currentToken = char;
            } else if (this.isAlphanumeric(char)) {
                currentToken += char;
            } else if (this.specialTokens.has(char)) {
                if (currentToken) {
                    tokens.push(currentToken);
                    currentToken = '';
                }
                tokens.push(char);
            } else {
                if (currentToken) {
                    tokens.push(currentToken);
                    currentToken = '';
                }
            }
        }

        if (currentToken) {
            tokens.push(currentToken);
        }

        return tokens;
    }

    chunkTokens(tokens, maxTokens = 4000) {
        const chunks = [];
        let currentChunk = [];
        let currentLength = 0;

        for (const token of tokens) {
            if (currentLength + 1 > maxTokens) {
                chunks.push(currentChunk.join(' '));
                currentChunk = [token];
                currentLength = 1;
            } else {
                currentChunk.push(token);
                currentLength++;
            }
        }

        if (currentChunk.length > 0) {
            chunks.push(currentChunk.join(' '));
        }

        return chunks;
    }

    chunkText(text, maxTokens = 4000) {
        const chunks = [];
        let currentChunk = [];
        let currentLength = 0;
        let CHARACTER_PER_TOKEN = 4;

        for (const character of text) {
            if (currentLength + CHARACTER_PER_TOKEN > maxTokens) {
                chunks.push(currentChunk.join(''));
                currentChunk = [character];
                currentLength = CHARACTER_PER_TOKEN;
            } else {
                currentChunk.push(character);
                currentLength += CHARACTER_PER_TOKEN;
            }
        }

        if (currentChunk.length > 0) {
            chunks.push(currentChunk.join(''));
        }

        return chunks;
    }

    async splitWithLangchain(text, maxTokens = 4000) {
        const textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: maxTokens,
            chunkOverlap: 0,
        });

        const texts = await textSplitter.splitText(text);
        return texts;
    }
}

export default Tokenizer;