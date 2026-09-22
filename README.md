# Bundle Builder — Frontend Take-Home

A multi-step security system bundle builder built in React. Shoppers configure cameras, a monitoring plan, sensors, and accessories through a 4-step accordion. A live review panel beside it reflects every selection in real time.

---

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server (runs on http://localhost:5173)
npm run dev

# Build for production
npm run build
```

Requires Node 18+. No environment variables needed.

---

## Architecture Decisions

### State: Zustand over Context + useReducer

Chose Zustand for the global cart state because:
- **Subscriptions are selector-based** — components only re-render when the slice they care about changes. A `SingleProductItem` for camera A doesn't re-render when camera B's quantity changes.
- **No Provider boilerplate** — the store is importable anywhere, which made wiring the review panel straightforward.
- **`getState()` escape hatch** — the Save button reads the full snapshot at click-time without needing to put the whole state in a React variable.

### Per-Variant Quantity Model

The spec requires Red and Blue of the same camera to be tracked with separate quantities.

Cart keys are **compound strings**: `"productId::colorName"` for products with variants, bare `"productId"` for products without:

```
{
  "cam-v4::White":  { quantity: 2 },
  "cam-v4::Black":  { quantity: 0 },
  "duo-cam-doorbell": { quantity: 1 }
}
```

**Which color is "selected" on the card** is local UI state (`useState` in `SingleProductItem`). Switching from White to Black doesn't touch the cart — it just rebinds the stepper to `cam-v4::Black`. White's count of 2 is untouched.

The review panel renders one line per compound key that has `quantity > 0`, so adding both White and Black produces two separate review lines automatically.

### Data Source: Local JSON (`src/data/products.json`)

All product catalog data and the initial seeded cart state come from a single JSON file. The app renders from data — no product markup is hardcoded in any component. The store's `buildInitialCart` function initializes all color variant slots from the catalog at startup so variant keys always exist.

### Persistence: Manual Save Only

The spec says save-on-click, not auto-save. `localStorage` is written only when "Save my system for later" is clicked. On load, `App.jsx` checks for a saved key and calls `rehydrate()` if one exists.

Step accordion state (`openSteps`) is intentionally **not persisted** — the accordion always resets to "cameras open" on each visit. Cart contents and plan are the persistent data.

---

## Tradeoffs & Known Limitations

| Area | Decision | Tradeoff |
|---|---|---|
| Sensor/accessory unit prices | Derived as `totalPrice / seedQty` from JSON | Fragile if seed qty changes — ideally stored as explicit `unitPrice` in JSON |
| Shipping row | Hardcoded `$5.99 → FREE` | Should come from JSON for consistency |
| No plan selector | Plan is fixed at "Cam Unlimited" | Spec shows one plan in design — a future iteration would let the user switch |
| No backend | JSON is local | Spec says API is a bonus; a small Express or Hono endpoint serving the same JSON would be trivial to add |
| No tests | — | Given the take-home scope, I focused on correctness and fidelity over test coverage |

---

## Tech Stack

| Tool | Why |
|---|---|
| React 19 + Vite | Fast dev experience, modern React features |
| Zustand | Lightweight global state without boilerplate |
| CSS Modules | Scoped styles, no runtime overhead, easy to reason about |
| Gilroy font | Matches the Figma typography |


some changes i made for better UX
1- grey negative button when the quantity is zero 
2- the checkout button are interactive letting the user know its done
3- fixed the color of quantity buttons in the review panel for better UI
4- the next buttons works and led to the next section
5- added a backend branch trying to implement simple Express server 

## Architectural Decisions & Tradeoffs

### State Management & Persistence: Why Zustand?
To handle the requirement of restoring a user's configuration upon a return visit ("Save my system for later"), I opted for **Zustand** coupled with its native `persist` middleware, rather than React Context or Redux.

**The Claim for Zustand:**
1. **Frictionless Persistence:** The `persist` middleware automatically syncs the active cart state to `localStorage` without requiring manual `useEffect` hooks, parsing, or stringifying JSON strings across the component tree.
2. **Variant Handling Complexity:** The prompt requires that product variants (e.g., Red vs. Blue cameras) track quantities entirely independently while sharing the same parent product card. I structured the Zustand store to use composite dictionary keys (`${productId}-${variantId}`). This O(1) lookup allows both the builder cards and the review panel to instantly read and update specific variant quantities without iterating through complex nested arrays.
3. **Render Optimization:** Context API would trigger a re-render of the entire two-column layout every time a user increments a stepper. Zustand allows the Review Panel and individual Product Cards to select only the specific slices of state they care about, keeping the live-updating UI highly performant. 

## There is a backend server in Express.js in the backend branch for Bonus

## The Figma File is not correct in calculation (the result is exactly $15.6575 (which rounds to $15.66). The designer who created the Figma mockup likely copy-pasted the "$19.19"), the cart total was ~$230, and forgot to update the math.   

*Note on "Save for Later":* Because `persist` actively mirrors the state to local storage in real-time, the shopper's configuration is inherently protected against accidental tab closures. The "Save my system for later" button serves primarily as a UX confirmation to give the user peace of mind, leveraging the data already secured in the browser.
