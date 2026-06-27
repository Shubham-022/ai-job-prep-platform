import React from 'react';
import '../auth.form.scss'
import { Link, useNavigate } from "react-router"
import { useAuth } from "../hooks/useAuth"
import { useState } from 'react';

const Login = () => {
    const navigate = useNavigate();
    const { loading, handleLogin } = useAuth(); //destructure krke nikal liya
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");


    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await handleLogin({ email, password });
            navigate("/")
        } catch (error) {
            // Error is already logged in useAuth, UI can stay on the same page
        }
    }

    return (
        <main>
            <div className="form-container">
                <h1>Login</h1>
                <form onSubmit={handleSubmit}>
                    <div className="input-Group">
                        <label htmlFor="email">Email</label>
                        <input
                            onChange={(e) => setEmail(e.target.value)}
                            type="email" id="email" name="email" placeholder='enter your email' />

                    </div>

                    <div className="input-Group">
                        <label htmlFor="password">Password</label>
                        <input
                            onChange={(e) => setPassword(e.target.value)}
                            type="password" id="password" name="password" placeholder='enter your password' />
                    </div>

                    <button disabled={loading} className='button primary-button'>
                        {loading ? 'Loading...' : 'Login'}
                    </button>

                    <div className='text-center'>
                        <p>Don't have an account?<Link to="/register">Register</Link></p>
                    </div>

                </form>
            </div>
        </main>
    );
};

export default Login;