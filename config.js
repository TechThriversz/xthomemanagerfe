// src/config.js
// Use import.meta.env as per Vite's documentation.
// The VITE_API_BASE_URL will be provided by Vercel for preview and production,
// and from the .env.local file for local development.

// Helper to get currency symbol by country code
function getCurrencySymbol() {
    // Map country codes to currency symbols
    const countryCurrencyMap = {
        'PK': '₨', // Pakistan Rupee
        'IN': '₹', // Indian Rupee
        'US': '$', // US Dollar
        'GB': '£', // British Pound
        'EU': '€', // Euro
        'AE': 'د.إ', // UAE Dirham
        // ...add more as needed
    };

    // Try to get country code from browser
    let countryCode = undefined;
    if (typeof navigator !== 'undefined' && navigator.language) {
        // e.g., "en-US", "en-PK"
        const locale = navigator.language || '';
        countryCode = locale.split('-')[1];
    }

    // Default to PKR if not found
    return countryCurrencyMap[countryCode] || '₨';
}

export const CONFIG = {
    // This will fall back to the local URL if VITE_API_BASE_URL is not set.
    // This ensures that your local dev environment always works without needing
    // to set an environment variable on your machine.
    BASE_API_URL: import.meta.env.VITE_API_BASE_URL || 'https://hmapi.somee.com',
    R2_BASE_URL: 'https://pub-867806bcf0914258bb29ce36f455004f.r2.dev',
    DUMMY_IMAGE_URL: 'https://themindfulaimanifesto.org/wp-content/uploads/2020/09/male-placeholder-image.jpeg',
    currencySymbol: getCurrencySymbol(),
};
