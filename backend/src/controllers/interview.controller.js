const PDFParse=require("pdf-parse")
const {generateInterviewReport}=require("../services/ai.services");
const InterviewReportModel=require("../models/interviewReport.model");

const generateInterviewReportController=async(req,res)=>{
    

        const resumeContent = (await PDFParse(req.file.buffer).text);
        const {selfDescription,jobDescription}=req.body;

        const interViewReportByAi=await generateInterviewReport({
            resume:resumeContent,
            jobDescription,
            selfDescription
        })

        const interViewReport=await InterviewReportModel.create({
            user:req.user.id,
            resume:resumeContent,
            selfDescription,
            jobDescription,
            ...interViewReportByAi  //sb khud destructure krke nikal lega
        })

        return res.status(201).json({
            success:true,
            message:"Interview report generated successfully",
            interViewReport
        })

        
}

/**
 * @description ontroller to get interview report by interviewId.
 *  */

const getInterviewReportByIdController=async(req,res)=>{
    const {intrviewId}=req.params

    const interviewReport=await interviewReportModel.findOne({interviewId,user:req.user.id});
   
    if(!interviewReport){
        return res.status(404).json({
            success:false,
            message:"Interview report not found"
        })
    }
    return res.status(200).json({
        success:true,
        message:"Interview report fetched successfully",
        interviewReport
    })
}




const getAllInterviewReportsController=async(req,res)=>{
    const interviewReports=await interviewReportModel.find({user:req.user.id}).sort({created:-1}).select("-resume -selfDescription -jsonDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan");

    return res.status(200).json({
        success:true,
        message:"Interview reports fetched successfully",
        interviewReports
    })
}



module.exports={generateInterviewReportController,getInterviewReportByIdController,getAllInterviewReportsController}