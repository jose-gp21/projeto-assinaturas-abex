// src/services/memberContentService.ts
import { connectMongoose } from '@/lib/mongodb';
import User from '@/lib/models/User';
import Content from '@/lib/models/Content';
import { Types } from 'mongoose'; // To verify if the ID is a valid ObjectId

// Function to get a single piece of content for a specific member
export async function getSingleMemberContent(contentId: string, userId: string) {
    await connectMongoose(); // Ensures the connection

    if (!Types.ObjectId.isValid(contentId)) { // ID validation
        throw new Error('Invalid content ID.');
    }

    // Fetch the logged-in user to check subscription status
    const member = await User.findById(userId);
    const hasActiveSubscription = member?.subscriptionStatus === 'Active';

    const content = await Content.findById(contentId).populate('planId', 'name');

    if (!content) {
        throw new Error('Content not found.');
    }

    // Check if the content is restricted and if the member has an active subscription
    if (content.restricted && !hasActiveSubscription) {
        throw new Error('Access denied. This content is exclusive to active subscribers.');
    }

    return content;
}

// Function to list all accessible content for a member
export async function getAllAccessibleMemberContent(userId: string) {
    await connectMongoose(); // Ensures the connection

    // Fetch the logged-in user to check subscription status
    const member = await User.findById(userId);
    const hasActiveSubscription = member?.subscriptionStatus === 'Active';

    let query: any = { restricted: false }; // By default, show non-restricted content

    // If the member has an active subscription, they can also view all restricted content
    if (hasActiveSubscription) {
        // The original query ($or) already filters well for restricted content associated with plans or not
        // If the member has an active subscription, just remove the initial restriction filter and they can see everything
        // or, to be more explicit, we can say:
        // query = { $or: [{ restricted: false }, { restricted: true }] };
        // or simply fetch everything and filter, as in your original code
        // But a more efficient query would be if the complex filtering logic (like specific plans) were stronger in the DB
    }
    
    // Refining the search logic to be more efficient in the DB
    // Fetch all content that is not restricted OR (if the user has an active subscription) all restricted content
    const contents = await Content.find({
        $or: [
            { restricted: false }, // Public content
            // Restricted content (only if the member has an active subscription)
            ...(hasActiveSubscription ? [{ restricted: true }] : [])
        ]
    }).populate('planId', 'name');

    return contents;
}