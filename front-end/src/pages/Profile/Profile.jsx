import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Alert, Badge, Col, Container, Form, Modal, Row } from 'react-bootstrap';
import {
  FaEnvelope, FaLock, FaTrash, FaEdit, FaCalendarAlt,
  FaMapMarkerAlt, FaSave, FaTimes, FaShieldAlt, FaUsers
} from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { clearAuth, selectUser } from '../../store/slices/authSlice';
import { fetchProfile, updateProfileInfo, changeUserPassword } from '../../store/slices/userSlice';
import { eventsApi } from '../../api';
import { usersApi } from '../../api';
import Loader from '../../components/Loader/Loader';
import AttendeesModal from '../../components/AttendeesModal/AttendeesModal';
import styles from './Profile.module.css';

export default function Profile() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const currentUser = useSelector(selectUser);
  const isAdmin = currentUser?.role === 'admin';

  const profile = useSelector((state) => state.users.profile);
  const organizedEvents = useSelector((state) => state.users.organizedEvents);
  const isLoading = useSelector((state) => state.users.isLoading);
  const storeError = useSelector((state) => state.users.error);

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Edit Profile
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  // Change Password
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Delete Account
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [deleteAccountLoading, setDeleteAccountLoading] = useState(false);

  // Delete Event
  const [showDeleteEventModal, setShowDeleteEventModal] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [deleteEventLoading, setDeleteEventLoading] = useState(false);
  const [localOrganizedEvents, setLocalOrganizedEvents] = useState([]);

  // Attendees
  const [showAttendeesModal, setShowAttendeesModal] = useState(false);
  const [selectedEventForAttendees, setSelectedEventForAttendees] = useState(null);

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  useEffect(() => {
    if (organizedEvents) {
      setLocalOrganizedEvents(organizedEvents);
    }
  }, [organizedEvents]);

  useEffect(() => {
    if (profile?.name) {
      setEditName(profile.name);
    }
  }, [profile]);

  useEffect(() => {
    if (storeError) setError(storeError);
  }, [storeError]);

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) return;
    try {
      setEditLoading(true);
      setEditError('');
      await dispatch(updateProfileInfo({ name: editName.trim() })).unwrap();
      setEditMode(false);
      showSuccess('Profile updated successfully!');
    } catch (err) {
      setEditError(err || 'Failed to update profile.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword) return;
    try {
      setPasswordLoading(true);
      setPasswordError('');
      await dispatch(changeUserPassword({ oldPassword, newPassword })).unwrap();
      setShowPasswordModal(false);
      setOldPassword('');
      setNewPassword('');
      showSuccess('Password changed successfully!');
    } catch (err) {
      setPasswordError(err || 'Failed to change password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  // Delete Account 
  const handleDeleteAccount = async () => {
    try {
      setDeleteAccountLoading(true);
      await usersApi.deleteAccount();
      dispatch(clearAuth());
      setShowDeleteAccountModal(false);
      navigate('/login');
    } catch (err) {
      setShowDeleteAccountModal(false);
      setError(err?.response?.data?.message || 'Failed to delete account.');
    } finally {
      setDeleteAccountLoading(false);
    }
  };

  const confirmDeleteEvent = (event) => {
    setEventToDelete(event);
    setShowDeleteEventModal(true);
  };

  const handleDeleteEvent = async () => {
    if (!eventToDelete) return;
    try {
      setDeleteEventLoading(true);
      await eventsApi.deleteEvent(eventToDelete._id);
      setLocalOrganizedEvents(prev => prev.filter(e => e._id !== eventToDelete._id));
      setShowDeleteEventModal(false);
      setEventToDelete(null);
      showSuccess('Event deleted successfully!');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete event.');
    } finally {
      setDeleteEventLoading(false);
    }
  };

  if (isLoading && !profile) {
    return (
      <div className={styles.pageBackground}>
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
          <Loader text="Loading your profile..." />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageBackground}>
      <Container className={styles.wrapper}>

        {error && <Alert variant="danger" className={styles.alertBox} onClose={() => setError('')} dismissible>{error}</Alert>}
        {successMsg && <Alert variant="success" className={styles.alertBox}>{successMsg}</Alert>}

        {profile && (
          <>
            <div className={styles.profileCard}>
              <div className={styles.avatarCircle}>
                {profile.name?.charAt(0).toUpperCase()}
              </div>

              {editMode ? (
                <div className={styles.editNameWrapper}>
                  <Form.Control
                    className={styles.editNameInput}
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Your name"
                  />
                  {editError && <p className={styles.inlineError}>{editError}</p>}
                  <div className={styles.editActions}>
                    <button className={styles.saveBtn} onClick={handleSaveProfile} disabled={editLoading}>
                      <FaSave /> {editLoading ? 'Saving...' : 'Save'}
                    </button>
                    <button className={styles.cancelBtn} onClick={() => { setEditMode(false); setEditName(profile.name); setEditError(''); }}>
                      <FaTimes /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className={styles.profileInfo}>
                  <h2 className={styles.profileName}>{profile.name}</h2>
                  <p className={styles.profileEmail}><FaEnvelope className={styles.infoIcon} />{profile.email}</p>
                  <Badge className={styles.roleBadge} bg={profile.role === 'admin' ? 'danger' : 'primary'}>
                    {profile.role}
                  </Badge>
                </div>
              )}

              {!editMode && (
                <div className={styles.profileActions}>
                  <button className={styles.editBtn} onClick={() => setEditMode(true)}>
                    <FaEdit /> Edit Name
                  </button>
                  <button className={styles.passwordBtn} onClick={() => setShowPasswordModal(true)}>
                    <FaLock /> Change Password
                  </button>
                  {isAdmin && (
                    <button className={styles.adminBtn} onClick={() => navigate('/admin')}>
                      <FaShieldAlt /> Admin Dashboard
                    </button>
                  )}
                  <button className={styles.deleteAccountBtn} onClick={() => setShowDeleteAccountModal(true)}>
                    <FaTrash /> Delete Account
                  </button>
                </div>
              )}
            </div>

            {/* ── Organized Events ── */}
            <div className={styles.eventsSection}>
              <h3 className={styles.sectionTitle}>
                <FaCalendarAlt className={styles.sectionIcon} />
                My Organized Events
                <span className={styles.eventCount}>{localOrganizedEvents.length}</span>
              </h3>

              {localOrganizedEvents.length === 0 ? (
                <div className={styles.emptyEvents}>
                  <FaCalendarAlt className={styles.emptyIcon} />
                  <p>You haven't organized any events yet.</p>
                  <button className={styles.createEventBtn} onClick={() => navigate('/create-event')}>
                    Create Your First Event
                  </button>
                </div>
              ) : (
                <Row>
                  {localOrganizedEvents.map((event) => (
                    <Col md={6} key={event._id} className="mb-4">
                      <div className={styles.eventCard}>
                        <Link to={`/events/${event._id}`}>
                          {event.image && (
                            <img src={event.image} alt={event.title} className={styles.eventImage} />
                          )}
                        </Link>
                        <div className={styles.eventBody}>
                          <Link to={`/events/${event._id}`} className={styles.eventTitleLink}>
                            <h4 className={styles.eventTitle}>{event.title}</h4>
                          </Link>
                          <p className={styles.eventMeta}>
                            <FaCalendarAlt className={styles.metaIcon} />
                            {new Date(event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </p>
                          <p className={styles.eventMeta}>
                            <FaMapMarkerAlt className={styles.metaIcon} />
                            {event.location?.address || 'TBA'}
                          </p>
                          <div className={styles.eventCardActions}>
                            <button className={styles.attendeesBtn} onClick={() => { setSelectedEventForAttendees(event); setShowAttendeesModal(true); }}>
                              <FaUsers /> Attendees
                            </button>
                            <button className={styles.editEventBtn} onClick={() => navigate(`/events/${event._id}/edit`)}>
                              <FaEdit /> Edit
                            </button>
                            <button className={styles.deleteEventBtn} onClick={() => confirmDeleteEvent(event)}>
                              <FaTrash /> Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </Col>
                  ))}
                </Row>
              )}
            </div>
          </>
        )}
      </Container>

      {/* ── Change Password Modal ── */}
      <Modal show={showPasswordModal} onHide={() => { setShowPasswordModal(false); setPasswordError(''); }} centered>
        <Modal.Header closeButton className={styles.modalHeader}>
          <Modal.Title className={styles.modalTitle}><FaLock /> Change Password</Modal.Title>
        </Modal.Header>
        <Modal.Body className={styles.modalBody}>
          {passwordError && <Alert variant="danger">{passwordError}</Alert>}
          <Form.Group className="mb-3">
            <Form.Label className={styles.formLabel}>Current Password</Form.Label>
            <Form.Control type="password" className={styles.customInput} value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} placeholder="Enter current password" />
          </Form.Group>
          <Form.Group>
            <Form.Label className={styles.formLabel}>New Password</Form.Label>
            <Form.Control type="password" className={styles.customInput} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password" />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className={styles.modalFooter}>
          <button className={styles.cancelBtn} onClick={() => setShowPasswordModal(false)}>Cancel</button>
          <button className={styles.saveBtn} onClick={handleChangePassword} disabled={passwordLoading || !oldPassword || !newPassword}>
            {passwordLoading ? 'Saving...' : 'Save Password'}
          </button>
        </Modal.Footer>
      </Modal>

      {/* ── Delete Account Modal ── */}
      <Modal show={showDeleteAccountModal} onHide={() => setShowDeleteAccountModal(false)} centered>
        <Modal.Header closeButton className={styles.modalHeader}>
          <Modal.Title className={styles.modalTitle}><FaTrash /> Delete Account</Modal.Title>
        </Modal.Header>
        <Modal.Body className={styles.modalBody}>
          <p className={styles.confirmText}>Are you sure you want to <strong>permanently delete</strong> your account? This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer className={styles.modalFooter}>
          <button className={styles.cancelBtn} onClick={() => setShowDeleteAccountModal(false)}>Cancel</button>
          <button className={styles.deleteConfirmBtn} onClick={handleDeleteAccount} disabled={deleteAccountLoading}>
            {deleteAccountLoading ? 'Deleting...' : 'Yes, Delete My Account'}
          </button>
        </Modal.Footer>
      </Modal>

      {/* ── Delete Event Modal ── */}
      <Modal show={showDeleteEventModal} onHide={() => setShowDeleteEventModal(false)} centered>
        <Modal.Header closeButton className={styles.modalHeader}>
          <Modal.Title className={styles.modalTitle}><FaTrash /> Delete Event</Modal.Title>
        </Modal.Header>
        <Modal.Body className={styles.modalBody}>
          <p className={styles.confirmText}>
            Are you sure you want to delete <strong>"{eventToDelete?.title}"</strong>? This action cannot be undone.
          </p>
        </Modal.Body>
        <Modal.Footer className={styles.modalFooter}>
          <button className={styles.cancelBtn} onClick={() => setShowDeleteEventModal(false)}>Cancel</button>
          <button className={styles.deleteConfirmBtn} onClick={handleDeleteEvent} disabled={deleteEventLoading}>
            {deleteEventLoading ? 'Deleting...' : 'Yes, Delete Event'}
          </button>
        </Modal.Footer>
      </Modal>

      {/* ── Attendees Modal ── */}
      {showAttendeesModal && selectedEventForAttendees && (
        <AttendeesModal
          event={selectedEventForAttendees}
          onClose={() => { setShowAttendeesModal(false); setSelectedEventForAttendees(null); }}
        />
      )}
    </div>
  );
}