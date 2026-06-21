import { create } from 'zustand';
import productsData from '../data/products.json';

// ---------------------------------------------------------------------------
// Key format
//   With variants:    "cam-v4::White", "cam-v4::Black"
//   Without variants: "duo-cam-doorbell"
//   Sensors/Acc:      "sense-motion"
// ---------------------------------------------------------------------------
export function parseCartKey(key) {
  const sep = key.indexOf('::');
  if (sep === -1) return { productId: key, variant: null };
  return { productId: key.slice(0, sep), variant: key.slice(sep + 2) };
}

export function makeCartKey(productId, colorName) {
  return colorName ? `${productId}::${colorName}` : productId;
}

// ---------------------------------------------------------------------------
// Build initial cart — one slot per product+variant combo
// ---------------------------------------------------------------------------
function buildInitialCart(initialState, catalog) {
  const cart = {};

  // Map of seeded cameras { id -> { quantity, color } }
  const seededCameras = new Map(
    initialState.cart.cameras.map((c) => [c.id, c])
  );

  for (const cam of catalog.cameras) {
    if (cam.colors && cam.colors.length > 0) {
      // Create one entry per color variant
      for (const color of cam.colors) {
        const key = makeCartKey(cam.id, color.name);
        const seeded = seededCameras.get(cam.id);
        // Only seed qty on the pre-selected color; all others start at 0
        const qty = seeded && seeded.color === color.name ? seeded.quantity : 0;
        cart[key] = { quantity: qty };
      }
    } else {
      // No variants — bare productId
      const seeded = seededCameras.get(cam.id);
      cart[cam.id] = { quantity: seeded?.quantity ?? 0 };
    }
  }

  // Sensors and accessories (no color variants)
  for (const sensor of initialState.cart.sensors) {
    cart[sensor.id] = { quantity: sensor.quantity };
  }
  for (const acc of initialState.cart.accessories) {
    cart[acc.id] = { quantity: acc.quantity };
  }

  return cart;
}

// ---------------------------------------------------------------------------
// Lookup tables (indexed by bare productId)
// ---------------------------------------------------------------------------
const catalogById = {};
for (const cam of productsData.catalog.cameras) {
  catalogById[cam.id] = cam;
}

const initialCartPricing = {};
for (const sensor of productsData.initialState.cart.sensors) {
  initialCartPricing[sensor.id] = {
    title: sensor.title,
    image: sensor.image,
    unitPrice: sensor.price / sensor.quantity,
    oldUnitPrice: sensor.oldPrice != null ? sensor.oldPrice / sensor.quantity : null,
  };
}
for (const acc of productsData.initialState.cart.accessories) {
  initialCartPricing[acc.id] = {
    title: acc.title,
    image: acc.image,
    unitPrice: acc.price / acc.quantity,
    oldUnitPrice: acc.oldPrice != null ? acc.oldPrice / acc.quantity : null,
  };
}

// ---------------------------------------------------------------------------
// Price / info lookups — accept compound keys like "cam-v4::White"
// ---------------------------------------------------------------------------
export function getUnitPrice(key) {
  const { productId } = parseCartKey(key);
  if (catalogById[productId]) return catalogById[productId].price;
  const extra = initialCartPricing[productId];
  if (extra) return extra.unitPrice;
  return 0;
}

export function getOldUnitPrice(key) {
  const { productId } = parseCartKey(key);
  if (catalogById[productId]) return catalogById[productId].oldPrice ?? null;
  const extra = initialCartPricing[productId];
  if (extra) return extra.oldUnitPrice;
  return null;
}

export function getItemInfo(key) {
  const { productId, variant } = parseCartKey(key);
  const catalogItem = catalogById[productId];
  if (catalogItem) {
    // Append color label in the review panel title
    const title = variant ? `${catalogItem.title} (${variant})` : catalogItem.title;
    return { title, image: catalogItem.image };
  }
  const extra = initialCartPricing[productId];
  if (extra) return { title: extra.title, image: extra.image };
  return { title: key, image: null };
}

// ---------------------------------------------------------------------------
// Category helpers — work with both bare and compound keys
// ---------------------------------------------------------------------------
const cameraIds    = new Set(productsData.catalog.cameras.map((c) => c.id));
const sensorIds    = new Set(productsData.initialState.cart.sensors.map((s) => s.id));
const accessoryIds = new Set(productsData.initialState.cart.accessories.map((a) => a.id));

export function isCamera(key)    { return cameraIds.has(parseCartKey(key).productId); }
export function isSensor(key)    { return sensorIds.has(parseCartKey(key).productId); }
export function isAccessory(key) { return accessoryIds.has(parseCartKey(key).productId); }

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------
const useBundleStore = create((set, get) => ({
  catalog: productsData.catalog,

  // One entry per product+variant: { "cam-v4::White": { quantity: 1 }, ... }
  cartItems: buildInitialCart(productsData.initialState, productsData.catalog),

  plan: { ...productsData.initialState.cart.plan },

  openSteps: [1], // step 1 open by default

  // ── Actions ────────────────────────────────────────────────────────────────

  setQuantity: (key, qty) =>
    set((state) => ({
      cartItems: {
        ...state.cartItems,
        [key]: { ...state.cartItems[key], quantity: Math.max(0, qty) },
      },
    })),

  incrementQty: (key) => {
    const current = get().cartItems[key]?.quantity ?? 0;
    get().setQuantity(key, current + 1);
  },

  decrementQty: (key) => {
    const current = get().cartItems[key]?.quantity ?? 0;
    get().setQuantity(key, current - 1);
  },

  toggleStep: (step) =>
    set((state) => ({
      openSteps: state.openSteps.includes(step)
        ? state.openSteps.filter((s) => s !== step)
        : [...state.openSteps, step],
    })),

  openStep: (step) =>
    set((state) => ({
      openSteps: state.openSteps.includes(step)
        ? state.openSteps
        : [...state.openSteps, step],
    })),

  /** Restore from localStorage — only cart data, not UI state */
  rehydrate: (saved) =>
    set({
      cartItems: saved.cartItems ?? get().cartItems,
      plan:      saved.plan      ?? get().plan,
    }),

  // ── Derived ───────────────────────────────────────────────────────────────

  getCartTotal: () => {
    const { cartItems, plan } = get();
    let total = 0;
    for (const [key, item] of Object.entries(cartItems)) {
      if (item.quantity > 0) total += item.quantity * getUnitPrice(key);
    }
    total += plan.price;
    return total;
  },

  getOldTotal: () => {
    const { cartItems, plan } = get();
    let total = 0;
    for (const [key, item] of Object.entries(cartItems)) {
      if (item.quantity > 0) {
        const oldUnit = getOldUnitPrice(key);
        total += item.quantity * (oldUnit ?? getUnitPrice(key));
      }
    }
    total += plan.oldPrice ?? plan.price;
    return total;
  },

  getSavings: () => get().getOldTotal() - get().getCartTotal(),

  /**
   * Count of DISTINCT camera products with any variant qty > 0.
   * (2 White + 1 Black of the same camera = 1 selected camera)
   */
  getSelectedCameraCount: () => {
    const { cartItems } = get();
    const distinctProducts = new Set();
    for (const [key, item] of Object.entries(cartItems)) {
      if (isCamera(key) && item.quantity > 0) {
        distinctProducts.add(parseCartKey(key).productId);
      }
    }
    return distinctProducts.size;
  },

  getMonthlyPrice: () => get().getCartTotal() / 12,
}));

export default useBundleStore;
