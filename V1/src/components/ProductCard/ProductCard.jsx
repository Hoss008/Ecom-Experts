import { useState } from 'react';
import styles from './ProductCard.module.css';
import useBundleStore, { makeCartKey } from '../../store/useBundleStore';
import { formatPrice } from '../../utils/formatPrice';
import QuantityStepper from '../QuantityStepper/QuantityStepper';
import ColorSelector from '../ColorSelector/ColorSelector';

/**
 * A single product card within the camera step.
 *
 * Handles variant selection (local state) and binds the stepper
 * to whichever color variant is currently active.
 */
export default function ProductCard({ product }) {
  const hasVariants = product.colors && product.colors.length > 0;

  // Which color chip is active — local UI state, NOT cart state.
  const [activeColor, setActiveColor] = useState(() => {
    if (!hasVariants) return null;
    // Prefer the color that was pre-seeded with qty > 0
    for (const c of product.colors) {
      const key = makeCartKey(product.id, c.name);
      const qty = useBundleStore.getState().cartItems[key]?.quantity ?? 0;
      if (qty > 0) return c.name;
    }
    return product.colors[0].name;
  });

  // Cart key the stepper is bound to
  const activeKey = hasVariants
    ? makeCartKey(product.id, activeColor)
    : product.id;

  // Granular selectors — only re-render when THIS variant's qty changes
  const quantity = useBundleStore((s) => s.cartItems[activeKey]?.quantity ?? 0);
  const incrementQty = useBundleStore((s) => s.incrementQty);
  const decrementQty = useBundleStore((s) => s.decrementQty);

  // Purple border = ANY variant of this product has qty > 0
  const isSelected = useBundleStore((s) => {
    if (!hasVariants) return (s.cartItems[product.id]?.quantity ?? 0) > 0;
    return product.colors.some(
      (c) => (s.cartItems[makeCartKey(product.id, c.name)]?.quantity ?? 0) > 0
    );
  });

  return (
    <div
      className={`${styles.card} ${isSelected ? styles.cardSelected : ''}`}
    >
      {product.badge && <span className={styles.badge}>{product.badge}</span>}

      <div className={styles.imageContainer}>
        {product.image ? (
          <img
            src={product.image}
            alt={product.title}
            className={styles.image}
          />
        ) : (
          <div className={styles.placeholder}>IMG</div>
        )}
      </div>

      <div className={styles.details}>
        <div className={styles.detailsTop}>
          <h3 className={styles.title}>{product.title}</h3>
          <p className={styles.description}>
            {product.description}{' '}
            <a href="#" className={styles.learnMore}>
              Learn More
            </a>
          </p>

          {hasVariants && (
            <ColorSelector
              productId={product.id}
              colors={product.colors}
              activeColor={activeColor}
              onSelect={setActiveColor}
            />
          )}
        </div>

        <div className={styles.bottomRow}>
          <QuantityStepper
            quantity={quantity}
            onIncrement={() => incrementQty(activeKey)}
            onDecrement={() => decrementQty(activeKey)}
            label={product.title}
          />

          <div className={styles.pricing}>
            {product.oldPrice && (
              <span className={styles.oldPrice}>
                {formatPrice(product.oldPrice)}
              </span>
            )}
            <span className={styles.currentPrice}>
              {formatPrice(product.price)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
