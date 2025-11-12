// src/config.js
const DEFAULTS = {
  currency: 'PKR',
  country: 'Pakistan',
  decimalPlaces: 0,
  dateFormat: 'dd/MM/yyyy',
  weightUnit: 'kg',
  milkRatePerLiter: 0
};

function getSymbolFromCurrency(code) {
  try {
    const parts = new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: code,
      currencyDisplay: 'symbol'
    }).formatToParts(0);
    return parts.find(p => p.type === 'currency')?.value || '₨';
  } catch { return '₨'; }
}

function loadSettings() {
  const saved = localStorage.getItem('appSettings');
  if (saved) {
    const parsed = JSON.parse(saved);
    return {
      ...DEFAULTS,
      ...parsed,
      CurrencySymbol: getSymbolFromCurrency(parsed.Currency || DEFAULTS.Currency)
    };
  }
  return { ...DEFAULTS };
}

export function saveSettings(settings) {
  const toSave = {
    currency: settings.currency,
    country: settings.country,
    decimalPlaces: settings.decimalPlaces,
    dateFormat: settings.dateFormat,
    weightUnit: settings.weightUnit,
    milkRatePerLiter: settings.milkRatePerLiter
  };
  localStorage.setItem('appSettings', JSON.stringify(toSave));
  window.dispatchEvent(new Event('settingsUpdated'));
}

export const CONFIG = {
  BASE_API_URL: import.meta.env.VITE_API_BASE_URL || 'https://hmapi.somee.com',
  R2_BASE_URL: 'https://pub-867806bcf0914258bb29ce36f455004f.r2.dev',
  DUMMY_IMAGE_URL: 'https://themindfulaimanifesto.org/wp-content/uploads/2020/09/male-placeholder-image.jpeg',
  ...loadSettings()
};

window.addEventListener('settingsUpdated', () => {
  Object.assign(CONFIG, loadSettings());
});