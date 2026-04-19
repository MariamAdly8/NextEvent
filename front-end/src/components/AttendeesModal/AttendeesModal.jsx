import React, { useEffect, useState } from 'react';
import { Modal, Alert } from 'react-bootstrap';
import { FaUsers, FaEnvelope } from 'react-icons/fa';
import { registrationsApi } from '../../api';
import styles from './AttendeesModal.module.css';

export default function AttendeesModal({ event, onClose }) {
  const [attendees, setAttendees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const data = await registrationsApi.getEventAttendees(event._id);
        setAttendees(data?.registrations ?? []);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load attendees.');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [event._id]);

  return (
    <Modal show onHide={onClose} centered size="md">
      <Modal.Header closeButton className={styles.header}>
        <Modal.Title className={styles.title}>
          <FaUsers /> {event.title} — Attendees
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className={styles.body}>
        {isLoading && <p className={styles.info}>Loading attendees...</p>}
        {error && <Alert variant="danger">{error}</Alert>}
        {!isLoading && !error && attendees.length === 0 && (
          <p className={styles.info}>No attendees yet.</p>
        )}
        {!isLoading && !error && attendees.length > 0 && (
          <ul className={styles.list}>
            {attendees.map((reg) => (
              <li key={reg._id} className={styles.item}>
                <div className={styles.avatar}>
                  {reg.user?.name?.charAt(0).toUpperCase() || '?'}
                </div>
                <div className={styles.info}>
                  <span className={styles.name}>{reg.user?.name || 'Unknown'}</span>
                  <span className={styles.email}>
                    <FaEnvelope /> {reg.user?.email || '—'}
                  </span>
                </div>
                <span className={`${styles.status} ${styles[reg.status]}`}>
                  {reg.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Modal.Body>
    </Modal>
  );
}