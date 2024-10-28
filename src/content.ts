import { sendToBackground } from "@plasmohq/messaging";

export {}
const EXTENSION_ID = "caijdklfefngnfplclccpilllnbglbjh";

console.log(
  "Mink: You may find that having is not so pleasing a thing as wanting. This is not logical, but it is often true."
)

const extractPageContent = () => {
    const title = document.title;
    const url = window.location.href;
    const content = document.body.innerText;
    const meta = document.querySelector('meta[name="description"]');
    const description = meta ? meta.getAttribute("content") : "";
    const origin = window.location.origin;

    return { title, url, content, description, origin };
};

const socialPlatforms = [
    'twitter.com', 'linkedin.com', 'facebook.com', 'reddit.com', 'x.com',
    'youtube.com', 'instagram.com', 'tiktok.com', 'pinterest.com', 'snapchat.com',
    'twitch.tv', 'discord.com', 'telegram.org', 'whatsapp.com', 'messenger.com',
];

class ContentApp {
    settings: any;
    
    constructor() {
        this.init();
    }

    private async init() {
        this.settings = await this.getSettings();
        this.trySendPageContent();
    }

    private async getSettings() {
        const {status, settings} = await sendToBackground({
            extensionId: EXTENSION_ID,
            name: "get-account-settings",
            body: {},
        });
        if (!status) throw new Error("Failed to get settings");
        return settings;
    };

    private trySendPageContent() {
        const startTrackingSessionAfter = this.settings.options.startTrackingSessionAfter;
        if (startTrackingSessionAfter === 'never' || startTrackingSessionAfter <= 0) {
            console.log("Mink is disabled on this page");
            return;
        }

        if (socialPlatforms.includes(window.location.hostname)) {
            console.log("Mink is disabled on this social platform");
            return;
        }

        setTimeout(async () => {
            const pageContent = extractPageContent();
            // console.log(`***Mink: I just tracked your session, open mink to disable.***`);
            await sendToBackground({
                extensionId: EXTENSION_ID,
                name: "track-webpage-session",
                body: pageContent,
            });
        }, startTrackingSessionAfter * 60 * 1000); 
    }
}

new ContentApp();
