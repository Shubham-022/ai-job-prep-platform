const {GoogleGenAI}=require("@google/genai");
const {z}=require("zod");
const puppeteer = require("puppeteer");



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


async function generatePdfFromHtml(htmlContent){
        const browser=await puppeteer.launch()
        const page=await browser.newPage()
        await page.setContent(htmlContent,{waitUntil:"networkidle0"})

        const pdfBuffer =await page.pdf({format:"A4" ,margin:{
           top:"20mm",
           bottom:"20mm",
           left:"15mm",
           right:"15mm"
        }})
        await browser.close()
        return pdfBuffer
        
}

async function generateResumePdf({resume,selfDescription,jobDescription}){

    const resumePdfSchema=z.object({
        html:z.string().describe("The HTML content of the resume which can be converted to PDF using any library like Puppeteer")
    })

    const prompt=`
            You are an expert resume writer and ATS optimization specialist.

            Generate a professional, ATS-friendly, single-page resume based on the following information.

            Candidate Resume:
            ${resume}

            Candidate Self Description:
            ${selfDescription}

            Target Job Description:
            ${jobDescription}

            Instructions:

            - Analyze the candidate's existing resume and the target job description.
            - Optimize the resume specifically for this job.
            - Use keywords from the job description wherever appropriate.
            - Never fabricate experience, projects, education, certifications, or achievements that are not supported by the provided information.
            - You may rewrite and reorganize the content to make it more impactful and ATS-friendly.
            - Improve grammar, wording, formatting, and readability.
            - Quantify achievements whenever the provided information allows.
            - The final resume should sound natural and human-written, not AI-generated.
            - Keep the resume concise and professional.
            - The resume should fit within one A4 page.

            Resume Sections:
            - Full Name
            - Professional Title
            - Contact Information
            - Professional Summary
            - Technical Skills
            - Projects
            - Work Experience (if available)
            - Education
            - Certifications (if available)
            - Achievements (if available)

            Design Requirements:
            - Return ONLY valid HTML.
            - Include all CSS inside a <style> tag.
            - Use modern typography with a clean professional layout.
            - Use subtle colors only for headings and section dividers.
            - Maintain good spacing and alignment.
            - Ensure the HTML is printable on an A4 page.
            - Do not use external CSS, Bootstrap, Tailwind, CDN, JavaScript, or images.
            - Use semantic HTML elements.

            Links:
            - GitHub, LinkedIn, Portfolio, Email, and Website links must be clickable using proper <a href=""> tags.
            - Email should use mailto: links.
            - Phone numbers may use tel: links.
            - External links should include:
                target="_blank"
                rel="noopener noreferrer"

            Output Format:

            Return ONLY a JSON object.

            Example:

            {
            "html": "<!DOCTYPE html> ... complete HTML here ..."
            }

            Do not include markdown.
            Do not wrap the HTML inside triple backticks.
            Return only valid JSON.

`   
        const response=await ai.models.generateContent({
            model:"gemini-3-flash-preview",
            contents:prompt,
            config:{
                responseMimeType:"application/json",
                responseJsonSchema:z.toJSONSchema(resumePdfSchema)
            }

        })

        const jsonContent=JSON.parse(response.text);

       
        const pdfBuffer=await generatePdfFromHtml(jsonContent.html)

        return pdfBuffer;


}

module.exports={
    generateInterviewReport,
    generateResumePdf
}

