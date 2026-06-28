const PDFParse=require("pdf-parse")
const {generateInterviewReport,generateResumePdf}=require("../services/ai.services");
const InterviewReportModel=require("../models/interviewReport.model");
// const puppeteer = require("puppeteer");

const generateInterviewReportController = async (req, res) => {

    const pdfData = await PDFParse(req.file.buffer);
    const resumeContent = pdfData.text;
    const { selfDescription, jobDescription } = req.body;

    const interViewReportByAi = await generateInterviewReport({
        resume: resumeContent,
        jobDescription,
        selfDescription
    })

    const interviewReport = await InterviewReportModel.create({
        user: req.user.id,
        resume: resumeContent,
        selfDescription,
        jobDescription,
        ...interViewReportByAi
    })

    return res.status(201).json({
        success: true,
        message: "Interview report generated successfully",
        interviewReport  // fixed: was interViewReport (capital V)
    })
}

/**
 * @description ontroller to get interview report by interviewId.
 *  */

const getInterviewReportByIdController = async (req, res) => {
    const { interviewId } = req.params

    const interviewReport = await InterviewReportModel.findOne({ _id: interviewId, user: req.user.id });

    if (!interviewReport) {
        return res.status(404).json({
            success: false,
            message: "Interview report not found"
        })
    }
    return res.status(200).json({
        success: true,
        message: "Interview report fetched successfully",
        interviewReport
    })
}




const getAllInterviewReportsController = async (req, res) => {
    const interviewReports = await InterviewReportModel.find({ user: req.user.id }).sort({ createdAt: -1 }).select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan");

    return res.status(200).json({
        success: true,
        message: "Interview reports fetched successfully",
        interviewReports
    })
}


/**
 * @description: controller to download resume 
 * @route: 
 * @access: private
 */

async function generateResumePdfController(req,res){
    const {interviewReportId} = req.params;
    const interviewReport=await InterviewReportModel.findById(interviewReportId);

    if(!interviewReport){
        return res.status(404).json({
            success:false,
            message:"Interview report not found"
        })
    }

    const {resume,jobDescription,selfDescription}=interviewReport;
    const pdfBuffer=await generateResumePdf({
        resume,
        jobDescription,
        selfDescription
    })
    res.set({
        'Content-Type':'application/pdf',
        'Content-Disposition':`attachement;filename=resume_${interviewReportId}.pdf`
    })
    return res.status(200).send(pdfBuffer);
    

    

    
}


module.exports={generateInterviewReportController,getInterviewReportByIdController,getAllInterviewReportsController,generateResumePdfController}