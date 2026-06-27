import { createContext, useState } from "react";

export const InterviewContext = createContext(null);

export const InterviewProvider = ({ children }) => {
    const [loading, setLoading] = useState(false);
    const [report, setReport] = useState(null);
    const [reports, setReports] = useState(null);

    return (
        <InterviewContext.Provider value={{ loading, report, setReport, setLoading, reports, setReports }}>
            {children}
        </InterviewContext.Provider>
    );
};