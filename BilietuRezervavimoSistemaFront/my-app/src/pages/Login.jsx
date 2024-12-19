import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api';
import '../css/Login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    const successMessage = location.state?.successMessage || '';

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/login', {

                email,
                password,
            }, { withCredentials: true });
            console.log('Cookies after login:', document.cookie);
            const { access_token, user } = response.data;
            localStorage.setItem('token', access_token);
            localStorage.setItem('user', JSON.stringify(user));
            console.log(`Logged in as: ${JSON.stringify(user)}`);
            navigate('/'); 
        } catch (err) {
            setError('Invalid login credentials');
        }
    };

    const handleRegister = () => {
        navigate('/register');
    };

    const handleGuestLogin = async () => {
        const guestEmail = 'guest@example.com';
        const guestPassword = 'guestguest';
    
        try {
            const response = await api.post('/login', {
                email: guestEmail,
                password: guestPassword,
            }, { withCredentials: true });
    
            // Save token and guest user info in localStorage
            const { access_token, user } = response.data;
            localStorage.setItem('token', access_token);
            localStorage.setItem('user', JSON.stringify(user)); // Save user info as a JSON string
    
            console.log("Logged in as guest:", JSON.stringify(user));
    
            navigate('/'); // Redirect after login
        } catch (err) {
            console.error('Unable to login as guest. Please try again later.', err);
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h2>Login</h2>
                {successMessage && <p className="success-message">{successMessage}</p>}
                {error && <p className="error-message">{error}</p>}
                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button type="submit">Login</button>
                </form>
                <div>
                    <button type="button" onClick={handleRegister}>
                        Register
                    </button>
                </div>
                <div>
                    <button type="button" onClick={handleGuestLogin} className="secondary-button">
                        Login as Guest
                    </button>
                </div>
            </div>
            <div className="background-image"></div>
        </div>
    );
};

export default Login;