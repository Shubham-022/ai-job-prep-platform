const app=require("./src/app");
require("dotenv").config();
const dbConnect=require("./src/config/database");

const port=process.env.PORT||3000;

dbConnect();

app.listen(port,()=>{
    console.log(`server is running on port ${port}`);
});