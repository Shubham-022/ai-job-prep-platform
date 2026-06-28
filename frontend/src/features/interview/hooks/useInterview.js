import {generateInterviewReport,getInterviewReportById,getAllInterviewReports,generateResumePdf} from "../services/interview.api";
import {useContext, useCallback} from "react"
import {InterviewContext} from "../interview.context"
export const useInterview=()=>{
    const context=useContext(InterviewContext);

    if(!context){
        throw new Error("useInterview must be used within an interviewProvider");
    }

    const {loading,setLoading,report,setReport,reports,setReports}=context;

    const generateReport = useCallback(async ({ jobDescription, selfDescription, resume }) => {
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
    }, [setLoading, setReport]);

    const getReportById = useCallback(async (interviewId) => {
        setLoading(true)
        try {
            const response = await getInterviewReportById(interviewId);
            setReport(response.interviewReport);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false)
        }
    }, [setLoading, setReport]);

    const getReports = useCallback(async () => {
        setLoading(true)
        try {
            const response = await getAllInterviewReports();
            setReports(response.interviewReports);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false)
        }
    }, [setLoading, setReports]);

    const getResumePdf = useCallback(async (interviewReportId) => {
        setLoading(true)
        try {
            const response = await generateResumePdf({ interviewReportId })
            const url = window.URL.createObjectURL(
                new Blob([response], { type: "application/pdf" })
            );

            const link = document.createElement("a")
            link.href = url;
            link.setAttribute("download", `resume_${interviewReportId}.pdf`)
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }, [setLoading]);

    return{
        generateReport,
        getReportById,
        getReports,
        loading,
        report,
        reports,
        getResumePdf
    };
    
};