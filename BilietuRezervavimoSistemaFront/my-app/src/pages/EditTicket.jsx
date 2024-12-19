import React, { useState, useEffect } from 'react';
import '../css/ModalForm.css';
import api from '../api';

const EditTicket = ({ ticket, eventID, placeID, onClose, refreshTickets, showSuccessMessage }) => {
    const [ticketData, setTicketData] = useState({
        status: '',
        purchase_date: '',
        seat_number: '',
        price: '',
    });
    const [error, setError] = useState('');
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (ticket) {
            setTicketData({
                status: ticket.status || '',
                purchase_date: ticket.purchase_date || '',
                seat_number: ticket.seat_number || '',
                price: ticket.price || '',
            });
        }
    }, [ticket]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setTicketData({ ...ticketData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await api.patch(
                `/vieta/${placeID}/renginys/${eventID}/bilietas/${ticket.id}`,
                ticketData,
                { withCredentials: true }
            );

            if (response.status === 200) {
                setError('');
                setErrors({});
                refreshTickets();
                showSuccessMessage('Ticket updated successfully!');
                onClose();
            }
        } catch (err) {
            if (err.response && err.response.status === 422) {
                setErrors(err.response.data.errors || {});
            } else {
                setError('Failed to update the ticket. Please try again.');
            }
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Edit Ticket</h2>
                {error && <p className="error-message">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Status</label>
                        <select
                            name="status"
                            value={ticketData.status}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                        {errors.status && <p className="error-message">{errors.status[0]}</p>}
                    </div>
                    <div className="form-group">
                        <label>Purchase Date</label>
                        <input
                            type="date"
                            name="purchase_date"
                            value={ticketData.purchase_date}
                            onChange={handleChange}
                            required
                        />
                        {errors.purchase_date && <p className="error-message">{errors.purchase_date[0]}</p>}
                    </div>
                    <div className="form-group">
                        <label>Seat Number</label>
                        <input
                            type="text"
                            name="seat_number"
                            value={ticketData.seat_number}
                            onChange={handleChange}
                        />
                        {errors.seat_number && <p className="error-message">{errors.seat_number[0]}</p>}
                    </div>
                    <div className="form-group">
                        <label>Price</label>
                        <input
                            type="number"
                            name="price"
                            value={ticketData.price}
                            onChange={handleChange}
                            required
                            min="0"
                            step="0.01"
                        />
                        {errors.price && <p className="error-message">{errors.price[0]}</p>}
                    </div>
                    <div className="button-group">
                        <button type="submit">Update Ticket</button>
                        <button type="button" onClick={onClose} className="secondary-button">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditTicket;