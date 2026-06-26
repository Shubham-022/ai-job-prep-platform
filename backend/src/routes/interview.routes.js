const express=require("express")
const interviewRouter=express.Router();
const interviewController=require("../controllers/interview.controller")
const authMiddleware=require("../middlewares/auth.middleware")
const upload=require("../middlewares/multer.middleware")

/**
 * @route POST/api/v1/interview/
 * @description generate new interview report on it basis of user self description
 * resume pdf,and job description
 * @access private
 */
interviewRouter.post("/generate-interview-report",authMiddleware.authUser,upload.single("resume"),interviewController.generateInterviewReportController);



module.exports=interviewRouter