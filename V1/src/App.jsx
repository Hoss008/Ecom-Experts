import { useEffect } from 'react';
import './global.css';
import ProductCard from './components/ProductCard';
import useBundleStore from './store/useBundleStore';

const STORAGE_KEY = 'ecom-experts-bundle';

function App() {
  useEffect(() => {
    // Only restore if the user explicitly saved previously
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        useBundleStore.getState().rehydrate(saved);
      }
    } catch {
      // Corrupt data — ignore and start fresh
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []); // runs once on mount

  return (
    <>
      <ProductCard />
    </>
  );
}

export default App;