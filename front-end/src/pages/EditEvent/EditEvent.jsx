import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, Button, Col, Container, Form, Row } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';
import { 
  FaHeading, FaAlignLeft, FaCalendarAlt, FaUsers, 
  FaMoneyBillWave, FaImage, FaTags, FaMapMarkerAlt, FaMap 
} from 'react-icons/fa';
import { selectIsAuthenticated, selectUser } from '../../store/slices/authSlice';
import { categoriesApi, eventsApi } from '../../api';
import Loader from '../../components/Loader/Loader';
import styles from '../CreateEvent/CreateEvent.module.css';

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

// دالة عشان تظبط صيغة التاريخ للـ input type="datetime-local"
const formatForInput = (isoString) => {
  if (!isoString) return '';
  const d = new Date(isoString);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

export default function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const currentUser = useSelector(selectUser);

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
  const [currentImage, setCurrentImage] = useState('');
  
  const [categories, setCategories] = useState([]);
  
  const [validated, setValidated] = useState(false);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const selectedPosition = useMemo(() => {
    if (!coordinates) return null;
    return [coordinates.latitude, coordinates.longitude];
  }, [coordinates]);

  // 1. Load Categories and Event Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Load Categories
        const catData = await categoriesApi.getCategories();
        setCategories(catData?.categories ?? []);

        // Load Event Details
        const eventData = await eventsApi.getEventById(id);
        const ev = eventData?.event;

        if (!ev) throw new Error("Event not found");

        // التأكد إن اليوزر الحالي هو صاحب الإيفنت
        const organizerId = typeof ev.organizer === 'object' ? ev.organizer._id : ev.organizer;
        if (organizerId !== currentUser?._id) {
            navigate('/profile');
            return;
        }

        // Fill the form
        setForm({
          title: ev.title || '',
          description: ev.description || '',
          date: formatForInput(ev.date),
          capacity: ev.capacity || 10,
          price: ev.price || 0,
          address: ev.location?.address || '',
          category: ev.category?._id || ev.category || '',
        });

        if (ev.location?.coordinates && ev.location.coordinates.length === 2) {
          setCoordinates({
            longitude: ev.location.coordinates[0],
            latitude: ev.location.coordinates[1]
          });
        }
        
        if (ev.image) setCurrentImage(ev.image);

      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load event data.');
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
        fetchData();
    } else {
        navigate('/login');
    }
  }, [id, isAuthenticated, currentUser, navigate]);

  const updateAddressFromCoordinates = async (latitude, longitude) => {
    try {
      const resp = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
      );
      const data = await resp.json();
      if (data?.display_name) {
        setForm((prev) => ({ ...prev, address: data.display_name }));
      }
    } catch (err){
        console.log(err);
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
      
      // نبعت الصورة بس لو اليوزر رفع صورة جديدة
      if (imageFile) payload.append('image', imageFile);

      await eventsApi.updateEvent(id, payload);
      navigate(`/events/${id}`);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update event.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.pageBackground}>
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
          <Loader text="Loading event details..." />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageBackground}>
      <Container className={styles.wrapper}>
        
        <div className={styles.headerSection}>
          <h1 className={styles.title}>Edit Event</h1>
          <p className={styles.subtitle}>Update the details of your event below.</p>
        </div>

        {error && <Alert variant="danger" className={styles.alertBox}>{error}</Alert>}

        <div className={styles.formCard}>
          {/* ضفنا noValidate و validated هنا */}
          <Form noValidate validated={validated} onSubmit={handleSubmit}>
            
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
                required
              />
              <Form.Control.Feedback type="invalid">
                Please provide a description.
              </Form.Control.Feedback>
            </Form.Group>

            <hr className={styles.divider} />

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
                    <FaImage className={styles.labelIcon} /> Update Cover
                  </Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    className={styles.customInput}
                  />
                  {currentImage && !imageFile && (
                    <div className="mt-2 text-muted" style={{ fontSize: '0.85rem' }}>
                      Leave empty to keep current image
                    </div>
                  )}
                </Form.Group>
              </Col>
            </Row>

            <hr className={styles.divider} />

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
                required
              />
              <Form.Control.Feedback type="invalid">
                Please provide an address or click on the map.
              </Form.Control.Feedback>
            </Form.Group>

            <div className={styles.mapContainerBox}>
              <div className={styles.mapHeader}>
                <FaMap className={styles.mapHeaderIcon} />
                <span>Drag or click to update the event location</span>
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
            </div>

            <div className={styles.submitWrapper}>
              <Button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
              </Button>
            </div>

          </Form>
        </div>
      </Container>
    </div>
  );
}