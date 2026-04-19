import axiosInstance from './axiosInstance';

export const getCategories = async () => {
  const { data } = await axiosInstance.get('/categories');
  return data;
};

export const getCategoryById = async (categoryId) => {
  const { data } = await axiosInstance.get(`/categories/${categoryId}`);
  return data;
};

export const createCategory = async (payload) => {
  const { data } = await axiosInstance.post('/categories', payload);
  return data;
};

export const updateCategory = async (categoryId, payload) => {
  const { data } = await axiosInstance.put(`/categories/${categoryId}`, payload);
  return data;
};

export const deleteCategory = async (categoryId) => {
  const { data } = await axiosInstance.delete(`/categories/${categoryId}`);
  return data;
};
