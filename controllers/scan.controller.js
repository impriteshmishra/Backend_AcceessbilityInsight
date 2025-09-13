import source from "axe-core";
import { extractEssentialData } from "../dao/extractEssentialData.js";
import { scanPage } from "../services/scan.service.js";
import redisClient from "../utils/redisClient.js";
import prisma from "../lib/prisma.js";

function normalizeUrl(inputUrl) {
    if (/^https?:\/\//i.test(inputUrl)) return inputUrl;
    return `https://${inputUrl}`;
}

const scanUrl = async (req, res) => {
    let { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: "URL is required.", success: false });
    }

    url = normalizeUrl(url);

    try {
        // get user from clerk
        const clerkAuth = req.auth();
        const clerkId = clerkAuth.userId;
        console.log("user", clerkId);

        //  Check Redis cache
        const cachedResult = await redisClient.get(url);
        if (cachedResult) {
            const results = JSON.parse(cachedResult);
            const extractedData = extractEssentialData(results);
            // console.log("results data", extractedData);
            
            if (extractedData && clerkId) {
                await prisma.scanHistory.create({
                    data: {
                        url: url,
                        userClerkId: clerkId
                    }
                })
            }
            return res.status(200).json({
                success: true,
                url,
                timestamp: results.timestamp,
                summary: extractedData.summary,
                urgentIssues: extractedData.urgentViolations,
                topIssues: extractedData.topIssues,
                actionableItems: extractedData.actionableItems,
                detailedResults: {
                    prioritizedViolations: extractedData.prioritizedViolations,
                    violationsByType: extractedData.violationsByType
                }
            });
        }

        //  Fresh scan
        const results = await scanPage(url);
        results.timestamp = new Date().toISOString(); // ensure timestamp

        const extractedData = extractEssentialData(results);

        if (extractedData && clerkId) {
            await prisma.scanHistory.create({
                data: {
                    url: url,
                    userClerkId: clerkId
                }
            })
        }

        await redisClient.setEx(url, 1800, JSON.stringify(results)); // cache for 80 mins
        // console.log("extractd data", extractedData);


        return res.status(200).json({
            success: true,
            url,
            timestamp: results.timestamp,
            summary: extractedData.summary,
            urgentIssues: extractedData.urgentViolations,
            topIssues: extractedData.topIssues,
            actionableItems: extractedData.actionableItems,
            detailedResults: {
                prioritizedViolations: extractedData.prioritizedViolations,
                violationsByType: extractedData.violationsByType
            }
        });
    } catch (error) {
        console.error(error);
        if (error.message.includes("net::ERR_NAME_NOT_RESOLVED")) {
            return res.status(502).json({
                success: false,
                error: "Domain not found.",
                code: "DOMAIN_NOT_FOUND",
            });
        }

        if (error.message.includes("net::ERR_CERT")) {
            return res.status(495).json({
                success: false,
                error: "SSL certificate error.",
                code: "SSL_ERROR",
            });
        }

        if (error.message.includes("net::ERR_TOO_MANY_REDIRECTS")) {
            return res.status(508).json({
                success: false,
                error: "Too many redirects.",
                code: "TOO_MANY_REDIRECTS",
            });
        }

        if (error.message.includes("net::ERR_CONNECTION_TIMED_OUT")) {
            return res.status(408).json({
                success: false,
                error: "Connection timed out.",
                code: "TIMEOUT",
            });
        }

        if (error.message.includes("net::ERR_HTTP2_PROTOCOL_ERROR")) {
            return res.status(521).json({
                success: false,
                error: "Website blocked or does not support automated scanning (HTTP2 issue).",
                code: "HTTP2_BLOCKED",
            });
        }

        return res.status(500).json({
            success: false,
            error: "Unexpected scan failure. May be does not support automated scanning",
            code: "SCAN_FAILED",
        });
    }
};

export default scanUrl;
