import express from "express"
import dotenv from "dotenv"
import scanRoute from "./routes/scan.route.js"
import userRoute from "./routes/user.route.js"
import reportRoute from "./routes/report.route.js"
import recentUrlRoute from "./routes/getRecentUrl.route.js"
import cors from 'cors';
import path from "path";
import { clerkWebhook } from "./utils/clerkWebhook.js";

dotenv.config({});
const app = express();

// const __dirname = path.resolve(); //directories path 

const corsOptions = {
    origin: process.env.URL_FRONTEND,
    credentials: true
}
app.use(cors(corsOptions));
//webhook
app.post(
    "/webhook",
    express.raw({ type: "application/json" }), // raw body just for this route
    clerkWebhook
);


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.get("/", (req, res) => {
//     res.send("Server is running");
// })

//Our api call here
app.use("/api/v1/user", userRoute);
app.use("/api/v1/url", scanRoute);
app.use("/api/v1/report", reportRoute);
app.use("/api/v1/recent", recentUrlRoute);


//deploying setup (backend automatically surf the frontend)
// app.use(express.static(path.join(__dirname, "frontend", "dist")));
// app.get("*", (req,res)=>{
//     res.sendFile(path.join(__dirname, "frontend", "dist", "index.html"))  //path to get frontend
// })

app.listen(process.env.PORT, () => {
    console.log(`Server is running on PORT ${process.env.PORT}`);
})