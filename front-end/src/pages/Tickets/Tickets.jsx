import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Alert, Badge, Col, Container, Row } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { FaRegFrownOpen } from 'react-icons/fa';
import { selectIsAuthenticated } from '../../store/slices/authSlice';
import { usersApi } from '../../api';
import Loader from '../../components/Loader/Loader';
import EventCard from '../../components/EventCard/EventCard';
import styles from './Tickets.module.css';

const getBadgeVariant = (status) => {
  switch (status?.toLowerCase()) {
    case 'confirmed':
    case 'registered': return 'success';
    case 'cancelled':  return 'danger';
    case 'pending':    return 'warning';
    default:           return 'secondary';
  }
};

export default function Tickets() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadTickets = async () => {
      try {
        setIsLoading(true);
        setError('');
        const data = await usersApi.getProfile();
        const tickets = data?.registeredEvents ?? data?.user?.registeredEvents ?? [];
        setRegisteredEvents(tickets);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load tickets.');
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) loadTickets();
  }, [isAuthenticated]);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <div className={styles.pageBackground}>
      <Container className={styles.wrapper}>

        <div className={styles.header}>
          <h1 className={styles.title}>My Tickets</h1>
          <p className={styles.subtitle}>Manage your upcoming and past event registrations.</p>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        {isLoading ? (
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '40vh' }}>
            <Loader text="Loading your tickets..." />
          </div>
        ) : (
          <>
            {!error && registeredEvents.length === 0 && (
              <div className={styles.emptyState}>
                <FaRegFrownOpen className={styles.emptyIcon} />
                <h3>No Tickets Found</h3>
                <p>You haven't registered for any events yet.</p>
                <Link to="/explore" className={styles.exploreBtn}>
                  Explore Events
                </Link>
              </div>
            )}

            <Row>
              {registeredEvents.map((registration) => {
                const event = registration.event;
                if (!event || !event._id) return null;

                return (
                  <Col key={registration._id} lg={4} md={6} className="mb-4">
                    {/* ✅ wrapper عشان نضيف الـ status badge فوق الـ EventCard */}
                    <div className={styles.ticketWrapper}>
                      <Badge
                        bg={getBadgeVariant(registration.status)}
                        className={styles.statusBadge}
                      >
                        {registration.status || 'Unknown'}
                      </Badge>
                      <EventCard event={event} variant="default" />
                    </div>
                  </Col>
                );
              })}
            </Row>
          </>
        )}
      </Container>
    </div>
  );
}