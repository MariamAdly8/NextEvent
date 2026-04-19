import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footerCustom}>
      <Container>
        <Row className="text-center text-lg-start">
          <Col lg={4} md={12} className="mb-4 mb-lg-0">
            <div className={styles.brandSection}>
              <h3>
                NextEvent
              </h3>
              <p className={styles.brandDescription}>
                Your ultimate platform for discovering and managing events. 
                Connecting people through unforgettable experiences.
              </p>
              <div className={`${styles.socialIcons} justify-content-center justify-content-lg-start`}>
                <a className={styles.socialIcon}><FaFacebook /></a>
                <a className={styles.socialIcon}><FaTwitter /></a>
                <a className={styles.socialIcon}><FaInstagram /></a>
                <a className={styles.socialIcon}><FaLinkedin /></a>
              </div>
            </div>
          </Col>

          <Col lg={4} md={6} className="mb-4 mb-md-0 d-flex flex-column align-items-center">
            <div className="w-100 text-center text-lg-start" style={{ maxWidth: '200px' }}>
              <h5 className={styles.footerTitle}>Quick Links</h5>
              <Link to="/" className={styles.footerLink}>Home</Link>
              <Link to="/explore" className={styles.footerLink}>Explore Events</Link>
              <Link to="/calendar" className={styles.footerLink}>Calendar</Link>
            </div>
          </Col>

          <Col lg={4} md={6} className="d-flex flex-column align-items-center">
            <div className="w-100 text-center text-lg-start" style={{ maxWidth: '200px' }}>
              <h5 className={styles.footerTitle}>Support</h5>
              <Link className={styles.footerLink}>Contact Us</Link>
              <Link className={styles.footerLink}>Privacy Policy</Link>
              <Link className={styles.footerLink}>Terms of Service</Link>
            </div>
          </Col>
        </Row>

        <div className={styles.bottomBar}>
          <p>© {new Date().getFullYear()} NextEvent. Designed with ❤️ for a better experience.</p>
        </div>
      </Container>
    </footer>
  );
}