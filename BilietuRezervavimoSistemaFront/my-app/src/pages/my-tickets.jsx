import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import '../css/Grid.css';

const MyTicketsPage = () => {
    const [tickets, setTickets] = useState([]);
    const [filteredTickets, setFilteredTickets] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const navigate = useNavigate();

    // Fetch tickets
    const fetchTickets = async () => {
        setLoading(true);
        try {
            const response = await api.get('/my-tickets', { withCredentials: true });
            setTickets(response.data);
            setFilteredTickets(response.data);
            setTotalPages(Math.ceil(response.data.length / itemsPerPage));
        } catch (err) {
            console.error('Error fetching tickets:', err);
            setError('Unable to fetch tickets. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, [itemsPerPage]);

    // Filter tickets based on search query
    useEffect(() => {
        const keywords = searchQuery.trim().toLowerCase().split(' ').filter((keyword) => keyword.length > 0);
        const filtered = tickets.filter((ticket) =>
            keywords.every((keyword) =>
                (ticket.event_name && ticket.event_name.toLowerCase().includes(keyword)) ||
                (ticket.place_name && ticket.place_name.toLowerCase().includes(keyword)) ||
                (ticket.status && ticket.status.toLowerCase().includes(keyword)) ||
                (ticket.seat_number && ticket.seat_number.toLowerCase().includes(keyword)) ||
                (ticket.start_date && ticket.start_date.includes(keyword)) ||
                (ticket.end_date && ticket.end_date.includes(keyword)) ||
                (ticket.ticketID && ticket.ticketID.toString().includes(keyword))
            )
        );
        setFilteredTickets(filtered);
        setTotalPages(Math.ceil(filtered.length / itemsPerPage));
        setCurrentPage(1); // Reset to first page after filtering
    }, [searchQuery, tickets, itemsPerPage]);

    // Pagination
    const paginatedTickets = filteredTickets.slice(
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

    if (loading) return <p>Loading...</p>;
    if (error) return <p className="error-message">{error}</p>;

    return (
        <div className="page">
            <h1 className="page-title">My Tickets</h1>
            <div className="search-bar-container">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by event name, venue, status, seat, date, etc."
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
            {filteredTickets.length > 0 ? (
                <div className="places-grid">
                    {paginatedTickets.map((ticket) => (
                        <div key={ticket.ticketID} className="card">
                            <h2>{ticket.event_name}</h2>
                            <p>
                                <strong>Event Start:</strong> {ticket.start_date} {ticket.start_time}
                            </p>
                            <p>
                                <strong>Event End:</strong> {ticket.end_date} {ticket.end_time}
                            </p>
                            <p><strong>Venue:</strong> {ticket.place_name}</p>
                            <p><strong>Address:</strong> {ticket.address}, {ticket.city}</p>
                            <p><strong>Status:</strong> {ticket.status}</p>
                            <p><strong>Seat:</strong> {ticket.seat_number || 'N/A'}</p>
                            <button
                                className="view-details-button"
                                onClick={() =>
                                    navigate(
                                        `/place/${ticket.placeID}/event/${ticket.eventID}/ticket/${ticket.ticketID}`
                                    )
                                }
                            >
                                View Details
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <p>No tickets found.</p>
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
        </div>
    );
};

export default MyTicketsPage;
