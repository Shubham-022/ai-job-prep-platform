require("dotenv").config();
const app=require("./src/app");
const dbConnect=require("./src/config/database");
//const{resume,selfDescription,jobDescription}=require("./src/services/temp")
//const {generateInterviewReport}=require("./src/services/ai.services")
const port=process.env.PORT||3000;

dbConnect();


//generateInterviewReport({resume,selfDescription,jobDescription});
app.listen(port,()=>{
    console.log(`server is running on port ${port}`);
});