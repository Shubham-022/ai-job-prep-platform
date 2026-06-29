const { GoogleGenAI } = require("@google/genai");
const { z } = require("zod");
const PDFDocument = require("pdfkit");



const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_API_KEY,
});

const interviewReportSchema = z.object({
    matchScore: z.number().min(0).max(100).describe("The match score between the candidate's profile and the job description"),
    technicalQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interiew"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover,what approach to use , what examples to give ect")
    })).describe("Technical questions that can be asked in the interview along with their intention and how to answer them to impress the interviewer"),
    behavioralQuestions: z.array(z.object({
        question: z.string().describe("The behavioral question can be asked in the interiew"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover,what approach to use , what examples to give ect")
    })).describe("Behavioral questions that can be asked in the interview along with their intention and how to answer them to impress the interviewer"),
    skillGaps: z.array(z.object({
        skill: z.string().describe("The skill which the candidate is lacking"),
        severity: z.enum(["low", "med", "high"]).describe("The severty of this skill gap,i.e. how important is this skill for the job")
    })).describe("List if skill gap in the candidate's profile along with their severity"),
    preparationPlan: z.array(z.object({
        day: z.number().describe("The day number in the preparation plan , starting from 1"),
        focus: z.string().describe("The main focus of this day in the preparation plan,i.e. data structures, system design, mock interviews etc"),
        tasks: z.array(z.string().describe("The list of task to be done on this day to follow the preparation plan, e.g. read a specific chapter in a book, practice a specific type of problems, do a mock interview etc"))
    })).describe("A day-wise preparation plan for the candidate to follow in order to prepare for the interview"),
    title: z.string().describe("The title of the job for which the interview report is generated"),
})


