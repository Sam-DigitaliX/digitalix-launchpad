/// <reference types="vite/client" />

interface Window {
  dataLayer: Record<string, unknown>[];
  Didomi?: {
    preferences: {
      show: () => void;
    };
  };
}
