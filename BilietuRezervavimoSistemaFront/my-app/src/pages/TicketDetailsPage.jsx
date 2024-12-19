import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';
import api from '../api';
import '../css/Notification.css';
import '../css/Grid.css';
import '../css/QR.css'; // Add QR-specific styles
import EditTicket from './EditTicket';

const TicketDetailPage = () => {
    const { placeID, eventID, ticketID } = useParams();
    const navigate = useNavigate();
    const [ticket, setTicket] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const user = JSON.parse(localStorage.getItem('user')) || {};

    const fetchTicketDetails = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/vieta/${placeID}/renginys/${eventID}/bilietas/${ticketID}`, {
                withCredentials: true,
            });
            setTicket(response.data);

            const qrData = JSON.stringify(response.data);
            const qrCode = await QRCode.toDataURL(qrData);
            setQrCodeUrl(qrCode);
        } catch (err) {
            console.error('Error fetching ticket details:', err);
            setError('Unable to fetch ticket details. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTicketDetails();
    }, [placeID, eventID, ticketID]);

    const handleEditModalOpen = () => {
        setIsEditModalOpen(true);
        document.body.classList.add('modal-open');
    };

    const handleEditModalClose = () => {
        setIsEditModalOpen(false);
        document.body.classList.remove('modal-open');
        fetchTicketDetails();
    };

    const handleDownloadQRCode = () => {
        const link = document.createElement('a');
        link.href = qrCodeUrl;
        link.download = `Ticket_${ticketID}_QRCode.png`;
        link.click();
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p className="error-message">{error}</p>;

    return (
        <div className="detail-page">
            <h1 className="page-title">Ticket Details</h1>
            {successMessage && <div className="notification success">{successMessage}</div>}
            {ticket && (
                <div className="details-grid">
                    <p><strong>Ticket ID:</strong> {ticket.id}</p>
                    <p><strong>User ID:</strong> {ticket.user_id}</p>
                    <p><strong>Price:</strong> ${ticket.price}</p>
                    <p><strong>Status:</strong> {ticket.status}</p>
                    <p><strong>Seat Number:</strong> {ticket.seat_number || 'Not Assigned'}</p>
                    <p><strong>Purchase Date:</strong> {ticket.purchase_date}</p>
                </div>
            )}
            {qrCodeUrl && (
                <div className="qr-code-container">
                    <h2>QR Code</h2>
                    <img src={qrCodeUrl} alt="Ticket QR Code" className="qr-code-image" /> <br/>
                    <button onClick={handleDownloadQRCode} className="download-qr-button">
                        Download QR Code
                    </button>
                </div>
            )}
            {(user?.role === 3 || (user?.role === 2 && user?.id === ticket?.creator_id)) && (
                <div className="button-group">
                    <button onClick={handleEditModalOpen} className="edit-button">
                        Edit Ticket
                    </button>
                </div>
            )}
            <button onClick={() => navigate(-1)} className="secondary-button">
                Back
            </button>
            {isEditModalOpen && (
                <EditTicket
                    ticket={ticket}
                    placeID={placeID}
                    eventID={eventID}
                    onClose={handleEditModalClose}
                    refreshTickets={fetchTicketDetails}
                    showSuccessMessage={setSuccessMessage}
                />
            )}
        </div>
    );
};

export default TicketDetailPage;