import styles from './extrapanel.module.css';
import useBundleStore, { getUnitPrice, getOldUnitPrice, getItemInfo } from '../store/useBundleStore';
import { formatPrice } from '../utils/formatPrice';
import waves from '../assets/icon/24/cam/waves.svg';
import shield from '../assets/icon/24/cam/SHIELD.svg';
import extra from '../assets/icon/24/cam/extra.svg';
import guard from '../assets/icon/24/cam/guard.svg';
import productsData from '../data/products.json';

// ─── Shared CartItem row (same logic as ReviewPanel) ──────────────────────────
const ExpandedItem = ({ id }) => {
  const item       = useBundleStore((s) => s.cartItems[id]);
  const incrementQty = useBundleStore((s) => s.incrementQty);
  const decrementQty = useBundleStore((s) => s.decrementQty);

  if (!item) return null;

  const info        = getItemInfo(id);
  const unitPrice   = getUnitPrice(id);
  const oldUnit     = getOldUnitPrice(id);
  const lineTotal   = item.quantity * unitPrice;
  const lineOld     = oldUnit != null ? item.quantity * oldUnit : null;
  const isFree      = unitPrice === 0;

  return (
    <div className={styles.expandedItem}>
      <div className={styles.itemLeft}>
        <div className={styles.itemThumb}>
          {info.image ? <img src={info.image} alt={info.title} /> : null}
        </div>
        <span className={styles.itemTitle}>{info.title}</span>
      </div>

      <div className={styles.itemRight}>
        <div className={styles.qtyControl}>
          <button className={styles.qtyBtn} onClick={() => decrementQty(id)}>−</button>
          <span className={styles.qtyNumber}>{item.quantity}</span>
          <button className={styles.qtyBtn} onClick={() => incrementQty(id)}>+</button>
        </div>

        <div className={styles.pricingCol}>
          {lineOld != null && (
            <span className={styles.oldPrice}>{formatPrice(lineOld)}</span>
          )}
          <span className={isFree ? styles.freePrice : styles.currentPrice}>
            {isFree ? 'FREE' : formatPrice(lineTotal)}
          </span>
        </div>
      </div>
    </div>
  );
};

// ─── Step 2: Choose your plan ─────────────────────────────────────────────────
const PlanContent = () => {
  const plan = useBundleStore((s) => s.plan);
  return (
    <div className={styles.expandedContent}>
      <div className={styles.expandedItem}>
        <div className={styles.itemLeft}>
          <div className={styles.itemThumb}>
            <img src={guard} alt="plan icon" />
          </div>
          <span className={styles.itemTitle}>
            <b>Cam</b> Unlimited
          </span>
        </div>
        <div className={styles.itemRight}>
          <div className={styles.pricingCol}>
            {plan.oldPrice && (
              <span className={styles.oldPrice}>${plan.oldPrice}/mo</span>
            )}
            <span className={styles.currentPrice}>${plan.price}/mo</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Step 3: Sensors ─────────────────────────────────────────────────────────
const SensorsContent = () => {
  const sensorIds = productsData.initialState.cart.sensors.map((s) => s.id);
  return (
    <div className={styles.expandedContent}>
      {sensorIds.map((id) => (
        <ExpandedItem key={id} id={id} />
      ))}
    </div>
  );
};

// ─── Step 4: Accessories ─────────────────────────────────────────────────────
const AccessoriesContent = () => {
  const accessoryIds = productsData.initialState.cart.accessories.map((a) => a.id);
  return (
    <div className={styles.expandedContent}>
      {accessoryIds.map((id) => (
        <ExpandedItem key={id} id={id} />
      ))}
    </div>
  );
};

// ─── Step header (title row + chevron) ────────────────────────────────────────
const StepPanel = ({ stepNumber, title, iconPath, children }) => {
  const openSteps  = useBundleStore((s) => s.openSteps);
  const toggleStep = useBundleStore((s) => s.toggleStep);

  const isActive = openSteps.includes(stepNumber);

  const handleClick = () => toggleStep(stepNumber);

  return (
    <div className={`${styles.stepWrapper} ${isActive ? styles.stepWrapperActive : ''}`}>
      {/* ── Clickable header ── */}
      <div
        className={styles.stepHeader}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(); }
        }}
      >
        <span className={styles.stepIndicator}>STEP {stepNumber} OF 4</span>

        <div className={styles.stepContent}>
          <div className={styles.stepLeft}>
            <img src={iconPath} alt={`${title} icon`} className={styles.stepIcon} />
            <h2 className={styles.stepTitle}>{title}</h2>
          </div>

          <div className={`${styles.chevron} ${isActive ? styles.chevronActive : ''}`}>
            <svg width="14" height="8" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1L7 7L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>

      {/* ── Expanded content (only when active) ── */}
      {isActive && (
        <div className={styles.expandedBody}>
          {children}
        </div>
      )}
    </div>
  );
};

// ─── Main export ──────────────────────────────────────────────────────────────
export default function RemainingSteps() {
  return (
    <div className={styles.container}>
      <StepPanel stepNumber={2} title="Choose your plan" iconPath={shield}>
        <PlanContent />
      </StepPanel>

      <StepPanel stepNumber={3} title="Choose your sensors" iconPath={waves}>
        <SensorsContent />
      </StepPanel>

      <StepPanel stepNumber={4} title="Add extra protection" iconPath={extra}>
        <AccessoriesContent />
      </StepPanel>
    </div>
  );
}