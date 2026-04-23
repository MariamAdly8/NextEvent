import React from 'react';
import { Modal } from 'react-bootstrap';
import { FaTicketAlt, FaDownload } from 'react-icons/fa';
import styles from './QRModal.module.css';

export default function QRModal({ show, onHide, event, qrCode }) {
  if (!qrCode) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = qrCode;
    link.download = `ticket-${event?.title || 'event'}.png`;
    link.click();
  };

  return (
    <Modal show={show} onHide={onHide} centered size="sm">
      <Modal.Header closeButton className={styles.header}>
        <Modal.Title className={styles.title}>
          <FaTicketAlt className={styles.titleIcon} />
          Your Ticket
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className={styles.body}>
        <p className={styles.eventName}>{event?.title}</p>

        <div className={styles.qrWrapper}>
          <img src={qrCode} alt="QR Code" className={styles.qrImage} />
        </div>

        <p className={styles.hint}>Show this QR code at the event entrance</p>

        <button className={styles.downloadBtn} onClick={handleDownload}>
          <FaDownload /> Download Ticket
        </button>
      </Modal.Body>
    </Modal>
  );
}