import styles from "./productcard.module.css";
import camera from "../assets/icon/24/cam/camera.svg";

function ProductCard() {
  return (
    <div className={styles.stepcontainer}>
      <span className={styles.stepIndicator}>STEP 1 OF 4 </span>

      <div className={styles.titleRow}>
        <img src={camera} alt="camera icon" />
        <h1 className={styles.title}>Choose your cameras</h1>
      </div>
    </div>
  );
}

export default ProductCard;
