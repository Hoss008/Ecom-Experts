import { useEffect } from 'react';
import './global.css';
import ProductCard from './components/ProductCard';
import useBundleStore from './store/useBundleStore';

const STORAGE_KEY = 'ecom-experts-bundle';

function App() {
  const loadStatus = useBundleStore((state) => state.loadStatus);
  const loadError = useBundleStore((state) => state.loadError);

  useEffect(() => {
    let isMounted = true;

    async function loadBundle() {
      try {
        const response = await fetch('/api/bundle');
        if (!response.ok) throw new Error(`Request failed with ${response.status}`);

        const bundle = await response.json();
        if (!isMounted) return;

        useBundleStore.getState().initializeBundle(bundle);

        // Only restore if the user explicitly saved previously.
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          if (raw) useBundleStore.getState().rehydrate(JSON.parse(raw));
        } catch {
          // Corrupt data — ignore and start from the API seed state.
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch {
        if (isMounted) {
          useBundleStore.getState().setLoadError('We could not load your security bundle. Please refresh and try again.');
        }
      }
    }

    loadBundle();
    return () => { isMounted = false; };
  }, []); // runs once on mount

  if (loadStatus === 'loading') {
    return <main className="appStatus">Loading your security bundle…</main>;
  }

  if (loadStatus === 'error') {
    return <main className="appStatus" role="alert">{loadError}</main>;
  }

  return (
    <>
      <ProductCard />
    </>
  );
}

export default App;
