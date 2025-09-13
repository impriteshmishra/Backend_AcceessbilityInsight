import { Webhook } from 'svix';
import { createUser, deleteUser } from "../controllers/user.controller.js";
import {clerkClient} from '@clerk/clerk-sdk-node';

export const clerkWebhook = async (req, res) => {
    // console.log("webhook received now");

    try {
        
        const payload = req.body.toString("utf8");

        // Svix headers config
        const headers = {
            "svix-id": req.headers["svix-id"],
            "svix-timestamp": req.headers["svix-timestamp"],
            "svix-signature": req.headers["svix-signature"],
        };

        const webhook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

        // Verifying the signature and get the event
        const event = webhook.verify(payload, headers);

        // console.log("Event type:", event.type, "ID:", event.data.id);
        req.body = { data: event.data, type: event.type };
        // Immediately respond to Clerk to avoid timeout    
        res.status(200).json({ received: true });
        // console.log("eventData", event.data);;
        // console.log("eventData Type", event.type);
        
        
        // Handling the user events asynchronously
        if (event.type === "user.created" || event.type === "user.updated") {
            await createUser(event.data); 
        } else if (event.type === "user.deleted") {
            await deleteUser(event.data);
        } 
    } catch (error) {
        console.log("Webhook signature invalid or non-user event:", error.message);
        res.status(200).json({ received: true, ignored: true });
        return;
    }
};
