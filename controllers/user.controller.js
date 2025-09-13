
import { createUserService, deleteUserService, getUserService } from '../services/user.services.js';

// store user
export const createUser = async (clerkUser) => {
    try {
        const user = await createUserService(clerkUser);
        console.log("from createUser", user);
    } catch (error) {
        console.error("Error creating user:", error);
    }
}

export const deleteUser = async (clerkUser) => {
    try {
        await deleteUserService(clerkUser);
        console.log("User deleted successfully.");
    } catch (error) {
        console.log("Error deleting user:", error);
    }
}

// get user
export const getUser = async (req, res) => {
    try {
        const { clerkId } = req.params;

        if (req.auth.userId !== clerkId) {
            return res.status(403).json({ error: "Not authenticated." });
        }

        const user = await getUserService(clerkId);

        if (!user) {
            return res.status(404).json({
                error: "User not found."
            })
        }
        res.status(200).json({ user });
    } catch (error) {
        console.log("error get user", error);

        res.status(500).json({
            error: "Error fetching the user."
        })
    }
}