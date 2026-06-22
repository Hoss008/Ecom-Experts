# Bundle Builder — React + Express Take-Home

A multi-step security system bundle builder built in React. Shoppers configure cameras, a monitoring plan, sensors, and accessories through a 4-step accordion. A live review panel beside it reflects every selection in real time.

---

## Getting Started

```bash
# Install dependencies
npm install

# Start the Express API and Vite client (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Serve the production build and API from Express (http://localhost:3001)
npm start
```

Requires Node 18+. No environment variables are needed.

## API

The client gets its full catalog and seeded bundle state from Express:

| Endpoint | Purpose |
|---|---|
| `GET /api/bundle` | Catalog, pre-populated review items, and initial plan/cart state |
| `GET /api/health` | Minimal health check |

In development, Vite proxies `/api` to Express on port `3001`. In production, Express serves both `dist/` and the API on the same origin.

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

### Data Source: Express API (`GET /api/bundle`)

The small Express server owns the catalog and initial bundle data in `server/data/bundleData.js` and exposes it as JSON at `/api/bundle`. The React app fetches that endpoint before it renders the bundle. No product markup is hardcoded in the components; the store builds every product/variant slot and pre-populates the review items from the API response.

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
| In-memory catalog | Server restarts reset catalog changes | Appropriate for this read-only take-home API; a database would be needless complexity |
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
