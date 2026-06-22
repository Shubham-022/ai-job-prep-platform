const mongoose=require("mongoose");

const dbConnect=async()=>{
    try{
    const connection=await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to database :");
    }
    catch(err){
        console.log(err);
        process.exit(1);
    }

}

module.exports=dbConnect;