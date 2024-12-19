import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import api from '../api';
import '../css/Grid.css';
import '../css/Notification.css';
import EditTicket from './EditTicket';
import DeleteTicket from './DeleteTicket';

const TicketsPage = () => {
    const { placeID, eventID } = useParams();
    const location = useLocation();
    const { creatorId } = location.state || {};
    const [tickets, setTickets] = useState([]);
    const [filteredTickets, setFilteredTickets] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [ticketToDelete, setTicketToDelete] = useState(null);

    const user = JSON.parse(localStorage.getItem('user')) || {};

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/vieta/${placeID}/renginys/${eventID}/bilietas`, { withCredentials: true });
            setTickets(response.data);
            setFilteredTickets(response.data);
            setTotalPages(Math.ceil(response.data.length / itemsPerPage));
        } catch (err) {
            console.error(err);
            setError('Unable to fetch tickets. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, [placeID, eventID, itemsPerPage]);

    useEffect(() => {
        const keywords = searchQuery.trim().toLowerCase().split(' ').filter((keyword) => keyword.length > 0);
        const filtered = tickets.filter((ticket) =>
            keywords.every((keyword) =>
                (ticket.id && ticket.id.toString().includes(keyword)) ||
                (ticket.user_id && ticket.user_id.toString().includes(keyword)) ||
                (ticket.price && ticket.price.toString().includes(keyword)) ||
                (ticket.status && ticket.status.toLowerCase().includes(keyword)) ||
                (ticket.seat_number && ticket.seat_number.toLowerCase().includes(keyword)) ||
                (ticket.purchase_date && ticket.purchase_date.includes(keyword))
            )
        );

        setFilteredTickets(filtered);
        setTotalPages(Math.ceil(filtered.length / itemsPerPage));
        setCurrentPage(1);
    }, [searchQuery, tickets, itemsPerPage]);

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

    const showSuccessMessage = (message) => {
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    const handleEditModalOpen = (ticket) => {
        setSelectedTicket(ticket);
        setIsEditModalOpen(true);
        document.body.classList.add('modal-open');
    };

    const handleEditModalClose = () => {
        setSelectedTicket(null);
        setIsEditModalOpen(false);
        document.body.classList.remove('modal-open');
    };

    const handleDeleteModalOpen = (ticket) => {
        setTicketToDelete(ticket);
        setIsDeleteModalOpen(true);
        document.body.classList.add('modal-open');
    };
    
    const handleDeleteModalClose = () => {
        setTicketToDelete(null);
        setIsDeleteModalOpen(false);
        document.body.classList.remove('modal-open');
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p className="error-message">{error}</p>;

    return (
        <div className="page">
            <h1 className="page-title">Tickets</h1>
            {successMessage && <div className="notification">{successMessage}</div>}
            <div className="search-bar-container">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by ticket ID, user ID, price, status, seat, date, etc."
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
            {filteredTickets.length === 0 && !loading && <p className="no-results-message">No tickets found.</p>}
            <div className="places-grid">
                {paginatedTickets.map((ticket) => (
                    <div key={ticket.id} className="card">
                        <p><strong>Ticket ID:</strong> {ticket.id}<strong>, User ID:</strong> {ticket.user_id}</p>
                        <p><strong>Price:</strong> ${ticket.price}</p>
                        <p><strong>Status:</strong> {ticket.status}</p>
                        <p><strong>Seat Number:</strong> {ticket.seat_number || 'Not Assigned'}</p>
                        <p><strong>Purchase Date:</strong> {ticket.purchase_date}</p>
                        {(user?.role === 3 || (user?.role === 2 && user?.id === creatorId)) && (
                            <Link to={`/place/${placeID}/event/${eventID}/ticket/${ticket.id}`}>
                                View Details
                            </Link>
                        )}
                        {(user?.role === 3 || (user?.role === 2 && user?.id === creatorId)) && (
                            
                            <span
                                onClick={() => handleEditModalOpen(ticket)}
                                className="edit-link"
                            >
                                Edit
                            </span>
                        )}
                        {(user?.role === 3) && (
                            <span
                                onClick={() => handleDeleteModalOpen(ticket)}
                                className="delete-link"
                            >
                                Delete
                            </span>
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
                <button onClick={handleNextPage} disabled={currentPage === totalPages || totalPages === 0}>
                    Next
                </button>
            </div>

            {isEditModalOpen && (
                <EditTicket
                    ticket={selectedTicket}
                    placeID={placeID}
                    eventID={eventID}
                    onClose={handleEditModalClose}
                    refreshTickets={fetchTickets}
                    showSuccessMessage={showSuccessMessage}
                />
            )}

            {isDeleteModalOpen && (
                <DeleteTicket
                    ticket={ticketToDelete}
                    placeID={placeID}
                    eventID={eventID}
                    onClose={handleDeleteModalClose}
                    refreshTickets={fetchTickets}
                    showSuccessMessage={showSuccessMessage}
                />
            )}

        </div>
    );
};

export default TicketsPage;
