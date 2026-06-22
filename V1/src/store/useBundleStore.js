import { create } from 'zustand';

// ---------------------------------------------------------------------------
// Key format
//   With variants:    "cam-v4::White", "cam-v4::Black"
//   Without variants: "duo-cam-doorbell"
//   Sensors/Acc:      "sense-motion"
// ---------------------------------------------------------------------------
export function parseCartKey(key) {
  const separator = key.indexOf('::');
  if (separator === -1) return { productId: key, variant: null };
  return { productId: key.slice(0, separator), variant: key.slice(separator + 2) };
}

export function makeCartKey(productId, colorName) {
  return colorName ? `${productId}::${colorName}` : productId;
}

function buildInitialCart(initialState, catalog) {
  const cart = {};
  const seededCameras = new Map(initialState.cart.cameras.map((camera) => [camera.id, camera]));

  for (const camera of catalog.cameras) {
    if (camera.colors?.length) {
      for (const color of camera.colors) {
        const key = makeCartKey(camera.id, color.name);
        const seeded = seededCameras.get(camera.id);
        cart[key] = {
          quantity: seeded?.color === color.name ? seeded.quantity : 0,
        };
      }
    } else {
      cart[camera.id] = { quantity: seededCameras.get(camera.id)?.quantity ?? 0 };
    }
  }

  for (const sensor of initialState.cart.sensors) {
    cart[sensor.id] = { quantity: sensor.quantity };
  }
  for (const accessory of initialState.cart.accessories) {
    cart[accessory.id] = { quantity: accessory.quantity };
  }

  return cart;
}

function buildIndexes(bundle) {
  const { catalog, initialState } = bundle;
  const { sensors, accessories } = initialState.cart;
  const catalogById = Object.fromEntries(catalog.cameras.map((camera) => [camera.id, camera]));
  const seededItemById = {};

  for (const item of [...sensors, ...accessories]) {
    seededItemById[item.id] = {
      title: item.title,
      image: item.image,
      unitPrice: item.price / item.quantity,
      oldUnitPrice: item.oldPrice != null ? item.oldPrice / item.quantity : null,
    };
  }

  return {
    catalogById,
    seededItemById,
    cameraIds: new Set(catalog.cameras.map((camera) => camera.id)),
    sensorIds: sensors.map((sensor) => sensor.id),
    sensorIdSet: new Set(sensors.map((sensor) => sensor.id)),
    accessoryIds: accessories.map((accessory) => accessory.id),
    accessoryIdSet: new Set(accessories.map((accessory) => accessory.id)),
  };
}

function getMetadata() {
  return useBundleStore.getState();
}

// ---------------------------------------------------------------------------
// Price / info lookups — accept compound keys like "cam-v4::White"
// ---------------------------------------------------------------------------
export function getUnitPrice(key) {
  const { productId } = parseCartKey(key);
  const { catalogById, seededItemById } = getMetadata();
  return catalogById[productId]?.price ?? seededItemById[productId]?.unitPrice ?? 0;
}

export function getOldUnitPrice(key) {
  const { productId } = parseCartKey(key);
  const { catalogById, seededItemById } = getMetadata();
  return catalogById[productId]?.oldPrice ?? seededItemById[productId]?.oldUnitPrice ?? null;
}

export function getItemInfo(key) {
  const { productId, variant } = parseCartKey(key);
  const { catalogById, seededItemById } = getMetadata();
  const catalogItem = catalogById[productId];

  if (catalogItem) {
    return {
      title: variant ? `${catalogItem.title} (${variant})` : catalogItem.title,
      image: catalogItem.image,
    };
  }

  const seededItem = seededItemById[productId];
  return seededItem ? { title: seededItem.title, image: seededItem.image } : { title: key, image: null };
}

export function isCamera(key) {
  return getMetadata().cameraIds.has(parseCartKey(key).productId);
}

export function isSensor(key) {
  return getMetadata().sensorIdSet.has(parseCartKey(key).productId);
}

export function isAccessory(key) {
  return getMetadata().accessoryIdSet.has(parseCartKey(key).productId);
}

const emptyCatalog = { cameras: [] };

const useBundleStore = create((set, get) => ({
  catalog: emptyCatalog,
  cartItems: {},
  plan: null,
  catalogById: {},
  seededItemById: {},
  cameraIds: new Set(),
  sensorIds: [],
  sensorIdSet: new Set(),
  accessoryIds: [],
  accessoryIdSet: new Set(),
  loadStatus: 'loading',
  loadError: null,
  openSteps: [1],

  initializeBundle: (bundle) => {
    if (!bundle?.catalog?.cameras || !bundle?.initialState?.cart) {
      throw new Error('The bundle API returned an invalid catalog.');
    }

    const indexes = buildIndexes(bundle);
    set({
      catalog: bundle.catalog,
      cartItems: buildInitialCart(bundle.initialState, bundle.catalog),
      plan: { ...bundle.initialState.cart.plan },
      ...indexes,
      loadStatus: 'ready',
      loadError: null,
    });
  },

  setLoadError: (message) => set({ loadStatus: 'error', loadError: message }),

  setQuantity: (key, quantity) =>
    set((state) => ({
      cartItems: {
        ...state.cartItems,
        [key]: { ...state.cartItems[key], quantity: Math.max(0, quantity) },
      },
    })),

  incrementQty: (key) => {
    const quantity = get().cartItems[key]?.quantity ?? 0;
    get().setQuantity(key, quantity + 1);
  },

  decrementQty: (key) => {
    const quantity = get().cartItems[key]?.quantity ?? 0;
    get().setQuantity(key, quantity - 1);
  },

  toggleStep: (step) =>
    set((state) => ({
      openSteps: state.openSteps.includes(step)
        ? state.openSteps.filter((openStep) => openStep !== step)
        : [...state.openSteps, step],
    })),

  openStep: (step) =>
    set((state) => ({
      openSteps: state.openSteps.includes(step) ? state.openSteps : [...state.openSteps, step],
    })),

  /** Restore only saved customer choices after the API establishes the catalog. */
  rehydrate: (saved) =>
    set((state) => ({
      cartItems: saved.cartItems ?? state.cartItems,
      plan: saved.plan ?? state.plan,
    })),

  getCartTotal: () => {
    const { cartItems, plan } = get();
    const itemsTotal = Object.entries(cartItems).reduce(
      (total, [key, item]) => total + item.quantity * getUnitPrice(key),
      0,
    );
    return itemsTotal + (plan?.price ?? 0);
  },

  getOldTotal: () => {
    const { cartItems, plan } = get();
    const itemsTotal = Object.entries(cartItems).reduce((total, [key, item]) => {
      const unitPrice = getUnitPrice(key);
      return total + item.quantity * (getOldUnitPrice(key) ?? unitPrice);
    }, 0);
    return itemsTotal + (plan?.oldPrice ?? plan?.price ?? 0);
  },

  getSavings: () => get().getOldTotal() - get().getCartTotal(),

  getSelectedCameraCount: () => {
    const selectedCameraIds = new Set();
    for (const [key, item] of Object.entries(get().cartItems)) {
      if (isCamera(key) && item.quantity > 0) selectedCameraIds.add(parseCartKey(key).productId);
    }
    return selectedCameraIds.size;
  },

  getMonthlyPrice: () => get().getCartTotal() / 12,
}));

export default useBundleStore;
