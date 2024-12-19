import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import '../css/Grid.css';
import '../css/Notification.css'; // Add CSS for notification
import AddPlace from './AddPlace';
import EditPlace from './EditPlace';
import DeletePlace from './DeletePlace';

const PlacesPage = () => {
    const [places, setPlaces] = useState([]);
    const [filteredPlaces, setFilteredPlaces] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState(''); // New state for success message
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [placeToDelete, setPlaceToDelete] = useState(null);
    
    // Check if user is an administrator (role 3)
    const user = JSON.parse(localStorage.getItem('user'));
    
    // Fetch all places from API
    useEffect(() => {
        const fetchPlaces = async () => {
            setLoading(true);
            try {
                const response = await api.get('/vieta', { withCredentials: true });
                setPlaces(response.data);
                setFilteredPlaces(response.data); // Initially show all places
                setTotalPages(Math.ceil(response.data.length / itemsPerPage));
            } catch (err) {
                console.error(err);
                setError('Unable to fetch places. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchPlaces();
    }, [itemsPerPage]);

    const refreshPlaces = async () => {
        try {
            const response = await api.get('/vieta', { withCredentials: true });
            setPlaces(response.data);
            setFilteredPlaces(response.data);
            setTotalPages(Math.ceil(response.data.length / itemsPerPage));
        } catch (err) {
            console.error(err);
            setError('Unable to refresh places. Please try again later.');
        }
    };

    const showSuccessMessage = (message) => {
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(''), 3000); // Auto-hide after 3 seconds
    };

    // Filter places based on search query
    useEffect(() => {
        const keywords = searchQuery
            .trim()
            .toLowerCase()
            .split(' ')
            .filter((keyword) => keyword.length > 0); // Split by spaces and remove empty keywords

        const filtered = places.filter((place) =>
            keywords.every((keyword) =>
                (place.name && place.name.toLowerCase().includes(keyword)) ||
                (place.address && place.address.toLowerCase().includes(keyword)) ||
                (place.city && place.city.toLowerCase().includes(keyword)) ||
                (place.postal_code && place.postal_code.toLowerCase().includes(keyword)) ||
                (place.country && place.country.toLowerCase().includes(keyword))
            )
        );

        setFilteredPlaces(filtered);
        setTotalPages(Math.ceil(filtered.length / itemsPerPage));
        setCurrentPage(1); // Reset to page 1 after filtering
    }, [searchQuery, places, itemsPerPage]);

    // Paginated places for the current page
    const paginatedPlaces = filteredPlaces.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Handlers for pagination controls
    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage((prevPage) => prevPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage((prevPage) => prevPage + 1);
        }
    };

    const handlePageChange = (e) => {
        const page = Number(e.target.value);
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const handleItemsPerPageChange = (e) => {
        const newValue = Number(e.target.value);
        if (newValue > 0 && Number.isInteger(newValue)) {
            setItemsPerPage(newValue);
        }
    };

    const handleModalOpen = () => {
        setIsModalOpen(true);
        document.body.classList.add('modal-open');
    };
    
    const handleModalClose = () => {
        setIsModalOpen(false);
        document.body.classList.remove('modal-open');
    };

    const handleEditModalOpen = (place) => {
        setSelectedPlace(place);
        setIsEditModalOpen(true);
        document.body.classList.add('modal-open');
    };
    
    const handleEditModalClose = () => {
        setSelectedPlace(null);
        setIsEditModalOpen(false);
        document.body.classList.remove('modal-open');
    };

    const handleDeleteModalOpen = (place) => {
        setPlaceToDelete(place);
        setIsDeleteModalOpen(true);
        document.body.classList.add('modal-open');
    };
    
    const handleDeleteModalClose = () => {
        setPlaceToDelete(null);
        setIsDeleteModalOpen(false);
        document.body.classList.remove('modal-open');
    };

    return (
        <div className="page">
            <h1 className="page-title">Places</h1>

            <div className="search-bar-container">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, address, city, etc."
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

            {successMessage && <div className="notification">{successMessage}</div>} {/* Success Popup */}
            
            {error && <p className="error-message">{error}</p>}
            {loading ? (
                <p>Loading...</p>
            ) : (
                <>
                    {filteredPlaces.length === 0 && !loading && (
                        <p className="no-results-message">No places found</p>
                    )}
                    <div className="places-grid">
                        {paginatedPlaces.map((place) => (
                            <div key={place.id} className="card">
                                <h2>{place.name}</h2>
                                <p>
                                    {place.address}, {place.city}, {place.postal_code}, {place.country}
                                </p>
                                <p>Capacity: {place.capacity}</p>
                                <Link to={`/place/${place.id}`}>View Details</Link>
                                {user?.role === 3 && (
                                        <span
                                        onClick={() => handleEditModalOpen(place)}
                                        className="edit-link"
                                    >
                                        Edit
                                    </span>
                                )}
                                {user?.role === 3 && (
                                    <span
                                        onClick={() => handleDeleteModalOpen(place)}
                                        className="delete-link"
                                    >
                                        Delete
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="pagination-controls">
                        <button onClick={handlePreviousPage} disabled={currentPage === 1 || totalPages === 0}>
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
                        <button 
                            onClick={handleNextPage} 
                            disabled={currentPage === totalPages || totalPages === 0}>
                            Next
                        </button>
                    </div>
                </>
            )}

            {/* Modal Structure */}
            {isModalOpen && (
                <AddPlace
                    onClose={handleModalClose}
                    refreshPlaces={refreshPlaces}
                    showSuccessMessage={showSuccessMessage}
                />
            )}
            {isEditModalOpen && (
                <EditPlace
                    place={selectedPlace}
                    onClose={handleEditModalClose}
                    refreshPlaces={refreshPlaces}
                    showSuccessMessage={showSuccessMessage}
                />
            )}
            {isDeleteModalOpen && (
                <DeletePlace
                    place={placeToDelete}
                    onClose={handleDeleteModalClose}
                    refreshPlaces={refreshPlaces}
                    showSuccessMessage={showSuccessMessage}
                />
            )}

            

            {user?.role === 3 && (
                <button onClick={handleModalOpen} className="add-place-button small-button">
                    Add Place
                </button>
            )}
        </div>
    );
};

export default PlacesPage;