import React, { useEffect, useState, useMemo } from 'react';
import { Container, Alert, Badge, Row, Col, Button, Spinner } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  FaMapMarkerAlt, FaUsers, FaCalendarAlt, 
  FaClock, FaTicketAlt, FaUserTie, FaQrcode
} from 'react-icons/fa';
import { eventsApi } from '../../api';
import { MapContainer, Marker, TileLayer } from 'react-leaflet';
import styles from './EventDetails.module.css';

import { selectIsAuthenticated } from '../../store/slices/authSlice';
import { fetchProfile } from '../../store/slices/userSlice';
import { 
  registerEvent, 
  cancelEventRegistration, 
  clearRegistrationMessages 
} from '../../store/slices/registrationsSlice';
import QRModal from '../../components/QRModal/QRModal';
import Loader from '../../components/Loader/Loader';

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const isAuthenticated = useSelector(selectIsAuthenticated);
  const registeredEvents = useSelector((state) => state.users.registeredEvents);
  const latestTicket = useSelector((state) => state.registrations.latestTicket);
  const { isLoading: isRegLoading, error: regError, successMessage } = useSelector((state) => state.registrations);

  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showQR, setShowQR] = useState(false);

  const isRegistered = useMemo(() => {
    if (!isAuthenticated || !registeredEvents?.length) return false;
    return registeredEvents.some((reg) => {
      const eventId = typeof reg.event === 'object' ? reg.event?._id : reg.event;
      return eventId === id && reg.status !== 'cancelled';
    });
  }, [isAuthenticated, registeredEvents, id]);

  const currentTicketQR = useMemo(() => {
    if (!registeredEvents?.length) return null;
    const reg = registeredEvents.find((r) => {
      const eventId = typeof r.event === 'object' ? r.event?._id : r.event;
      return eventId === id && r.status !== 'cancelled';
    });
    return reg?.qrCode ?? null;
  }, [registeredEvents, id]);

  const activeQR = latestTicket?.qrCode || currentTicketQR;

  useEffect(() => {
    const loadEvent = async () => {
      try {
        setIsLoading(true);
        setError('');
        const data = await eventsApi.getEventById(id);
        setEvent(data?.event ?? null);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load event details.');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) loadEvent();
    if (isAuthenticated) dispatch(fetchProfile());

    return () => { dispatch(clearRegistrationMessages()); };
  }, [id, isAuthenticated, dispatch]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        dispatch(clearRegistrationMessages());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, dispatch]);

  const handleRegistrationToggle = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (isRegistered) {
      await dispatch(cancelEventRegistration(id));
    } else {
      try {
        await dispatch(registerEvent(id)).unwrap();
        setShowQR(true);
      } catch {
        // registration failed, QR won't show
      }
    }

    dispatch(fetchProfile());
    try {
      const data = await eventsApi.getEventById(id);
      setEvent(data?.event ?? null);
    } catch {
      // ignore
    }
  };

  if (isLoading) {
    return (
      <div className={styles.pageBackground}>
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
          <Loader text="Loading event details..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.pageBackground}>
        <Container className={styles.wrapper}>
          <Alert variant="danger">{error}</Alert>
        </Container>
      </div>
    );
  }

  if (!event) {
    return (
      <div className={styles.pageBackground}>
        <Container className={styles.wrapper}>
          <Alert variant="warning">Event not found.</Alert>
        </Container>
      </div>
    );
  }

  const eventDate = new Date(event.date);
  const isSoldOut = event.capacity <= 0;
  const isPastEvent = eventDate < new Date();

  return (
    <div className={styles.pageBackground}>
      <Container className={styles.wrapper}>

        <div className="d-block d-lg-none mb-4">
          <h1 className={styles.mobileTitle}>{event.title}</h1>
          <Badge bg="secondary" className={styles.categoryBadge}>
            {event.category?.name || 'General'}
          </Badge>
        </div>

        <Row>
          <Col lg={8} className="mb-4">
            <div className={styles.mainContent}>
              <div className={styles.imageWrapper}>
                <img
                  src={event.image || 'https://via.placeholder.com/800x400?text=Event+Image'}
                  alt={event.title}
                  className={styles.image}
                />
              </div>

              <div className="d-none d-lg-block mt-4">
                <Badge className={styles.categoryBadge}>
                  {event.category?.name || 'General'}
                </Badge>
                <h1 className={styles.title}>{event.title}</h1>
              </div>

              {event.organizer && (
                <div className={styles.organizerBox}>
                  <FaUserTie className={styles.organizerIcon} />
                  <span>Organized by <strong>{event.organizer.name || 'Unknown'}</strong></span>
                </div>
              )}

              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>About this event</h3>
                <p className={styles.description}>{event.description}</p>
              </div>

              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Location</h3>
                <p className={styles.locationText}>
                  <FaMapMarkerAlt className={styles.locationIcon} />
                  {event.location?.address || 'Address not available'}
                </p>

                {Array.isArray(event.location?.coordinates) && event.location.coordinates.length === 2 && (
                  <div className={styles.mapWrapper}>
                    <MapContainer
                      center={[event.location.coordinates[1], event.location.coordinates[0]]}
                      zoom={14}
                      className={styles.map}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <Marker position={[event.location.coordinates[1], event.location.coordinates[0]]} />
                    </MapContainer>
                  </div>
                )}
              </div>
            </div>
          </Col>

          <Col lg={4}>
            <div className={styles.stickySidebar}>
              <div className={styles.ticketCard}>
                <div className={styles.priceHeader}>
                  {event.price === 0 || !event.price ? 'Free' : `${Number(event.price).toFixed(2)} EGP`}
                </div>

                <div className={styles.ticketInfo}>
                  {(regError || successMessage) && (
                    <Alert
                      variant={regError ? 'danger' : 'success'}
                      className="mb-3"
                      style={{ fontSize: '0.9rem' }}
                      onClose={() => dispatch(clearRegistrationMessages())}
                      dismissible
                    >
                      {regError || successMessage}
                    </Alert>
                  )}

                  <div className={styles.infoRow}>
                    <div className={styles.iconBox}><FaCalendarAlt /></div>
                    <div>
                      <strong>Date</strong>
                      <p>{eventDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                  </div>

                  <div className={styles.infoRow}>
                    <div className={styles.iconBox}><FaClock /></div>
                    <div>
                      <strong>Time</strong>
                      <p>{eventDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>

                  <div className={styles.infoRow}>
                    <div className={styles.iconBox}><FaUsers /></div>
                    <div>
                      <strong>Availability</strong>
                      <p className={isSoldOut ? styles.soldOutText : styles.availableText}>
                        {isSoldOut ? 'Sold Out' : `${event.capacity} seats left`}
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  className={isRegistered ? styles.cancelBtn : styles.registerBtn}
                  disabled={(!isRegistered && isSoldOut) || isPastEvent || isRegLoading}
                  onClick={handleRegistrationToggle}
                >
                  {isRegLoading ? (
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                  ) : (
                    <FaTicketAlt className="me-2" />
                  )}
                  {isPastEvent
                    ? 'Event Ended'
                    : isRegistered
                      ? 'Cancel Registration'
                      : isSoldOut
                        ? 'Sold Out'
                        : 'Register Now'}
                </Button>

                {isRegistered && activeQR && (
                  <Button
                    className={styles.qrBtn}
                    onClick={() => setShowQR(true)}
                  >
                    <FaQrcode className="me-2" />
                    Show My Ticket QR
                  </Button>
                )}

              </div>
            </div>
          </Col>
        </Row>
      </Container>

      <QRModal
        show={showQR}
        onHide={() => setShowQR(false)}
        event={event}
        qrCode={activeQR}
      />
    </div>
  );
}