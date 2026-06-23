const express = require("express");

const authRouter=express.Router();

//require all controller here

const authController=require("../controllers/auth.controller")

authRouter.post("/register",authController.registerUserController);

module.exports=authRouter;