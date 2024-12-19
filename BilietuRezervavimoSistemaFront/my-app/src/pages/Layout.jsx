import React, { useState } from 'react';
import { Outlet } from 'react-router-dom'; 
import '../css/Layout.css';
import logo from '../images/logo.svg';
import api from '../api';

const Layout = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false); 
    const user = JSON.parse(localStorage.getItem('user')) || {};

    const handleLogout = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
    
            if (user && user.role === 0) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
                return;
            }
    
            await api.post('/logout');
    
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        } catch (err) {
    
            console.error('Error during logout:', err);
            window.location.href = '/login';
        }
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <div className="home-container">
            {/* Navigation Bar */}
            <nav className="navbar">
                <div className="navbar-logo">
                    <img src={logo} alt="Logo" className="logo" />
                </div>
                <ul className={`navbar-links ${isMenuOpen ? 'active' : ''}`}>
                    <li>
                        <a href="/">Home</a>
                    </li>
                    {user.role >= 2 && (
                        <li>
                            <a href="/my-events">My Events</a>
                        </li>
                    )}

                    {user.role >= 1 && (
                        <li>
                            <a href="/my-tickets">My Tickets</a>
                        </li>
                    )}

                    {user.role >= 0 && (
                        <li>
                            <a href="/places">Browse</a>
                        </li>
                    )}
                    <li>
                        <button onClick={handleLogout}>Logout</button>
                    </li>
                    <li>
                        <h1>Welcome, {user.name}</h1>
                    </li>
                </ul>
                {/* Hamburger Menu */}
                <div className="hamburger-menu" onClick={toggleMenu}>
                    <h1></h1>
                    <h1></h1>
                    <h1></h1>
                </div>
            </nav>

            {/* Main Content */}
            <main className="content">
                <Outlet /> {/* Child routes */}
            </main>

            {/* Footer */}
            <footer className="footer">
                <p>&copy; {new Date().getFullYear()} Event Management System</p>
            </footer>
        </div>
    );
};

export default Layout;
