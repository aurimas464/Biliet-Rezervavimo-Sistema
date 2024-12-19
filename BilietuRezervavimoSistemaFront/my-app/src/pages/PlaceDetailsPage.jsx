import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import '../css/Grid.css';

const PlaceDetailsPage = () => {
    const { placeID } = useParams(); // Retrieve the place ID from the URL
    const navigate = useNavigate(); // For navigation
    const [place, setPlace] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Fetch place details
    useEffect(() => {
        const fetchPlaceDetails = async () => {
            setLoading(true);
            try {
                const response = await api.get(`/vieta/${placeID}`, {}, {withCredentials: true});
                setPlace(response.data);
            } catch (err) {
                console.error(err);
                setError('Unable to fetch place details. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchPlaceDetails();
    }, [placeID]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p className="error-message">{error}</p>;

    return (
        <div className="place-details-page">
            <h1 className="page-title">{place?.name}</h1>
            {place && (
                <div className="place-info">
                    <div className="details-grid">
                        <p><strong>Name:</strong> {place.name}</p>
                        <p><strong>Address:</strong> {place.address}</p>
                        <p><strong>City:</strong> {place.city}</p>
                        <p><strong>Postal Code:</strong> {place.postal_code}</p>
                        <p><strong>Country:</strong> {place.country}</p>
                        <p><strong>Capacity:</strong> {place.capacity}</p>
                        <p><strong>Created At:</strong> {place.created_at}</p>
                        <p><strong>Updated At:</strong> {place.updated_at}</p>
                    </div>
                </div>
            )}
            <button
                onClick={() => navigate(`/place/${placeID}/events`)}
                className="view-events-button"
            >
                View Events
            </button>
        </div>
    );
};

export default PlaceDetailsPage;