import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Form, Button, Container, Row, Col, Alert } from 'react-bootstrap';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import { 
  loginUser, 
  selectAuthStatus, 
  selectAuthError, 
  clearAuthError,
  selectIsAuthenticated
} from '../../store/slices/authSlice';
import styles from './Login.module.css';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const status = useSelector(selectAuthStatus);
  const error = useSelector(selectAuthError);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  useEffect(() => {
    if (isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) dispatch(clearAuthError());
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) return;
    dispatch(loginUser(formData));
  };

  return (
    <div className={styles.loginPage}>
      <Container>
        <Row className="justify-content-center">
          <Col md={8} lg={5}>
            <div className={styles.loginCard}>
              <div className={styles.brandHeader}>
                <h2>Welcome Back</h2>
                <p>Login to your NextEvent account</p>
              </div>

              {error && (
                <Alert variant="danger" dismissible onClose={() => dispatch(clearAuthError())}>
                  {error}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-4" controlId="email">
                  <Form.Label className={styles.formLabel}>Email Address</Form.Label>
                  <div className={styles.inputWrapper}>
                    <FaEnvelope className={styles.inputIcon} />
                    <Form.Control
                      type="email"
                      name="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                      className={styles.customInput}
                      required
                    />
                  </div>
                </Form.Group>

                <Form.Group className="mb-4" controlId="password">
                  <Form.Label className={styles.formLabel}>Password</Form.Label>
                  <div className={styles.inputWrapper}>
                    <FaLock className={styles.inputIcon} />
                    <Form.Control
                      type="password"
                      name="password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                      className={styles.customInput}
                      required
                    />
                  </div>
                </Form.Group>

                <Button
                  type="submit"
                  className={styles.loginBtn}
                  disabled={status === 'loading'}
                >
                  {status === 'loading' ? (
                    <span className="d-flex align-items-center justify-content-center gap-2">
                      <span className="spinner-border spinner-border-sm" role="status" />
                      Logging in...
                    </span>
                  ) : 'Login'}
                </Button>
              </Form>

              <div className={styles.footerText}>
                Don't have an account? <Link to="/signup">Sign up</Link>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}