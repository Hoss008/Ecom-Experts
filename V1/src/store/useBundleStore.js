import { create } from 'zustand';
import productsData from '../data/products.json';

// ---------------------------------------------------------------------------
// Helpers: build initial cartItems map from the JSON initialState
// ---------------------------------------------------------------------------
function buildInitialCart(initialState) {
  const cart = {};

  // Cameras — store quantity + selected color
  for (const cam of initialState.cart.cameras) {
    cart[cam.id] = { quantity: cam.quantity, color: cam.color ?? null };
  }

  // Sensors
  for (const sensor of initialState.cart.sensors) {
    cart[sensor.id] = { quantity: sensor.quantity };
  }

  // Accessories
  for (const acc of initialState.cart.accessories) {
    cart[acc.id] = { quantity: acc.quantity };
  }

  return cart;
}

// ---------------------------------------------------------------------------
// Helpers: price lookups
// ---------------------------------------------------------------------------

// All catalog items in a flat array for easy lookup
const allCatalogItems = [
  ...productsData.catalog.cameras,
  // Add sensors, accessories catalogs here when they exist in the JSON
];

// Quick lookup map: id → catalog item
const catalogById = {};
for (const item of allCatalogItems) {
  catalogById[item.id] = item;
}

// For sensor/accessory items that only exist in initialState (no catalog entry),
// we store their pricing info separately
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

/**
 * Look up the unit price for a given product id.
 */
export function getUnitPrice(id) {
  const catalogItem = catalogById[id];
  if (catalogItem) return catalogItem.price;
  const extra = initialCartPricing[id];
  if (extra) return extra.unitPrice;
  return 0;
}

/**
 * Look up the old (strikethrough) unit price for a given product id.
 */
export function getOldUnitPrice(id) {
  const catalogItem = catalogById[id];
  if (catalogItem) return catalogItem.oldPrice ?? null;
  const extra = initialCartPricing[id];
  if (extra) return extra.oldUnitPrice;
  return null;
}

/**
 * Get display info (title, image) for a given product id.
 */
export function getItemInfo(id) {
  const catalogItem = catalogById[id];
  if (catalogItem) {
    return { title: catalogItem.title, image: catalogItem.image };
  }
  const extra = initialCartPricing[id];
  if (extra) {
    return { title: extra.title, image: extra.image };
  }
  return { title: id, image: null };
}

// ---------------------------------------------------------------------------
// Category helpers — which IDs are cameras / sensors / accessories
// ---------------------------------------------------------------------------
const cameraIds = new Set(productsData.catalog.cameras.map((c) => c.id));
const sensorIds = new Set(productsData.initialState.cart.sensors.map((s) => s.id));
const accessoryIds = new Set(productsData.initialState.cart.accessories.map((a) => a.id));

export function isCamera(id) { return cameraIds.has(id); }
export function isSensor(id) { return sensorIds.has(id); }
export function isAccessory(id) { return accessoryIds.has(id); }

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------
const useBundleStore = create((set, get) => ({
  // ── Catalog (read-only reference) ──────────────────────────────────
  catalog: productsData.catalog,

  // ── Cart items  { [id]: { quantity, color? } } ─────────────────────
  cartItems: buildInitialCart(productsData.initialState),

  // ── Plan ───────────────────────────────────────────────────────────
  plan: { ...productsData.initialState.cart.plan },

  // ── UI state — which steps are currently expanded ─────────────────
  openSteps: [1], // step 1 open by default

  // ── Actions ────────────────────────────────────────────────────────

  /** Set quantity for a product (clamped to 0 minimum) */
  setQuantity: (id, qty) =>
    set((state) => ({
      cartItems: {
        ...state.cartItems,
        [id]: { ...state.cartItems[id], quantity: Math.max(0, qty) },
      },
    })),

  /** Increment quantity by 1 */
  incrementQty: (id) => {
    const current = get().cartItems[id]?.quantity ?? 0;
    get().setQuantity(id, current + 1);
  },

  /** Decrement quantity by 1 (floor at 0) */
  decrementQty: (id) => {
    const current = get().cartItems[id]?.quantity ?? 0;
    get().setQuantity(id, current - 1);
  },

  /** Select a color for a product */
  selectColor: (productId, colorName) =>
    set((state) => ({
      cartItems: {
        ...state.cartItems,
        [productId]: { ...state.cartItems[productId], color: colorName },
      },
    })),

  /** Toggle a step open/closed independently (multiple can be open) */
  toggleStep: (step) =>
    set((state) => ({
      openSteps: state.openSteps.includes(step)
        ? state.openSteps.filter((s) => s !== step)
        : [...state.openSteps, step],
    })),

  /** Open a step without closing others (used by Next button) */
  openStep: (step) =>
    set((state) => ({
      openSteps: state.openSteps.includes(step)
        ? state.openSteps
        : [...state.openSteps, step],
    })),

  /** Restore a previously saved state from localStorage */
  rehydrate: (saved) => set({
    cartItems: saved.cartItems ?? get().cartItems,
    plan:      saved.plan      ?? get().plan,
    openSteps: saved.openSteps ?? get().openSteps,
  }),

  // ── Derived / Computed ─────────────────────────────────────────────

  /** Total price of all items + plan */
  getCartTotal: () => {
    const { cartItems, plan } = get();
    let total = 0;
    for (const [id, item] of Object.entries(cartItems)) {
      if (item.quantity > 0) {
        total += item.quantity * getUnitPrice(id);
      }
    }
    total += plan.price;
    return total;
  },

  /** Total using old prices (for strikethrough) */
  getOldTotal: () => {
    const { cartItems, plan } = get();
    let total = 0;
    for (const [id, item] of Object.entries(cartItems)) {
      if (item.quantity > 0) {
        const oldUnit = getOldUnitPrice(id);
        total += item.quantity * (oldUnit ?? getUnitPrice(id));
      }
    }
    total += plan.oldPrice ?? plan.price;
    return total;
  },

  /** How much the user saves */
  getSavings: () => {
    return get().getOldTotal() - get().getCartTotal();
  },

  /** Count of cameras with quantity > 0 */
  getSelectedCameraCount: () => {
    const { cartItems } = get();
    let count = 0;
    for (const [id, item] of Object.entries(cartItems)) {
      if (isCamera(id) && item.quantity > 0) {
        count += item.quantity;
      }
    }
    return count;
  },

  /** "As low as" monthly price (total / 12) */
  getMonthlyPrice: () => {
    return get().getCartTotal() / 12;
  },
}));

export default useBundleStore;
