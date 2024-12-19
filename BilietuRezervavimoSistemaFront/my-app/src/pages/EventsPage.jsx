import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import '../css/Grid.css';
import '../css/Notification.css';
import AddEvent from './AddEvent';
import EditEvent from './EditEvent';
import DeleteEvent from './DeleteEvent';

const EventsPage = () => {
    const { placeID } = useParams();
    const [events, setEvents] = useState([]);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [eventToDelete, setEventToDelete] = useState(null);

    const user = JSON.parse(localStorage.getItem('user'));


    useEffect(() => {
        const fetchEvents = async () => {
            setLoading(true);
            try {
                const response = await api.get(`/vieta/${placeID}/renginys`, { withCredentials: true });
                setEvents(response.data);
                setFilteredEvents(response.data);
                setTotalPages(Math.ceil(response.data.length / itemsPerPage));
            } catch (err) {
                console.error(err);
                setError('Unable to fetch events. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, [placeID, itemsPerPage]);

    const refreshEvents = async () => {
        try {
            const response = await api.get(`/vieta/${placeID}/renginys`, { withCredentials: true });
            setEvents(response.data);
            setFilteredEvents(response.data);
            setTotalPages(Math.ceil(response.data.length / itemsPerPage));
        } catch (err) {
            console.error(err);
            setError('Unable to refresh events. Please try again later.');
        }
    };

    const showSuccessMessage = (message) => {
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    useEffect(() => {
        const keywords = searchQuery.trim().toLowerCase().split(' ').filter((keyword) => keyword.length > 0);
        const filtered = events.filter((event) =>
            keywords.every((keyword) =>
                (event.name && event.name.toLowerCase().includes(keyword)) ||
                (event.description && event.description.toLowerCase().includes(keyword)) ||
                (event.start_date && event.start_date.includes(keyword)) ||
                (event.start_time && event.start_time.includes(keyword)) ||
                (event.end_date && event.end_date.includes(keyword)) ||
                (event.end_time && event.end_time.includes(keyword)) ||
                (event.price && event.price.includes(keyword))
            )
        );

        setFilteredEvents(filtered);
        setTotalPages(Math.ceil(filtered.length / itemsPerPage));
        setCurrentPage(1);
    }, [searchQuery, events, itemsPerPage]);

    const paginatedEvents = filteredEvents.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handlePreviousPage = () => {
        if (currentPage > 1) setCurrentPage((prevPage) => prevPage - 1);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage((prevPage) => prevPage + 1);
    };

    const handlePageChange = (e) => {
        const page = Number(e.target.value);
        if (page >= 1 && page <= totalPages) setCurrentPage(page);
    };

    const handleItemsPerPageChange = (e) => {
        const newValue = Number(e.target.value);
        if (newValue > 0) setItemsPerPage(newValue);
    };

    const handleModalOpen = () => {
        setIsModalOpen(true);
        document.body.classList.add('modal-open');
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        document.body.classList.remove('modal-open');
    };

    const handleEditModalOpen = (event) => {
        setSelectedEvent(event);
        setIsEditModalOpen(true);
        document.body.classList.add('modal-open');
    };

    const handleEditModalClose = () => {
        setSelectedEvent(null);
        setIsEditModalOpen(false);
        document.body.classList.remove('modal-open');
    };

    const handleDeleteModalOpen = (event) => {
        setEventToDelete(event);
        setIsDeleteModalOpen(true);
        document.body.classList.add('modal-open');
    };

    const handleDeleteModalClose = () => {
        setEventToDelete(null);
        setIsDeleteModalOpen(false);
        document.body.classList.remove('modal-open');
    };

    
    return (
        <div className="page">
            <h1 className="page-title">Events</h1>

            <div className="search-bar-container">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, description, date, time, price, etc."
                    className="search-input"
                />
                <div className="items-per-page">
                    <label>
                        Items per page
                        <input
                            type="number"
                            value={itemsPerPage}
                            onChange={handleItemsPerPageChange}
                            min="1"
                            step="1"
                            className="items-per-page-input"
                        />
                    </label>
                </div>
            </div>

            {successMessage && <div className="notification">{successMessage}</div>}
            {error && <p className="error-message">{error}</p>}
            {loading ? (
                <p>Loading...</p>
            ) : (
                <>
                    {filteredEvents.length === 0 && !loading && <p className="no-results-message">No events found.</p>}
                    <div className="places-grid">
                        {paginatedEvents.map((event) => (
                            <div key={event.id} className="card">
                                <h2>{event.name}</h2>
                                <p>
                                    <strong>Date:</strong> {event.start_date} - {event.end_date}
                                </p>
                                <p>
                                    <strong>Time:</strong> {event.start_time} - {event.end_time}
                                </p>
                                <p>
                                    <strong>Price:</strong> ${event.price} 
                                    <strong>, </strong> 
                                    <strong>Max Tickets:</strong> {event.max_tickets}
                                </p>
                                <Link to={`/place/${placeID}/event/${event.id}`}>View Details</Link>
                                {(user?.role === 3 || (user?.role === 2 && user?.id === event.user_id)) && (
                                    <>
                                        <span
                                            onClick={() => handleEditModalOpen(event)}
                                            className="edit-link"
                                        >
                                            Edit
                                        </span>
                                        <span
                                            onClick={() => handleDeleteModalOpen(event)}
                                            className="delete-link"
                                        >
                                            Delete
                                        </span>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="pagination-controls">
                        <button onClick={handlePreviousPage} disabled={currentPage === 1}>
                            Previous
                        </button>
                        <input
                            type="number"
                            className="pagination-input"
                            value={currentPage}
                            onChange={handlePageChange}
                            min="1"
                            max={totalPages}
                        />
                        <button 
                            onClick={handleNextPage} 
                            disabled={currentPage === totalPages || totalPages === 0}>
                            Next
                        </button>
                    </div>
                </>
            )}
            
            {isModalOpen && (
                <AddEvent
                    placeID={placeID}
                    onClose={handleModalClose}
                    refreshEvents={refreshEvents}
                    showSuccessMessage={showSuccessMessage}
                />
            )}
            {isEditModalOpen && (
                <EditEvent
                    event={selectedEvent}
                    placeID={placeID}
                    onClose={handleEditModalClose}
                    refreshEvents={refreshEvents}
                    showSuccessMessage={showSuccessMessage}
                />
            )}
            {isDeleteModalOpen && (
                <DeleteEvent
                    event={eventToDelete}
                    placeID={placeID}
                    onClose={handleDeleteModalClose}
                    refreshEvents={refreshEvents}
                    showSuccessMessage={showSuccessMessage}
                />
            )}
            {user?.role >= 2 && (
                <button onClick={handleModalOpen} className="add-place-button small-button">
                    Add Event
                </button>
            )}
        </div>
    );
}

export default EventsPage;