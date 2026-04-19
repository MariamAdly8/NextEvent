import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Button } from 'react-bootstrap';
import { MdOutlineEventBusy } from 'react-icons/md';
import styles from './NotFound.module.css';

export default function NotFound() {
  return (
    <Container className={styles.notFoundWrapper}>
      <div className={styles.content}>
        <div className={styles.iconWrapper}>
          <MdOutlineEventBusy className={styles.brokenIcon} />
        </div>
        <h1 className={styles.errorCode}>404</h1>
        <h2 className={styles.errorTitle}>Oops! Page Not Found</h2>
        <p className={styles.errorText}>
          The page you are looking for doesn't exist.
          Let's get you back to discovering great experiences.
        </p>
        <Button as={Link} to="/" className={styles.homeBtn}>
          Back to Home
        </Button>
      </div>
    </Container>
  );
}