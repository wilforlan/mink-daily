import {
    BrowserClient,
    defaultStackParser,
    getDefaultIntegrations,
    makeFetchTransport,
    Scope
} from "@sentry/browser";

const sentryClient = new BrowserClient({
    dsn: process.env.PLASMO_PUBLIC_SENTRY_DSN,
    stackParser: defaultStackParser,
    integrations: getDefaultIntegrations({}),
    transport: makeFetchTransport,
});

const sentryScope = new Scope();
sentryScope.setClient(sentryClient);


sentryClient.init(); // initializing has to be done after setting the client on the scope

export const scope = sentryScope;
export const client = sentryClient;
