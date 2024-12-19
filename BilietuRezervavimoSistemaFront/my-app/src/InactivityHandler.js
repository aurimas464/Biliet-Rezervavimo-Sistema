import React, { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const InactivityHandler = ({ children }) => {
    const navigate = useNavigate();
    const inactivityTimeout = useRef(null);

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        navigate('/login');
    }, [navigate]);

    const resetInactivityTimer = useCallback(() => {
        if (inactivityTimeout.current) {
            clearTimeout(inactivityTimeout.current);
        }
        inactivityTimeout.current = setTimeout(logout, 15 * 60 * 1000); // 15 minutes inactivity
    }, [logout]);

    useEffect(() => {
        const handleActivity = resetInactivityTimer;

        document.addEventListener('mousemove', handleActivity);
        document.addEventListener('keypress', handleActivity);

        resetInactivityTimer(); // Start the timer initially

        return () => {
            document.removeEventListener('mousemove', handleActivity);
            document.removeEventListener('keypress', handleActivity);
            if (inactivityTimeout.current) {
                clearTimeout(inactivityTimeout.current); // Cleanup timeout
            }
        };
    }, [resetInactivityTimer]);

    return <>{children}</>;
};

export default InactivityHandler;