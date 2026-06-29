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
        linkedin: z.string().optional().describe("Full LinkedIn profile URL, e.g. 'https://linkedin.com/in/username'. Empty string if unavailable."),
        github: z.string().optional().describe("Full GitHub profile URL, e.g. 'https://github.com/username'. Empty string if unavailable."),
        portfolio: z.string().optional().describe("Full portfolio/website URL. Empty string if unavailable."),
    }),
    summary: z.string().describe("A concise 3-4 sentence professional summary. Write in first-person implied tone (no 'I'). Sound human and confident — never robotic or AI-generated. Tailor directly to the target job. Mention years of experience, core strengths, and what value the candidate brings. Use natural language a hiring manager would appreciate."),
    skills: z.object({
        languages: z.array(z.string()).describe("Programming languages, e.g. ['JavaScript', 'Python', 'TypeScript', 'Java']"),
        frontend: z.array(z.string()).describe("Frontend frameworks and libraries, e.g. ['React', 'Next.js', 'Tailwind CSS', 'HTML5', 'CSS3']"),
        backend: z.array(z.string()).describe("Backend frameworks and runtime, e.g. ['Node.js', 'Express', 'Django', 'Spring Boot']"),
        database: z.array(z.string()).describe("Databases and ORMs, e.g. ['MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Prisma']"),
        tools: z.array(z.string()).describe("Dev tools, version control, CI/CD, e.g. ['Git', 'Docker', 'Webpack', 'Jest', 'Postman']"),
        cloud: z.array(z.string()).describe("Cloud platforms and services, e.g. ['AWS', 'Vercel', 'Render', 'Firebase', 'GCP']. Empty array if none."),
    }).describe("Technical skills organized by category. Each category is an array of strings. Use empty arrays for categories with no skills."),
    experience: z.array(z.object({
        role: z.string().describe("Job title"),
        company: z.string().describe("Company name"),
        location: z.string().describe("City, Country or 'Remote'. Use empty string if unknown."),
        duration: z.string().describe("Duration string, e.g. 'Jan 2022 – Dec 2023' or 'Jun 2023 – Present'"),
        points: z.array(z.string()).describe("3-5 achievement-oriented bullet points. MUST start with a strong past-tense action verb (Engineered, Architected, Spearheaded, Optimized, Delivered, Reduced, Increased, Automated, etc.). Quantify impact with numbers, percentages, or metrics wherever the data supports it. Focus on outcomes not duties.")
    })).describe("Work experience in reverse chronological order. Empty array if candidate has no work experience."),
    projects: z.array(z.object({
        name: z.string().describe("Project name"),
        techStack: z.string().describe("Comma-separated list of key technologies used, e.g. 'React, Node.js, MongoDB, Socket.io'"),
        liveLink: z.string().optional().describe("Live project URL. Empty string if unavailable."),
        githubLink: z.string().optional().describe("GitHub repo URL. Empty string if unavailable."),
        points: z.array(z.string()).describe("3-5 bullet points. Start each with a strong action verb. Describe what the project does, technical challenges solved, your specific contribution, and quantifiable impact (users, performance, scale). Make it sound impressive but truthful.")
    })).describe("Key projects relevant to the target job, ordered by relevance"),
    education: z.array(z.object({
        degree: z.string().describe("Degree name, e.g. 'B.Tech in Computer Science & Engineering'"),
        institution: z.string().describe("University or institution name"),
        location: z.string().describe("City, Country. Empty string if unknown."),
        year: z.string().describe("Graduation year range or expected, e.g. '2020 – 2024' or 'Expected 2025'"),
        gpa: z.string().optional().describe("GPA or percentage if notable, e.g. '8.5/10' or '3.8/4.0'. Empty string if not provided or not impressive."),
        coursework: z.string().optional().describe("Relevant coursework comma-separated. Empty string if not useful.")
    })),
    certifications: z.array(z.object({
        name: z.string().describe("Certification name"),
        issuer: z.string().describe("Issuing organization, e.g. 'AWS', 'Google', 'Coursera'"),
        year: z.string().optional().describe("Year obtained. Empty string if unknown.")
    })).describe("Professional certifications. Empty array if none."),
    achievements: z.array(z.string()).describe("Notable achievements, awards, hackathon wins, competitive programming ranks, open-source contributions. Empty array if none."),
    languages: z.array(z.string()).optional().describe("Languages known, e.g. ['English', 'Hindi']"),
    awards: z.array(z.string()).optional().describe("Awards or honors received. Empty array if none."),
    publications: z.array(z.object({
        title: z.string().describe("Publication title"),
        publisher: z.string().optional().describe("Publisher name or journal"),
        year: z.string().optional().describe("Year published")
    })).optional().describe("Publications or patents. Empty array if none."),
    volunteer: z.array(z.object({
        role: z.string().describe("Volunteer job title"),
        organization: z.string().describe("Organization name"),
        duration: z.string().optional().describe("Duration of work"),
        points: z.array(z.string()).optional().describe("Bullet points describing activities")
    })).optional().describe("Volunteer work details. Empty array if none.")
})


