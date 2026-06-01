import api from './api';

/**
 * @typedef {import('../types/api.types').Sale} Sale
 * @typedef {import('../types/api.types').PaginatedResponse} PaginatedResponse
 */

const saleService = {
  /**
   * Get list of sales
   * @param {Object} params - { customer, payment_method, date_from, date_to, ordering, page }
   * @returns {Promise<PaginatedResponse<Sale>>}
   */
  getSales: async (params) => {
    const response = await api.get('/api/sales/', { params });
    return response.data;
  },

  /**
   * Create a new sale
   * @param {Object} data - { customer, items, discount, payment_method, note }
   * @returns {Promise<Sale>}
   */
  createSale: async (data) => {
    const response = await api.post('/api/sales/', data);
    return response.data;
  },

  /**
   * Get sale detail
   * @param {number} id
   * @returns {Promise<Sale>}
   */
  getSale: async (id) => {
    const response = await api.get(`/api/sales/${id}/`);
    return response.data;
  },

  /**
   * Update sale
   * @param {number} id
   * @param {Object} data
   * @returns {Promise<Sale>}
   */
  updateSale: async (id, data) => {
    const response = await api.patch(`/api/sales/${id}/`, data);
    return response.data;
  },

  /**
   * Delete sale
   * @param {number} id
   */
  deleteSale: async (id) => {
    await api.delete(`/api/sales/${id}/`);
  },

  /**
   * Get overdue sales (debt_due_date < today)
   * @returns {Promise<PaginatedResponse<Sale>>}
   */
  getOverdueSales: async () => {
    const response = await api.get('/api/sales/overdue/');
    return response.data;
  }
};

export default saleService;
