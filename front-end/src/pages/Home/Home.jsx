import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Container, Row, Col } from 'react-bootstrap';
import { FaCalendarAlt, FaTicketAlt, FaUsers } from 'react-icons/fa';
import { selectIsAuthenticated } from '../../store/slices/authSlice';
import { eventsApi } from '../../api';
import EventCard from '../../components/EventCard/EventCard';
import styles from './Home.module.css';
import Loader from '../../components/Loader/Loader';

export default function Home() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [topEvents, setTopEvents] = useState([]);
  const [isTopEventsLoading, setIsTopEventsLoading] = useState(true);
  const [topEventsError, setTopEventsError] = useState('');

  useEffect(() => {
    const loadTopEvents = async () => {
      try {
        setIsTopEventsLoading(true);
        setTopEventsError('');
        const data = await eventsApi.getTopRegisteredEvents();
        setTopEvents(data?.events ?? []);
      } catch (error) {
        setTopEventsError(error?.response?.data?.message || 'Failed to load top events.');
      } finally {
        setIsTopEventsLoading(false);
      }
    };
    loadTopEvents();
  }, []);

  return (
    <div className={styles.homeWrapper}>

      {/* ── Hero Section ── */}
      <section className={styles.heroSection}>
        <Container>
          <Row className="align-items-center min-vh-75">
            <Col lg={6} className="text-center text-lg-start mb-5 mb-lg-0 z-index-1">
              <h1 className={styles.heroTitle}>
                Discover & Create <br />
                <span className={styles.highlight}>Unforgettable</span><br/> Events
              </h1>
              <div className={styles.heroButtons}>
                <Link to="/explore" className={styles.primaryBtn}>Explore Events</Link>
                {isAuthenticated ? (
                  <Link to="/create-event" className={styles.secondaryBtn}>Create Event</Link>
                ) : (
                  <Link to="/signup" className={styles.secondaryBtn}>Join Now</Link>
                )}
              </div>
            </Col>

            <Col lg={6} className="d-none d-lg-flex justify-content-center position-relative">
              <div className={styles.heroArt}>
                <div className={styles.circleLarge}></div>
                <div className={styles.circleSmall}></div>
                <div className={styles.glassCard1}>
                  <FaCalendarAlt className={styles.artIcon} />
                  <span>Plan</span>
                </div>
                <div className={styles.glassCard2}>
                  <FaTicketAlt className={styles.artIcon} />
                  <span>Book</span>
                </div>
                <div className={styles.glassCard3}>
                  <FaUsers className={styles.artIcon} />
                  <span>Connect</span>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* ── Trending Events Section ── */}
      <section className={styles.topEventsSection}>
        <Container>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Trending Events</h2>
            <div className={styles.titleUnderline}></div>
          </div>

          {isTopEventsLoading && (
            <div className="d-flex justify-content-center py-5">
              <Loader text="Loading trending events..." />
            </div>
          )}    
          {!isTopEventsLoading && topEventsError && <p className={styles.sectionError}>{topEventsError}</p>}
          {!isTopEventsLoading && !topEventsError && topEvents.length === 0 && (
            <p className={styles.sectionInfo}>No events available yet.</p>
          )}

          {!isTopEventsLoading && !topEventsError && topEvents.length > 0 && (
            <Row>
              {topEvents.map((event) => (
                <Col key={event._id} lg={4} md={6} className="mb-4">
                  <EventCard event={event} variant="trending" />
                </Col>
              ))}
            </Row>
          )}
        </Container>
      </section>

    </div>
  );
}