import React from 'react'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectIsAuthenticated, selectUser } from '../store/slices/authSlice'

import NotFound from '../pages/NotFound/NotFound'
import SharedLayout from './SharedLayout'
import Login from '../pages/Login/Login'
import Home from '../pages/Home/Home'
import SignUp from '../pages/SignUp/SignUp'
import EventDetails from '../pages/EventDetails/EventDetails'
import Explore from '../pages/Explore/Explore'
import CreateEvent from '../pages/CreateEvent/CreateEvent'
import Tickets from '../pages/Tickets/Tickets'
import Calendar from '../pages/Calendar/Calendar'
import Profile from '../pages/Profile/Profile'
import ScrollToTop from '../components/ScrollToTop/ScrollToTop'
import EditEvent from '../pages/EditEvent/EditEvent'
import AdminDashboard from '../pages/AdminDashboard/AdminDashboard'

// protected route for authenticated users
function ProtectedRoute({ children }) {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

//protected route for admin-only pages
function AdminRoute({ children }) {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!user || user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

export default function MainLayout() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<SharedLayout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<SignUp />} />
          <Route path="events/:id" element={<EventDetails />} />
          <Route path="explore" element={<Explore />} />
          <Route path="calendar" element={<Calendar />} />

          <Route path="create-event" element={<ProtectedRoute><CreateEvent /></ProtectedRoute>} />
          <Route path="events/:id/edit" element={<ProtectedRoute><EditEvent /></ProtectedRoute>} />
          <Route path="tickets" element={<ProtectedRoute><Tickets /></ProtectedRoute>} />
          <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

          <Route path="admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        </Route>
        <Route path='*' element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}