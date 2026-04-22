import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Form, Button, Container, Row, Col, Alert } from 'react-bootstrap';
import { FaUser, FaEnvelope, FaLock } from 'react-icons/fa';
import { 
  signupUser, 
  selectAuthStatus, 
  selectAuthError, 
  clearAuthError,
  selectIsAuthenticated
} from '../../store/slices/authSlice';
import Loader from '../../components/Loader/Loader';
import styles from './SignUp.module.css';

export default function SignUp() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const status = useSelector(selectAuthStatus);
  const error = useSelector(selectAuthError);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
    return () => {
      dispatch(clearAuthError());
    };
  }, [isAuthenticated, navigate, dispatch]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) dispatch(clearAuthError());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) return;
    
    try {
      await dispatch(signupUser(formData)).unwrap();
      navigate('/login');
    } catch (err) {
      console.error('Signup failed', err);
    }
  };

  if (status === 'loading') {
    return <Loader fullScreen={true} text="Creating your account..." />;
  }

  return (
    <div className={styles.signupPage}>
      <Container>
        <Row className="justify-content-center">
          <Col md={8} lg={5}>
            <div className={styles.signupCard}>
              <div className={styles.brandHeader}>
                <h2>Join NextEvent</h2>
                <p>Create an account to start your journey</p>
              </div>

              {error && (
                <Alert variant="danger" dismissible onClose={() => dispatch(clearAuthError())}>
                  {error}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-4" controlId="name">
                  <Form.Label className={styles.formLabel}>Full Name</Form.Label>
                  <div className={styles.inputWrapper}>
                    <FaUser className={styles.inputIcon} />
                    <Form.Control
                      type="text"
                      name="name"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleChange}
                      className={styles.customInput}
                      required
                    />
                  </div>
                </Form.Group>

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
                      placeholder="Create a strong password" 
                      value={formData.password}
                      onChange={handleChange}
                      className={styles.customInput}
                      required
                    />
                  </div>
                  <Form.Text className="text-muted d-block mt-2" style={{ fontSize: '12px' }}>
                  Must be at least 8 characters, including uppercase and lowercase letters, a number, and a special symbol (@, #, $).                  </Form.Text>
                </Form.Group>

                <Button 
                  type="submit" 
                  className={styles.signupBtn} 
                  disabled={status === 'loading'}
                >
                  Create Account
                </Button>
              </Form>

              <div className={styles.footerText}>
                Already have an account? <Link to="/login">Login</Link>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}