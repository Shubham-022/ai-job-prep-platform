const express = require("express");
const app = express();

const cookieParser = require("cookie-parser");
const cors = require("cors")

app.use(express.json());
app.use(cookieParser());
const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://ai-job-prep-platform-gvao.vercel.app",
    "https://ai-job-prep-platform-55b2.onrender.com",
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true
}));
//require all routes here
const authRouter = require("./routes/auth.routes");
const interviewRouter = require("./routes/interview.routes");



//using all routes here
app.use("/api/v1/auth/", authRouter);
app.use("/api/v1/interview/", interviewRouter);







module.exports = app;
