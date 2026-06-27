import { useContext } from "react"
import { AuthContext } from "../auth.context.jsx"   //from  state layer
import { login, register, logout } from "../services/auth.api" //from api layer

export const useAuth = () => {
    const context = useContext(AuthContext);
    const { user, setUser, loading, setLoading } = context

    const handleLogin = async ({ email, password }) => {
        setLoading(true)
        try {
            const data = await login({ email, password });

            if (data) {
                setUser(data.user);
            }

        } catch (error) {
            console.error("Login error:", error);
            setUser(null);
            throw error;
        } finally {
            setLoading(false);
        }
    }

    const handleRegister = async ({ username, email, password }) => {

        setLoading(true)
        try {
            const data = await register({ username, email, password })
            setUser(data.user)
        }
        catch (err) {
            console.log(err);
            setUser(null)
            throw err;
        } finally {
            setLoading(false)
        }

    }

    const handleLogout = async () => {
        setLoading(true)
        try {
            await logout()
            setUser(null)
        } catch (err) {
            console.log(err)
        } finally {
            setLoading(false)
        }
    }

    return { user, loading, handleRegister, handleLogin, handleLogout }
}