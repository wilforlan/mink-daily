import { sendToBackground } from "@plasmohq/messaging";
import React, { useEffect, useState } from "react";
const EXTENSION_ID = chrome.runtime.id;
import icon from "data-base64:~content-assets/icon.png"

export {}

export const getShadowHostId = () => "mink-daily-notification"
import styleText from "data-text:./style.css" 
import type { PlasmoCSConfig } from "plasmo"
import { isProduction } from "./misc";
 
export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  all_frames: true
}

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
    'm.stripe.network', "td.doubleclick.net", "ogs.google.com", "js.stripe.com",
    "newassets.hcaptcha.com", "www.googletagmanager.com", "consentcdn.cookiebot.com",
    "acdn.adnxs.com", "ads.eu.criteo.com", "t.a3cloud.net", "widgets.outbrain.com", 
    "pagead2.googlesyndication.com", "punchnews.os.tc", "tpc.googlesyndication.com",
    "tsdtocl.com", 
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
        const { status, settings } = await sendToBackground({
            extensionId: EXTENSION_ID,
            name: "get-account-settings",
            body: {},
        });
        if (!status) throw new Error("Failed to get settings");
        return settings;
    };

    private async trySendPageContent() {
        const {startTrackingSessionAfter, maxAllowedLinksPerDay} = this.settings.options;
        if (startTrackingSessionAfter === 'never') {
            console.log("Mink is disabled on this page");
            return;
        }

        if (socialPlatforms.includes(window.location.hostname)) {
            console.log("Mink is disabled on this social platform");
            return;
        }

        const getDailyMinkStats = async (url: string) => {
            const { status, stats } = await sendToBackground({
                extensionId: EXTENSION_ID,
                name: "get-daily-mink-stats",
                body: { url },
            });

            if (!status) throw new Error("Failed to get daily mink stats");
            return stats;
        }

        const maxAllowedLinks = parseInt(maxAllowedLinksPerDay);
        if (maxAllowedLinks > 0) {
            const dailyMinkStats = await getDailyMinkStats(window.location.href);
            if (dailyMinkStats.total_unique_pages_visited >= maxAllowedLinks) {
                if (!isProduction) console.log("Mink is disabled because you have reached the max allowed links per day");
                return;
            }

            if (dailyMinkStats.current_page_tracked) {
                if (!isProduction) console.log("Mink is disabled because you have already tracked this page today");
                return;
            }
        }
        
        const sendData = async () => {
            const pageContent = extractPageContent();
            // console.log(`***Mink: I just tracked your session, open mink to disable.***`);
            await sendToBackground({
                extensionId: EXTENSION_ID,
                name: "track-webpage-session",
                body: pageContent,
            });
        }

        const time = parseInt(startTrackingSessionAfter);
        setTimeout(async () => {
            await sendData();
        }, time * 60 * 1000);
    }
}

new ContentApp();

// notification component, white background, black text, at the bottom right of the screen

const randomMinkMessagesBody = [
    "🎉 Your Mink is here! Dive into today’s summary 🚀",
    "✨ Ta-da! Your Mink magic is ready – open for your update! 📜",
    "🔥 Boom! Your Mink summary is live and it\’s epic! 🎆💥",
    "🚀 Ready, Set, Go! Your Mink is waiting – see what\’s new! 🌟",
    "📬 You\’ve got Mink mail! Today\’s update is ready – check it out! 📨",
    "💫✨ Just in! Your Mink has created a powerful update! 🎉👀",
    "🌞 Good news! Your Mink is complete – click to see today\’s highlights! 📜",
    "🎊 It’s here! Your Mink has a fresh update for you! Unwrap it now! 📦💫",
    "⚡ Zap! Your Mink summary is done – discover the latest now! 🎉🔥",
    "🪄 Like magic, your Mink is ready! Click to reveal the latest! 🌠",
    "🌟 The wait is over! Your Mink is glowing with new insights! 💡✨",
    "🚨 Mink Alert! Your update is sizzling hot and fresh! 🔥📈",
    "🎁 Surprise! Mink packed today’s highlights just for you – open now! 🎊",
    "💥 Boom! Explosive insights await in your new Mink update! 💣",
    "🌅 Rise and shine! Your Mink is ready to kickstart your day! ☀️",
    "🚀 Fasten your seatbelt! Your Mink just delivered an epic update! 🚀",
    "📜 Read all about it! Mink’s got the scoop – don’t miss out! 📰",
    "🎈 Pop the confetti! Your Mink is loaded with juicy updates! 🎉",
    "💥 Mink alert! Your Mink summary is here and it’s spectacular! 🌟",
    "💎 Golden insights! Your Mink has polished up today’s best bits! 💫"
];

const randomButtonText = [
    "Okay",
    "Got it",
    "Cool",
    "Alright",
]

export const getStyle = () => {
    const style = document.createElement("style")
    style.textContent = styleText
    return style
  }

// const Notification = ({ notification }: { notification: any }) => {

//     const markAsRead = () => {
//         if (notification) {
//             sendToBackground({
//                 extensionId: EXTENSION_ID,
//                 name: "mark-notification-as-read",
//                 body: {
//                     id: notification.notificationId,
//                 },
//             });
//         }
//     }

//     return (
//         <div style={{
//             position: 'fixed',
//             bottom: '20px',
//             right: '20px',
//             backgroundColor: 'white',
//             padding: '20px',
//             borderRadius: '10px',
//             zIndex: 1000000000,
//         }}>
//             <div style={{ display: 'flex', flexDirection: 'column' }}>
//                 <img src={icon} alt="Mink Logo" style={{ width: '65px', height: '50px' }} />
//                 <p style={{
//                     color: 'black',
//                     fontSize: '20px',
//                     fontWeight: 'normal',
//                 }}>{
//                         notification ? notification.body : randomMinkMessagesBody[Math.floor(Math.random() * randomMinkMessagesBody.length)]
//                     }</p>
//                 <button style={{
//                     backgroundColor: 'black',
//                     color: 'white',
//                     padding: '10px 20px',
//                     borderRadius: '5px',
//                     cursor: 'pointer',
//                     marginTop: '10px',
//                     zIndex: 9999999999,
//                 }}
//                     onClick={markAsRead}
//                 >{randomButtonText[Math.floor(Math.random() * randomButtonText.length)]}</button>
//             </div>
//         </div>
//     );
// };

// export default function ContentPage() {
//     const [notification, setNotification] = useState<any>(null);

//     const getNotifications = async () => {
//         const { status, notifications } = await sendToBackground({
//             extensionId: EXTENSION_ID,
//             name: "get-notifications",
//             body: {},
//         });
//         if (status) {
//             setNotification(notifications[0] || notification || null);
//         }
//     }

//     useEffect(() => {
//         getNotifications();
//     }, []);

//     return (
//         <div style={{
//             position: 'relative',
//             height: '100%',
//             width: '100%',
//         }}>
//             <Notification notification={notification} />
//         </div>
//     )
// }
