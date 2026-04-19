import React from 'react';
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt } from 'react-icons/fa';
import styles from './EventCard.module.css';

const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();

const formatPrice = (price) =>
  price === 0 || !price ? 'Free' : `${Number(price).toFixed(2)} EGP`;

// variant: 'default' (Explore) | 'trending' (Home)
export default function EventCard({ event, variant = 'default' }) {
  return (
    <Link to={`/events/${event._id}`} className={styles.cardLink}>
      <article className={`${styles.card} ${variant === 'trending' ? styles.trending : ''}`}>
        
        <div className={styles.imageWrapper}>
          <img
            src={event.image || 'https://via.placeholder.com/500x300'}
            alt={event.title}
            className={styles.image}
          />
          <span className={styles.dateBadge}>{formatDate(event.date)}</span>
        </div>

        <div className={styles.body}>
          <h3 className={styles.title}>{event.title}</h3>
          <p className={styles.description}>{event.description}</p>

          <div className={styles.footer}>
            <div className={styles.location}>
              <FaMapMarkerAlt className={styles.locationIcon} />
              <span>{event.location?.address || 'TBA'}</span>
            </div>

            <div className={styles.bottomRow}>
              <span className={styles.price}>{formatPrice(event.price)}</span>
              {variant === 'default' && (
                <span className={styles.categoryTag}>{event.category?.name || 'General'}</span>
              )}
              {variant === 'trending' && (
                <span className={styles.registrations}>
                  {event.registrationCount ?? 0} registered
                </span>
              )}
            </div>
          </div>
        </div>

      </article>
    </Link>
  );
}