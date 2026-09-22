import styles from './QuantityStepper.module.css';

/**
 * Shared quantity stepper (+/−) used on product cards and the review panel.
 *
 * @param {Object}   props
 * @param {number}   props.quantity    – current quantity value
 * @param {function} props.onIncrement – called when "+" is clicked
 * @param {function} props.onDecrement – called when "−" is clicked
 * @param {'default'|'compact'} [props.size='default'] – visual size variant
 * @param {string}   [props.label]     – accessible product name
 */
export default function QuantityStepper({
  quantity,
  onIncrement,
  onDecrement,
  size = 'default',
  label = 'item',
}) {
  const isZero = quantity === 0;
  const sizeClass = size === 'compact' ? styles.compact : '';

  return (
    <div className={`${styles.stepper} ${sizeClass}`}>
      <button
        className={`${styles.btn} ${isZero ? styles.btnDisabled : ''}`}
        onClick={onDecrement}
        disabled={isZero}
        aria-label={`Decrease ${label} quantity`}
      >
        −
      </button>
      <span className={styles.count}>{quantity}</span>
      <button
        className={styles.btn}
        onClick={onIncrement}
        aria-label={`Increase ${label} quantity`}
      >
        +
      </button>
    </div>
  );
}
