import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import '../css/Grid.css';
import EditEvent from './EditEvent';
import DeleteEvent from './DeleteEvent';

const EventDetailsPage = () => {
    const { placeID, eventID } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [notification, setNotification] = useState(''); // For max ticket limit notification
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentTicketCount, setCurrentTicketCount] = useState(0);

    const user = JSON.parse(localStorage.getItem('user')) || {};

    // Fetch event details
    const fetchEventDetails = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/vieta/${placeID}/renginys/${eventID}`, {}, { withCredentials: true });
            setEvent(response.data);
        } catch (err) {
            console.error(err);
            setError('Unable to fetch event details. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const fetchTicketCount = async () => {
        try {
            const response = await api.get(`/vieta/${placeID}/renginys/${eventID}/ticket-count`, { withCredentials: true });
            setCurrentTicketCount(response.data.current_ticket_count);
        } catch (err) {
            console.error('Error fetching ticket count:', err);
        }
    };

    useEffect(() => {
        fetchEventDetails();
        fetchTicketCount();
    }, [placeID, eventID]);

    const generateRandomSeat = () => {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const randomLetter = letters[Math.floor(Math.random() * letters.length)]; // Pick a random letter
        const randomNumber = Math.floor(Math.random() * 100) + 1; // Generate a random number between 1 and 100
        return `${randomLetter}${randomNumber}`; // Combine letter and number, e.g., "A23"
    };

    const handleBuyTicket = async () => {
        try {
            // Check ticket availability
            const countResponse = await api.get(`/vieta/${placeID}/renginys/${eventID}/ticket-count`, { withCredentials: true });
            const { current_ticket_count, max_tickets } = countResponse.data;
    
            const now = new Date();
            const eventStartDate = new Date(`${event.start_date}T${event.start_time}`);
            
            if (now >= eventStartDate) {
                setNotification('Tickets can no longer be purchased as the event has already started');
                setTimeout(() => setNotification(''), 3000); // Clear notification after 3 seconds
                return;
            }

            if (current_ticket_count >= max_tickets) {
                setNotification('Sorry, this event has reached its maximum ticket capacity');
                setTimeout(() => setNotification(''), 3000); // Clear notification after 3 seconds
                return;
            }
    
            // Generate a random seat with a letter and number
            const randomSeat = generateRandomSeat();
    
            // Proceed to purchase ticket
            const ticketData = {
                user_id: user.id,
                status: 'active',
                purchase_date: new Date().toISOString().split('T')[0],
                seat_number: randomSeat,
                price: event.price,
            };
    
            const response = await api.post(
                `/vieta/${placeID}/renginys/${eventID}/bilietas`,
                ticketData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                },
                { withCredentials: true }
            );
    
            if (response.status === 201) {
                setSuccessMessage(`Ticket purchased successfully!`);
                fetchTicketCount();
            } else {
                alert('Unexpected response from the server.');
            }
        } catch (err) {
            console.error(err);
            alert(err.response?.data.message || 'Unable to buy ticket. Please try again.');
        }
    };

    const handleEditModalOpen = () => {
        setIsEditModalOpen(true);
        document.body.classList.add('modal-open');
    };

    const handleEditModalClose = () => {
        setIsEditModalOpen(false);
        document.body.classList.remove('modal-open');
        fetchEventDetails();
    };

    const handleDeleteModalOpen = () => {
        setIsDeleteModalOpen(true);
        document.body.classList.add('modal-open');
    };

    const handleDeleteModalClose = () => {
        setIsDeleteModalOpen(false);
        document.body.classList.remove('modal-open');
        navigate(`/place/${placeID}/events`);
    };

    const handleViewAllTickets = () => {
        navigate(`/place/${placeID}/event/${eventID}/tickets`, { state: { creatorId: event.user_id } });
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p className="error-message">{error}</p>;

    return (
        <div className="event-details-page">
            <h1 className="page-title">{event?.name}</h1>
            {successMessage && <div className="notification success">{successMessage}</div>}
            {notification && <div className="notification error">{notification}</div>}
            {event && (
                <div className="event-info">
                    <div className="details-grid">
                        <p><strong>Name:</strong> {event.name}</p>
                        <p>
                            <strong>Date & Time:</strong> {event.start_date} {event.start_time} - {event.end_date} {event.end_time}
                        </p>
                        <p><strong>Price:</strong> ${event.price}</p>
                        <p><strong>Tickets Sold:</strong> {currentTicketCount} / {event.max_tickets}</p>
                        <p className="description-row">
                            <strong>Description:</strong> <br /> {event.description || 'No description available'}
                        </p>
                        <p><strong>Created At:</strong> {event.created_at}</p>
                        <p><strong>Updated At:</strong> {event.updated_at}</p>
                    </div>
                    {user.role >= 1 && (
                        <button onClick={handleBuyTicket} className="buy-ticket-button">
                            Buy Ticket
                        </button>
                    )}
                    {(user.role === 3 || (user.role === 2 && user.id === event.user_id)) && (
                        <div className="button-group">
                            <button onClick={handleViewAllTickets} className="view-tickets-button">
                                View All Tickets
                            </button>
                        </div>
                    )}
                    {(user.role === 3 || (user.role === 2 && user.id === event.user_id)) && (
                        <div className="button-group">
                            <button onClick={handleEditModalOpen} className="edit-button">
                                Edit Event
                            </button>
                            <button onClick={handleDeleteModalOpen} className="delete-button">
                                Delete Event
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Edit Modal */}
            {isEditModalOpen && (
                <EditEvent
                    event={event}
                    placeID={placeID}
                    onClose={handleEditModalClose}
                    refreshEvents={fetchEventDetails}
                    showSuccessMessage={setSuccessMessage}
                />
            )}

            {/* Delete Modal */}
            {isDeleteModalOpen && (
                <DeleteEvent
                    event={event}
                    placeID={placeID}
                    onClose={handleDeleteModalClose}
                    refreshEvents={fetchEventDetails}
                    showSuccessMessage={setSuccessMessage}
                />
            )}
        </div>
    );
};

export default EventDetailsPage;
