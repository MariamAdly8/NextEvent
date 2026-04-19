import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Badge, Col, Container, Form, Modal, Row, Tab, Tabs } from 'react-bootstrap';
import {
  FaUsers, FaCalendarAlt, FaTags, FaTrash, FaEdit,
  FaShieldAlt, FaSearch, FaPlus, FaChevronLeft, FaChevronRight, FaEye
} from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { selectUser } from '../../store/slices/authSlice';
import { usersApi, eventsApi, categoriesApi } from '../../api';
import Loader from '../../components/Loader/Loader';
import AttendeesModal from '../../components/AttendeesModal/AttendeesModal';
import styles from './AdminDashboard.module.css';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const currentUser = useSelector(selectUser);

  const [activeTab, setActiveTab] = useState('users');

  // ── Users State ──
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState('');
  const [usersPage, setUsersPage] = useState(1);
  const [usersTotalPages, setUsersTotalPages] = useState(1);
  const [usersSearch, setUsersSearch] = useState('');
  const [showDeleteUserModal, setShowDeleteUserModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleteUserLoading, setDeleteUserLoading] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [userToChangeRole, setUserToChangeRole] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [roleLoading, setRoleLoading] = useState(false);

  // ── Events State ──
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsError, setEventsError] = useState('');
  const [eventsPage, setEventsPage] = useState(1);
  const [eventsTotalPages, setEventsTotalPages] = useState(1);
  const [eventsSearch, setEventsSearch] = useState('');
  const [showDeleteEventModal, setShowDeleteEventModal] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [deleteEventLoading, setDeleteEventLoading] = useState(false);
  const [showAttendeesModal, setShowAttendeesModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // ── Categories State ──
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState('');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '' });
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [showDeleteCategoryModal, setShowDeleteCategoryModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  // ── Success message ──
  const [successMsg, setSuccessMsg] = useState('');
  const showSuccess = (msg) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(''), 3000); };

  // ── Load Users ──
  useEffect(() => {
    if (activeTab !== 'users') return;
    const load = async () => {
      try {
        setUsersLoading(true);
        setUsersError('');
        const data = await usersApi.getAllUsers({ page: usersPage, limit: 10, search: usersSearch || undefined });
        setUsers(data?.users ?? []);
        setUsersTotalPages(data?.pagination?.totalPages || 1);
      } catch (err) {
        setUsersError(err?.response?.data?.message || 'Failed to load users.');
      } finally {
        setUsersLoading(false);
      }
    };
    const timer = setTimeout(load, usersSearch ? 500 : 0);
    return () => clearTimeout(timer);
  }, [activeTab, usersPage, usersSearch]);

  // ── Load Events ──
  useEffect(() => {
    if (activeTab !== 'events') return;
    const load = async () => {
      try {
        setEventsLoading(true);
        setEventsError('');
        const data = await eventsApi.getEvents({ page: eventsPage, limit: 10, search: eventsSearch || undefined });
        setEvents(data?.events ?? []);
        setEventsTotalPages(data?.pagination?.totalPages || 1);
      } catch (err) {
        setEventsError(err?.response?.data?.message || 'Failed to load events.');
      } finally {
        setEventsLoading(false);
      }
    };
    const timer = setTimeout(load, eventsSearch ? 500 : 0);
    return () => clearTimeout(timer);
  }, [activeTab, eventsPage, eventsSearch]);

  // ── Load Categories ──
  useEffect(() => {
    if (activeTab !== 'categories') return;
    const load = async () => {
      try {
        setCategoriesLoading(true);
        setCategoriesError('');
        const data = await categoriesApi.getCategories();
        setCategories(data?.categories ?? []);
      } catch (err) {
        setCategoriesError(err?.response?.data?.message || 'Failed to load categories.');
      } finally {
        setCategoriesLoading(false);
      }
    };
    load();
  }, [activeTab]);

  // ── Users Actions ──
  const handleDeleteUser = async () => {
    try {
      setDeleteUserLoading(true);
      await usersApi.deleteUserByAdmin(userToDelete._id);
      setUsers(prev => prev.filter(u => u._id !== userToDelete._id));
      setShowDeleteUserModal(false);
      showSuccess('User deleted successfully!');
    } catch (err) {
      setUsersError(err?.response?.data?.message || 'Failed to delete user.');
    } finally {
      setDeleteUserLoading(false);
    }
  };

  const handleChangeRole = async () => {
    try {
      setRoleLoading(true);
      await usersApi.updateUserRole(userToChangeRole._id, { role: newRole });
      setUsers(prev => prev.map(u => u._id === userToChangeRole._id ? { ...u, role: newRole } : u));
      setShowRoleModal(false);
      showSuccess('Role updated successfully!');
    } catch (err) {
      setUsersError(err?.response?.data?.message || 'Failed to update role.');
    } finally {
      setRoleLoading(false);
    }
  };

  // ── Events Actions ──
  const handleDeleteEvent = async () => {
    try {
      setDeleteEventLoading(true);
      await eventsApi.deleteEvent(eventToDelete._id);
      setEvents(prev => prev.filter(e => e._id !== eventToDelete._id));
      setShowDeleteEventModal(false);
      showSuccess('Event deleted successfully!');
    } catch (err) {
      setEventsError(err?.response?.data?.message || 'Failed to delete event.');
    } finally {
      setDeleteEventLoading(false);
    }
  };

  // ── Categories Actions ──
  const handleSaveCategory = async () => {
    if (!categoryForm.name.trim()) return;
    try {
      setCategoryLoading(true);
      if (editingCategory) {
        await categoriesApi.updateCategory(editingCategory._id, categoryForm);
        setCategories(prev => prev.map(c => c._id === editingCategory._id ? { ...c, ...categoryForm } : c));
        showSuccess('Category updated successfully!');
      } else {
        const data = await categoriesApi.createCategory(categoryForm);
        setCategories(prev => [...prev, data?.category ?? { ...categoryForm, _id: Date.now() }]);
        showSuccess('Category created successfully!');
      }
      setShowCategoryModal(false);
      setCategoryForm({ name: '', description: '' });
      setEditingCategory(null);
    } catch (err) {
      setCategoriesError(err?.response?.data?.message || 'Failed to save category.');
    } finally {
      setCategoryLoading(false);
    }
  };

  const handleDeleteCategory = async () => {
    try {
      setCategoryLoading(true);
      await categoriesApi.deleteCategory(categoryToDelete._id);
      setCategories(prev => prev.filter(c => c._id !== categoryToDelete._id));
      setShowDeleteCategoryModal(false);
      showSuccess('Category deleted successfully!');
    } catch (err) {
      setCategoriesError(err?.response?.data?.message || 'Failed to delete category.');
    } finally {
      setCategoryLoading(false);
    }
  };

  return (
    <div className={styles.pageBackground}>
      <Container className={styles.wrapper}>

        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <FaShieldAlt className={styles.headerIcon} />
            <div>
              <h1 className={styles.title}>Admin Dashboard</h1>
              <p className={styles.subtitle}>Manage users, events, and categories</p>
            </div>
          </div>
          <button className={styles.backBtn} onClick={() => navigate('/profile')}>
            Back to Profile
          </button>
        </div>

        {successMsg && <Alert variant="success" className={styles.alertBox}>{successMsg}</Alert>}

        <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className={styles.tabs}>

          {/* ══════════════ USERS TAB ══════════════ */}
          <Tab eventKey="users" title={<span><FaUsers className="me-2" />Users</span>}>
            <div className={styles.tabContent}>
              <div className={styles.tableHeader}>
                <div className={styles.searchBox}>
                  <FaSearch className={styles.searchIcon} />
                  <input
                    className={styles.searchInput}
                    placeholder="Search users..."
                    value={usersSearch}
                    onChange={(e) => { setUsersSearch(e.target.value); setUsersPage(1); }}
                  />
                </div>
              </div>

              {usersError && <Alert variant="danger">{usersError}</Alert>}
              {usersLoading ? <div className="text-center py-5"><Loader text="Loading users..." /></div> : (
                <>
                  <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Role</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map(user => (
                          <tr key={user._id} className={user._id === currentUser?._id ? styles.currentUserRow : ''}>
                            <td className={styles.nameCell}>
                              <div className={styles.miniAvatar}>{user.name?.charAt(0).toUpperCase()}</div>
                              {user.name}
                              {user._id === currentUser?._id && <span className={styles.youBadge}>You</span>}
                            </td>
                            <td>{user.email}</td>
                            <td>
                              <Badge bg={user.role === 'admin' ? 'danger' : 'primary'} className={styles.roleBadge}>
                                {user.role}
                              </Badge>
                            </td>
                            <td>
                              <div className={styles.actionBtns}>
                                {user._id !== currentUser?._id && (
                                  <>
                                    <button className={styles.roleBtn} onClick={() => { setUserToChangeRole(user); setNewRole(user.role); setShowRoleModal(true); }}>
                                      <FaEdit /> Role
                                    </button>
                                    <button className={styles.deleteBtn} onClick={() => { setUserToDelete(user); setShowDeleteUserModal(true); }}>
                                      <FaTrash />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <Pagination page={usersPage} totalPages={usersTotalPages} onPageChange={setUsersPage} />
                </>
              )}
            </div>
          </Tab>

          {/* ══════════════ EVENTS TAB ══════════════ */}
          <Tab eventKey="events" title={<span><FaCalendarAlt className="me-2" />Events</span>}>
            <div className={styles.tabContent}>
              <div className={styles.tableHeader}>
                <div className={styles.searchBox}>
                  <FaSearch className={styles.searchIcon} />
                  <input
                    className={styles.searchInput}
                    placeholder="Search events..."
                    value={eventsSearch}
                    onChange={(e) => { setEventsSearch(e.target.value); setEventsPage(1); }}
                  />
                </div>
              </div>

              {eventsError && <Alert variant="danger">{eventsError}</Alert>}
              {eventsLoading ? <div className="text-center py-5"><Loader text="Loading events..." /></div> : (
                <>
                  <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>Title</th>
                          <th>Organizer</th>
                          <th>Date</th>
                          <th>Category</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {events.map(event => (
                          <tr key={event._id}>
                            <td className={styles.nameCell}>
                              {event.image && <img src={event.image} alt="" className={styles.eventThumb} />}
                              {event.title}
                            </td>
                            <td>{event.organizer?.name || '—'}</td>
                            <td>{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                            <td>{event.category?.name || '—'}</td>
                            <td>
                              <div className={styles.actionBtns}>
                                <button className={styles.viewBtn} onClick={() => navigate(`/events/${event._id}`)}>
                                  <FaEye />
                                </button>
                                <button className={styles.roleBtn} onClick={() => { setSelectedEvent(event); setShowAttendeesModal(true); }}>
                                  <FaUsers />
                                </button>
                                <button className={styles.deleteBtn} onClick={() => { setEventToDelete(event); setShowDeleteEventModal(true); }}>
                                  <FaTrash />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <Pagination page={eventsPage} totalPages={eventsTotalPages} onPageChange={setEventsPage} />
                </>
              )}
            </div>
          </Tab>

          {/* ══════════════ CATEGORIES TAB ══════════════ */}
          <Tab eventKey="categories" title={<span><FaTags className="me-2" />Categories</span>}>
            <div className={styles.tabContent}>
              <div className={styles.tableHeader}>
                <button className={styles.addBtn} onClick={() => { setCategoryForm({ name: '', description: '' }); setEditingCategory(null); setShowCategoryModal(true); }}>
                  <FaPlus /> Add Category
                </button>
              </div>

              {categoriesError && <Alert variant="danger">{categoriesError}</Alert>}
              {categoriesLoading ? <div className="text-center py-5"><Loader text="Loading categories..." /></div> : (
                <div className={styles.tableWrapper}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map(cat => (
                        <tr key={cat._id}>
                          <td className={styles.nameCell}>{cat.name}</td>
                          <td>
                            <div className={styles.actionBtns}>
                              <button className={styles.roleBtn} onClick={() => { setEditingCategory(cat); setCategoryForm({ name: cat.name, description: cat.description || '' }); setShowCategoryModal(true); }}>
                                <FaEdit /> Edit
                              </button>
                              <button className={styles.deleteBtn} onClick={() => { setCategoryToDelete(cat); setShowDeleteCategoryModal(true); }}>
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </Tab>

        </Tabs>
      </Container>

      {/* ── Delete User Modal ── */}
      <ConfirmModal
        show={showDeleteUserModal}
        onHide={() => setShowDeleteUserModal(false)}
        onConfirm={handleDeleteUser}
        loading={deleteUserLoading}
        title="Delete User"
        message={<>Are you sure you want to delete <strong>{userToDelete?.name}</strong>? This cannot be undone.</>}
      />

      {/* ── Change Role Modal ── */}
      <Modal show={showRoleModal} onHide={() => setShowRoleModal(false)} centered>
        <Modal.Header closeButton className={styles.modalHeader}>
          <Modal.Title className={styles.modalTitle}><FaEdit /> Change Role</Modal.Title>
        </Modal.Header>
        <Modal.Body className={styles.modalBody}>
          <p className={styles.confirmText}>Change role for <strong>{userToChangeRole?.name}</strong>:</p>
          <Form.Select className={styles.customInput} value={newRole} onChange={(e) => setNewRole(e.target.value)}>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </Form.Select>
        </Modal.Body>
        <Modal.Footer className={styles.modalFooter}>
          <button className={styles.cancelBtn} onClick={() => setShowRoleModal(false)}>Cancel</button>
          <button className={styles.saveBtn} onClick={handleChangeRole} disabled={roleLoading}>
            {roleLoading ? 'Saving...' : 'Save'}
          </button>
        </Modal.Footer>
      </Modal>

      {/* ── Delete Event Modal ── */}
      <ConfirmModal
        show={showDeleteEventModal}
        onHide={() => setShowDeleteEventModal(false)}
        onConfirm={handleDeleteEvent}
        loading={deleteEventLoading}
        title="Delete Event"
        message={<>Are you sure you want to delete <strong>"{eventToDelete?.title}"</strong>? This cannot be undone.</>}
      />

      {/* ── Category Modal ── */}
      <Modal show={showCategoryModal} onHide={() => setShowCategoryModal(false)} centered>
        <Modal.Header closeButton className={styles.modalHeader}>
          <Modal.Title className={styles.modalTitle}>
            {editingCategory ? <><FaEdit /> Edit Category</> : <><FaPlus /> Add Category</>}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className={styles.modalBody}>
          <Form.Group className="mb-3">
            <Form.Label className={styles.formLabel}>Name</Form.Label>
            <Form.Control className={styles.customInput} value={categoryForm.name} onChange={(e) => setCategoryForm(p => ({ ...p, name: e.target.value }))} placeholder="Category name" />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className={styles.modalFooter}>
          <button className={styles.cancelBtn} onClick={() => setShowCategoryModal(false)}>Cancel</button>
          <button className={styles.saveBtn} onClick={handleSaveCategory} disabled={categoryLoading || !categoryForm.name.trim()}>
            {categoryLoading ? 'Saving...' : editingCategory ? 'Save Changes' : 'Create'}
          </button>
        </Modal.Footer>
      </Modal>

      {/* ── Delete Category Modal ── */}
      <ConfirmModal
        show={showDeleteCategoryModal}
        onHide={() => setShowDeleteCategoryModal(false)}
        onConfirm={handleDeleteCategory}
        loading={categoryLoading}
        title="Delete Category"
        message={<>Are you sure you want to delete <strong>"{categoryToDelete?.name}"</strong>?</>}
      />

      {/* ── Attendees Modal ── */}
      {showAttendeesModal && selectedEvent && (
        <AttendeesModal event={selectedEvent} onClose={() => { setShowAttendeesModal(false); setSelectedEvent(null); }} />
      )}
    </div>
  );
}

// ── Reusable components ──
function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  return (
    <div className={styles.pagination}>
      <button className={styles.pageBtn} disabled={page === 1} onClick={() => onPageChange(p => p - 1)}>
        <FaChevronLeft />
      </button>
      <span className={styles.pageInfo}>Page {page} of {totalPages}</span>
      <button className={styles.pageBtn} disabled={page === totalPages} onClick={() => onPageChange(p => p + 1)}>
        <FaChevronRight />
      </button>
    </div>
  );
}

function ConfirmModal({ show, onHide, onConfirm, loading, title, message }) {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton style={{ borderBottom: '1px solid #f1f5f9', padding: '20px 24px' }}>
        <Modal.Title style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 10 }}>
          <FaTrash style={{ color: '#d32f2f' }} /> {title}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ padding: '24px' }}>
        <p style={{ color: '#475569', fontSize: '1rem', lineHeight: 1.6 }}>{message}</p>
      </Modal.Body>
      <Modal.Footer style={{ borderTop: '1px solid #f1f5f9', padding: '16px 24px', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button onClick={onHide} style={{ display: 'flex', alignItems: 'center', gap: 8, backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 22px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}>
          Cancel
        </button>
        <button onClick={onConfirm} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: 8, backgroundColor: '#d32f2f', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 22px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', opacity: loading ? 0.6 : 1 }}>
          {loading ? 'Deleting...' : 'Yes, Delete'}
        </button>
      </Modal.Footer>
    </Modal>
  );
}