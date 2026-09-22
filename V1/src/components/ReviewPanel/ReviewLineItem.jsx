import styles from './ReviewPanel.module.css';
import useBundleStore, { getItemInfo, getUnitPrice, getOldUnitPrice } from '../../store/useBundleStore';
import { formatPrice } from '../../utils/formatPrice';
import QuantityStepper from '../QuantityStepper/QuantityStepper';

/**
 * A single line item row in the review panel (cameras, sensors, accessories).
 *
 * @param {Object} props
 * @param {string} props.cartKey – compound key like "cam-v4::White" or "sense-motion"
 */
export default function ReviewLineItem({ cartKey }) {
  const quantity     = useBundleStore((s) => s.cartItems[cartKey]?.quantity ?? 0);
  const incrementQty = useBundleStore((s) => s.incrementQty);
  const decrementQty = useBundleStore((s) => s.decrementQty);

  const info         = getItemInfo(cartKey);
  const unitPrice    = getUnitPrice(cartKey);
  const oldUnitPrice = getOldUnitPrice(cartKey);
  const lineTotal    = quantity * unitPrice;
  const lineOldTotal = oldUnitPrice != null ? quantity * oldUnitPrice : null;
  const isFree       = unitPrice === 0;

  return (
    <div className={styles.cartItem}>
      <div className={styles.itemLeft}>
        <div className={styles.iconPlaceholder}>
          {info.image ? (
            <img src={info.image} alt={info.title} />
          ) : (
            'IMG'
          )}
        </div>
        <span className={styles.itemTitle}>{info.title}</span>
      </div>

      <div className={styles.itemRight}>
        <QuantityStepper
          quantity={quantity}
          onIncrement={() => incrementQty(cartKey)}
          onDecrement={() => decrementQty(cartKey)}
          size="compact"
          label={info.title}
        />

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
}
