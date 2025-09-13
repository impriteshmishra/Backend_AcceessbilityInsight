import {createClient} from "redis";

const redisClient = createClient({
    url: process.env.REDIS_URL
});

redisClient.on("error", (error) => console.log("Redis client error:", error));

await redisClient.connect();

export default redisClient;