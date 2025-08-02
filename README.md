### Mink

On this day 15th March 2025, we'll be migrating to storing user data in our db, this is due to many reasons.

1. We're a for profit company
2. We've had less users when we've asked for OpenAI keys and usage as grown since we just process and do not ask for their own API keys
3. Users are finding ways to by pass payment because the data required to make payment decisions sits outside the servers, so client side check fails when the user has tried
tricks like logging out, uninstalling and installing again, deleteing data from application in dev console (experienced user)

Today the cost is low and for our total cost is around 5usd so far, only in 48hrs of released and has been used by 3 users and tan through 180+ Journey Mapping so far, which is great start.
Once it's rolled out for all 30+ users we have then we'll check what our daily cost is, and either block.

For now, we do not need to deploy any new features, we only need to keep monitoring. Meanwhile this migration will be completed so we can go ahead to adding other features like

- Notification bubbles (like "Hey, I found something on your journey that you might like", "Hey! We've just released)
- Space+M: A feature that allows users to run a power up map of the day's journey's. This create a workflow like of the journey based on the direction the user have set
The space m feature will be displayed on a larged screen and the user would be able to save the output as PNG or maybe export as PDF.
We'll need to generate nicely decorated threejs or mermaid JS code to display the workflow.
- Follow Ups: Follow ups are prompt suggestions for each journey, up to 3 auto generated which allows the users to interact with the journey results

Hopefully, once we rollout the update to block the payment security issue, we'll have gotten at least one paid user which indicates PMF before getting started.
