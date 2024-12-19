import React, { useState } from 'react';
import '../css/ModalForm.css';
import api from '../api';

const AddPlace = ({ onClose, refreshPlaces, showSuccessMessage  }) => {
    const [placeData, setPlaceData] = useState({
        name: '',
        address: '',
        city: '',
        postal_code: '',
        country: '',
        capacity: '',
    });
    const [error, setError] = useState('');
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPlaceData({ ...placeData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/vieta', placeData, {
                withCredentials: true,
            });

            if (response.status === 201) {
                setError('');
                setErrors({});
                refreshPlaces(); // Refresh the list of places
                showSuccessMessage('Place added successfully!');
                onClose(); // Close the modal
            }
        } catch (err) {
            if (err.response && err.response.status === 422) {
                setErrors(err.response.data.errors || {});
            } else {
                setError('Failed to add the place. Please try again.');
            }
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Add New Place</h2>
                {error && <p className="error-message">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Name</label>
                        <input
                            type="text"
                            name="name"
                            value={placeData.name}
                            onChange={handleChange}
                            required
                        />
                        {errors.name && <p className="error-message">{errors.name[0]}</p>}
                    </div>
                    <div className="form-group">
                        <label>Address</label>
                        <input
                            type="text"
                            name="address"
                            value={placeData.address}
                            onChange={handleChange}
                            required
                        />
                        {errors.address && <p className="error-message">{errors.address[0]}</p>}
                    </div>
                    <div className="form-group">
                        <label>City</label>
                        <input
                            type="text"
                            name="city"
                            value={placeData.city}
                            onChange={handleChange}
                            required
                        />
                        {errors.city && <p className="error-message">{errors.city[0]}</p>}
                    </div>
                    <div className="form-group">
                        <label>Postal Code</label>
                        <input
                            type="text"
                            name="postal_code"
                            value={placeData.postal_code}
                            onChange={handleChange}
                            required
                        />
                        {errors.postal_code && <p className="error-message">{errors.postal_code[0]}</p>}
                    </div>
                    <div className="form-group">
                        <label>Country</label>
                        <input
                            type="text"
                            name="country"
                            value={placeData.country}
                            onChange={handleChange}
                            required
                        />
                        {errors.country && <p className="error-message">{errors.country[0]}</p>}
                    </div>
                    <div className="form-group">
                        <label>Capacity</label>
                        <input
                            type="number"
                            name="capacity"
                            value={placeData.capacity}
                            onChange={handleChange}
                            required
                            min="1"
                        />
                        {errors.capacity && <p className="error-message">{errors.capacity[0]}</p>}
                    </div>
                    <div className="button-group">
                        <button type="submit">Add Place</button>
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

export default AddPlace;