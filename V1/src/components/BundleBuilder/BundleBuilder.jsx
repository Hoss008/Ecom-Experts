import styles from './BundleBuilder.module.css';
import useBundleStore from '../../store/useBundleStore';
import { formatPrice } from '../../utils/formatPrice';

import StepAccordion from '../StepAccordion/StepAccordion';
import ProductCard from '../ProductCard/ProductCard';
import StepContentItem from '../StepContentItem/StepContentItem';
import ReviewPanel from '../ReviewPanel/ReviewPanel';

import cameraIcon from '../../assets/icon/24/cam/camera.svg';
import shieldIcon from '../../assets/icon/24/cam/shield.svg';
import wavesIcon from '../../assets/icon/24/cam/waves.svg';
import extraIcon from '../../assets/icon/24/cam/extra.svg';
import guardIcon from '../../assets/icon/24/cam/guard.svg';

import productsData from '../../data/products.json';

// ─── Step content components ─────────────────────────────────────────────────

/** Step 1: Camera product grid */
function CameraGrid() {
  const cameras = useBundleStore((s) => s.catalog.cameras);

  return (
    <div className={styles.productGrid}>
      {cameras.map((product, index) => {
        // Last product (5th, index 4) is centered on its own row
        if (index === 4) {
          return (
            <div key={product.id} className={styles.centeredRow}>
              <ProductCard product={product} />
            </div>
          );
        }
        return <ProductCard key={product.id} product={product} />;
      })}
    </div>
  );
}

/** Step 2: Plan content (no quantity stepper — single plan shown) */
function PlanContent() {
  const plan = useBundleStore((s) => s.plan);

  return (
    <div className={styles.stepContent}>
      <div className={styles.contentItem}>
        <div className={styles.contentItemLeft}>
          <div className={styles.contentThumb}>
            <img src={guardIcon} alt="plan icon" />
          </div>
          <span className={styles.contentTitle}>
            <b>Cam</b> Unlimited
          </span>
        </div>
        <div className={styles.contentPricing}>
          {plan.oldPrice && (
            <span className={styles.contentOldPrice}>
              ${plan.oldPrice}/mo
            </span>
          )}
          <span className={styles.contentCurrentPrice}>
            ${plan.price}/mo
          </span>
        </div>
      </div>
    </div>
  );
}

/** Step 3: Sensors list */
function SensorsContent() {
  const sensorIds = productsData.initialState.cart.sensors.map((s) => s.id);

  return (
    <div className={styles.stepContent}>
      {sensorIds.map((id) => (
        <StepContentItem key={id} itemId={id} />
      ))}
    </div>
  );
}

/** Step 4: Accessories list */
function AccessoriesContent() {
  const accIds = productsData.initialState.cart.accessories.map((a) => a.id);

  return (
    <div className={styles.stepContent}>
      {accIds.map((id) => (
        <StepContentItem key={id} itemId={id} />
      ))}
    </div>
  );
}

// ─── Main layout ─────────────────────────────────────────────────────────────

export default function BundleBuilder() {
  const openStep = useBundleStore((s) => s.openStep);

  // Selected counts per step
  const cameraCount = useBundleStore((s) => s.getSelectedCameraCount());
  const planCount   = useBundleStore((s) => s.plan ? 1 : 0);

  const sensorCount = useBundleStore((s) => {
    const sensorIds = new Set(productsData.initialState.cart.sensors.map((x) => x.id));
    return Object.entries(s.cartItems)
      .filter(([k, v]) => sensorIds.has(k) && v.quantity > 0)
      .length;
  });

  const accessoryCount = useBundleStore((s) => {
    const accIds = new Set(productsData.initialState.cart.accessories.map((x) => x.id));
    return Object.entries(s.cartItems)
      .filter(([k, v]) => accIds.has(k) && v.quantity > 0)
      .length;
  });

  return (
    <>
      <h1 className={styles.mobileTitle}>Let&apos;s get started!</h1>

      <div className={styles.layout}>
        {/* ── LEFT COLUMN: 4-step accordion ── */}
        <div className={styles.leftPanel}>
          <StepAccordion
            stepNumber={1}
            title="Choose your cameras"
            icon={cameraIcon}
            selectedCount={cameraCount}
            nextLabel="Next: Choose your plan"
            onNext={() => openStep(2)}
          >
            <CameraGrid />
          </StepAccordion>

          <StepAccordion
            stepNumber={2}
            title="Choose your plan"
            icon={shieldIcon}
            selectedCount={planCount}
            nextLabel="Next: Choose your sensors"
            onNext={() => openStep(3)}
          >
            <PlanContent />
          </StepAccordion>

          <StepAccordion
            stepNumber={3}
            title="Choose your sensors"
            icon={wavesIcon}
            selectedCount={sensorCount}
            nextLabel="Next: Add extra protection"
            onNext={() => openStep(4)}
          >
            <SensorsContent />
          </StepAccordion>

          <StepAccordion
            stepNumber={4}
            title="Add extra protection"
            icon={extraIcon}
            selectedCount={accessoryCount}
          >
            <AccessoriesContent />
          </StepAccordion>
        </div>

        {/* ── RIGHT COLUMN: Review panel ── */}
        <aside className={styles.rightPanel}>
          <ReviewPanel />
        </aside>
      </div>
    </>
  );
}
