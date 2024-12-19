import React, { useState, useEffect } from 'react';
import '../css/ModalForm.css';
import api from '../api';

const AddEvent = ({ onClose, refreshEvents, showSuccessMessage, placeID }) => {
    const user = JSON.parse(localStorage.getItem('user'));

    const [eventData, setEventData] = useState({
        name: '',
        start_date: '',
        start_time: '',
        end_date: '',
        end_time: '',
        price: '',
        max_tickets: '',
        description: '',
        user_id: user.id,
        place_id: placeID || '', // If placeID is not provided, allow selection
    });
    const [error, setError] = useState('');
    const [errors, setErrors] = useState({});
    const [places, setPlaces] = useState([]);
    const [filteredPlaces, setFilteredPlaces] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loadingPlaces, setLoadingPlaces] = useState(false);

    // Fetch locations for the dropdown
    useEffect(() => {
        if (!placeID) {
            setLoadingPlaces(true);
            api.get('/vieta', { withCredentials: true })
                .then((response) => {
                    setPlaces(response.data);
                    setFilteredPlaces(response.data);
                    setLoadingPlaces(false);
                })
                .catch((err) => {
                    console.error('Error fetching locations:', err);
                    setError('Unable to fetch locations. Please try again later.');
                    setLoadingPlaces(false);
                });
        }
    }, [placeID]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEventData({ ...eventData, [name]: value });
    };

    const handleSearch = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);
        setFilteredPlaces(
            places.filter(
                (place) =>
                    place.name.toLowerCase().includes(query) ||
                    place.address.toLowerCase().includes(query) ||
                    place.city.toLowerCase().includes(query)
            )
        );
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateDates()) return;

        try {
            const response = await api.post(`/vieta/${eventData.place_id}/renginys`, eventData, {
                withCredentials: true,
            });

            if (response.status === 201) {
                setError('');
                setErrors({});
                if (refreshEvents) refreshEvents();
                if (showSuccessMessage) showSuccessMessage('Event added successfully!');
                onClose();
            }
        } catch (err) {
            if (err.response && err.response.status === 422) {
                setErrors(err.response.data.errors || {});
            } else {
                setError('Failed to add the event. Please try again.');
            }
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Add New Event</h2>
                {error && <p className="error-message">{error}</p>}
                <form onSubmit={handleSubmit}>
                    {!placeID && (
                        <div className="form-group">
                            <label>Location</label>
                            {loadingPlaces ? (
                                <p>Loading locations...</p>
                            ) : (
                                <>
                                    <input
                                        type="text"
                                        placeholder="Search locations..."
                                        value={searchQuery}
                                        onChange={handleSearch}
                                        className="search-input"
                                    />
                                    <select
                                        name="place_id"
                                        value={eventData.place_id}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Select a location</option>
                                        {filteredPlaces.map((place) => (
                                            <option key={place.id} value={place.id}>
                                                {place.name} ({place.address}, {place.city})
                                            </option>
                                        ))}
                                    </select>
                                </>
                            )}
                            {errors.place_id && <p className="error-message">{errors.place_id[0]}</p>}
                        </div>
                    )}
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
                            <label>End Time</label>
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
                        <button type="submit">Add Event</button>
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

export default AddEvent;
