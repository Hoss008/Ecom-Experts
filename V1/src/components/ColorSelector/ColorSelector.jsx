import styles from './ColorSelector.module.css';
import useBundleStore, { makeCartKey } from '../../store/useBundleStore';
import { useShallow } from 'zustand/react/shallow';

/**
 * Row of selectable color chips for product variants.
 *
 * @param {Object}   props
 * @param {string}   props.productId   – base product id (e.g. "cam-v4")
 * @param {Array}    props.colors      – array of { name, iconId } objects
 * @param {string}   props.activeColor – currently selected color name
 * @param {function} props.onSelect    – called with color name when a chip is clicked
 */
export default function ColorSelector({ productId, colors, activeColor, onSelect }) {
  // Subscribe to only THIS product's variant quantities with shallow equality
  const variantQtys = useBundleStore(
    useShallow((s) => {
      const result = {};
      for (const c of colors) {
        const key = makeCartKey(productId, c.name);
        result[key] = s.cartItems[key]?.quantity ?? 0;
      }
      return result;
    })
  );

  return (
    <div className={styles.picker}>
      {colors.map((colorObj) => {
        const variantKey = makeCartKey(productId, colorObj.name);
        const variantQty = variantQtys[variantKey] ?? 0;
        const isActive = activeColor === colorObj.name;

        return (
          <button
            key={colorObj.name}
            className={`${styles.chip} ${isActive ? styles.chipActive : ''}`}
            onClick={() => onSelect(colorObj.name)}
            aria-label={`Select ${colorObj.name} variant`}
            aria-pressed={isActive}
          >
            <img
              src={colorObj.iconId}
              alt={colorObj.name}
              className={styles.chipIcon}
            />
            {colorObj.name}
            {variantQty > 0 && (
              <span className={styles.qtyBadge}>{variantQty}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
