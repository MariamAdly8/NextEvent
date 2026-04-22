import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert, Container } from 'react-bootstrap';
import { FaRegCalendarAlt, FaRegClock, FaChevronRight } from 'react-icons/fa';
import { eventsApi } from '../../api';
import Loader from '../../components/Loader/Loader'; 
import styles from './Calendar.module.css';

export default function Calendar() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        setError('');
        const data = await eventsApi.getEvents({ page, limit: 10 });
        setEvents(data?.events ?? []);
        setTotalPages(data?.pagination?.totalPages || 1);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load calendar events.');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [page]);

  const grouped = useMemo(() => {
    const groups = events.reduce((acc, item) => {
      const key = new Date(item.date).toDateString();
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});

    Object.keys(groups).forEach(day => {
      groups[day].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    });

    return groups;
  }, [events]);

  const sortedDays = Object.keys(grouped).sort((a, b) => new Date(a) - new Date(b));

  const formatDayHeader = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  useEffect(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [page]);
  return (
    <div className={styles.pageBackground}>
      <Container className={styles.wrapper}>
        <div className={styles.headerSection}>
          <h1 className={styles.title}>Events Calendar</h1>
          <p className={styles.subtitle}>Plan your days with our upcoming events schedule.</p>
        </div>

        {error && <Alert variant="danger" className={styles.alertBox}>{error}</Alert>}

        {isLoading ? (
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '40vh' }}>
            <Loader text="Loading your schedule..." />
          </div>
        ) : (
          <>
            {!error && sortedDays.length === 0 && (
              <div className={styles.emptyState}>
                <FaRegCalendarAlt className={styles.emptyIcon} />
                <h3>Your calendar is clear</h3>
                <p className={styles.infoText}>There are no upcoming events scheduled at the moment.</p>
                <Link to="/explore" className={styles.exploreBtn}>Explore Events</Link>
              </div>
            )}

            <div className={styles.timeline}>
              {sortedDays.map((day) => (
                <section key={day} className={styles.daySection}>
                  <div className={styles.dateHeader}>
                    <FaRegCalendarAlt className={styles.dateIcon} />
                    <h2>{formatDayHeader(day)}</h2>
                  </div>
                  
                  <div className={styles.eventsList}>
                    {grouped[day].map((event) => (
                      <Link key={event._id} to={`/events/${event._id}`} className={styles.eventCard}>
                        <div className={styles.eventTime}>
                          <FaRegClock />
                          <span>
                            {new Date(event.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        
                        <div className={styles.eventDetails}>
                          <h3 className={styles.eventTitle}>{event.title}</h3>
                        </div>
                        <div className={styles.arrowWrapper}>
                          <FaChevronRight className={styles.arrowIcon} />
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="d-flex justify-content-center align-items-center mt-5 gap-3">
                <button 
                  className={styles.pageBtn} 
                  disabled={page === 1} 
                  onClick={() => { setPage(prev => prev - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                >
                  Previous
                </button>
                
                <span style={{ fontWeight: '600', color: '#1e293b' }}>
                  Page {page} of {totalPages}
                </span>

                <button 
                  className={styles.pageBtn} 
                  disabled={page === totalPages} 
                  onClick={() => { setPage(prev => prev + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </Container>
    </div>
  );
}