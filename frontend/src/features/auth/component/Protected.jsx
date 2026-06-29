import { Navigate } from "react-router"
import { useAuth } from "../hooks/useAuth"
import { useEffect, useState } from "react"

const Protected = ({ children }) => {
    const { user, loading } = useAuth();
    const [timedOut, setTimedOut] = useState(false);

    // Safety net: if loading takes more than 12s, give up and redirect to login
    useEffect(() => {
        if (!loading) return;
        const timer = setTimeout(() => setTimedOut(true), 12000);
        return () => clearTimeout(timer);
    }, [loading]);

    if (loading && !timedOut) {
        return (
            <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100vh",
                background: "#0f0f13",
                gap: "16px"
            }}>
                <div style={{
                    width: "48px",
                    height: "48px",
                    border: "3px solid #2d2d3a",
                    borderTop: "3px solid #6366f1",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite"
                }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                <p style={{ color: "#a1a1aa", fontSize: "14px", margin: 0 }}>
                    Loading your session...
                </p>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />
    }

    return children;
}

export default Protected