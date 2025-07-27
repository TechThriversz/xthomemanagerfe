// src/config.js
export const CONFIG = {
  BASE_API_URL: process.env.NODE_ENV === 'development' ? 'http://localhost:7266' : 'https://your-backend-api-url', // Update for production
  R2_BASE_URL: 'https://pub-867806bcf0914258bb29ce36f455004f.r2.dev', // Your R2 bucket URL
  DUMMY_IMAGE_URL: 'https://themindfulaimanifesto.org/wp-content/uploads/2020/09/male-placeholder-image.jpeg', // Fallback image
};
