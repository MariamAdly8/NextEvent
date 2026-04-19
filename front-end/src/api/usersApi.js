import axiosInstance from './axiosInstance';

export const getProfile = async () => {
  const { data } = await axiosInstance.get('/users/profile');
  return data;
};

export const updateProfile = async (payload) => {
  const { data } = await axiosInstance.put('/users/update-profile', payload);
  return data;
};

export const changePassword = async (payload) => {
  const { data } = await axiosInstance.put('/users/change-password', payload);
  return data;
};

export const deleteAccount = async () => {
  const { data } = await axiosInstance.delete('/users/delete-account');
  return data;
};

export const getUserById = async (userId) => {
  const { data } = await axiosInstance.get(`/users/${userId}`);
  return data;
};

export const getAllUsers = async (params = {}) => {
  const { data } = await axiosInstance.get('/users/admin/all', { params });
  return data;
};

export const updateUserRole = async (userId, payload) => {
  const { data } = await axiosInstance.put(`/users/admin/${userId}/role`, payload);
  return data;
};

export const deleteUserByAdmin = async (userId) => {
  const { data } = await axiosInstance.delete(`/users/admin/${userId}`);
  return data;
};
