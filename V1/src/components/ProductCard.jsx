import styles from "./productcard.module.css";
import camera from "../assets/icon/24/cam/camera.svg";
import productsData from "../data/products.json";

const SingleProductItem = ({ product }) => {
  return (
    <div className={styles.productItem}>
      {product.badge && <span className={styles.badge}>{product.badge}</span>}

      <div className={styles.itemImageContainer}>
        <div className={styles.placeholderBox}>IMG</div>
      </div>

      <div className={styles.itemDetails}>
        <h3>{product.title}</h3>
        <p>
          {product.description} <a href="#">Learn More</a>
        </p>

        {product.colors && product.colors.length > 0 && (
          <div className={styles.colorPicker}>
            {product.colors.map((color) => (
              <span key={color}>{color}</span>
            ))}
          </div>
        )}

        <div className={styles.priceRow}>
          {product.oldPrice && (
            <span className={styles.oldPrice}>${product.oldPrice}</span>
          )}
          <span className={styles.currentPrice}>${product.price}</span>
        </div>
      </div>
    </div>
  );
};

function ProductCard() {
  return (
    <>
      <div className={styles.bundleWrapper}>
        <div className={styles.leftPanel}>
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
              {productsData.catalog.cameras.map((product, index) => {
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
        </div>

        <aside className={styles.ReviewPanel}>
          {/* Review system goes here */}
        </aside>
      </div>
    </>
  );
}

export default ProductCard;