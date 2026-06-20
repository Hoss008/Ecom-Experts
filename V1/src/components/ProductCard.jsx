import styles from "./productcard.module.css";
import useBundleStore from "../store/useBundleStore";
import { formatPrice } from "../utils/formatPrice";
// Make sure this path exactly matches where your camera icon is!
import camera from "../assets/icon/24/cam/camera.svg";
import ReviewPanel from "./ReviewPanel";
import ExtraPanel from "./ExtraPanel";

const SingleProductItem = ({ product }) => {
  // Selectors — only re-render when this specific item changes
  const cartItem = useBundleStore((s) => s.cartItems[product.id]);
  const incrementQty = useBundleStore((s) => s.incrementQty);
  const decrementQty = useBundleStore((s) => s.decrementQty);
  const selectColor = useBundleStore((s) => s.selectColor);

  const quantity = cartItem?.quantity ?? 0;
  const selectedColor = cartItem?.color ?? null;

  return (
    <div className={`${styles.productItem} ${quantity > 0 ? styles.productItemSelected : ''}`}>
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

          {product.colors && product.colors.length > 0 && (
            <div className={styles.colorPicker}>
              {product.colors.map((colorObj) => (
                <button
                  key={colorObj.name}
                  className={`${styles.colorBtn} ${
                    selectedColor === colorObj.name ? styles.colorBtnActive : ""
                  }`}
                  onClick={() => selectColor(product.id, colorObj.name)}
                >
                  <img
                    src={colorObj.iconId}
                    alt={colorObj.name}
                    className={styles.colorIcon}
                  />
                  {colorObj.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={styles.cardBottomRow}>
          <div className={styles.qtyControl}>
            <button
              className={styles.qtyBtn}
              onClick={() => decrementQty(product.id)}
            >
              -
            </button>
            <span className={styles.qtyNumber}>{quantity}</span>
            <button
              className={styles.qtyBtn}
              onClick={() => incrementQty(product.id)}
            >
              +
            </button>
          </div>

          <div className={styles.pricingCol}>
            {product.oldPrice && (
              <span className={styles.oldPrice}>
                {formatPrice(product.oldPrice)}
              </span>
            )}
            <span className={styles.currentPrice}>
              {formatPrice(product.price)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

function ProductCard() {
  const catalog = useBundleStore((s) => s.catalog);
  const selectedCount = useBundleStore((s) => s.getSelectedCameraCount());
  const openSteps = useBundleStore((s) => s.openSteps);
  const toggleStep = useBundleStore((s) => s.toggleStep);
  const openStep  = useBundleStore((s) => s.openStep);

  const isOpen = openSteps.includes(1);

  const handleToggle = () => toggleStep(1);

  return (
    <>
      <h1 className={styles.mobileTitle}>Let's get started!</h1>

      <div className={styles.bundleWrapper}>
        {/* --- LEFT COLUMN --- */}
        <div className={styles.leftPanel}>
          {/* 1. CAMERAS FIRST */}
          <div className={styles.stepcontainer}>
            <span className={styles.stepIndicator}>STEP 1 OF 4</span>

            {/* Clickable header row */}
            <div
              className={styles.titleRow}
              onClick={handleToggle}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleToggle(); }
              }}
            >
              <div className={styles.titleLeft}>
                <img src={camera} alt="camera icon" />
                <h1 className={styles.title}>Choose your cameras</h1>
              </div>

              <span className={styles.selectedCount}>
                {selectedCount} selected{' '}
                <span className={`${styles.chevron} ${isOpen ? styles.chevronUp : ''}`}>
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
                    return <SingleProductItem key={product.id} product={product} />;
                  })}
                </div>

                <button
                  className={styles.nextButton}
                  onClick={(e) => { e.stopPropagation(); openStep(2); }}
                >
                  Next: Choose your plan
                </button>
              </>
            )}
          </div>

          {/* 2. EXTRA STEPS SECOND */}
          <div className={styles.extraStepsWrapper}>
            <ExtraPanel />
          </div>
        </div>
        {/* --- END OF LEFT COLUMN --- */}

        {/* 3. REVIEW PANEL LAST */}
        <aside className={styles.ReviewPanel}>
          <ReviewPanel />
        </aside>
      </div>
    </>
  );
}

export default ProductCard;

