import { useEffect, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';

export function useFormPersistence<T extends Record<string, any>>(
  key: string,
  methods: UseFormReturn<T>,
  excludeFields: (keyof T)[] = []
) {
  const [hasRestored, setHasRestored] = useState(false);
  const [savedDataExists, setSavedDataExists] = useState(false);

  // Check on mount if saved data exists
  useEffect(() => {
    const saved = localStorage.getItem(key);
    if (saved) {
      setSavedDataExists(true);
    }
  }, [key]);

  // Save data continuously as it changes, but debounce it slightly
  useEffect(() => {
    if (!hasRestored) return; // Don't save before restoring or deciding not to restore

    const subscription = methods.watch((value) => {
      const dataToSave = { ...value } as Record<string, any>;
      
      // Remove excluded fields
      excludeFields.forEach(field => {
        delete dataToSave[field as string];
      });

      // Simple debounce
      const handler = setTimeout(() => {
        localStorage.setItem(key, JSON.stringify(dataToSave));
      }, 500);
      
      return () => clearTimeout(handler);
    });

    return () => subscription.unsubscribe();
  }, [key, methods, excludeFields, hasRestored]);

  const restoreData = () => {
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        Object.keys(parsed).forEach(field => {
          methods.setValue(field as any, parsed[field], { shouldValidate: true });
        });
      } catch (e) {
        console.error('Failed to restore form data', e);
      }
    }
    setHasRestored(true);
    setSavedDataExists(false);
  };

  const clearSavedData = () => {
    localStorage.removeItem(key);
    setHasRestored(true);
    setSavedDataExists(false);
  };

  return {
    savedDataExists,
    restoreData,
    clearSavedData,
    hasRestored
  };
}
