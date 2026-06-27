const {GoogleGenAI}=require("@google/genai");
const {z}=require("zod");



const ai=new GoogleGenAI({
    apiKey:process.env.GOOGLE_API_KEY,
});

const interviewReportSchema=z.object({
    matchScore:z.number().min(0).max(100).describe("The match score between the candidate's profile and the job description"),
    technicalQuestions:z.array(z.object({
        question:z.string().describe("The technical question can be asked in the interiew"),
        intention:z.string().describe("The intention of interviewer behind asking this question"),
        answer:z.string().describe("How to answer this question, what points to cover,what approach to use , what examples to give ect")
    })).describe("Technical questions that can be asked in the interview along with their intention and how to answer them to impress the interviewer"),
    behavioralQuestions:z.array(z.object({
        question:z.string().describe("The behavioral question can be asked in the interiew"),
        intention:z.string().describe("The intention of interviewer behind asking this question"),
        answer:z.string().describe("How to answer this question, what points to cover,what approach to use , what examples to give ect")
    })).describe("Behavioral questions that can be asked in the interview along with their intention and how to answer them to impress the interviewer"),
    skillGaps:z.array(z.object({
        skill:z.string().describe("The skill which the candidate is lacking"),
        severity:z.enum(["low","med","high"]).describe("The severty of this skill gap,i.e. how important is this skill for the job")
    })).describe("List if skill gap in the candidate's profile along with their severity"),
    preparationPlan:z.array(z.object({
        day:z.number().describe("The day number in the preparation plan , starting from 1"),
        focus:z.string().describe("The main focus of this day in the preparation plan,i.e. data structures, system design, mock interviews etc"),
        tasks:z.array(z.string().describe("The list of task to be done on this day to follow the preparation plan, e.g. read a specific chapter in a book, practice a specific type of problems, do a mock interview etc"))
    })).describe("A day-wise preparation plan for the candidate to follow in order to prepare for the interview"),
    title:z.string().describe("The title of the job for which the interview report is generated"),
})


const generateInterviewReport=async({resume,selfDescription,jobDescription})=>{

    const prompt=`Generate an interview report for a candidate with the following details:
    Resume:${resume}
    Self-description:${selfDescription}
    Job description:${jobDescription}`

    const response = await ai.models.generateContent({
  model: "gemini-2.5-flash",
  contents: prompt,
  config: {
    responseMimeType: "application/json",
    responseJsonSchema: z.toJSONSchema(interviewReportSchema)
  }
});
        return JSON.parse(response.text);
}


console.log(interviewReportSchema);

module.exports={
    generateInterviewReport
}