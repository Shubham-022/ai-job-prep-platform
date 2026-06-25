import { Navigate } from "react-router"
import { useAuth } from "../hooks/useAuth"  

const Protected = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <h1>loading</h1>
    }
    if (!user) {
        return <Navigate to="/login" replace />
    }
    return children
}

export default Protected