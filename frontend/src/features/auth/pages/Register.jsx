import React from 'react';
import { useNavigate, Link } from "react-router"
import { useAuth } from '../hooks/useAuth';
import { useState } from 'react';

const Register = () => {
    const navigate = useNavigate();
    const { loading, handleRegister } = useAuth();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        await handleRegister({ username, email, password });
        navigate("/");
    }
    if (loading) {
        return (<main><h1>Loading....</h1></main>)
    }

    return (
        <main>
            <div className="form-container">
                <h1>Register</h1>
                <form onSubmit={handleSubmit}>
                    <div className="input-Group">
                        <label htmlFor="username">Username</label>
                        <input
                            onChange={(e) => setUsername(e.target.value)}
                            type="text" id="username" name="username" placeholder='enter your username' />

                    </div>
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

                    <button className='button primary-button'>Register</button>
                    <div className='text-center'>
                        <p>Already have an account?<Link to="/login">Login</Link></p>
                    </div>

                </form>
            </div>
        </main>
    );
};

export default Register;