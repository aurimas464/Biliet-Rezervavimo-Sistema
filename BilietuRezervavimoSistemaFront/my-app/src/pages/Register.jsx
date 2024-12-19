import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/Register.css'; // Add CSS similar to Login.css
import '../css/Grid.css';

const Register = () => {
    const serverUrl = process.env.REACT_APP_SERVER_URL + "/api";

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [role, setRole] = useState('');
    const [error, setError] = useState('');
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {

            if (!role) {
                setError('Please select a role before registering.');
                return;
            }

            await axios.post(`${serverUrl}/register`, {
                name,
                email,
                password,
                password_confirmation: passwordConfirmation,
                role: role || undefined,
            }, { withCredentials: true });

            navigate('/login', { state: { successMessage: 'Registration successful. Please log in.' } });
        } catch (err) {
            if (err.response && err.response.status === 422) {
                setErrors(err.response.data.errors || {});
            } else {
                setError('Registration failed. Please try again.');
            }
        }
    };

    const handleNavigateToLogin = () => {
        navigate('/login');
    };

    return (
        <div className="register-container">
            <div className="register-box">
                <h2>Register</h2>
                {error && <p className="error-message">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                        {errors.name && <p className="error-message">{errors.name[0]}</p>}
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        {errors.email && <p className="error-message">{errors.email[0]}</p>}
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        {errors.password && <p className="error-message">{errors.password[0]}</p>}
                    </div>
                    <div className="form-group">
                        <label>Confirm Password</label>
                        <input
                            type="password"
                            value={passwordConfirmation}
                            onChange={(e) => setPasswordConfirmation(e.target.value)}
                            required
                        />
                        {errors.password_confirmation && (
                            <p className="error-message">{errors.password_confirmation[0]}</p>
                        )}
                    </div>
                    <div className="form-group">
                        <label>Role</label>
                        <select value={role} onChange={(e) => setRole(e.target.value)}>
                            <option value="">Select a role</option>
                            <option value="1">User</option>
                            <option value="2">Organizer</option>
                        </select>
                        {errors.role && <p className="error-message">{errors.role[0]}</p>}
                    </div>
                    <div>
                        <button type="submit">Register</button>
                    </div>
                    <div>
                        <button
                            type="button"
                            onClick={handleNavigateToLogin}
                            className="secondary-button"
                        >
                            Login
                        </button>
                    </div>
                </form>
            </div>
            <div className="background-image"></div>
        </div>
    );
};

export default Register;