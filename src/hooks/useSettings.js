// src/hooks/useSettings.js
import { useState, useEffect } from 'react';
import { CONFIG, saveSettings } from '../../config';
import { getSettings, updateSettings } from '../services/api';

// Get symbol from currency code
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

// src/hooks/useSettings.js
export function useSettings() {
  const [settings, setSettings] = useState({
    currency: 'PKR',
    country: 'Pakistan',
    decimalPlaces: 0,
    dateFormat: 'dd/MM/yyyy',
    weightUnit: 'kg',
    milkRatePerLiter: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSettings()
      .then(res => {
        console.log('API SETTINGS:', res.data);
        const data = res.data;
        const merged = {
          currency: data.currency || 'PKR',
          country: data.country || 'Pakistan',
          decimalPlaces: data.decimalPlaces ?? 0,
          dateFormat: data.dateFormat || 'dd/MM/yyyy',
          weightUnit: data.weightUnit || 'kg',
          milkRatePerLiter: data.milkRatePerLiter || 0
        };
        merged.CurrencySymbol = getSymbolFromCurrency(merged.currency);
        setSettings(merged);
        saveSettings(merged);
      })
      .catch(err => {
        console.error('Failed to load settings:', err);
        setSettings({
          currency: 'PKR', country: 'Pakistan', decimalPlaces: 0,
          dateFormat: 'dd/MM/yyyy', weightUnit: 'kg', milkRatePerLiter: 0
        });
      })
      .finally(() => setLoading(false));
  }, []);

  // localStorage sync
  useEffect(() => {
    const handler = () => {
      const saved = localStorage.getItem('appSettings');
      if (saved) {
        const parsed = JSON.parse(saved);
        const updated = { ...settings, ...parsed };
        updated.CurrencySymbol = getSymbolFromCurrency(updated.currency);
        setSettings(updated);
      }
    };
    window.addEventListener('settingsUpdated', handler);
    return () => window.removeEventListener('settingsUpdated', handler);
  }, []);

  const update = async (updates) => {
    setLoading(true);
    try {
      const response = await updateSettings(updates);
      const newSettings = {
        ...settings,
        ...response.data,
        CurrencySymbol: getSymbolFromCurrency(response.data.currency || settings.currency)
      };
      setSettings(newSettings);
      saveSettings(newSettings);
      window.dispatchEvent(new Event('settingsUpdated'));
      return newSettings;
    } catch (err) {
      console.error('Update failed:', err);
      toast.error('Failed to save settings');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { settings, update, loading };
}