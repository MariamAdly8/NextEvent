import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, Col, Container, Form, Row } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';
import { 
  FaHeading, FaAlignLeft, FaCalendarAlt, FaUsers, 
  FaMoneyBillWave, FaImage, FaTags, FaMapMarkerAlt, FaMap 
} from 'react-icons/fa';
import { selectIsAuthenticated } from '../../store/slices/authSlice';
import { categoriesApi, eventsApi } from '../../api';
import styles from './CreateEvent.module.css';

const DEFAULT_CENTER = [30.0444, 31.2357];

function LocationPicker({ onPick, currentPosition }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng);
    },
  });

  if (!currentPosition) return null;
  return <Marker position={currentPosition} />;
}

export default function CreateEvent() {
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const [form, setForm] = useState({
    title: '',
    description: '',
    date: '',
    capacity: 10,
    price: 0,
    address: '',
    category: '',
  });
  const [coordinates, setCoordinates] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [categories, setCategories] = useState([]);
  
  // ضفنا الـ state دي عشان نتحكم في الـ validation
  const [validated, setValidated] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const selectedPosition = useMemo(() => {
    if (!coordinates) return null;
    return [coordinates.latitude, coordinates.longitude];
  }, [coordinates]);

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

  const updateAddressFromCoordinates = async (latitude, longitude) => {
    try {
      const resp = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
      );
      const data = await resp.json();
      if (data?.display_name) {
        setForm((prev) => ({ ...prev, address: data.display_name }));
      }
    } catch {
      // Keep manual address input if reverse geocode fails.
    }
  };

  const handleMapPick = (latlng) => {
    const latitude = Number(latlng.lat.toFixed(6));
    const longitude = Number(latlng.lng.toFixed(6));
    setCoordinates({ latitude, longitude });
    updateAddressFromCoordinates(latitude, longitude);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const currentForm = e.currentTarget;
    if (currentForm.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true); 
      const firstInvalidElement = currentForm.querySelector(':invalid');
      if (firstInvalidElement) {
        firstInvalidElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstInvalidElement.focus(); 
      }
      return;
    }
    
    setValidated(true);

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!coordinates) {
      setError('Please pick a location on the map.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      const payload = new FormData();
      payload.append('title', form.title);
      payload.append('description', form.description);
      payload.append('date', new Date(form.date).toISOString());
      payload.append('capacity', String(form.capacity));
      payload.append('price', String(form.price));
      payload.append('address', form.address);
      if (form.category) payload.append('category', form.category);
      payload.append('coordinates', JSON.stringify([coordinates.longitude, coordinates.latitude]));
      if (imageFile) payload.append('image', imageFile);

      const data = await eventsApi.createEvent(payload);
      const eventId = data?.event?._id;
      if (eventId) {
        navigate(`/events/${eventId}`);
        return;
      }
      navigate('/explore');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create event.');
    } finally {
      window.scrollTo({
        top: 0,
        behavior: 'smooth' 
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.pageBackground}>
      <Container className={styles.wrapper}>
        
        <div className={styles.headerSection}>
          <h1 className={styles.title}>Host a New Event</h1>
          <p className={styles.subtitle}>
            Bring people together! Fill in the details below and drop a pin on the map.
          </p>
        </div>

        {error && <Alert variant="danger" className={styles.alertBox}>{error}</Alert>}

        <div className={styles.formCard}>
          {/* ضفنا noValidate و validated هنا */}
          <Form noValidate validated={validated} onSubmit={handleSubmit}>
            
            {/* Section 1: Basic Info */}
            <h4 className={styles.sectionTitle}>1. Basic Information</h4>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-4">
                  <Form.Label className={styles.formLabel}>
                    <FaHeading className={styles.labelIcon} /> Event Title
                  </Form.Label>
                  <Form.Control 
                    name="title" 
                    value={form.title} 
                    onChange={handleChange} 
                    className={styles.customInput}
                    placeholder="e.g., Tech Innovators Meetup"
                    required 
                  />
                  <Form.Control.Feedback type="invalid">
                    Please provide an event title.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-4">
                  <Form.Label className={styles.formLabel}>
                    <FaTags className={styles.labelIcon} /> Category
                  </Form.Label>
                  <Form.Select 
                    name="category" 
                    value={form.category} 
                    onChange={handleChange}
                    className={styles.customInput}
                    required
                  >
                    <option value="">Choose a category...</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    Please select a category.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-4">
              <Form.Label className={styles.formLabel}>
                <FaAlignLeft className={styles.labelIcon} /> Description
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="description"
                value={form.description}
                onChange={handleChange}
                className={styles.customInput}
                placeholder="What is this event about? What should attendees expect?"
                required
              />
              <Form.Control.Feedback type="invalid">
                Please provide a description.
              </Form.Control.Feedback>
            </Form.Group>

            <hr className={styles.divider} />

            {/* Section 2: Details & Media */}
            <h4 className={styles.sectionTitle}>2. Details & Media</h4>
            <Row>
              <Col md={6} lg={3}>
                <Form.Group className="mb-4">
                  <Form.Label className={styles.formLabel}>
                    <FaCalendarAlt className={styles.labelIcon} /> Date & Time
                  </Form.Label>
                  <Form.Control
                    name="date"
                    type="datetime-local"
                    value={form.date}
                    onChange={handleChange}
                    className={styles.customInput}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Please select a valid date.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6} lg={3}>
                <Form.Group className="mb-4">
                  <Form.Label className={styles.formLabel}>
                    <FaUsers className={styles.labelIcon} /> Capacity
                  </Form.Label>
                  <Form.Control
                    name="capacity"
                    type="number"
                    min={1}
                    value={form.capacity}
                    onChange={handleChange}
                    className={styles.customInput}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Capacity must be at least 1.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6} lg={3}>
                <Form.Group className="mb-4">
                  <Form.Label className={styles.formLabel}>
                    <FaMoneyBillWave className={styles.labelIcon} /> Price (EGP)
                  </Form.Label>
                  <Form.Control
                    name="price"
                    type="number"
                    min={0}
                    step="0.01"
                    value={form.price}
                    onChange={handleChange}
                    className={styles.customInput}
                  />
                  <Form.Control.Feedback type="invalid">
                    Price cannot be negative.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6} lg={3}>
                <Form.Group className="mb-4">
                  <Form.Label className={styles.formLabel}>
                    <FaImage className={styles.labelIcon} /> Event Cover
                  </Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    className={styles.customInput}
                  />
                </Form.Group>
              </Col>
            </Row>

            <hr className={styles.divider} />

            {/* Section 3: Location */}
            <h4 className={styles.sectionTitle}>3. Location</h4>
            <Form.Group className="mb-4">
              <Form.Label className={styles.formLabel}>
                <FaMapMarkerAlt className={styles.labelIcon} /> Venue Address
              </Form.Label>
              <Form.Control
                name="address"
                value={form.address}
                onChange={handleChange}
                className={styles.customInput}
                placeholder="Click on the map to auto-fill, or type manually..."
                required
              />
              <Form.Control.Feedback type="invalid">
                Please provide an address or click on the map.
              </Form.Control.Feedback>
            </Form.Group>

            <div className={styles.mapContainerBox}>
              <div className={styles.mapHeader}>
                <FaMap className={styles.mapHeaderIcon} />
                <span>Drop a pin exactly where the event is happening</span>
              </div>
              <div className={styles.mapWrapper}>
                <MapContainer
                  center={selectedPosition || DEFAULT_CENTER}
                  zoom={selectedPosition ? 15 : 12}
                  className={styles.map}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <LocationPicker onPick={handleMapPick} currentPosition={selectedPosition} />
                </MapContainer>
              </div>
              {coordinates && (
                <div className={styles.coordsText}>
                  Coordinates saved: {coordinates.latitude}, {coordinates.longitude}
                </div>
              )}
            </div>

            <div className={styles.submitWrapper}>
              <Button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                {isSubmitting ? 'Publishing Event...' : 'Publish Event'}
              </Button>
            </div>

          </Form>
        </div>
      </Container>
    </div>
  );
}