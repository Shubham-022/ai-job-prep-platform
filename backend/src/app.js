const express = require("express");
const app = express();

const cookieParser = require("cookie-parser");
const cors = require("cors")

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true
}))
//require all routes here
const authRouter = require("./routes/auth.routes");


//using all routes here
app.use("/api/v1/auth/", authRouter);







module.exports = app;
