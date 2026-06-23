const userModel = require("../models/user.model");
const bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken");

const registerUserController=async(req,res)=>{
        const {username,email,password}=req.body;

        if(!username || !email || !password){
            return res.status(400).json({message:"All fields are required"});
        }

        //check if username or email already exists
        const isUserAlreadyExists=await userModel.findOne({
            $or : [{username},{email}]  //or gate ke jese kam kr rha hai
        })

        if(isUserAlreadyExists){
            return res.status(400).json({message:"User already exists"});
        }

        const hashed_password=await bcrypt.hash(password,10);

        const user=await userModel.create({
            username,
            email,
            password:hashed_password
        });

        const payload={
            id:user._id,
            email:user.email,
            username:user.username
        }

        const token=jwt.sign(payload,process.env.JWT_SECRET,{expiresIn:"1d"});

        res.cookie("token",token)
        return res.status(201).json({
            message:"User registered successfully",
            user:{
                _id:user._id,
                username:user.username,
                email:user.email
            }
        })

        
        
}
module.exports = {
    registerUserController
};