const generateInterviewReport = async ({ resume, selfDescription, jobDescription }) => {


    const prompt = `Generate an interview report for a candidate with the following details:
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


// ── Zod schema for structured resume data (AI returns this, pdfkit renders it) ──
const resumeDataSchema = z.object({
    name: z.string().describe("Full name of the candidate"),
    title: z.string().describe("Professional title / target role, e.g. 'Full-Stack Developer'"),
    contact: z.object({
        email: z.string().describe("Email address"),
        phone: z.string().describe("Phone number with country code"),
        linkedin: z.string().optional().describe("LinkedIn URL (empty string if unavailable)"),
        github: z.string().optional().describe("GitHub URL (empty string if unavailable)"),
        portfolio: z.string().optional().describe("Portfolio/website URL (empty string if unavailable)"),
    }),
    summary: z.string().describe("A concise 2-4 sentence professional summary optimized for the target job. Use strong action verbs and keywords from the job description."),
    skills: z.array(z.string()).describe("Flat list of technical skills ordered by relevance to the target job. Include languages, frameworks, tools, and methodologies."),
    experience: z.array(z.object({
        role: z.string().describe("Job title"),
        company: z.string().describe("Company name"),
        duration: z.string().describe("Duration string, e.g. 'Jan 2022 – Dec 2023'"),
        points: z.array(z.string()).describe("3-5 bullet points. Start each with a strong action verb. Quantify results wherever the data supports it.")
    })).describe("Work experience in reverse chronological order. Empty array if none."),
    projects: z.array(z.object({
        name: z.string().describe("Project name"),
        techStack: z.string().describe("Comma-separated list of technologies used"),
        points: z.array(z.string()).describe("2-4 bullet points describing what the project does, your role, and measurable outcomes")
    })).describe("Key projects relevant to the target job"),
    education: z.array(z.object({
        degree: z.string().describe("Degree name, e.g. 'B.Tech in Computer Science'"),
        institution: z.string().describe("University or institution name"),
        year: z.string().describe("Graduation year or expected graduation, e.g. '2024' or 'Expected 2025'")
    })),
    certifications: z.array(z.string()).describe("List of certifications. Empty array if none."),
    achievements: z.array(z.string()).describe("Notable achievements, awards, or honors. Empty array if none.")
})


async function generateResumePdf({ resume, selfDescription, jobDescription }) {

    const prompt = `
            You are an expert resume writer and ATS optimization specialist.

            Generate a professional, ATS-friendly, single-page resume as STRUCTURED JSON based on the following information.

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
            - Keep the resume concise and professional — fit within one A4 page.
            - Start every bullet point with a strong action verb (Built, Developed, Optimized, Led, Designed, etc.).
            - Order skills by relevance to the job description.
            - For contact info, if a field is not available, use an empty string.

            Resume Sections to populate:
            - name, title, contact (email, phone, linkedin, github, portfolio)
            - summary (2-4 sentences)
            - skills (flat array of strings)
            - experience (array of role objects with bullet points)
            - projects (array of project objects with bullet points)
            - education (array)
            - certifications (array of strings, empty if none)
            - achievements (array of strings, empty if none)

            Return ONLY valid JSON matching the schema. Do not include markdown or backticks.
`
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseJsonSchema: z.toJSONSchema(resumeDataSchema)
        }

    })

    const resumeData = JSON.parse(response.text);

    const pdfBuffer = await buildResumePdf(resumeData)

    return pdfBuffer;
}


/**
 * Renders a professional A4 resume PDF from structured data using pdfkit.
 * Mirrors the clean, modern design that was previously done by puppeteer + HTML/CSS.
 * No Chrome or browser required — pure Node.js.
 */
function buildResumePdf(data) {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({
            size: "A4",
            margins: { top: 40, bottom: 40, left: 45, right: 45 },
            bufferPages: true
        });
        const chunks = [];
        doc.on("data", (chunk) => chunks.push(chunk));
        doc.on("end", () => resolve(Buffer.concat(chunks)));
        doc.on("error", reject);

        const PAGE_W = doc.page.width;
        const MARGIN_L = 45;
        const MARGIN_R = 45;
        const CONTENT_W = PAGE_W - MARGIN_L - MARGIN_R;

        // ── Colors (professional blue accent, like a modern resume template) ──
        const PRIMARY = "#1a56db";     // headings & accent
        const DARK = "#1e293b";        // body text
        const MUTED = "#64748b";       // secondary text (dates, hints)
        const DIVIDER = "#cbd5e1";     // light gray lines

        // ══════════════════════════════════════════════════════════════════════
        //  HEADER — Name + Title + Contact
        // ══════════════════════════════════════════════════════════════════════
        doc.fontSize(22).font("Helvetica-Bold").fillColor(DARK)
            .text(data.name || "Candidate Name", { align: "center" });

        doc.fontSize(11).font("Helvetica").fillColor(PRIMARY)
            .text(data.title || "", { align: "center" });

        doc.moveDown(0.3);

        // Contact line
        const c = data.contact || {};
        const contactParts = [
            c.email, c.phone,
            c.linkedin, c.github, c.portfolio
        ].filter(v => v && v.trim() !== "");
        if (contactParts.length > 0) {
            doc.fontSize(8.5).fillColor(MUTED)
                .text(contactParts.join("  •  "), { align: "center" });
        }

        doc.moveDown(0.4);
        drawLine(doc, MARGIN_L, doc.y, CONTENT_W, PRIMARY, 1.2);
        doc.moveDown(0.5);

        // ══════════════════════════════════════════════════════════════════════
        //  HELPER FUNCTIONS
        // ══════════════════════════════════════════════════════════════════════
        function sectionHeading(title) {
            doc.moveDown(0.15);
            doc.fontSize(10.5).font("Helvetica-Bold").fillColor(PRIMARY)
                .text(title.toUpperCase(), MARGIN_L);
            drawLine(doc, MARGIN_L, doc.y + 1, CONTENT_W, DIVIDER, 0.6);
            doc.moveDown(0.35);
        }

        function bulletPoint(text) {
            doc.fontSize(9.2).font("Helvetica").fillColor(DARK)
                .text("•  " + text, MARGIN_L + 12, doc.y, {
                    width: CONTENT_W - 12,
                    align: "justify"
                });
            doc.moveDown(0.08);
        }

        // ══════════════════════════════════════════════════════════════════════
        //  PROFESSIONAL SUMMARY
        // ══════════════════════════════════════════════════════════════════════
        if (data.summary) {
            sectionHeading("Professional Summary");
            doc.fontSize(9.2).font("Helvetica").fillColor(DARK)
                .text(data.summary, MARGIN_L, doc.y, { width: CONTENT_W, align: "justify" });
            doc.moveDown(0.45);
        }

        // ══════════════════════════════════════════════════════════════════════
        //  TECHNICAL SKILLS
        // ══════════════════════════════════════════════════════════════════════
        if (data.skills && data.skills.length > 0) {
            sectionHeading("Technical Skills");
            doc.fontSize(9.2).font("Helvetica").fillColor(DARK)
                .text(data.skills.join("  ·  "), MARGIN_L, doc.y, { width: CONTENT_W });
            doc.moveDown(0.45);
        }

        // ══════════════════════════════════════════════════════════════════════
        //  WORK EXPERIENCE
        // ══════════════════════════════════════════════════════════════════════
        if (data.experience && data.experience.length > 0) {
            sectionHeading("Work Experience");
            data.experience.forEach((exp, idx) => {
                // Role — Company — Duration on one line
                doc.fontSize(10).font("Helvetica-Bold").fillColor(DARK)
                    .text(exp.role, MARGIN_L, doc.y, { continued: true, width: CONTENT_W });
                doc.font("Helvetica").fillColor(MUTED)
                    .text("  —  " + exp.company + "  (" + exp.duration + ")");

                if (exp.points && exp.points.length > 0) {
                    exp.points.forEach(pt => bulletPoint(pt));
                }
                if (idx < data.experience.length - 1) doc.moveDown(0.25);
            });
            doc.moveDown(0.45);
        }

        // ══════════════════════════════════════════════════════════════════════
        //  PROJECTS
        // ══════════════════════════════════════════════════════════════════════
        if (data.projects && data.projects.length > 0) {
            sectionHeading("Projects");
            data.projects.forEach((proj, idx) => {
                doc.fontSize(10).font("Helvetica-Bold").fillColor(DARK)
                    .text(proj.name, MARGIN_L, doc.y, { continued: true, width: CONTENT_W });
                doc.fontSize(9).font("Helvetica").fillColor(MUTED)
                    .text("  |  " + proj.techStack);

                if (proj.points && proj.points.length > 0) {
                    proj.points.forEach(pt => bulletPoint(pt));
                }
                if (idx < data.projects.length - 1) doc.moveDown(0.25);
            });
            doc.moveDown(0.45);
        }

        // ══════════════════════════════════════════════════════════════════════
        //  EDUCATION
        // ══════════════════════════════════════════════════════════════════════
        if (data.education && data.education.length > 0) {
            sectionHeading("Education");
            data.education.forEach(edu => {
                doc.fontSize(10).font("Helvetica-Bold").fillColor(DARK)
                    .text(edu.degree, MARGIN_L, doc.y, { continued: true, width: CONTENT_W });
                doc.font("Helvetica").fillColor(MUTED)
                    .text("  —  " + edu.institution + "  (" + edu.year + ")");
            });
            doc.moveDown(0.45);
        }

        // ══════════════════════════════════════════════════════════════════════
        //  CERTIFICATIONS
        // ══════════════════════════════════════════════════════════════════════
        if (data.certifications && data.certifications.length > 0) {
            sectionHeading("Certifications");
            data.certifications.forEach(cert => bulletPoint(cert));
            doc.moveDown(0.45);
        }

        // ══════════════════════════════════════════════════════════════════════
        //  ACHIEVEMENTS
        // ══════════════════════════════════════════════════════════════════════
        if (data.achievements && data.achievements.length > 0) {
            sectionHeading("Achievements");
            data.achievements.forEach(ach => bulletPoint(ach));
        }

        doc.end();
    });
}


/** Draw a horizontal line */
function drawLine(doc, x, y, width, color, thickness) {
    doc.moveTo(x, y).lineTo(x + width, y)
        .strokeColor(color).lineWidth(thickness).stroke();
}

module.exports = {
    generateInterviewReport,
    generateResumePdf
}

