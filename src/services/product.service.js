import api from './api';

/**
 * @typedef {import('../types/api.types').Product} Product
 * @typedef {import('../types/api.types').ProductList} ProductList
 * @typedef {import('../types/api.types').Category} Category
 * @typedef {import('../types/api.types').PaginatedResponse} PaginatedResponse
 */

const productService = {
  /**
   * Get list of products
   * @param {Object} params - { search, category, unit, ordering, page }
   * @returns {Promise<PaginatedResponse<ProductList>>}
   */
  getProducts: async (params) => {
    const response = await api.get('/api/products/', { params });
    return response.data;
  },

  /**
   * Create a new product
   * @param {FormData | Object} data
   * @returns {Promise<Product>}
   */
  createProduct: async (data) => {
    const headers = data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {};
    const response = await api.post('/api/products/', data, { headers });
    return response.data;
  },

  /**
   * Get product detail
   * @param {number} id
   * @returns {Promise<Product>}
   */
  getProduct: async (id) => {
    const response = await api.get(`/api/products/${id}/`);
    return response.data;
  },

  /**
   * Update product
   * @param {number} id
   * @param {FormData | Object} data
   * @returns {Promise<Product>}
   */
  updateProduct: async (id, data) => {
    const headers = data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {};
    const response = await api.patch(`/api/products/${id}/`, data, { headers });
    return response.data;
  },

  /**
   * Delete product
   * @param {number} id
   */
  deleteProduct: async (id) => {
    await api.delete(`/api/products/${id}/`);
  },

  /**
   * Get categories
   * @param {Object} params - { search, page }
   * @returns {Promise<PaginatedResponse<Category>>}
   */
  getCategories: async (params) => {
    const response = await api.get('/api/products/categories/', { params });
    return response.data;
  },

  /**
   * Create category
   * @param {Object} data - { name }
   * @returns {Promise<Category>}
   */
  createCategory: async (data) => {
    const response = await api.post('/api/products/categories/', data);
    return response.data;
  },

  /**
   * Update category
   * @param {number} id
   * @param {Object} data - { name }
   * @returns {Promise<Category>}
   */
  updateCategory: async (id, data) => {
    const response = await api.patch(`/api/products/categories/${id}/`, data);
    return response.data;
  },

  /**
   * Delete category
   * @param {number} id
   */
  deleteCategory: async (id) => {
    await api.delete(`/api/products/categories/${id}/`);
  },

  /**
   * Get products for sale (quantity > 0)
   * @returns {Promise<Product[]>}
   */
  getProductsForSale: async (params = {}) => {
    const response = await api.get('/api/products/', { params });
    return response.data;
  },

  /**
   * Get low stock products
   * @returns {Promise<Product[]>}
   */
  getLowStockProducts: async () => {
    const response = await api.get('/api/products/low_stock/');
    return response.data;
  }
};

export default productService;
