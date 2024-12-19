import React, { useState } from 'react';
import '../css/ModalForm.css'; // Import the updated modal styles
import api from '../api';

const DeletePlace = ({ place, onClose, refreshPlaces, showSuccessMessage }) => {
    const [error, setError] = useState('');

    const handleDelete = async () => {
        try {
            const response = await api.delete(`/vieta/${place.id}`, {
                withCredentials: true,
            });

            if (response.status === 204) {
                // Show success message
                showSuccessMessage(`Place deleted successfully!`);

                // Refresh the list of places
                await refreshPlaces();

                // Close the modal
                onClose();
            }
        } catch (err) {
            console.error('Failed to delete place:', err);
            setError('Failed to delete the place. Please try again.');
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Delete Confirmation</h2>
                <p>Are you sure you want to delete <strong>{place.name}</strong>?</p>
                {error && <p className="error-message">{error}</p>}
                <div className="button-group">
                    <button onClick={handleDelete} className="delete-button">
                        Yes, Delete
                    </button>
                    <button
                        onClick={onClose}
                        className="secondary-button"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeletePlace;