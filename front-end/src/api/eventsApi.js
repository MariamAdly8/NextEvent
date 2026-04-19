import axiosInstance from './axiosInstance';

export const getEvents = async (params = {}) => {
  const { data } = await axiosInstance.get('/events', { params });
  return data;
};

export const getEventById = async (eventId) => {
  const { data } = await axiosInstance.get(`/events/${eventId}`);
  return data;
};

export const getTopRegisteredEvents = async () => {
  const { data } = await axiosInstance.get('/events/top-registered');
  return data;
};

export const createEvent = async (formData) => {
  const { data } = await axiosInstance.post('/events', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const updateEvent = async (eventId, formData) => {
  const { data } = await axiosInstance.put(`/events/${eventId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const deleteEvent = async (eventId) => {
  const { data } = await axiosInstance.delete(`/events/${eventId}`);
  return data;
};
