import Compressor from 'compressorjs';
import { request } from './request';
import { API_ENDPOINTS } from './endpoints';
import toast from 'react-hot-toast';

/**
 * Helper to ensure image URL is fully qualified with host if relative
 */
export const getPublicImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  const baseUrl = import.meta.env.VITE_BASE_URL || 'https://api.kingcreativestudio.my.id/biologi-proflic';
  return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
};

/**
 * Compress image using Compressor.js (Max 500KB) and upload to server
 * @param {File} file - Raw input image file
 * @returns {Promise<string>} - Returns the uploaded image URL (full accessible URL)
 */
export const compressAndUploadImage = (file) => {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      toast.error('File yang diunggah harus berupa gambar.');
      return reject(new Error('Invalid image file'));
    }

    new Compressor(file, {
      quality: 0.8,
      maxWidth: 1600,
      maxHeight: 1600,
      convertSize: 500000, // 500KB threshold
      success: async (compressedResult) => {
        try {
          const formData = new FormData();
          const fileName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
          formData.append('file', compressedResult, fileName);

          const res = await request.post(API_ENDPOINTS.UPLOAD, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });

          if (res?.success && res.fileUrl) {
            const sizeKB = (compressedResult.size / 1024).toFixed(1);
            toast.success(`Gambar terkompresi (${sizeKB} KB) & berhasil diunggah!`);
            const fullUrl = getPublicImageUrl(res.fileUrl);
            resolve(fullUrl);
          } else {
            reject(new Error(res?.message || 'Gagal mengunggah gambar'));
          }
        } catch (err) {
          toast.error('Gagal mengunggah gambar ke server.');
          reject(err);
        }
      },
      error: (err) => {
        toast.error('Gagal mengompres gambar: ' + err.message);
        reject(err);
      },
    });
  });
};
