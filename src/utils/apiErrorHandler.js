// utils/apiErrorHandler.js
export const handleApiError = (err, toast) => {
  const message = err.response?.data || err.message || 'Something went wrong';

  if (typeof message === 'string') {
    if (message.includes('pending')) {
      toast.warn('Your request is already pending');
    } else if (message.includes('Full Name') || message.includes('Phone')) {
      toast.error('Please update your Full Name & Phone in Settings first');
    } else if (message.includes('not found')) {
      toast.error('User not found');
    } else {
      toast.error(message);
    }
  } else {
    toast.error('An error occurred');
  }
};