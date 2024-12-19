import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './pages/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

import PlacesPage from './pages/PlacesPage';
import EventsPage from './pages/EventsPage';
import TicketsPage from './pages/TicketsPage';

import PlaceDetailsPage from './pages/PlaceDetailsPage';
import EventDetailsPage from './pages/EventDetailsPage';
import TicketDetailsPage from './pages/TicketDetailsPage';
import MyTicketsPage from './pages/my-tickets';
import MyEventsPage from './pages/my-events';


const ProtectedRoute = ({ role = 0, children }) => {
    const token = localStorage.getItem('token');
    const userRole = parseInt(localStorage.getItem('role'), 10);

    if (!token) {
        return <Navigate to="/login" />;
    }

    if (userRole < role) {
        return <Navigate to="/" />;
    }

    return children;
};

const App = () => {
    return (
        <Router>
            <Routes>
                {/* Layout with protected routes */}
                <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                    <Route path="/" element={<Home />} />

                    {/* Guest Routes (role: 0) */}
                    <Route path="/places" element={<ProtectedRoute role={0}><PlacesPage /></ProtectedRoute>} />
                    <Route path="/place/:placeID" element={<ProtectedRoute role={0}><PlaceDetailsPage /></ProtectedRoute>} />
                    <Route path="/place/:placeID/events" element={<ProtectedRoute role={0}><EventsPage /></ProtectedRoute>} />
                    <Route path="/place/:placeID/event/:eventID" element={<ProtectedRoute role={0}><EventDetailsPage /></ProtectedRoute>} />

                    {/* User Routes (role: 1) */}
                    <Route path="/my-tickets" element={<ProtectedRoute role={1}><MyTicketsPage /></ProtectedRoute>} />
                    <Route path="/place/:placeID/event/:eventID/ticket/:ticketID" element={<ProtectedRoute role={1}><TicketDetailsPage /></ProtectedRoute>} />

                    {/* Organizer Routes (role: 2) */}
                    <Route path="/my-events" element={<ProtectedRoute role={2}><MyEventsPage /></ProtectedRoute>} />
                    <Route path="/place/:placeID/event/:eventID/tickets" element={<ProtectedRoute role={2}><TicketsPage /></ProtectedRoute>} />
                </Route>

                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Fallback Route */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Router>
    );
};

export default App;