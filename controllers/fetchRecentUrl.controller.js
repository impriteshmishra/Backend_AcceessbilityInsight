import prisma from "../lib/prisma.js";


const fetchRecentUrl = async (req, res) => {
    const {clerkId} = req.body;
    console.log("clerkid", clerkId);
    
    if (!clerkId) {
        return res.status(404).json({
            error: "User not found."
        })
    }

    try {

        const getUrl = await prisma.scanHistory.findMany({
            where: { userClerkId: clerkId },
            orderBy: { createdAt: "desc" }
        });

        res.status(200).json({
            success: true,
            getUrl
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            error: error
        })
    }
}

export default fetchRecentUrl;