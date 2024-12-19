import React, { useState } from 'react';
import '../css/ModalForm.css'; // Reuse modal styles
import api from '../api';

const DeleteEvent = ({ event, placeID, onClose, refreshEvents, showSuccessMessage }) => {
    const [error, setError] = useState('');

    const handleDelete = async () => {
        try {
            const response = await api.delete(`/vieta/${placeID}/renginys/${event.id}`, {
                withCredentials: true,
            });

            if (response.status === 204) {
                // Show success message
                showSuccessMessage(`Event "${event.name}" deleted successfully!`);

                // Refresh the events list
                await refreshEvents();

                // Close the modal
                onClose();
            }
        } catch (err) {
            console.error('Failed to delete event:', err);
            setError('Failed to delete the event. Please try again.');
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Delete Confirmation</h2>
                <p>Are you sure you want to delete <strong>{event.name}</strong>?</p>
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

export default DeleteEvent;