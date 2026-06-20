import { useState } from 'react';
import styles from './reviewpanel.module.css';
import useBundleStore, { getItemInfo, isCamera, isSensor, isAccessory, getUnitPrice, getOldUnitPrice } from '../store/useBundleStore';
import { formatPrice } from '../utils/formatPrice';
import guaranteeIcon from '../assets/icon/24/cam/fast.svg';
import fastShippingIcon from '../assets/icon/24/cam/fastshipping.svg';
import guard from '../assets/icon/24/cam/guard.svg';

// Reusable row for Cameras, Sensors, and Accessories
const CartItem = ({ id, item }) => {
  const incrementQty = useBundleStore((s) => s.incrementQty);
  const decrementQty = useBundleStore((s) => s.decrementQty);

  const info = getItemInfo(id);
  const unitPrice    = getUnitPrice(id);
  const oldUnitPrice = getOldUnitPrice(id);
  const lineTotal    = item.quantity * unitPrice;
  const lineOldTotal = oldUnitPrice != null ? item.quantity * oldUnitPrice : null;
  const isFree       = unitPrice === 0;

  return (
    <div className={styles.cartItem}>
      <div className={styles.itemLeft}>
        <div className={styles.iconPlaceholder}>
          {info.image ? <img src={info.image} alt={info.title} /> : 'IMG'}
        </div>
        <span className={styles.itemTitle}>{info.title}</span>
      </div>
      
      <div className={styles.itemRight}>
        {item.quantity !== undefined && (
          <div className={styles.qtyControl}>
            <button className={styles.qtyBtn} onClick={() => decrementQty(id)}>-</button>
            <span className={styles.qtyNumber}>{item.quantity}</span>
            <button className={styles.qtyBtn} onClick={() => incrementQty(id)}>+</button>
          </div>
        )}
        
        <div className={styles.pricingCol}>
          {lineOldTotal != null && (
            <span className={styles.oldPrice}>{formatPrice(lineOldTotal)}</span>
          )}
          <span className={isFree ? styles.freePrice : styles.currentPrice}>
            {isFree ? 'FREE' : formatPrice(lineTotal)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default function ReviewPanel() {
  const cartItems = useBundleStore((s) => s.cartItems);
  const plan = useBundleStore((s) => s.plan);
  const cartTotal = useBundleStore((s) => s.getCartTotal());
  const oldTotal = useBundleStore((s) => s.getOldTotal());
  const savings = useBundleStore((s) => s.getSavings());
  const monthlyPrice = useBundleStore((s) => s.getMonthlyPrice());

  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    const { cartItems, plan, openSteps } = useBundleStore.getState();
    localStorage.setItem(
      'ecom-experts-bundle',
      JSON.stringify({ cartItems, plan, openSteps })
    );
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // Split cart items by category, only include items with quantity > 0
  const cameraEntries = Object.entries(cartItems).filter(
    ([id, item]) => isCamera(id) && item.quantity > 0
  );
  const sensorEntries = Object.entries(cartItems).filter(
    ([id, item]) => isSensor(id) && item.quantity > 0
  );
  const accessoryEntries = Object.entries(cartItems).filter(
    ([id, item]) => isAccessory(id) && item.quantity > 0
  );

  return (
    <aside className={styles.reviewContainer}>
      {/* Header */}
      <div className={styles.header}>
        <span className={styles.label}>REVIEW</span>
        <h2 className={styles.title}>Your security system</h2>
        <p className={styles.subtitle}>
          Review your personalized protection system designed to keep what matters most safe.
        </p>
      </div>

      {/* Cameras */}
      {cameraEntries.length > 0 && (
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>CAMERAS</h4>
          {cameraEntries.map(([id, item]) => (
            <CartItem key={id} id={id} item={item} />
          ))}
        </div>
      )}

      {/* Sensors */}
      {sensorEntries.length > 0 && (
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>SENSORS</h4>
          {sensorEntries.map(([id, item]) => (
            <CartItem key={id} id={id} item={item} />
          ))}
        </div>
      )}

      {/* Accessories */}
      {accessoryEntries.length > 0 && (
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>ACCESSORIES</h4>
          {accessoryEntries.map(([id, item]) => (
            <CartItem key={id} id={id} item={item} />
          ))}
        </div>
      )}

      {/* Plan */}
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>PLAN</h4>
        <div className={styles.planRow}>
          <div className={styles.planLeft}>
            <img src={guard} alt="guard icon" />
             <span className={styles.planTitle}><b>Cam</b> Unlimited</span>
          </div>
          <div className={styles.pricingCol}>
            {plan.oldPrice && (
              <span className={styles.oldPrice}>${plan.oldPrice}/mo</span>
            )}
            <span className={styles.currentPrice}>${plan.price}/mo</span>
          </div>
        </div>
      </div>

      {/* Footer Summary */}
      <div className={styles.summarySection}>
        <div className={styles.shippingRow}>
           <div className={styles.shippingLeft}>
           <img src={fastShippingIcon} alt="fast shipping icon" />
             <span className={styles.shippingText}>Fast Shipping</span>
           </div>
           <div className={styles.pricingCol}>
             <span className={styles.oldPrice}>$5.99</span>
             <span className={styles.freePrice}>FREE</span>
           </div>
        </div>

        <div className={styles.totalRow}>
           <img src={guaranteeIcon} alt="guarantee icon" />
          
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
            Congrats! You're saving {formatPrice(savings)} on your security bundle!
          </p>
        )}
        
        <button className={styles.checkoutBtn}>Checkout</button>
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