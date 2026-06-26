const express = require("express");

const authRouter = express.Router();

//require all controller here

const authController = require("../controllers/auth.controller")
const authMiddlewares = require("../middlewares/auth.middleware")


authRouter.post("/register", authController.registerUserController);
authRouter.post("/login", authController.loginUserController);
authRouter.get("/logout", authController.logoutUserController)


/**
 * @route GET /api/v1/auth/logout
 * @description get the curent logged in details
 * @access private (protected route)
 * 
 */

authRouter.get("/get-me", authMiddlewares.authUser, authController.getMeController)

module.exports = authRouter;