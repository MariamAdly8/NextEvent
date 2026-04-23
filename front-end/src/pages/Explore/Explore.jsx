import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Alert, Col, Container, Form, Row } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import { FaSearch, FaFilter, FaRegFrownOpen, FaCalendarAlt } from 'react-icons/fa';
import { eventsApi, categoriesApi } from '../../api';
import styles from './Explore.module.css';
import Loader from '../../components/Loader/Loader';
import EventCard from '../../components/EventCard/EventCard';

export default function Explore() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const syncSearchFromUrl = useCallback(() => {
    const urlSearch = searchParams.get('search') || '';
    setSearch(prev => {
      if (urlSearch !== prev) return urlSearch;
      return prev;
    });
  }, [searchParams]);

  useEffect(() => {
    syncSearchFromUrl();
  }, [syncSearchFromUrl]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await categoriesApi.getCategories();
        setCategories(data?.categories ?? []);
      } catch {
        setCategories([]);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, category, dateFilter]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setIsLoading(true);
        setError('');
        const params = { page, limit: 9 };
        if (search.trim()) params.search = search.trim();
        if (category) params.category = category;
        if (dateFilter === 'upcoming') params.dateFrom = new Date().toISOString();
        if (dateFilter === 'past') params.dateTo = new Date().toISOString();
        const data = await eventsApi.getEvents(params);
        setEvents(data?.events ?? []);
        setTotalPages(data?.pagination?.totalPages || 1);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load events.');
      } finally {
        setIsLoading(false);
      }
    };

    const delay = search ? 500 : 0;
    const timer = setTimeout(loadEvents, delay);
    return () => clearTimeout(timer);
  }, [search, category, dateFilter, page]);

  const emptyStateText = useMemo(() => {
    if (search || category || dateFilter !== 'all') return "We couldn't find any events matching your filters.";
    return "No events are available at the moment.";
  }, [search, category, dateFilter]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    if (val) setSearchParams({ search: val });
    else setSearchParams({});
  };

  const handleClear = () => {
    setSearch('');
    setCategory('');
    setDateFilter('all');
    setSearchParams({});
  };

  return (
    <div className={styles.pageBackground}>
      <Container className={styles.wrapper}>

        <div className={styles.header}>
          <h1 className={styles.title}>Explore Events</h1>
          <p className={styles.subtitle}>Discover what's happening and find your next experience.</p>
        </div>

        <div className={styles.filterBar}>
          <Row className="g-3">
            <Col md={6}>
              <div className={styles.inputWrapper}>
                <FaSearch className={styles.inputIcon} />
                <Form.Control
                  className={styles.customInput}
                  value={search}
                  onChange={handleSearchChange}
                  placeholder="Search events by title..."
                />
              </div>
            </Col>
            <Col md={3}>
              <div className={styles.inputWrapper}>
                <FaFilter className={styles.inputIcon} />
                <Form.Select
                  className={styles.customInput}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </Form.Select>
              </div>
            </Col>
            <Col md={3}>
              <div className={styles.inputWrapper}>
                <FaCalendarAlt className={styles.inputIcon} />
                <Form.Select
                  className={styles.customInput}
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                >
                  <option value="all">All Events</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="past">Past</option>
                </Form.Select>
              </div>
            </Col>
          </Row>
        </div>

        {error && <Alert variant="danger" className={styles.alertBox}>{error}</Alert>}

        {isLoading ? (
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '40vh' }}>
            <Loader text="Searching for amazing events..." />
          </div>
        ) : (
          <>
            {!error && events.length === 0 && (
              <div className={styles.emptyState}>
                <FaRegFrownOpen className={styles.emptyIcon} />
                <h3>No Results Found</h3>
                <p>{emptyStateText}</p>
                <button className={styles.clearBtn} onClick={handleClear}>
                  Clear Filters
                </button>
              </div>
            )}

            <Row>
              {events.map((event) => (
                <Col key={event._id} lg={4} md={6} className="mb-4">
                  <EventCard event={event} />
                </Col>
              ))}
            </Row>

            {totalPages > 1 && (
              <div className="d-flex justify-content-center align-items-center mt-5 gap-3">
                <button
                  className={styles.clearBtn}
                  disabled={page === 1}
                  onClick={() => setPage(prev => prev - 1)}
                >
                  Previous
                </button>
                <span style={{ fontWeight: '600', color: '#1e293b' }}>
                  Page {page} of {totalPages}
                </span>
                <button
                  className={styles.clearBtn}
                  disabled={page === totalPages}
                  onClick={() => setPage(prev => prev + 1)}
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