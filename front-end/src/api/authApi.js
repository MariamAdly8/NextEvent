import axiosInstance from './axiosInstance';

export const signup = async (payload) => {
  const { data } = await axiosInstance.post('/auth/signup', payload);
  return data;
};

export const login = async (payload) => {
  const { data } = await axiosInstance.post('/auth/login', payload);
  return data;
};

export const refreshAccessToken = async () => {
  const { data } = await axiosInstance.get('/auth/refresh');
  return data;
};

export const logout = async () => {
  const { data } = await axiosInstance.delete('/auth/logout');
  return data;
};
