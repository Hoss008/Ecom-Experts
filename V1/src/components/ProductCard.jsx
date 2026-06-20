import styles from "./productcard.module.css";
import products from "../data/products.json";
// Make sure this path exactly matches where your camera icon is!
import camera from "../assets/icon/24/cam/camera.svg";
import ReviewPanel from "./ReviewPanel";
import ExtraPanel from "./ExtraPanel";

const SingleProductItem = ({ product }) => {
  return (
    <div className={styles.productItem}>
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
                <button key={colorObj.name} className={styles.colorBtn}>
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
            <button className={styles.qtyBtn}>-</button>
            <span className={styles.qtyNumber}>
              {product.title.includes("Pan")
                ? "2"
                : product.price === 27.98
                  ? "1"
                  : "0"}
            </span>
            <button className={styles.qtyBtn}>+</button>
          </div>

          <div className={styles.pricingCol}>
            {product.oldPrice && (
              <span className={styles.oldPrice}>${product.oldPrice}</span>
            )}
            <span className={styles.currentPrice}>${product.price}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

function ProductCard() {
  return (
    <>
      <h1 className={styles.mobileTitle}>Let's get started!</h1>

      <div className={styles.bundleWrapper}>
        {/* --- LEFT COLUMN --- */}
        <div className={styles.leftPanel}>
          {/* 1. CAMERAS FIRST */}
          <div className={styles.stepcontainer}>
            <span className={styles.stepIndicator}>STEP 1 OF 4</span>

            <div className={styles.titleRow}>
              <div className={styles.titleLeft}>
                <img src={camera} alt="camera icon" />
                <h1 className={styles.title}>Choose your cameras</h1>
              </div>

              <span className={styles.selectedCount}>2 selected &#9652;</span>
            </div>

            <div className={styles.productGrid}>
              {products.catalog.cameras.map((product, index) => {
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

            <button className={styles.nextButton}>
              Next: Choose your plan
            </button>
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
