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

/**
 * @route GET/api/v1/interview/reports/:reportId
 * @description get interview report by interview id
 * @access private
 */
interviewRouter.get("/report/:interviewId",authMiddleware.authUser,interviewController.getInterviewReportByIdController);


/**
 * @route Get/api/v1/interview/
 * @description Get all interview reports of a logged in user
 * @access private
 */

interviewRouter.get("/",authMiddleware.authUser,interviewController.getAllInterviewReportsController);

module.exports=interviewRouter