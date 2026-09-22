import styles from './StepContentItem.module.css';
import useBundleStore, { getItemInfo, getUnitPrice, getOldUnitPrice } from '../../store/useBundleStore';
import { formatPrice } from '../../utils/formatPrice';
import QuantityStepper from '../QuantityStepper/QuantityStepper';

/**
 * An item row inside an expanded step (sensors, accessories).
 * Similar to ReviewLineItem but rendered inside the left panel.
 *
 * @param {Object} props
 * @param {string} props.itemId – cart key (e.g. "sense-motion")
 */
export default function StepContentItem({ itemId }) {
  const quantity     = useBundleStore((s) => s.cartItems[itemId]?.quantity ?? 0);
  const incrementQty = useBundleStore((s) => s.incrementQty);
  const decrementQty = useBundleStore((s) => s.decrementQty);

  const info      = getItemInfo(itemId);
  const unitPrice = getUnitPrice(itemId);
  const oldUnit   = getOldUnitPrice(itemId);
  const lineTotal = quantity * unitPrice;
  const lineOld   = oldUnit != null ? quantity * oldUnit : null;
  const isFree    = unitPrice === 0;

  return (
    <div className={styles.item}>
      <div className={styles.left}>
        <div className={styles.thumb}>
          {info.image && <img src={info.image} alt={info.title} />}
        </div>
        <span className={styles.title}>{info.title}</span>
      </div>

      <div className={styles.right}>
        <QuantityStepper
          quantity={quantity}
          onIncrement={() => incrementQty(itemId)}
          onDecrement={() => decrementQty(itemId)}
          size="compact"
          label={info.title}
        />

        <div className={styles.pricing}>
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
}
