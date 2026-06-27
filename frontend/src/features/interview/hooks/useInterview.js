import {generateInterviewReport,getInterviewReportById,getAllInterviewReports} from "../services/interview.api";
import {useContext} from "react"
import {InterviewContext} from "../interview.context"
export const useInterview=()=>{
    const context=useContext(InterviewContext);

    if(!context){
        throw new Error("useInterview must be used within an interviewProvider");
    }

    const {loading,setLoading,report,setReport,reports,setReports}=context;

    const generateReport = async ({ jobDescription, selfDescription, resume }) => {
        setLoading(true)
        try {
            const response = await generateInterviewReport({ jobDescription, selfDescription, resume });
            setReport(response.interviewReport);
            return response.interviewReport; // return so Home.jsx can navigate
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false)
        }
    }

    const getReportById=async(interviewId)=>{
        setLoading(true)
        try{
            const response=await getInterviewReportById(interviewId);
            setReport(response.interviewReport);
        }catch(error){
            console.log(error);
        }finally{
            setLoading(false)
        }
    }

    const getReports=async()=>{
        setLoading(true)
        try{
            const response=await getAllInterviewReports();
            setReports(response.interviewReports);
        }catch(error){
            console.log(error);
        }finally{
            setLoading(false)
        }
    }

    return{
        generateReport,
        getReportById,
        getReports,
        loading,
        report,
        reports
    };
    
};