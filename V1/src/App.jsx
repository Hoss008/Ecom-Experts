import { useEffect } from 'react';
import './global.css';
import BundleBuilder from './components/BundleBuilder/BundleBuilder';
import useBundleStore from './store/useBundleStore';

const STORAGE_KEY = 'ecom-experts-bundle';

function App() {
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        useBundleStore.getState().rehydrate(saved);
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  return <BundleBuilder />;
}

export default App;