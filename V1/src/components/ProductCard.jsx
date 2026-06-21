import { useState } from "react";
import styles from "./productcard.module.css";
import useBundleStore, { makeCartKey } from "../store/useBundleStore";
import { formatPrice } from "../utils/formatPrice";
import camera from "../assets/icon/24/cam/camera.svg";
import ReviewPanel from "./ReviewPanel";
import ExtraPanel from "./ExtraPanel";

// ---------------------------------------------------------------------------
// Single camera card — handles per-variant quantity selection
// ---------------------------------------------------------------------------
const SingleProductItem = ({ product }) => {
  const hasVariants = product.colors && product.colors.length > 0;

  /**
   * activeColor is LOCAL UI state — it controls which chip is highlighted
   * and which variant's qty the stepper reads/writes.
   * It does NOT clear other variants' quantities when changed.
   */
  const [activeColor, setActiveColor] = useState(() => {
    if (!hasVariants) return null;
    // Prefer the color that was pre-seeded with qty > 0
    for (const c of product.colors) {
      const key = makeCartKey(product.id, c.name);
      const qty = useBundleStore.getState().cartItems[key]?.quantity ?? 0;
      if (qty > 0) return c.name;
    }
    return product.colors[0].name;
  });

  // The cart key the stepper is currently bound to
  const activeKey = hasVariants ? makeCartKey(product.id, activeColor) : product.id;

  // Qty for the active variant (what the stepper shows)
  const cartItem    = useBundleStore((s) => s.cartItems[activeKey]);
  const incrementQty = useBundleStore((s) => s.incrementQty);
  const decrementQty = useBundleStore((s) => s.decrementQty);

  // All cart items — needed for per-chip badges & purple border
  const allCartItems = useBundleStore((s) => s.cartItems);

  const quantity = cartItem?.quantity ?? 0;

  // Purple border = ANY variant of this product has qty > 0
  const isSelected = hasVariants
    ? product.colors.some(
        (c) => (allCartItems[makeCartKey(product.id, c.name)]?.quantity ?? 0) > 0
      )
    : quantity > 0;

  return (
    <div
      className={`${styles.productItem} ${isSelected ? styles.productItemSelected : ""}`}
    >
      {product.badge && <span className={styles.badge}>{product.badge}</span>}

      <div className={styles.itemImageContainer}>
        {product.image ? (
          <img
            src={product.image}
            alt={product.title}
            className={styles.productImage}
          />
        ) : (
          <div className={styles.placeholderBox}>IMG</div>
        )}
      </div>

      <div className={styles.itemDetails}>
        <div className={styles.detailsTop}>
          <h3>{product.title}</h3>
          <p className={styles.description}>
            {product.description}{" "}
            <a href="#" className={styles.learnMore}>
              Learn More
            </a>
          </p>

          {hasVariants && (
            <div className={styles.colorPicker}>
              {product.colors.map((colorObj) => {
                const variantKey = makeCartKey(product.id, colorObj.name);
                const variantQty = allCartItems[variantKey]?.quantity ?? 0;
                return (
                  <button
                    key={colorObj.name}
                    className={`${styles.colorBtn} ${
                      activeColor === colorObj.name ? styles.colorBtnActive : ""
                    }`}
                    onClick={() => setActiveColor(colorObj.name)}
                  >
                    <img
                      src={colorObj.iconId}
                      alt={colorObj.name}
                      className={styles.colorIcon}
                    />
                    {colorObj.name}
                    {/* Badge shows how many of THIS variant are in cart */}
                    {variantQty > 0 && (
                      <span className={styles.variantQtyBadge}>{variantQty}</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className={styles.cardBottomRow}>
          <div className={styles.qtyControl}>
            <button
              className={`${styles.qtyBtn} ${quantity === 0 ? styles.qtyBtnDisabled : ""}`}
              onClick={() => decrementQty(activeKey)}
              disabled={quantity === 0}
              aria-label="Decrease quantity"
            >
              -
            </button>
            <span className={styles.qtyNumber}>{quantity}</span>
            <button
              className={styles.qtyBtn}
              onClick={() => incrementQty(activeKey)}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          <div className={styles.pricingCol}>
            {product.oldPrice && (
              <span className={styles.oldPrice}>{formatPrice(product.oldPrice)}</span>
            )}
            <span className={styles.currentPrice}>{formatPrice(product.price)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Main layout — left panel (step 1 + extra steps) + review panel
// ---------------------------------------------------------------------------
function ProductCard() {
  const catalog      = useBundleStore((s) => s.catalog);
  const selectedCount = useBundleStore((s) => s.getSelectedCameraCount());
  const openSteps    = useBundleStore((s) => s.openSteps);
  const toggleStep   = useBundleStore((s) => s.toggleStep);
  const openStep     = useBundleStore((s) => s.openStep);

  const isOpen = openSteps.includes(1);

  const handleToggle = () => toggleStep(1);

  return (
    <>
      <h1 className={styles.mobileTitle}>Let&apos;s get started!</h1>

      <div className={styles.bundleWrapper}>
        {/* ── LEFT COLUMN ── */}
        <div className={styles.leftPanel}>

          <div
            className={`${styles.stepcontainer} ${!isOpen ? styles.isClosed : ""}`}
          >
            <span className={styles.stepIndicator}>STEP 1 OF 4</span>

            {/* Clickable header row */}
            <div
              className={styles.titleRow}
              onClick={handleToggle}
              role="button"
              tabIndex={0}
              aria-expanded={isOpen}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleToggle();
                }
              }}
            >
              <div className={styles.titleLeft}>
                <img src={camera} alt="camera icon" />
                <h1 className={styles.title}>Choose your cameras</h1>
              </div>

              <span className={styles.selectedCount}>
                {selectedCount} selected{" "}
                <span
                  className={`${styles.chevron} ${isOpen ? styles.chevronUp : ""}`}
                >
                  ▾
                </span>
              </span>
            </div>

            {/* Collapsible body */}
            {isOpen && (
              <>
                <div className={styles.productGrid}>
                  {catalog.cameras.map((product, index) => {
                    if (index === 4) {
                      return (
                        <div key={product.id} className={styles.centeredRow}>
                          <SingleProductItem product={product} />
                        </div>
                      );
                    }
                    return (
                      <SingleProductItem key={product.id} product={product} />
                    );
                  })}
                </div>

                <button
                  className={styles.nextButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    openStep(2);
                  }}
                >
                  Next: Choose your plan
                </button>
              </>
            )}
          </div>

          {/* Steps 2–4 */}
          <div className={styles.extraStepsWrapper}>
            <ExtraPanel />
          </div>
        </div>

        {/* ── REVIEW PANEL ── */}
        <aside className={styles.ReviewPanel}>
          <ReviewPanel />
        </aside>
      </div>
    </>
  );
}

export default ProductCard;
