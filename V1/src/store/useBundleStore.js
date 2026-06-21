import { create } from 'zustand';
import productsData from '../data/products.json';

function buildInitialCart(initialState) {
  const cart = {};


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



const allCatalogItems = [
  ...productsData.catalog.cameras,
];

const catalogById = {};
for (const item of allCatalogItems) {
  catalogById[item.id] = item;
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

export function getUnitPrice(id) {
  const catalogItem = catalogById[id];
  if (catalogItem) return catalogItem.price;
  const extra = initialCartPricing[id];
  if (extra) return extra.unitPrice;
  return 0;
}

export function getOldUnitPrice(id) {
  const catalogItem = catalogById[id];
  if (catalogItem) return catalogItem.oldPrice ?? null;
  const extra = initialCartPricing[id];
  if (extra) return extra.oldUnitPrice;
  return null;
}

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


const cameraIds = new Set(productsData.catalog.cameras.map((c) => c.id));
const sensorIds = new Set(productsData.initialState.cart.sensors.map((s) => s.id));
const accessoryIds = new Set(productsData.initialState.cart.accessories.map((a) => a.id));

export function isCamera(id) { return cameraIds.has(id); }
export function isSensor(id) { return sensorIds.has(id); }
export function isAccessory(id) { return accessoryIds.has(id); }

const useBundleStore = create((set, get) => ({
  catalog: productsData.catalog,

  cartItems: buildInitialCart(productsData.initialState),

  plan: { ...productsData.initialState.cart.plan },

  openSteps: [1], 

  setQuantity: (id, qty) =>
    set((state) => ({
      cartItems: {
        ...state.cartItems,
        [id]: { ...state.cartItems[id], quantity: Math.max(0, qty) },
      },
    })),

  incrementQty: (id) => {
    const current = get().cartItems[id]?.quantity ?? 0;
    get().setQuantity(id, current + 1);
  },

  decrementQty: (id) => {
    const current = get().cartItems[id]?.quantity ?? 0;
    get().setQuantity(id, current - 1);
  },

  selectColor: (productId, colorName) =>
    set((state) => ({
      cartItems: {
        ...state.cartItems,
        [productId]: { ...state.cartItems[productId], color: colorName },
      },
    })),

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

  /** Restore a previously saved state from localStorage */
  rehydrate: (saved) => set({
    cartItems: saved.cartItems ?? get().cartItems,
    plan:      saved.plan      ?? get().plan,
    // openSteps intentionally NOT restored — step UI always resets to default
  }),

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
