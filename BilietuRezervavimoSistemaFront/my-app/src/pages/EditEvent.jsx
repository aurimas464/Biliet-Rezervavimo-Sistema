import React, { useState, useEffect } from 'react';
import '../css/ModalForm.css';
import api from '../api';

const EditEvent = ({ event, onClose, refreshEvents, showSuccessMessage, placeID }) => {

    const [eventData, setEventData] = useState({
        name: '',
        start_date: '',
        start_time: '',
        end_date: '',
        end_time: '',
        price: '',
        max_tickets: '',
        description: '',
    });
    const [error, setError] = useState('');
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (event) {
            setEventData({
                name: event.name || '',
                start_date: event.start_date || '',
                start_time: event.start_time || '',
                end_date: event.end_date || '',
                end_time: event.end_time || '',
                price: event.price || '',
                max_tickets: event.max_tickets || '',
                description: event.description || '',
            });
        }
    }, [event]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEventData({ ...eventData, [name]: value });
    };

    const validateDates = () => {
        const { start_date, start_time, end_date, end_time } = eventData;

        if (start_date && end_date && new Date(start_date) > new Date(end_date)) {
            setError('Start date must be earlier than end date.');
            return false;
        }

        

        if (start_date === end_date && start_time && end_time) {
            const startTime = new Date(`1970-01-01T${start_time}:00`);
            const endTime = new Date(`1970-01-01T${end_time}:00`);

            if (startTime >= endTime) {
                setError('Start time must be earlier than end time on the same day.');
                return false;
            }
        }

        setError('');
        return true;
    };

    const sanitizeTime = (time) => {
        if (time) {
            const [hours, minutes] = time.split(':');
            return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
        }
        return time;
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
    
        const sanitizedData = {
            ...eventData,
            start_time: sanitizeTime(eventData.start_time),
            end_time: sanitizeTime(eventData.end_time),
        };
    
    
        // Proceed with API call
        try {
            const response = await api.patch(`/vieta/${placeID}/renginys/${event.id}`, sanitizedData, {
                withCredentials: true,
            });
    
            if (response.status === 200) {
                setError('');
                setErrors({});
                refreshEvents();
                showSuccessMessage('Event updated successfully!');
                onClose();
            }
        } catch (err) {
            if (err.response && err.response.status === 422) {
                setErrors(err.response.data.errors || {});
            } else {
                setError('Failed to update the event. Please try again.');
            }
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Edit Event</h2>
                {error && <p className="error-message">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Event Name</label>
                        <input
                            type="text"
                            name="name"
                            value={eventData.name}
                            onChange={handleChange}
                            required
                        />
                        {errors.name && <p className="error-message">{errors.name[0]}</p>}
                    </div>
                    <div className="form-group-row">
                        <div className="form-group">
                            <label>Start Date</label>
                            <input
                                type="date"
                                name="start_date"
                                value={eventData.start_date}
                                onChange={handleChange}
                                required
                            />
                            {errors.start_date && <p className="error-message">{errors.start_date[0]}</p>}
                        </div>
                        <div className="form-group">
                            <label>Start Time</label>
                            <input
                                type="time"
                                name="start_time"
                                value={eventData.start_time}
                                onChange={handleChange}
                                required
                            />
                            {errors.start_time && <p className="error-message">{errors.start_time[0]}</p>}
                        </div>
                    </div>
                    <div className="form-group-row">
                        <div className="form-group">
                            <label>End Date</label>
                            <input
                                type="date"
                                name="end_date"
                                value={eventData.end_date}
                                onChange={handleChange}
                                required
                            />
                            {errors.end_date && <p className="error-message">{errors.end_date[0]}</p>}
                        </div>
                        <div className="form-group">
                            <label>End Time (24-hour format)</label>
                            <input
                                type="time"
                                name="end_time"
                                value={eventData.end_time}
                                onChange={handleChange}
                                required
                            />
                            {errors.end_time && <p className="error-message">{errors.end_time[0]}</p>}
                        </div>
                    </div>
                    <div className="form-group-row">
                        <div className="form-group">
                            <label>Price</label>
                            <input
                                type="number"
                                name="price"
                                value={eventData.price}
                                onChange={handleChange}
                                required
                                min="0"
                                step="0.01"
                            />
                            {errors.price && <p className="error-message">{errors.price[0]}</p>}
                        </div>
                        <div className="form-group">
                            <label>Max Tickets</label>
                            <input
                                type="number"
                                name="max_tickets"
                                value={eventData.max_tickets}
                                onChange={handleChange}
                                required
                                min="1"
                            />
                            {errors.max_tickets && <p className="error-message">{errors.max_tickets[0]}</p>}
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            name="description"
                            value={eventData.description}
                            onChange={handleChange}
                            rows="5"
                        ></textarea>
                        {errors.description && <p className="error-message">{errors.description[0]}</p>}
                    </div>
                    <div className="button-group">
                        <button type="submit">Update Event</button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="secondary-button"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditEvent;