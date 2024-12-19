import React, { useState } from 'react';
import '../css/ModalForm.css'; // Reuse modal styles
import api from '../api';

const DeleteTicket = ({ ticket, placeID, eventID, onClose, refreshTickets, showSuccessMessage }) => {
    const [error, setError] = useState('');

    const handleDelete = async () => {
        try {
            const response = await api.delete(
                `/vieta/${placeID}/renginys/${eventID}/bilietas/${ticket.id}`,
                { withCredentials: true }
            );

            if (response.status === 204) {
                showSuccessMessage(`Ticket "${ticket.id}" deleted successfully!`);
                await refreshTickets();
                onClose();
            }
        } catch (err) {
            console.error('Failed to delete ticket:', err);
            setError('Failed to delete the ticket. Please try again.');
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Delete Confirmation</h2>
                <p>
                    Are you sure you want to delete ticket <strong>#{ticket.id}</strong>?
                </p>
                {error && <p className="error-message">{error}</p>}
                <div className="button-group">
                    <button onClick={handleDelete} className="delete-button">
                        Yes, Delete
                    </button>
                    <button onClick={onClose} className="secondary-button">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteTicket;