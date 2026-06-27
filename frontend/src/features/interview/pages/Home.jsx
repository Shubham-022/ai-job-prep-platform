import React,{useState,useRef} from 'react'
import '../style/home.scss'
import {useInterview} from "../hooks/useInterview.js"
import {useNavigate} from "react-router"

function Home() {

    const { loading, generateReport } = useInterview();
    const navigate = useNavigate();

    const [jobDescription, setJobDescription] = useState("")
    const [selfDescription, setSelfDescription] = useState("")
    const resumeInputRef = useRef()

    const handleGenerateReport = async () => {
        const resumeFile = resumeInputRef.current.files[0]
        const data = await generateReport({ jobDescription, selfDescription, resume: resumeFile })
        if (data?._id) {
            navigate(`/interview/${data._id}`)
        }
    }


    return (
        <main className='home'>
            
            <div className="home-header">
                <h1>Create Your Custom <span>Interview Plan</span></h1>
                <p>Let our AI analyze the job requirements and your unique profile to build a winning strategy.</p>
                <div className="dot-indicator"></div>
            </div>

            <div className="interview-input-card">
                
                <div className="card-body">
                    {/* Left Column */}
                    <div className="column left-col">
                        <div className="col-header">
                            <div className="title-group">
                                <span className="icon">💼</span>
                                <h2>Target Job Description</h2>
                            </div>
                            <span className="badge required">REQUIRED</span>
                        </div>
                        <div className="textarea-wrapper">
                            <textarea
                                onChange={(e)=>{setJobDescription(e.target.value)}} 
                                name="jobDescription" 
                                id="jobDescription" 
                                placeholder="Paste the full job description here...&#10;e.g. 'Senior Frontend Engineer at Google requires proficiency in React, TypeScript, and large-scale system design...'"
                            ></textarea>
                            <span className="char-counter">0 / 5000 chars</span>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="column right-col">
                        <div className="col-header">
                            <div className="title-group">
                                <span className="icon">👤</span>
                                <h2>Your Profile</h2>
                            </div>
                        </div>

                        <div className="input-group">
                            <label className="section-label">Upload Resume <span className="highlight">(Best Results)</span></label>
                            <label htmlFor="resume" className="file-upload-box">
                                <div className="upload-icon">
                                    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                                </div>
                                <span className="upload-text">Click to upload or drag & drop</span>
                                <span className="upload-hint">PDF or DOCX (Max 5MB)</span>
                                <input ref={resumeInputRef} type="file" id='resume' accept='.pdf,.docx' />
                            </label>
                        </div>

                        <div className="divider">
                            <span>OR</span>
                        </div>

                        <div className="input-group">
                            <label className="section-label">Quick Self-Description</label>
                            <textarea 
                                onChange={(e)=>{setSelfDescription(e.target.value)}}
                                name="selfDescription" 
                                id="selfDescription" 
                                placeholder="Briefly describe your experience, key skills, and years of experience if you don't have a resume handy..."
                            ></textarea>
                        </div>

                        <div className="info-box">
                            <span className="info-icon">i</span>
                            <p>Either a <strong>Resume</strong> or a <strong>Self Description</strong> is required to generate a personalized plan.</p>
                        </div>
                    </div>
                </div>

                <div className="card-footer">
                    <span className="footer-text">AI-Powered Strategy Generation &bull; Approx 30s</span>
                    <button onClick={handleGenerateReport} disabled={loading} className="submit-btn">
                        <span className="btn-icon">{loading ? '⏳' : '✨'}</span>
                        {loading ? 'Generating...' : 'Generate My Interview Strategy'}
                    </button>
                </div>

            </div>

            <div className="home-footer">
                <a href="#">Privacy Policy</a>
                <a href="#">Terms of Service</a>
                <a href="#">Help Center</a>
            </div>
            
        </main>
    )
}

export default Home