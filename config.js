// Use import.meta.env as per Vite's documentation.
// The VITE_API_BASE_URL will be provided by Vercel for preview and production,
// and from the .env.local file for local development.

// A map to associate country codes with currency codes for a more reliable guess
const countryToCurrencyMap = {
    'PK': 'PKR',
    'IN': 'INR',
    'US': 'USD',
    'GB': 'GBP',
    'AE': 'AED',
    'EU': 'EUR',
    // Add more country-to-currency mappings as needed
};

// Function to get the currency symbol based on the currency code.
function getSymbolFromCurrency(code) {
    if (!code) return undefined;
    try {
        const formatter = new Intl.NumberFormat(undefined, {
            style: 'currency',
            currency: code,
            currencyDisplay: 'symbol'
        });
        const parts = formatter.formatToParts(0);
        const currencyPart = parts.find(part => part.type === 'currency');
        return currencyPart ? currencyPart.value : undefined;
    } catch (e) {
        console.error(`Failed to get symbol for currency code: ${code}`, e);
        return undefined;
    }
}

// Function to get the user's preferred currency symbol.
// It prioritizes a saved user preference, then guesses from locale, and finally falls back.
function getCurrencySymbol() {
    // 1. Check for a saved preference in localStorage
    const savedSymbol = localStorage.getItem('currencySymbol');
    if (savedSymbol) {
        return savedSymbol;
    }

    // 2. Try to guess from the browser's locale
    try {
        const locale = navigator.language || undefined;
        // Extract country code from locale (e.g., 'en-PK' -> 'PK')
        const countryCode = locale.split('-')[1]?.toUpperCase();
        const currencyCode = countryToCurrencyMap[countryCode];
        const symbol = getSymbolFromCurrency(currencyCode);
        if (symbol) {
            return symbol;
        }
    } catch (e) {
        console.error('Failed to get currency from locale:', e);
    }
    
    // 3. Fallback to a hardcoded default if all else fails
    return '₨';
}

// Function to save the user's preferred currency symbol to localStorage.
// This should be called from the settings page when the user changes the currency.
export function setCurrencySymbol(symbol) {
    localStorage.setItem('currencySymbol', symbol);
    // You may also want to update the CONFIG object in the app state
    // so the change takes effect immediately without a page reload.
}

export const CONFIG = {
    BASE_API_URL: import.meta.env.VITE_API_BASE_URL || 'https://hmapi.somee.com',
    R2_BASE_URL: 'https://pub-867806bcf0914258bb29ce36f455004f.r2.dev',
    DUMMY_IMAGE_URL: 'https://themindfulaimanifesto.org/wp-content/uploads/2020/09/male-placeholder-image.jpeg',
    currencySymbol: getCurrencySymbol(),
};
