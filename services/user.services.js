import prisma from "../lib/prisma.js";

// saving new user
export const createUserService = async (clerkUser) => {
    // console.log("service", clerkUser);

    const email = clerkUser?.email_addresses[0]?.email_address || null;
    return prisma.user.upsert({
        where: { clerkId: clerkUser.id },
        update: {

            email,
            firstName: clerkUser.first_name,
            lastName: clerkUser.last_name,
            imageUrl: clerkUser.image_url
        },
        create: {
            clerkId: clerkUser.id,
            email,
            firstName: clerkUser.first_name,
            lastName: clerkUser.last_name,
            imageUrl: clerkUser.image_url
        }
    })
}

export const deleteUserService = async (clerkUser) => {
    // console.log("clerk user", clerkUser);
    
    return prisma.user.delete({
        where: { clerkId: clerkUser.id },
    });
}

//fetch user by clerk id
export const getUserService = async (clerkId) => {
    return prisma.user.findUnique({
        where: { clerkId }
    })
}