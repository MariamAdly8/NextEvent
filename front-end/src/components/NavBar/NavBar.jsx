import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectIsAuthenticated, logoutUser } from '../../store/slices/authSlice';

import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Dropdown from 'react-bootstrap/Dropdown';
import { FaSearch, FaPlusCircle } from 'react-icons/fa';
import { HiOutlineUserCircle } from "react-icons/hi2";
import styles from './NavBar.module.css';

const ProfileDropdown = ({ iconSize, onLogout, onClose }) => (
  <Dropdown align="end">
    <Dropdown.Toggle as="div" className={styles.profileWrapper} bsPrefix="p-0">
      <HiOutlineUserCircle size={iconSize} strokeWidth={1.5} />
    </Dropdown.Toggle>
    <Dropdown.Menu className={styles.dropdownMenuCustom}>
      <Dropdown.Item as={Link} to="/profile" onClick={onClose}>
        My Profile
      </Dropdown.Item>
      <Dropdown.Divider />
      <Dropdown.Item onClick={onLogout} className="text-danger fw-bold">
        Logout
      </Dropdown.Item>
    </Dropdown.Menu>
  </Dropdown>
);

function SearchBox({ onSearch, className }) {
  const [value, setValue] = useState('');

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && value.trim()) {
      onSearch(value.trim());
      setValue('');
    }
  };

  return (
    <div className={`${styles.searchWrapper} ${className || ''}`}>
      <FaSearch className={styles.searchIcon} />
      <Form.Control
        type="search"
        placeholder="Search events..."
        className={styles.searchInput}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
}

export default function NavBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const isAuthenticated = useSelector(selectIsAuthenticated);

  const [expanded, setExpanded] = useState(false);
  const navRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setExpanded(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const closeMenu = () => setExpanded(false);

  const handleLogout = () => {
    dispatch(logoutUser());
    closeMenu();
    navigate('/login');
  };

  const handleSearch = (query) => {
    closeMenu();
    navigate(`/explore?search=${encodeURIComponent(query)}`);
  };

  return (
    <Navbar expand="lg" className={styles.navbarCustom} expanded={expanded} ref={navRef}>
      <Container fluid className="px-4">

        <Navbar.Brand as={Link} to="/" className={styles.brandLogo} onClick={closeMenu}>
          NextEvent
        </Navbar.Brand>

        <div className="d-none d-sm-flex d-lg-none align-items-center gap-2 ms-auto me-2">
          {isAuthenticated ? (
            <>
              <Button as={Link} to="/create-event" onClick={closeMenu} className={styles.actionBtn} style={{ padding: '6px 12px' }}>
                <FaPlusCircle />
                <span style={{ whiteSpace: 'nowrap' }}>Create Event</span>
              </Button>
              <ProfileDropdown iconSize={32} onLogout={handleLogout} onClose={closeMenu} />
            </>
          ) : (
            <>
              <Button as={Link} to="/login" variant="outline-light" className="fw-bold px-2 px-md-3">Login</Button>
              <Button as={Link} to="/signup" className={styles.actionBtn} style={{ padding: '6px 12px' }}>Sign Up</Button>
            </>
          )}
        </div>

        <Navbar.Toggle
          aria-controls="basic-navbar-nav"
          onClick={() => setExpanded(expanded ? false : "expanded")}
          className={`${styles.customToggler} ${expanded ? styles.activeStroke : ''} ${!expanded ? 'ms-auto ms-sm-1' : 'ms-1'}`}
        />

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mx-auto text-center text-lg-start mt-3 mt-lg-0">
            <Nav.Link as={Link} to="/" onClick={closeMenu} className={`${styles.navLink} ${location.pathname === '/' ? styles.activeLink : ''}`}>
              Home
            </Nav.Link>
            <Nav.Link as={Link} to="/explore" onClick={closeMenu} className={`${styles.navLink} ${location.pathname === '/explore' ? styles.activeLink : ''}`}>
              Explore Events
            </Nav.Link>
            {isAuthenticated && (
              <Nav.Link as={Link} to="/tickets" onClick={closeMenu} className={`${styles.navLink} ${location.pathname === '/tickets' ? styles.activeLink : ''}`}>
                My Tickets
              </Nav.Link>
            )}
            <Nav.Link as={Link} to="/calendar" onClick={closeMenu} className={`${styles.navLink} ${location.pathname === '/calendar' ? styles.activeLink : ''}`}>
              Calendar
            </Nav.Link>
          </Nav>

          <div className="d-flex flex-column flex-lg-row align-items-center gap-3 mt-3 mt-lg-0 pb-3 pb-lg-0">

            <SearchBox onSearch={handleSearch} />

            <div className="d-none d-lg-flex align-items-center gap-3">
              {isAuthenticated ? (
                <>
                  <Button as={Link} to="/create-event" onClick={closeMenu} className={styles.actionBtn}>
                    <FaPlusCircle />
                    <span style={{ whiteSpace: 'nowrap' }}>Create Event</span>
                  </Button>
                  <ProfileDropdown iconSize={35} onLogout={handleLogout} onClose={closeMenu} />
                </>
              ) : (
                <>
                  <Button as={Link} to="/login" variant="outline-light" className="fw-bold">Login</Button>
                  <Button as={Link} to="/signup" className={styles.actionBtn}>Sign Up</Button>
                </>
              )}
            </div>

            <div className="d-flex d-sm-none flex-row justify-content-center align-items-center gap-3 mt-2">
              {isAuthenticated ? (
                <>
                  <Button as={Link} to="/create-event" onClick={closeMenu} className={styles.actionBtn}>
                    <FaPlusCircle />
                    <span style={{ whiteSpace: 'nowrap' }}>Create Event</span>
                  </Button>
                  <ProfileDropdown iconSize={35} onLogout={handleLogout} onClose={closeMenu} />
                </>
              ) : (
                <>
                  <Button as={Link} to="/login" onClick={closeMenu} variant="outline-light" className="fw-bold">Login</Button>
                  <Button as={Link} to="/signup" onClick={closeMenu} className={styles.actionBtn}>Sign Up</Button>
                </>
              )}
            </div>

          </div>
        </Navbar.Collapse>

      </Container>
    </Navbar>
  );
}