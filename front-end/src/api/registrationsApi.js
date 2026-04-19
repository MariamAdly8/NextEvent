import axiosInstance from './axiosInstance';

export const registerForEvent = async (eventId) => {
  const { data } = await axiosInstance.post(`/registrations/${eventId}/register`);
  return data;
};

export const cancelRegistration = async (eventId) => {
  const { data } = await axiosInstance.delete(`/registrations/${eventId}/cancel`);
  return data;
};

export const getEventAttendees = async (eventId) => {
  const { data } = await axiosInstance.get(`/registrations/${eventId}/attendees`);
  return data;
};
