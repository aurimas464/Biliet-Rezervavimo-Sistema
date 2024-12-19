import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import AddEvent from './AddEvent'; // Import AddEvent component
import '../css/Grid.css';
import '../css/Notification.css';

const MyEventsPage = () => {
    const [events, setEvents] = useState([]);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();

    // Fetch events
    const fetchEvents = async () => {
        setLoading(true);
        try {
            const response = await api.get('/my-events', { withCredentials: true });
            setEvents(response.data);
            setFilteredEvents(response.data);
            setTotalPages(Math.ceil(response.data.length / itemsPerPage));
        } catch (err) {
            console.error('Error fetching events:', err);
            setError('Unable to fetch events. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, [itemsPerPage]);

    // Filter events based on search query
    useEffect(() => {
        const keywords = searchQuery.trim().toLowerCase().split(' ').filter((keyword) => keyword.length > 0);
        const filtered = events.filter((event) =>
            keywords.every((keyword) =>
                (event.eventName && event.eventName.toLowerCase().includes(keyword)) ||
                (event.start_date && event.start_date.includes(keyword)) ||
                (event.end_date && event.end_date.includes(keyword)) ||
                (event.eventID && event.eventID.toString().includes(keyword))
            )
        );
        setFilteredEvents(filtered);
        setTotalPages(Math.ceil(filtered.length / itemsPerPage));
        setCurrentPage(1); // Reset to first page after filtering
    }, [searchQuery, events, itemsPerPage]);

    // Pagination
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
        fetchEvents();
    };

    const showSuccessMessage = (message) => {
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p className="error-message">{error}</p>;

    return (
        <div className="page">
            <h1 className="page-title">My Events</h1>
            {successMessage && <div className="notification success">{successMessage}</div>}
            <div className="search-bar-container">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by event name, date, ID, etc."
                    className="search-input"
                />
                <div className="items-per-page">
                    <label>
                        Items per page:
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
            {filteredEvents.length > 0 ? (
                <div className="places-grid">
                    {paginatedEvents.map((event) => (
                        <div key={event.eventID} className="card">
                            <h2>{event.eventName}</h2>
                            <p>
                                <strong>Start:</strong> {event.start_date} {event.start_time}
                            </p>
                            <p>
                                <strong>End:</strong> {event.end_date} {event.end_time}
                            </p>
                            <button
                                className="view-details-button"
                                onClick={() => navigate(`/place/${event.placeID}/event/${event.eventID}`)}
                            >
                                View Details
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <p>No events found.</p>
            )}
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
                <button onClick={handleNextPage} disabled={currentPage === totalPages || totalPages === 0}>
                    Next
                </button>
            </div>
            <button onClick={handleModalOpen} className="add-place-button small-button">
                Add Event
            </button>

            {isModalOpen && (
                <AddEvent
                    onClose={handleModalClose}
                    showSuccessMessage={showSuccessMessage}
                />
            )}
        </div>
    );
};

export default MyEventsPage;