async function generateResumePdf({ resume, selfDescription, jobDescription }) {

    const prompt = `
You are an elite resume writer who has crafted resumes for candidates hired at Google, Amazon, Microsoft, and top startups. You specialize in ATS-optimized, achievement-oriented resumes.

Generate a structured JSON resume based on the following candidate information.

═══════════════════════════════════════════════════════
CANDIDATE'S EXISTING RESUME:
${resume}

CANDIDATE'S SELF DESCRIPTION:
${selfDescription}

TARGET JOB DESCRIPTION:
${jobDescription}
═══════════════════════════════════════════════════════

STRICT RULES:

1. NEVER fabricate experience, projects, education, certifications, or achievements not supported by the provided information.
2. You MAY rewrite, reorganize, and strengthen the wording to be more impactful.
3. Optimize content for the target job description — mirror its keywords naturally.
4. Quantify achievements with numbers, percentages, and metrics wherever possible.
5. Content limits for a realistic one-page fresher resume:
   - Professional Summary: Maximum 4 lines.
   - Technical Skills: Include ONLY the most relevant skills. Avoid repetition.
   - Each Project: Maximum 4 bullet points.
   - Each bullet point: Maximum 18 words.
   - Certifications: Maximum 5 certifications.
   - Achievements: Maximum 4 achievements.

PROFESSIONAL SUMMARY (Maximum 4 lines):
- Write in third-person implied tone (no "I" or "my")
- Sound like a confident human professional, NOT an AI
- Avoid cliché phrases like "results-driven", "passionate professional", "detail-oriented"
- Instead use specific, concrete language about what the candidate actually does well
- Reference the target role naturally

SKILLS (categorized):
- languages: Programming languages only
- frontend: Frontend frameworks, libraries, CSS tools
- backend: Backend frameworks, runtimes, API tools
- database: Databases, caching, ORMs
- tools: Dev tools, CI/CD, testing, version control
- cloud: Cloud platforms, hosting, DevOps
- Use empty arrays for categories where the candidate has no skills
- Order skills within each category by relevance to the target job

EXPERIENCE bullet points:
- Start EVERY bullet with a strong past-tense action verb (Engineered, Architected, Spearheaded, Optimized, Reduced, Automated, Delivered, Scaled)
- Focus on OUTCOMES and IMPACT, not job duties
- Include metrics: "Reduced load time by 40%", "Spearheaded integration that served 10K+ users"

PROJECT bullet points (Maximum 4 bullet points, Max 18 words each):
- Start with strong action verbs (Built, Developed, Designed, Implemented, Integrated)
- Highlight technical complexity and real-world impact
- Keep them concise, punchy, and under 18 words per bullet

EDUCATION:
- Include GPA only if it's impressive (>8.0/10 or >3.5/4.0)
- Include relevant coursework only if it adds value for the target job

CERTIFICATIONS (Maximum 5):
- Include issuing organization and year
- Only include real, verifiable certifications from the source data

ACHIEVEMENTS (Maximum 4):
- Select the top 4 most impressive items from source data.

Return ONLY valid JSON matching the schema. No markdown. No backticks.
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

        const ML = 45;                              // margin left
        const CW = doc.page.width - ML - 45;        // content width

        // ── Colors (Navy, Dark Gray, Light Gray) ──────────────────────────
        const NAVY    = "#1E3A8A";   // dark navy blue (headings, name, accent)
        const DARK    = "#1F2937";   // body text (dark gray)
        const GRAY    = "#4B5563";   // secondary text (dates, locations, tech stack)
        const LIGHT   = "#D1D5DB";   // dividers (light gray)

        // ══════════════════════════════════════════════════════════════════
        //  PAGINATION & SPACE-CHECKING UTILITIES
        // ══════════════════════════════════════════════════════════════════
        function ensureSpace(neededHeight) {
            const bottomLimit = doc.page.height - doc.page.margins.bottom;
            if (doc.y + neededHeight > bottomLimit) {
                doc.addPage();
            }
        }

        // ══════════════════════════════════════════════════════════════════
        //  1. HEADER — Name + Title + Clickable Contact Details
        // ══════════════════════════════════════════════════════════════════
        doc.fontSize(26).font("Helvetica-Bold").fillColor(NAVY)
            .text(data.name || "Candidate Name", { align: "center" });

        if (data.title) {
            doc.moveDown(0.12);
            doc.fontSize(13).font("Helvetica").fillColor(GRAY)
                .text(data.title, { align: "center" });
        }

        doc.moveDown(0.25);

        // Contact details as a single centered line with pipe separators
        const c = data.contact || {};
        const contactItems = [];

        if (c.email) contactItems.push({ text: c.email, link: "mailto:" + c.email });
        if (c.phone) contactItems.push({ text: c.phone, link: "tel:" + c.phone.replace(/\s/g, "") });
        if (c.linkedin) contactItems.push({ text: "LinkedIn", link: c.linkedin });
        if (c.github) contactItems.push({ text: "GitHub", link: c.github });
        if (c.portfolio) contactItems.push({ text: "Portfolio", link: c.portfolio });

        if (contactItems.length > 0) {
            const sep = "  |  ";
            const contactY = doc.y;
            const fullText = contactItems.map(i => i.text).join(sep);
            const totalW = doc.fontSize(9.5).font("Helvetica").widthOfString(fullText);
            let curX = ML + (CW - totalW) / 2;

            contactItems.forEach((item, idx) => {
                const w = doc.widthOfString(item.text);
                doc.fontSize(9.5).font("Helvetica").fillColor(NAVY)
                    .text(item.text, curX, contactY, {
                        link: item.link,
                        underline: true,
                        continued: false
                    });
                curX += w;
                if (idx < contactItems.length - 1) {
                    doc.fillColor(GRAY).text(sep, curX, contactY, { continued: false, underline: false });
                    curX += doc.widthOfString(sep);
                }
            });
            doc.y = contactY + 12;
        }

        doc.moveDown(0.4);
        drawLine(doc, ML, doc.y, CW, NAVY, 1.2);
        doc.moveDown(0.4);


        // ══════════════════════════════════════════════════════════════════
        //  HELPER FUNCTIONS
        // ══════════════════════════════════════════════════════════════════

        function sectionHeading(title) {
            ensureSpace(70); // Ensure space for title + line + at least one content row
            doc.moveDown(0.25);
            doc.fontSize(13.5).font("Helvetica-Bold").fillColor(NAVY)
                .text(title.toUpperCase(), ML, doc.y);
            doc.moveDown(0.1);
            drawLine(doc, ML, doc.y, CW, NAVY, 0.75);
            doc.moveDown(0.3);
        }

        function bullet(text) {
            const bulletChar = "\u2022";
            const indent = 12;
            const bulletHeight = doc.fontSize(10.5).font("Helvetica")
                .heightOfString(text, { width: CW - indent, lineGap: 1.5 });
            ensureSpace(bulletHeight + 5);
            
            doc.fontSize(10.5).font("Helvetica").fillColor(DARK)
                .text(bulletChar, ML + 2, doc.y, { continued: false });
            doc.fontSize(10.5).font("Helvetica").fillColor(DARK)
                .text(text, ML + indent, doc.y - 12, {
                    width: CW - indent,
                    lineGap: 1.5
                });
            doc.moveDown(0.08);
        }

        function entryHeader(leftBold, rightMuted) {
            const rightW = doc.fontSize(10.5).font("Helvetica").widthOfString(rightMuted);
            doc.fontSize(11).font("Helvetica-Bold").fillColor(DARK)
                .text(leftBold, ML, doc.y, { width: CW - rightW - 10 });
            doc.fontSize(10.5).font("Helvetica").fillColor(GRAY)
                .text(rightMuted, ML + CW - rightW, doc.y - 13, { width: rightW, align: "right" });
        }


        // ══════════════════════════════════════════════════════════════════
        //  1. PROFESSIONAL SUMMARY
        // ══════════════════════════════════════════════════════════════════
        if (data.summary) {
            const textHeight = doc.fontSize(10.5).font("Helvetica").heightOfString(data.summary, { width: CW, lineGap: 2.0 });
            ensureSpace(60 + textHeight); // space for heading + body text
            sectionHeading("Professional Summary");
            doc.fontSize(10.5).font("Helvetica").fillColor(DARK)
                .text(data.summary, ML, doc.y, { width: CW, lineGap: 2.0 });
            doc.moveDown(0.4);
        }


        // ══════════════════════════════════════════════════════════════════
        //  2. EDUCATION
        // ══════════════════════════════════════════════════════════════════
        if (data.education && data.education.length > 0) {
            sectionHeading("Education");
            data.education.forEach((edu, idx) => {
                ensureSpace(65); // space for education header details
                entryHeader(edu.degree, edu.year);
                
                // Institute (Italic) + Location
                doc.fontSize(10.5).font("Helvetica-Oblique").fillColor(GRAY)
                    .text(edu.institution, ML, doc.y, { continued: true });
                
                if (edu.location) {
                    doc.font("Helvetica").text("  •  " + edu.location);
                } else {
                    doc.text("");
                }

                // CGPA and Coursework as bullet points below (Clean ATS layout)
                if (edu.gpa) {
                    bullet("GPA/Percentage: " + edu.gpa);
                }
                if (edu.coursework) {
                    bullet("Relevant Coursework: " + edu.coursework);
                }
                if (idx < data.education.length - 1) doc.moveDown(0.35);
            });
            doc.moveDown(0.4);
        }


        // ══════════════════════════════════════════════════════════════════
        //  3. TECHNICAL SKILLS
        // ══════════════════════════════════════════════════════════════════
        const sk = data.skills || {};
        const leftSkills = [
            { label: "Languages/Web", items: sk.languages },
            { label: "Backend", items: sk.backend },
            { label: "Tools", items: sk.tools }
        ].filter(cat => cat.items && cat.items.length > 0);

        const rightSkills = [
            { label: "Frontend", items: sk.frontend },
            { label: "Database", items: sk.database },
            { label: "Cloud", items: sk.cloud }
        ].filter(cat => cat.items && cat.items.length > 0);

        if (leftSkills.length > 0 || rightSkills.length > 0) {
            ensureSpace(110); // space for technical skills block
            sectionHeading("Technical Skills");
            
            const startY = doc.y;
            const colW = CW / 2 - 15;
            
            // Left Column
            let leftY = startY;
            leftSkills.forEach(cat => {
                doc.fontSize(10.5).font("Helvetica-Bold").fillColor(DARK)
                    .text(cat.label + ": ", ML, leftY, { width: colW, continued: true });
                doc.font("Helvetica").fillColor(DARK)
                    .text(cat.items.join(", "), { lineGap: 1.5 });
                leftY = doc.y + 2;
            });

            // Right Column
            let rightY = startY;
            rightSkills.forEach(cat => {
                doc.fontSize(10.5).font("Helvetica-Bold").fillColor(DARK)
                    .text(cat.label + ": ", ML + colW + 30, rightY, { width: colW, continued: true });
                doc.font("Helvetica").fillColor(DARK)
                    .text(cat.items.join(", "), { lineGap: 1.5 });
                rightY = doc.y + 2;
            });

            doc.y = Math.max(leftY, rightY) + 12;
            doc.moveDown(0.4);
        }


        // ══════════════════════════════════════════════════════════════════
        //  WORK EXPERIENCE
        // ══════════════════════════════════════════════════════════════════
        if (data.experience && data.experience.length > 0) {
            sectionHeading("Experience");
            data.experience.forEach((exp, idx) => {
                ensureSpace(60); // space for company header details
                entryHeader(exp.role, exp.duration);
                
                doc.fontSize(10.5).font("Helvetica-Oblique").fillColor(GRAY)
                    .text(exp.company + (exp.location ? "  •  " + exp.location : ""), ML, doc.y);
                
                doc.moveDown(0.12);
                if (exp.points && exp.points.length > 0) {
                    exp.points.forEach(pt => bullet(pt));
                }
                if (idx < data.experience.length - 1) doc.moveDown(0.3);
            });
            doc.moveDown(0.4);
        }


        // ══════════════════════════════════════════════════════════════════
        //  4. PROJECTS
        // ══════════════════════════════════════════════════════════════════
        if (data.projects && data.projects.length > 0) {
            sectionHeading("Projects");
            data.projects.forEach((proj, idx) => {
                ensureSpace(70); // space for project name + tech stack + demo row
                
                const rightText = proj.techStack ? proj.techStack : "";
                const rightW = doc.fontSize(9.5).font("Helvetica-Oblique").widthOfString(rightText);
                
                doc.fontSize(11).font("Helvetica-Bold").fillColor(DARK)
                    .text(proj.name, ML, doc.y, { width: CW - rightW - 10 });
                
                if (proj.techStack) {
                    doc.fontSize(9.5).font("Helvetica-Oblique").fillColor(GRAY)
                        .text(proj.techStack, ML + CW - rightW, doc.y - 13, { width: rightW, align: "right" });
                }

                // Links row below name
                const projLinks = [];
                if (proj.liveLink) projLinks.push({ text: "Live Demo", url: proj.liveLink });
                if (proj.githubLink) projLinks.push({ text: "GitHub", url: proj.githubLink });
                if (projLinks.length > 0) {
                    doc.fontSize(9).font("Helvetica").fillColor(NAVY);
                    projLinks.forEach((pl, i) => {
                        doc.text(pl.text, ML + (i > 0 ? 80 : 0), doc.y, {
                            link: pl.url,
                            underline: true,
                            continued: i < projLinks.length - 1
                        });
                        if (i < projLinks.length - 1) {
                            doc.fillColor(GRAY).text("   •   ", { continued: true, underline: false });
                        }
                    });
                    doc.text("", { continued: false });
                }

                doc.moveDown(0.12);
                if (proj.points && proj.points.length > 0) {
                    proj.points.forEach(pt => bullet(pt));
                }
                if (idx < data.projects.length - 1) doc.moveDown(0.35);
            });
            doc.moveDown(0.4);
        }

        // ══════════════════════════════════════════════════════════════════
        //  5. CERTIFICATIONS
        // ══════════════════════════════════════════════════════════════════
        if (data.certifications && data.certifications.length > 0) {
            sectionHeading("Certifications");
            
            // Render in 2 columns if space allows
            const startY = doc.y;
            const colW = CW / 2 - 15;
            
            data.certifications.forEach((cert, idx) => {
                const isLeft = idx % 2 === 0;
                const curX = isLeft ? ML : ML + colW + 30;
                const curY = isLeft ? doc.y : startY + (Math.floor(idx / 2) * 32);
                
                const bulletChar = "\u2022";
                doc.fontSize(10.5).font("Helvetica-Bold").fillColor(DARK)
                    .text(bulletChar, curX, curY, { continued: false });
                
                doc.fontSize(10.5).font("Helvetica-Bold").fillColor(DARK)
                    .text(cert.name, curX + 12, curY, { width: colW - 12, continued: true });
                
                if (cert.year) {
                    doc.font("Helvetica").fillColor(GRAY).text(" (" + cert.year + ")");
                } else {
                    doc.text("");
                }

                if (cert.issuer) {
                    doc.fontSize(9.5).font("Helvetica-Oblique").fillColor(GRAY)
                        .text(cert.issuer, curX + 12, doc.y, { width: colW - 12 });
                }
            });
            doc.moveDown(0.4);
        }

        // ══════════════════════════════════════════════════════════════════
        //  6. ACHIEVEMENTS
        // ══════════════════════════════════════════════════════════════════
        if (data.achievements && data.achievements.length > 0) {
            sectionHeading("Achievements");
            data.achievements.forEach(ach => bullet(ach));
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

