import { api } from "./api";

/**
 * Reusable request helper with error unwrapping and standardized handling
 */
export const request = {
  get: async (url, params = {}) => {
    const res = await api.get(url, { params });
    return res.data;
  },

  post: async (url, data = {}, config = {}) => {
    const res = await api.post(url, data, config);
    return res.data;
  },

  put: async (url, data = {}, config = {}) => {
    const res = await api.put(url, data, config);
    return res.data;
  },

  delete: async (url, config = {}) => {
    const res = await api.delete(url, config);
    return res.data;
  },

  uploadFile: async (url, file, extraData = {}) => {
    const formData = new FormData();
    formData.append("file", file);
    Object.keys(extraData).forEach((key) => {
      formData.append(key, extraData[key]);
    });

    const res = await api.post(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },
};
