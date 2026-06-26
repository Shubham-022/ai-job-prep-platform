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

module.exports={generateInterviewReportController}