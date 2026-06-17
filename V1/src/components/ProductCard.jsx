import styles from "./productcard.module.css";
import camera from "../assets/icon/24/cam/camera.svg";

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
          </div>
          <div />
        </div>

        {/* Your future right side */}
        <aside className={styles.rightSidebar}>
          {/* Review system goes here */}
        </aside>
      </div>
    </>
  );
}

export default ProductCard;
