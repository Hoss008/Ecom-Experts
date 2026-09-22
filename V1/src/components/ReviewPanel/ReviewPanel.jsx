import { useState } from 'react';
import styles from './reviewpanel.module.css';
import useBundleStore, { isCamera, isSensor, isAccessory } from '../../store/useBundleStore';
import { useShallow } from 'zustand/react/shallow';
import { formatPrice } from '../../utils/formatPrice';
import ReviewLineItem from './ReviewLineItem';
import guaranteeIcon from '../../assets/icon/24/cam/fast.svg';
import fastShippingIcon from '../../assets/icon/24/cam/fastshipping.svg';
import guard from '../../assets/icon/24/cam/guard.svg';

/**
 * Review panel — "Your security system" sidebar.
 * Lists selected items by category, shipping, guarantee, totals, checkout + save.
 */
export default function ReviewPanel() {
  const plan     = useBundleStore((s) => s.plan);
  const shipping = useBundleStore((s) => s.catalog.shipping);

  // Derive category keys — useShallow prevents re-renders when array contents haven't changed
  const cameraKeys = useBundleStore(
    useShallow((s) =>
      Object.keys(s.cartItems).filter((k) => isCamera(k) && s.cartItems[k].quantity > 0)
    )
  );
  const sensorKeys = useBundleStore(
    useShallow((s) =>
      Object.keys(s.cartItems).filter((k) => isSensor(k) && s.cartItems[k].quantity > 0)
    )
  );
  const accessoryKeys = useBundleStore(
    useShallow((s) =>
      Object.keys(s.cartItems).filter((k) => isAccessory(k) && s.cartItems[k].quantity > 0)
    )
  );

  const cartTotal    = useBundleStore((s) => s.getCartTotal());
  const oldTotal     = useBundleStore((s) => s.getOldTotal());
  const savings      = useBundleStore((s) => s.getSavings());
  const monthlyPrice = useBundleStore((s) => s.getMonthlyPrice());

  const [saved, setSaved]         = useState(false);
  const [checkedOut, setCheckedOut] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    // Zustand's persist middleware automatically saves state changes to localStorage.
    // We only need to trigger the UX confirmation here.
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleCheckout = () => {
    setCheckedOut(true);
    setTimeout(() => setCheckedOut(false), 2500);
  };

  return (
    <aside className={styles.container}>
      {/* ── Header ── */}
      <div className={styles.header}>
        <span className={styles.label}>REVIEW</span>
        <h2 className={styles.title}>Your security system</h2>
        <p className={styles.subtitle}>
          Review your personalized protection system designed to keep what
          matters most safe.
        </p>
      </div>

      {/* ── Cameras ── */}
      {cameraKeys.length > 0 && (
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>CAMERAS</h4>
          {cameraKeys.map((key) => (
            <ReviewLineItem key={key} cartKey={key} />
          ))}
        </div>
      )}

      {/* ── Sensors ── */}
      {sensorKeys.length > 0 && (
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>SENSORS</h4>
          {sensorKeys.map((key) => (
            <ReviewLineItem key={key} cartKey={key} />
          ))}
        </div>
      )}

      {/* ── Accessories ── */}
      {accessoryKeys.length > 0 && (
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>ACCESSORIES</h4>
          {accessoryKeys.map((key) => (
            <ReviewLineItem key={key} cartKey={key} />
          ))}
        </div>
      )}

      {/* ── Plan ── */}
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>PLAN</h4>
        <div className={styles.planRow}>
          <div className={styles.planLeft}>
            <img src={guard} alt="plan icon" />
            <span className={styles.planTitle}>
              <b>Cam</b> Unlimited
            </span>
          </div>
          <div className={styles.pricingCol}>
            {plan.oldPrice && (
              <span className={styles.oldPrice}>${plan.oldPrice}/mo</span>
            )}
            <span className={styles.currentPrice}>${plan.price}/mo</span>
          </div>
        </div>
      </div>

      {/* ── Footer Summary ── */}
      <div className={styles.summary}>
        {/* Shipping */}
        <div className={styles.shippingRow}>
          <div className={styles.shippingLeft}>
            <img src={fastShippingIcon} alt="fast shipping" />
            <span className={styles.shippingText}>Fast Shipping</span>
          </div>
          <div className={styles.pricingCol}>
            {shipping && shipping.oldPrice != null && (
              <span className={styles.oldPrice}>
                {formatPrice(shipping.oldPrice)}
              </span>
            )}
            <span className={styles.freePrice}>
              {shipping && shipping.price === 0 ? 'FREE' : formatPrice(shipping?.price ?? 0)}
            </span>
          </div>
        </div>

        {/* Satisfaction Guarantee */}
        <div className={styles.guaranteeRow}>
          <img
            src={guaranteeIcon}
            alt="satisfaction guarantee"
            className={styles.guaranteeIcon}
          />
          <div className={styles.guaranteeText}>
            <strong>30-day hassle-free returns</strong>
            <p>
              If you&apos;re not totally in love with the product, we will
              refund you 100%.
            </p>
          </div>
        </div>

        {/* Total */}
        <div className={styles.totalRow}>
          <div className={styles.totalsRight}>
            <span className={styles.monthlyBadge}>
              as low as {formatPrice(monthlyPrice)}/mo
            </span>
            <div className={styles.totalPrices}>
              <span className={styles.totalOld}>{formatPrice(oldTotal)}</span>
              <span className={styles.totalNew}>{formatPrice(cartTotal)}</span>
            </div>
          </div>
        </div>

        {savings > 0 && (
          <p className={styles.savingsText}>
            Congrats! You&apos;re saving {formatPrice(savings)} on your
            security bundle!
          </p>
        )}

        <button
          className={`${styles.checkoutBtn} ${checkedOut ? styles.checkoutBtnDone : ''}`}
          onClick={handleCheckout}
          disabled={checkedOut}
        >
          {checkedOut ? '✓ Order placed!' : 'Checkout'}
        </button>

        <a
          href="#"
          className={`${styles.saveLink} ${saved ? styles.saveLinkSaved : ''}`}
          onClick={handleSave}
        >
          {saved ? '✓ Saved!' : 'Save my system for later'}
        </a>
      </div>
    </aside>
  );
}