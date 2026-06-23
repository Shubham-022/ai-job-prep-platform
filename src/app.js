const express = require("express");

const app = express();

app.use(express.json());

//require all routes here
const authRouter=require("./routes/auth.routes");


//using all routes here
app.use("/api/v1/auth/",authRouter);







module.exports = app;
